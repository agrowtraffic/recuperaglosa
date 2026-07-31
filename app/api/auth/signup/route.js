import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enviarConfirmacaoConta } from '@/lib/emails';

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
      // Configuração inválida cai no domínio oficial abaixo.
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
  const password = String(body?.password || '');
  const firstName = String(body?.firstName || '').trim();
  const lastName = String(body?.lastName || '').trim();

  if (!firstName || !lastName || !email || !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: 'dados_invalidos' }, { status: 400 });
  }
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return NextResponse.json({ error: 'senha_invalida' }, { status: 400 });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('[SIGNUP] Supabase administrativo não configurado.');
    return NextResponse.json({ error: 'cadastro_indisponivel' }, { status: 503 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await admin.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: {
      data: { firstName, lastName },
      redirectTo: `${origem}/completar-cadastro`,
    },
  });

  if (error || !data?.user?.id || !data?.properties?.hashed_token) {
    console.error('[SIGNUP] Não foi possível gerar o link:', error?.message);
    const existente = /already|registered|exists/i.test(error?.message || '');
    return NextResponse.json(
      { error: existente ? 'email_ja_cadastrado' : 'cadastro_indisponivel' },
      { status: existente ? 409 : 502 }
    );
  }

  const confirmationUrl = new URL('/auth/confirm', origem);
  confirmationUrl.searchParams.set('token_hash', data.properties.hashed_token);
  confirmationUrl.searchParams.set('type', 'signup');
  confirmationUrl.searchParams.set('next', '/completar-cadastro');

  try {
    await enviarConfirmacaoConta({
      para: email,
      confirmationUrl: confirmationUrl.toString(),
      userId: data.user.id,
    });
  } catch (emailError) {
    console.error('[SIGNUP] Falha ao enviar confirmação:', emailError?.message);
    await admin.auth.admin.deleteUser(data.user.id).catch((rollbackError) => {
      console.error('[SIGNUP] Falha ao desfazer cadastro:', rollbackError?.message);
    });
    return NextResponse.json({ error: 'email_nao_enviado' }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
