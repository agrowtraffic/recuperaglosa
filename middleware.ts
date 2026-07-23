import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir rotas públicas
  if (pathname.startsWith('/auth/') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/privacidade') ||
      pathname.startsWith('/termos')) {
    return NextResponse.next();
  }

  // Proteger rotas privadas
  if (pathname === '/' || pathname.startsWith('/dashboard') ||
      pathname.startsWith('/lotes') || pathname.startsWith('/guias') ||
      pathname.startsWith('/glosas') || pathname.startsWith('/recursos') ||
      pathname.startsWith('/relatorios') || pathname.startsWith('/upload')) {

    // Procura qualquer cookie que comece com 'sb-' (padrão Supabase)
    const authCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'));

    console.log('[MIDDLEWARE]', {
      path: pathname,
      hasAuthCookie: authCookie,
      allCookies: request.cookies.getAll().map(c => c.name),
    });

    if (!authCookie) {
      console.log('[MIDDLEWARE] → Sem sessão, redirecionando para /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/auth/callback', '/lotes/:path*', '/guias/:path*', '/glosas/:path*', '/recursos/:path*', '/relatorios/:path*', '/upload/:path*'],
};
