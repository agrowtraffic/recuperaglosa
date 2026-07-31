import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://recuperaglosa.com.br';
const TEMPLATE_PAGAMENTO_CONFIRMADO = 'recupera-glosa-pagamento-confirmado';

function formatarDataPagamento(timestamp) {
  const data = timestamp ? new Date(timestamp * 1000) : new Date();
  return data.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

function formatarValorPagamento(valorEmCentavos) {
  return Number((valorEmCentavos ?? 0) / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatarMetodoPagamento(metodo) {
  const nomes = {
    card: 'Cartão',
    boleto: 'Boleto',
    pix: 'Pix',
  };
  return nomes[metodo] || 'Pagamento online';
}

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

        /* Guardar o subscription_id junto: sem ele não dá para cancelar,
           reconciliar nem conferir do nosso lado quem está pagando o quê.
           A coluna existe no schema e vinha ficando sempre nula. */
        const { error: updateError, data: updateData } = await supabaseAdmin
          .from('clinica')
          .update({
            plano: 'ativo',
            status_assinatura: 'ativo',
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription ?? null,
          })
          .eq('id', clinicaId)
          .select();

        const updatedRows = updateData ? updateData.length : 0;
        console.log(`🔔 [WEBHOOK] Update result - error: ${updateError}, rows: ${updatedRows}, data:`, updateData);

        if (updateError) {
          console.error(`❌ [WEBHOOK] Erro ao atualizar clínica ${clinicaId}:`, updateError);
        } else if (updatedRows > 0) {
          console.log(`✅ [WEBHOOK] Clínica ${clinicaId} ativada com sucesso (${updatedRows} linhas atualizadas)`);

          // Buscar email do usuario associado à clínica
          const { data: usuarioData } = await supabaseAdmin
            .from('usuario')
            .select('id, email')
            .eq('clinica_id', clinicaId)
            .maybeSingle();

          if (usuarioData?.email && resend) {
            try {
              const metodo = session.payment_method_types?.[0];
              const { error: emailError } = await resend.emails.send(
                {
                  from: 'Recupera Glosa <naoresponda@recuperaglosa.com.br>',
                  to: usuarioData.email,
                  template: {
                    id: TEMPLATE_PAGAMENTO_CONFIRMADO,
                    variables: {
                      ACCESS_URL: SITE,
                      PRODUCT_NAME: 'Plano Profissional',
                      ORDER_ID: session.id,
                      PAYMENT_DATE: formatarDataPagamento(session.created),
                      PAYMENT_METHOD: formatarMetodoPagamento(metodo),
                      AMOUNT: formatarValorPagamento(session.amount_total),
                      BENEFIT_1: 'Recursos de contestação completos e prontos para enviar',
                      BENEFIT_2: 'Auditorias ilimitadas para identificar oportunidades de recuperação',
                      BENEFIT_3: 'Suporte prioritário da equipe Recupera Glosa',
                    },
                  },
                },
                {
                  headers: {
                    'Idempotency-Key': `pagamento-confirmado-${session.id}`,
                  },
                }
              );

              if (emailError) throw emailError;
              console.log(`✅ [WEBHOOK] E-mail enviado para ${usuarioData.email}`);
            } catch (emailError) {
              console.error(`⚠️ [WEBHOOK] Erro ao enviar e-mail para ${usuarioData.email}:`, emailError);
            }
          }
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
