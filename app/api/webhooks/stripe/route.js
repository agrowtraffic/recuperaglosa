import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    // Verificar assinatura do webhook
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
      console.error('Erro ao verificar assinatura webhook:', err.message);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Processar eventos
    console.log('🔔 [WEBHOOK] Evento recebido:', event.type);
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const clinicaId = session.metadata?.clinica_id;

      console.log('🔔 [WEBHOOK] checkout.session.completed recebido');
      console.log('🔔 [WEBHOOK] session.metadata:', session.metadata);
      console.log('🔔 [WEBHOOK] clinicaId extraído:', clinicaId);

      if (clinicaId) {
        // Atualizar plano da clínica para 'ativo' usando service role (contorna RLS)
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        console.log(`🔔 [WEBHOOK] Tentando atualizar clinica ${clinicaId}...`);

        const { error: updateError, data: updateData } = await supabaseAdmin
          .from('clinica')
          .update({
            plano: 'ativo',
            status_assinatura: 'ativo',
            stripe_customer_id: session.customer,
          })
          .eq('id', clinicaId)
          .select();

        const updatedRows = updateData ? updateData.length : 0;
        console.log(`🔔 [WEBHOOK] Update result - error: ${updateError}, rows: ${updatedRows}, data:`, updateData);

        if (updateError) {
          console.error(`❌ [WEBHOOK] Erro ao atualizar clínica ${clinicaId}:`, updateError);
        } else if (updatedRows > 0) {
          console.log(`✅ [WEBHOOK] Clínica ${clinicaId} ativada com sucesso (${updatedRows} linhas atualizadas)`);
        } else {
          console.warn(`⚠️ [WEBHOOK] Nenhuma clínica encontrada com ID: ${clinicaId} (rows: ${updatedRows})`);
        }
      } else {
        console.warn('⚠️ [WEBHOOK] clinicaId não encontrado em session.metadata');
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      // Buscar clínica associada usando service role (contorna RLS)
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      const { data: clinica } = await supabaseAdmin
        .from('clinica')
        .select('id')
        .eq('stripe_customer_id', customerId)
        .single();

      if (clinica) {
        // Downgrade para 'trial' (cancelado)
        await supabaseAdmin
          .from('clinica')
          .update({
            plano: 'trial',
            status_assinatura: 'cancelado',
          })
          .eq('id', clinica.id);

        console.log(`✅ Assinatura de ${clinica.id} cancelada`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return NextResponse.json(
      { error: 'server_error' },
      { status: 500 }
    );
  }
}
