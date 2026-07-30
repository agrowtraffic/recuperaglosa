import { createClient } from '@/lib/supabase/server';
import { enviarFinalizacaoPagamento } from '@/lib/emails';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    console.log('🔔 [CHECKOUT] Versão 2 - Iniciando...');
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    // Buscar clinica do usuário autenticado
    const { data: usuarioData } = await supabase
      .from('usuario')
      .select('clinica_id')
      .eq('id', user.id)
      .single();

    if (!usuarioData) {
      return NextResponse.json({ error: 'usuario_not_found' }, { status: 404 });
    }

    const clinicaId = usuarioData.clinica_id;
    console.log('✅ [CHECKOUT] clinicaId encontrado:', clinicaId);

    // Buscar clinica
    const { data: clinica, error: clinicaError } = await supabase
      .from('clinica')
      .select('nome, stripe_customer_id')
      .eq('id', clinicaId)
      .single();

    if (clinicaError || !clinica) {
      console.error('❌ [CHECKOUT] Erro ao buscar clínica:', clinicaError);
      return NextResponse.json({ error: 'clinica_not_found' }, { status: 404 });
    }

    let customerId = clinica.stripe_customer_id;

    if (!customerId) {
      // Criar novo customer no Stripe
      const customer = await stripe.customers.create({
        email: user.email,
        name: clinica.nome,
        metadata: { clinica_id: clinicaId || user.id },
      });

      customerId = customer.id;

      // Salvar stripe_customer_id no Supabase
      const { error: updateError } = await supabase
        .from('clinica')
        .update({ stripe_customer_id: customerId })
        .eq('id', clinicaId);

      if (updateError) {
        console.error('❌ [CHECKOUT] Erro ao atualizar stripe_customer_id:', updateError);
      } else {
        console.log('✅ [CHECKOUT] stripe_customer_id salvo para clinica:', clinicaId);
      }
    }

    /* ── Trava contra assinatura duplicada ──
       Sem isto, cada clique em "Assinar" abre um checkout novo e o mesmo
       cliente acumula assinaturas ativas — quatro cliques, quatro
       cobranças de R$ 197 no mesmo cartão. Antes de abrir o checkout,
       pergunta ao Stripe se este customer já tem assinatura viva. */
    const assinaturasAtivas = await stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });

    const emTeste = await stripe.subscriptions.list({
      customer: customerId,
      status: 'trialing',
      limit: 1,
    });

    if (assinaturasAtivas.data.length > 0 || emTeste.data.length > 0) {
      const existente = assinaturasAtivas.data[0] ?? emTeste.data[0];
      console.log(`⚠️ [CHECKOUT] Clínica ${clinicaId} já tem assinatura ${existente.id} — checkout recusado.`);

      return NextResponse.json(
        {
          error: 'assinatura_existente',
          message: 'Esta clínica já tem uma assinatura ativa. Use "Gerenciar assinatura" para alterar ou cancelar.',
          subscriptionId: existente.id,
        },
        { status: 409 }
      );
    }

    // Criar Checkout Session
    console.log('✅ [CHECKOUT] Criando sessão com clinicaId:', clinicaId);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : 'https://recuperaglosa.vercel.app');
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${siteUrl}/pagamento-confirmado?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/recursos`,
      metadata: { clinica_id: clinicaId },
    });
    console.log('✅ [CHECKOUT] Sessão criada com ID:', session.id, 'metadata:', session.metadata);

    try {
      const validade = new Date(session.expires_at * 1000).toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        dateStyle: 'short',
        timeStyle: 'short',
      });

      const envio = await enviarFinalizacaoPagamento({
        para: user.email,
        paymentUrl: session.url,
        orderId: session.id,
        paymentDueDate: validade,
        valor: Number(session.amount_total ?? 19700) / 100,
      });

      if (!envio.enviado) {
        console.warn(`⚠️ [CHECKOUT] E-mail de retomada não enviado: ${envio.motivo}`);
      }
    } catch (emailError) {
      /* A criação do checkout continua válida mesmo se o e-mail falhar. */
      console.error('⚠️ [CHECKOUT] Erro ao enviar e-mail de retomada:', emailError);
    }

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url,
    });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: 'server_error', message: error.message },
      { status: 500 }
    );
  }
}
