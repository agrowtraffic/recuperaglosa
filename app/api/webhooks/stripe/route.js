import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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
              // Enviar e-mail de boas-vindas via Resend
              await resend.emails.send({
                from: 'Recupera Glosa <naoresponda@recuperaglosa.com.br>',
                to: usuarioData.email,
                subject: 'Seu plano Profissional está ativo 🎉',
                html: `
                  <!DOCTYPE html>
                  <html>
                    <head>
                      <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { text-align: center; padding-bottom: 30px; border-bottom: 2px solid #eee; }
                        .logo { font-size: 24px; font-weight: bold; color: #16a34a; }
                        .content { padding: 30px 0; }
                        .benefits { list-style: none; padding: 0; }
                        .benefits li { padding: 10px 0; padding-left: 30px; position: relative; }
                        .benefits li:before { content: "✓"; position: absolute; left: 0; color: #16a34a; font-weight: bold; }
                        .cta { text-align: center; margin: 30px 0; }
                        .cta a { background-color: #16a34a; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; }
                        .footer { border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #666; text-align: center; }
                      </style>
                    </head>
                    <body>
                      <div class="container">
                        <div class="header">
                          <div class="logo">🎉 Bem-vindo ao RecuperaGlosa!</div>
                        </div>
                        <div class="content">
                          <p>Olá,</p>
                          <p>Seu pagamento foi confirmado com sucesso! Seu plano <strong>Profissional</strong> já está ativo.</p>
                          <p style="margin-top: 20px; font-weight: bold;">Agora você tem acesso a:</p>
                          <ul class="benefits">
                            <li>Recursos de contestação completos e prontos para enviar</li>
                            <li>Auditorias ilimitadas por mês (contra 3/mês no plano gratuito)</li>
                            <li>Suporte prioritário da nossa equipe</li>
                          </ul>
                          <div class="cta">
                            <a href="${process.env.NEXT_PUBLIC_SITE_URL}">Acessar o RecuperaGlosa →</a>
                          </div>
                          <p>Qualquer dúvida ou sugestão, fale conosco: <strong>suporte@recuperaglosa.com.br</strong></p>
                          <p>Abraço,<br/>Time RecuperaGlosa</p>
                        </div>
                        <div class="footer">
                          <p>© 2026 RecuperaGlosa. Todos os direitos reservados.</p>
                        </div>
                      </div>
                    </body>
                  </html>
                `
              });
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
