const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data:",
  "font-src 'self' https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
].join('; ');

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  // Testado em Report-Only em produção: login por e-mail, dashboard autenticado
  // (Supabase + Recharts + estilos inline) e clique real em "Continuar com
  // Google" (navegação completa até accounts.google.com) sem nenhuma violação.
  { key: 'Content-Security-Policy', value: csp },
];

/* Domínio canônico. Os dois domínios serviam o app inteiro, cada um com
   sessão própria — cookie não atravessa domínio — e sem nenhum sinal para
   buscador de qual é o oficial.

   O caso que doía de verdade era o pagamento: /api/checkout monta a URL de
   retorno do Stripe a partir de NEXT_PUBLIC_SITE_URL, que é fixa. Quem
   assinasse pelo .vercel.app pagava e voltava num domínio onde não tinha
   sessão — a tela de confirmação não achava o usuário e mostrava erro para
   alguém que acabou de pagar.

   Fica em redirects() e não no middleware de propósito: a Vercel resolve
   na borda, antes de invocar função, e o matcher do middleware teria de
   crescer para cobrir /login e as páginas públicas.

   Casa só o host exato de produção. Preview (recuperaglosa-<hash>-…) e
   localhost não batem, e seguem funcionando. */
const HOST_ANTIGO = 'recuperaglosa.vercel.app';
const SITE_CANONICO = 'https://recuperaglosa.com.br';

/** @type {import('next').NextConfig} */
export default {
  reactStrictMode: true,
  swcMinify: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: HOST_ANTIGO }],
        destination: `${SITE_CANONICO}/:path*`,
        permanent: true,
      },
    ];
  },
};
