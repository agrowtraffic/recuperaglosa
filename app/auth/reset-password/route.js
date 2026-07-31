/* ============================================================
   RECUPERAÇÃO DE SENHA  →  /auth/reset-password

   Destino do link que o Supabase manda no e-mail de recuperação
   (LoginForm passa esta rota como `redirectTo`). O cliente do navegador
   usa PKCE, então o que chega aqui é `?code=` — só depois de trocar esse
   código por sessão é que /redefinir-senha consegue chamar updateUser().

   Esta rota não existia: o e-mail levava a um 404 e a recuperação de
   senha estava quebrada de ponta a ponta.
   ============================================================ */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(new URL('/redefinir-senha', request.url));
    }

    /* Falha típica: o link foi aberto em outro navegador, onde não existe
       o code verifier do PKCE. Sem log, isso vira "voltou pro login" sem
       explicação — que foi exatamente o que aconteceu no /auth/callback. */
    console.error('[RESET] Falha ao trocar código por sessão:', error.message);
  }

  return NextResponse.redirect(new URL('/login?erro=link-invalido', request.url));
}
