import { NextResponse, type NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Permitir auth callback sem restrições
  if (request.nextUrl.pathname.startsWith('/auth/callback')) {
    return NextResponse.next();
  }

  // Proteger rotas /dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    const authCookie = request.cookies.get('sb-access-token') ||
                       request.cookies.get('sb-auth-token') ||
                       request.cookies.get('supabase-auth-token');

    if (!authCookie) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/auth/callback'],
};
