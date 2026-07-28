import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Revalidar as rotas críticas que mostram plano/dados
    revalidatePath('/', 'layout'); // Revalida tudo
    revalidatePath('/configuracoes', 'page');

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    console.error('Erro ao revalidar:', error);
    return NextResponse.json({ revalidated: false }, { status: 500 });
  }
}
