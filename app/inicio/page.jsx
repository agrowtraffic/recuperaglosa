/* ============================================================
   LANDING  →  servida em / para quem não tem sessão.

   O middleware reescreve (não redireciona) a raiz para cá quando não há
   sessão, então a URL que a pessoa vê continua sendo recuperaglosa.com.br.
   Reescrita e não redirect porque o endereço de uma landing é ativo de
   marketing: um 307 para /inicio jogaria fora o link que vai em anúncio,
   e-mail e busca.

   Quem tem sessão nunca chega aqui — a raiz segue servindo o painel.

   Antes disso a landing morava num domínio de terceiro. O canonical dela
   apontava para lá, então o Google indexava a página de lançamento sob um
   endereço que não é da empresa, e o recuperaglosa.com.br ficava sem
   nenhum conteúdo indexável, só redirecionando para o login.
   ============================================================ */
import { HTML_LANDING } from './conteudo';
import { LIMITE_GRATIS, NOME, OG_IMAGE, ORGANIZACAO, PRECO_PRO, SITE, jsonLd } from '@/lib/seo';

/* FAQ do schema extraído do próprio HTML: o Google exige que o
   FAQPage corresponda ao que está visível, e duas cópias à mão
   divergiriam na primeira edição da landing. */
const semTags = (t) => t.replace(/<[^>]+>/g, '').trim();
const FAQ = [...HTML_LANDING.matchAll(/<details><summary>([\s\S]*?)<\/summary><p>([\s\S]*?)<\/p><\/details>/g)]
  .map(([, q, a]) => ({ q: semTags(q), a: semTags(a) }));

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    ORGANIZACAO,
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#site`,
      name: NOME,
      url: SITE,
      inLanguage: 'pt-BR',
      publisher: { '@id': ORGANIZACAO['@id'] },
    },
    {
      '@type': 'SoftwareApplication',
      name: NOME,
      url: SITE,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Auditoria de glosas de convênio',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      description:
        'Auditoria de glosas de convênio para clínicas e consultórios: lê o XML do demonstrativo TISS, recalcula o valor glosado por guia e motivo e redige o recurso de glosa.',
      featureList: [
        'Leitura do demonstrativo de pagamento XML padrão TISS',
        'Recálculo da glosa por guia (apresentado × pago)',
        'Classificação dos 603 códigos da Tabela 38 da ANS',
        'Geração automática de recurso de glosa',
        'Priorização por valor e prazo',
      ],
      publisher: { '@id': ORGANIZACAO['@id'] },
      offers: [
        {
          '@type': 'Offer',
          name: 'Gratuito',
          price: '0',
          priceCurrency: 'BRL',
          description: `${LIMITE_GRATIS} análises de XML por mês`,
        },
        {
          '@type': 'Offer',
          name: 'Profissional',
          price: String(PRECO_PRO),
          priceCurrency: 'BRL',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: String(PRECO_PRO),
            priceCurrency: 'BRL',
            billingDuration: 'P1M',
            unitText: 'mês',
          },
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

export const metadata = {
  /* `absolute` para escapar do template `%s · RecuperaGlosa` do layout
     raiz, que aqui deixaria a marca repetida duas vezes no mesmo título —
     e é este o texto que aparece no resultado de busca. */
  title: { absolute: 'Auditoria de glosas e recurso de glosa automático | RecuperaGlosa' },
  description:
    'Envie o XML TISS do convênio e veja em segundos quanto foi glosado, por qual motivo e o recurso de glosa já redigido. Para clínicas e consultórios. Grátis para começar.',
  /* Aponta para a raiz, não para /inicio: é a raiz que as pessoas
     acessam e é ela que deve concentrar o sinal de busca. Sem isto, os
     dois endereços disputariam a mesma página. */
  alternates: { canonical: '/' },
  openGraph: {
    title: 'RecuperaGlosa — descubra quanto o convênio deixou de pagar',
    description:
      'Envie o XML TISS e saia com o valor glosado por motivo e o recurso de glosa pronto. Grátis para começar.',
    url: '/',
    type: 'website',
    images: [OG_IMAGE],
  },
};

export default function Landing() {
  /* O HTML vem pronto do builder e é conteúdo próprio, versionado neste
     repositório — não entrada de usuário. */
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(SCHEMA)} />
      <div dangerouslySetInnerHTML={{ __html: HTML_LANDING }} />
    </>
  );
}
