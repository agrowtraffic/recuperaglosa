import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () =>
          request.cookies.getSetCookie().map((cookie) => {
            const [name, ...rest] = cookie.split('=');
            const value = rest.join('=').split(';')[0];
            return { name, value };
          }),
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data } = await supabase.auth.getUser();

  if (
    (request.nextUrl.pathname.startsWith('/dashboard') ||
     request.nextUrl.pathname.startsWith('/api/dashboard')) &&
    !data.user
  ) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/api/dashboard/:path*'],
};
