/* ============================================================
   /blog/[slug] — artigo no formato pergunta e resposta.

   O título é a pergunta que as pessoas fazem; a resposta direta vem
   logo abaixo, em 2–3 linhas, que é o trecho que o Google destaca e
   que os assistentes de IA citam. O aprofundamento vem depois.
   ============================================================ */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PaginaPublica, { Cta } from '@/app/_components/publico/PaginaPublica';
import s from '@/app/_components/publico/publico.module.css';
import { OG_IMAGE, ORGANIZACAO, SITE, breadcrumb, jsonLd } from '@/lib/seo';
import { POSTS, postPorSlug } from '../_posts';

export const dynamicParams = false;

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const p = postPorSlug(params.slug);
  if (!p) return {};
  return {
    title: { absolute: `${p.tituloSeo} · RecuperaGlosa` },
    description: p.descricao,
    alternates: { canonical: `/blog/${p.slug}` },
    openGraph: {
      title: p.tituloSeo,
      description: p.descricao,
      url: `/blog/${p.slug}`,
      type: 'article',
      publishedTime: p.publicado,
      modifiedTime: p.atualizado,
      images: [OG_IMAGE],
    },
  };
}

const dataExtenso = (iso) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

export default function ArtigoPage({ params }) {
  const p = postPorSlug(params.slug);
  if (!p) notFound();
  const { Conteudo } = p;
  const outros = POSTS.filter((o) => o.slug !== p.slug);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        ['Início', '/'],
        ['Blog', '/blog'],
        [p.titulo, `/blog/${p.slug}`],
      ]),
      {
        '@type': 'BlogPosting',
        headline: p.tituloSeo,
        description: p.descricao,
        inLanguage: 'pt-BR',
        datePublished: p.publicado,
        dateModified: p.atualizado,
        mainEntityOfPage: `${SITE}/blog/${p.slug}`,
        image: `${SITE}/opengraph-image`,
        author: ORGANIZACAO,
        publisher: ORGANIZACAO,
      },
      {
        '@type': 'FAQPage',
        mainEntity: p.perguntas.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };

  return (
    <PaginaPublica>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <article className={s.article}>
        <nav className={s.crumbs} aria-label="Você está em">
          <Link href="/">Início</Link> › <Link href="/blog">Blog</Link> › <span>{p.titulo}</span>
        </nav>

        <span className={s.eyebrow}>
          Perguntas e respostas · <time dateTime={p.atualizado}>atualizado em {dataExtenso(p.atualizado)}</time>
        </span>
        <h1>{p.titulo}</h1>

        <div className={s.resposta}>
          <p>{p.resposta}</p>
        </div>

        <Conteudo />

        <Cta
          titulo="Quanto o convênio deixou de pagar para você?"
          texto="Envie o XML do demonstrativo TISS e veja em segundos o valor glosado por motivo e o recurso já redigido para cada guia."
        />

        <h2 id="perguntas">Perguntas frequentes</h2>
        <div className={s.faq}>
          {p.perguntas.map(({ q, a }) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>

        {outros.length > 0 && (
          <>
            <h2>Leia também</h2>
            <ul className={s.relacionados}>
              {outros.map((o) => (
                <li key={o.slug}><Link href={`/blog/${o.slug}`}>{o.titulo}</Link></li>
              ))}
              <li><Link href="/recurso-de-glosa">Recurso de glosa: como fazer, prazo e modelo pronto</Link></li>
              <li><Link href="/codigos-de-glosa">Códigos de glosa: a Tabela 38 completa</Link></li>
            </ul>
          </>
        )}

        <p className={s.aviso}>
          Conteúdo informativo, produzido pela equipe do RecuperaGlosa. Não é assessoria jurídica; regras de prazo e canal
          de envio variam por contrato e operadora.
        </p>
      </article>
    </PaginaPublica>
  );
}
