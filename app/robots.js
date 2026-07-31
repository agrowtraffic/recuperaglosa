/* robots.txt gerado pelo Next (convenção de arquivo do App Router).

   Antes dava 404 nos dois domínios. Sem isso, buscador rastreia tudo —
   inclusive as rotas de API e as telas atrás de login, que só devolvem
   redirect para /login e viram lixo no índice.

   O que interessa indexar é a parte pública: a entrada, a ajuda e os
   documentos legais. O resto exige sessão e não tem conteúdo a oferecer. */
const SITE = 'https://recuperaglosa.com.br';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/auth/',
          /* Telas de conta: sem sessão devolvem redirect, e com sessão são
             dados de uma clínica só. Não existe versão pública delas. */
          '/lotes',
          '/guias',
          '/glosas',
          '/recursos',
          '/relatorios',
          '/configuracoes',
          '/completar-cadastro',
          '/pagamento-confirmado',
          '/redefinir-senha',
        ],
      },
    ],
    host: SITE,
  };
}
