/* ============================================================
   Dados de SEO compartilhados entre layout, landing, sitemap e as
   páginas de conteúdo.

   Os dados estruturados (JSON-LD) precisam bater com o que a página
   mostra — preço e limite do plano grátis inclusive. Se a oferta mudar
   aqui, muda também em app/inicio/conteudo.js, e vice-versa.
   ============================================================ */

export const SITE = 'https://recuperaglosa.com.br';
export const NOME = 'RecuperaGlosa';
export const EMAIL = 'suporte@recuperaglosa.com.br';
export const WHATSAPP = '+55-11-97731-5655';

/* Metadata de página que declara `openGraph` substitui o do layout
   inteiro — inclusive a imagem gerada por app/opengraph-image.jsx. Toda
   página com openGraph próprio precisa repetir isto. */
export const OG_IMAGE = {
  url: '/opengraph-image',
  width: 1200,
  height: 630,
  alt: 'RecuperaGlosa — auditoria de glosas de convênio para clínicas',
};

/* Limite real aplicado em app/api/upload/route.ts. */
export const LIMITE_GRATIS = 3;
export const PRECO_PRO = 197;

export const ORGANIZACAO = {
  '@type': 'Organization',
  '@id': `${SITE}/#organizacao`,
  name: NOME,
  url: SITE,
  logo: `${SITE}/marca/icone-512.png`,
  email: EMAIL,
  areaServed: 'BR',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: EMAIL,
    telephone: WHATSAPP,
    availableLanguage: 'Portuguese',
  },
};

/** Serializa JSON-LD escapando `<`, para que nenhum texto feche a tag. */
export function jsonLd(obj) {
  return { __html: JSON.stringify(obj).replace(/</g, '\\u003c') };
}

export function breadcrumb(itens) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: itens.map(([nome, caminho], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: nome,
      item: `${SITE}${caminho}`,
    })),
  };
}
