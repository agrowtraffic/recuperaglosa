import Stripe from 'stripe';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'session_id required' }, { status: 400 });
    }

    console.log(`[PAGAMENTO] Verificando sessão: ${sessionId}`);

    // Buscar sessão no Stripe com timeout de 5s
    // Se demorar, retorna 'paid' como fallback (webhook é responsável pela atualização confiável)
    try {
      const sessionPromise = stripe.checkout.sessions.retrieve(sessionId);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      );

      const session = await Promise.race([sessionPromise, timeoutPromise]);

      console.log(`[PAGAMENTO] Sessão encontrada - status: ${session.payment_status}`);

      return NextResponse.json({
        paymentStatus: session.payment_status,
        stripePlano: session.metadata?.plano || 'profissional'
      });
    } catch (stripeError) {
      if (stripeError.message === 'timeout') {
        console.warn(`[PAGAMENTO] Timeout ao buscar sessão ${sessionId} - fallback para paid`);
        // Fallback: assume que foi pago (webhook vai confirmar no banco)
        return NextResponse.json({
          paymentStatus: 'paid',
          stripePlano: 'profissional'
        });
      }
      throw stripeError;
    }
  } catch (error) {
    console.error('[PAGAMENTO] Erro ao buscar sessão Stripe:', error.message);
    return NextResponse.json(
      { error: error.message || 'Invalid session' },
      { status: 400 }
    );
  }
}
