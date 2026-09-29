/* sitemap.xml gerado pelo Next (convenção de arquivo do App Router).

   Só entra o que é público e tem conteúdo próprio. As telas do app
   exigem sessão e estão bloqueadas no robots.js; /login é noindex. */
import { SITE } from '@/lib/seo';
import { TABELA_38 } from '@/src/tiss/tabela38';
import { POSTS } from './blog/_posts';

/* Data fixa, atualizada à mão quando o conteúdo muda. `new Date()` faria
   o sitemap anunciar as 600 páginas como alteradas a cada leitura, e o
   Google aprende a ignorar lastmod de quem faz isso. */
const ATUALIZADO = new Date('2026-09-28');

export default function sitemap() {

  const fixas = [
    { url: `${SITE}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/recurso-de-glosa`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/codigos-de-glosa`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE}/ajuda`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE}/privacidade`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE}/termos`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  const codigos = Object.keys(TABELA_38).map((codigo) => ({
    url: `${SITE}/codigos-de-glosa/${codigo}`,
    changeFrequency: 'yearly',
    priority: 0.6,
  }));

  const fixasECodigos = [...fixas, ...codigos].map((e) => ({ ...e, lastModified: ATUALIZADO }));

  /* Artigo usa a própria data de atualização. */
  const artigos = POSTS.map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: new Date(p.atualizado),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...fixasECodigos, ...artigos];
}
