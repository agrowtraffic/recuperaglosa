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
    /* Visitante na raiz vê a landing, não o formulário de login. Quem
       chega em recuperaglosa.com.br pela primeira vez veio de anúncio ou
       de busca e ainda não tem conta — mandar direto para o login pede
       senha de quem nem sabe o que o produto faz.

       Reescrita e não redirect: a URL continua sendo a raiz. Um 307 para
       /inicio jogaria fora o endereço que vai em anúncio, e-mail e busca,
       e dividiria o sinal de SEO entre dois endereços. */
    if (pathname === '/') {
      /* Link de recuperação de senha que caiu na raiz.

         O Supabase só honra o `redirectTo` que a aplicação pede se ele
         estiver na allow-list do projeto; fora dela, ele descarta o
         pedido e usa o Site URL — que é a raiz. O resultado é um `code`
         de recuperação chegando aqui, onde não existe nada para trocá-lo
         por sessão: a pessoa clicava no e-mail e via a landing.

         Encaminhar para quem sabe trocar o código resolve sem depender
         de configuração. Vale manter mesmo depois de a allow-list ser
         corrigida: é a diferença entre uma config errada custar uma
         recuperação de senha ou custar nada. */
      const code = request.nextUrl.searchParams.get('code');
      if (code) {
        const destino = new URL('/auth/reset-password', request.url);
        destino.searchParams.set('code', code);
        const encaminha = NextResponse.redirect(destino);
        response.cookies.getAll().forEach((c) => encaminha.cookies.set(c.name, c.value, c));
        return encaminha;
      }

      const landing = NextResponse.rewrite(new URL('/inicio', request.url));
      response.cookies.getAll().forEach((c) => landing.cookies.set(c.name, c.value, c));
      return landing;
    }

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
