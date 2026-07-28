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

    // Buscar sessão no Stripe com timeout de 10s
    const sessionPromise = stripe.checkout.sessions.retrieve(sessionId);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Stripe API timeout')), 10000)
    );

    const session = await Promise.race([sessionPromise, timeoutPromise]);

    console.log(`[PAGAMENTO] Sessão encontrada - status: ${session.payment_status}`);

    return NextResponse.json({
      paymentStatus: session.payment_status, // 'paid' ou 'unpaid'
      stripePlano: session.metadata?.plano || 'profissional'
    });
  } catch (error) {
    console.error('[PAGAMENTO] Erro ao buscar sessão Stripe:', error.message);
    return NextResponse.json(
      { error: error.message || 'Invalid session' },
      { status: error.message?.includes('timeout') ? 504 : 400 }
    );
  }
}
