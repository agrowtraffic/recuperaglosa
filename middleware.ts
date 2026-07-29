import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir rotas públicas sem tocar em cookies/sessão
  if (pathname.startsWith('/auth/') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/privacidade') ||
      pathname.startsWith('/termos')) {
    return NextResponse.next();
  }

  const isOnboarding = pathname.startsWith('/completar-cadastro');
  const isProtected = isOnboarding || pathname === '/' ||
    pathname.startsWith('/lotes') || pathname.startsWith('/guias') ||
    pathname.startsWith('/glosas') || pathname.startsWith('/recursos') ||
    pathname.startsWith('/relatorios') || pathname.startsWith('/configuracoes') ||
    pathname.startsWith('/upload') || pathname.startsWith('/pagamento-confirmado');

  if (!isProtected) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request: { headers: request.headers } });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // getUser() valida o token com o servidor Supabase (getSession() só lê o cookie local)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url));
    // Preserva cookies renovados por getUser() mesmo no caminho de redirect
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c.name, c.value, c));
    return redirectResponse;
  }

  // Usuário autenticado, mas ainda sem linha em `usuario` (nunca completou o
  // onboarding) — manda para o formulário em vez de deixar o app quebrar em
  // "Usuário não encontrado na tabela usuario".
  const { data: usuarioRow } = await supabase.from('usuario').select('id').eq('id', user.id).maybeSingle();

  if (!usuarioRow && !isOnboarding) {
    const redirectResponse = NextResponse.redirect(new URL('/completar-cadastro', request.url));
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c.name, c.value, c));
    return redirectResponse;
  }

  if (usuarioRow && isOnboarding) {
    const redirectResponse = NextResponse.redirect(new URL('/', request.url));
    response.cookies.getAll().forEach((c) => redirectResponse.cookies.set(c.name, c.value, c));
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: ['/', '/completar-cadastro', '/lotes/:path*', '/guias/:path*', '/glosas/:path*', '/recursos/:path*', '/relatorios/:path*', '/configuracoes/:path*', '/upload/:path*', '/pagamento-confirmado/:path*'],
};
