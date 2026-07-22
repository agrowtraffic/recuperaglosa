import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir auth callback e páginas públicas
  if (pathname.startsWith('/auth/callback') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/auth/') ||
      pathname.startsWith('/privacidade') ||
      pathname.startsWith('/termos')) {
    return NextResponse.next();
  }

  // Proteger TODAS as rotas privadas (raiz, dashboard, lotes, etc)
  if (pathname === '/' || pathname.startsWith('/dashboard') ||
      pathname.startsWith('/lotes') || pathname.startsWith('/guias') ||
      pathname.startsWith('/glosas') || pathname.startsWith('/recursos') ||
      pathname.startsWith('/relatorios') || pathname.startsWith('/upload')) {

    const authCookie = request.cookies.get('sb-access-token') ||
                       request.cookies.get('sb-auth-token') ||
                       request.cookies.get('supabase-auth-token');

    if (!authCookie) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/auth/callback', '/lotes/:path*', '/guias/:path*', '/glosas/:path*', '/recursos/:path*', '/relatorios/:path*', '/upload/:path*'],
};
