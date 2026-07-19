import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const allowedTypes = new Set(['email', 'signup', 'magiclink', 'recovery', 'invite', 'email_change']);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type');
  const requestedNext = searchParams.get('next');
  const next = requestedNext?.startsWith('/') && !requestedNext.startsWith('//')
    ? requestedNext
    : '/';

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.search = '';

  if (tokenHash && type && allowedTypes.has(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = '/login';
  redirectTo.searchParams.set('erro', 'link-invalido');
  return NextResponse.redirect(redirectTo);
}
