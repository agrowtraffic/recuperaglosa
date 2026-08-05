import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarRedefinicaoSenha } from '@/lib/emails';

export const runtime = 'nodejs';

const ORIGENS_PERMITIDAS = new Set([
  'https://recuperaglosa.com.br',
  'https://www.recuperaglosa.com.br',
  'https://recuperaglosa.vercel.app',
  'http://localhost:3000',
]);

function origemPermitida(request) {
  const origem = request.headers.get('origin');
  if (origem && ORIGENS_PERMITIDAS.has(origem)) return origem;

  const configurada = process.env.NEXT_PUBLIC_SITE_URL;
  if (configurada) {
    try {
      const normalizada = new URL(configurada).origin;
      if (!origem || origem === normalizada) return normalizada;
    } catch {
      // Usa o domínio oficial quando a configuração estiver inválida.
    }
  }

  return origem ? null : 'https://recuperaglosa.com.br';
}

export async function POST(request) {
  const origem = origemPermitida(request);
  if (!origem) {
    return NextResponse.json({ error: 'origem_nao_permitida' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'dados_invalidos' }, { status: 400 });
  }

  const email = String(body?.email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'dados_invalidos' }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[RECOVERY] Supabase administrativo não configurado.');
    return NextResponse.json({ error: 'recuperacao_indisponivel' }, { status: 503 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const requestId = crypto.randomUUID();

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${origem}/redefinir-senha`,
    },
  });

  /* Keep the response generic whether or not the address exists. */
  if (error || !data?.user?.id || !data?.properties?.hashed_token) {
    console.error('[RECOVERY] Não foi possível gerar o link:', error?.message);
    return NextResponse.json({ ok: true });
  }

  const resetUrl = new URL('/auth/confirm', origem);
  resetUrl.searchParams.set('token_hash', data.properties.hashed_token);
  resetUrl.searchParams.set('type', 'recovery');
  resetUrl.searchParams.set('next', '/redefinir-senha');

  try {
    await enviarRedefinicaoSenha({
      para: email,
      resetUrl: resetUrl.toString(),
      requestId,
    });
  } catch (emailError) {
    console.error('[RECOVERY] Falha ao enviar redefinição:', emailError?.message);
  }

  return NextResponse.json({ ok: true });
}
