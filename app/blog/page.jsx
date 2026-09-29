/* /blog — índice dos artigos de perguntas e respostas sobre glosa. */
import Link from 'next/link';
import PaginaPublica, { Cta } from '@/app/_components/publico/PaginaPublica';
import s from '@/app/_components/publico/publico.module.css';
import { OG_IMAGE, SITE, breadcrumb, jsonLd } from '@/lib/seo';
import { POSTS } from './_posts';

const TITULO = 'Blog: perguntas e respostas sobre glosa de convênio';
const DESCRICAO =
  'Respostas diretas sobre glosa de convênio para clínicas e consultórios: o que é glosa, tipos de glosa, códigos da Tabela 38, prazos e como recorrer.';

export const metadata = {
  title: { absolute: `${TITULO} · RecuperaGlosa` },
  description: DESCRICAO,
  alternates: { canonical: '/blog' },
  openGraph: { title: TITULO, description: DESCRICAO, url: '/blog', type: 'website', images: [OG_IMAGE] },
};

export default function BlogPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        ['Início', '/'],
        ['Blog', '/blog'],
      ]),
      {
        '@type': 'Blog',
        name: 'Blog RecuperaGlosa',
        description: DESCRICAO,
        url: `${SITE}/blog`,
        inLanguage: 'pt-BR',
        blogPost: POSTS.map((p) => ({
          '@type': 'BlogPosting',
          headline: p.tituloSeo,
          url: `${SITE}/blog/${p.slug}`,
          datePublished: p.publicado,
        })),
      },
    ],
  };

  return (
    <PaginaPublica>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <div className={s.article}>
        <nav className={s.crumbs} aria-label="Você está em">
          <Link href="/">Início</Link> › <span>Blog</span>
        </nav>
        <span className={s.eyebrow}>Perguntas e respostas</span>
        <h1>Glosa de convênio, explicada em perguntas e respostas</h1>
        <p className={s.lead}>
          Respostas diretas para quem cuida do faturamento de clínica ou consultório — com os códigos oficiais da Tabela 38
          e o que fazer em cada caso.
        </p>

        <ul className={s.posts}>
          {POSTS.map((p) => (
            <li key={p.slug}>
              <Link href={`/blog/${p.slug}`}>
                <strong>{p.titulo}</strong>
                <span>{p.descricao}</span>
              </Link>
            </li>
          ))}
        </ul>

        <h2>Guias e consultas</h2>
        <ul className={s.relacionados}>
          <li><Link href="/recurso-de-glosa">Recurso de glosa: como fazer, prazo e modelo pronto</Link></li>
          <li><Link href="/codigos-de-glosa">Códigos de glosa: a Tabela 38 completa e atualizada</Link></li>
        </ul>

        <Cta
          titulo="Prefere ver direto no seu demonstrativo?"
          texto="Envie o XML TISS e veja o valor glosado, o motivo de cada glosa e o recurso já redigido."
        />
      </div>
    </PaginaPublica>
  );
}
