import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir rotas públicas
  if (pathname.startsWith('/auth/') ||
      pathname.startsWith('/login') ||
      pathname.startsWith('/privacidade') ||
      pathname.startsWith('/termos')) {
    return NextResponse.next();
  }

  // Proteger rotas privadas verificando sessão via Supabase
  if (pathname === '/' || pathname.startsWith('/dashboard') ||
      pathname.startsWith('/lotes') || pathname.startsWith('/guias') ||
      pathname.startsWith('/glosas') || pathname.startsWith('/recursos') ||
      pathname.startsWith('/relatorios') || pathname.startsWith('/upload')) {

    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!url || !key) {
        console.log('[MIDDLEWARE] Env vars faltando, redirecionando para /login');
        return NextResponse.redirect(new URL('/login', request.url));
      }

      const cookieStore = await cookies();
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {}
          },
        },
      });

      const { data: { user }, error } = await supabase.auth.getUser();

      console.log('[MIDDLEWARE]', {
        path: pathname,
        hasUser: !!user,
        userId: user?.id ?? null,
        error: error?.message ?? null,
      });

      if (!user) {
        console.log('[MIDDLEWARE] → Sem sessão, redirecionando para /login');
        return NextResponse.redirect(new URL('/login', request.url));
      }

      return NextResponse.next();
    } catch (err) {
      console.error('[MIDDLEWARE] Erro ao verificar sessão:', err);
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/auth/callback', '/lotes/:path*', '/guias/:path*', '/glosas/:path*', '/recursos/:path*', '/relatorios/:path*', '/upload/:path*'],
};
