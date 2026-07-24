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

  const isProtected = pathname === '/' || pathname.startsWith('/dashboard') ||
    pathname.startsWith('/lotes') || pathname.startsWith('/guias') ||
    pathname.startsWith('/glosas') || pathname.startsWith('/recursos') ||
    pathname.startsWith('/relatorios') || pathname.startsWith('/upload');

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

  console.log('[MIDDLEWARE]', { path: pathname, hasUser: !!user, userId: user?.id ?? null });

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/auth/callback', '/lotes/:path*', '/guias/:path*', '/glosas/:path*', '/recursos/:path*', '/relatorios/:path*', '/upload/:path*'],
};
