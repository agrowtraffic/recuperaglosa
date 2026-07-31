import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = '/completar-cadastro';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL(next, request.url));
    }

    /* Sem este log a falha era invisível: a pessoa voltava para o login e
       não havia como saber se o código expirou, se o verifier do PKCE não
       estava no navegador ou se a origem do redirect divergia. */
    console.error('[CALLBACK] Falha ao trocar código por sessão:', error.message);
  }

  return NextResponse.redirect(new URL('/login?erro=oauth', request.url));
}
