import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    /* Sem esta checagem, qualquer um pode invalidar o cache do site em
       loop. Revalidar é barato por chamada, mas em rajada derruba o
       benefício do cache para todo mundo. */
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'nao_autenticado' }, { status: 401 });
    }

    // Revalidar as rotas que mostram plano/dados
    revalidatePath('/', 'layout');
    revalidatePath('/configuracoes', 'page');

    return NextResponse.json({ revalidated: true });
  } catch (error) {
    console.error('Erro ao revalidar:', error);
    return NextResponse.json({ revalidated: false }, { status: 500 });
  }
}
