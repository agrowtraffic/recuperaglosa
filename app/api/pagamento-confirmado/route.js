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

    // Buscar sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    return NextResponse.json({
      paymentStatus: session.payment_status, // 'paid' ou 'unpaid'
      stripePlano: session.metadata?.plano || 'profissional'
    });
  } catch (error) {
    console.error('Erro ao buscar sessão Stripe:', error);
    return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
  }
}
