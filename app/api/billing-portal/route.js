import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const { data: usuarioData } = await supabase
      .from('usuario')
      .select('clinica_id')
      .eq('id', user.id)
      .single();

    if (!usuarioData) {
      return NextResponse.json({ error: 'usuario_not_found' }, { status: 404 });
    }

    const { data: clinica } = await supabase
      .from('clinica')
      .select('stripe_customer_id')
      .eq('id', usuarioData.clinica_id)
      .single();

    if (!clinica?.stripe_customer_id) {
      return NextResponse.json({ error: 'sem_assinatura' }, { status: 400 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: clinica.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/configuracoes`,
    });

    return NextResponse.json({ portalUrl: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão do portal:', error);
    return NextResponse.json({ error: 'server_error', message: error.message }, { status: 500 });
  }
}
