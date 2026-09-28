/* ============================================================
   /motivos-de-glosa/[codigo] — uma página por código da Tabela 38.

   Quem recebe um demonstrativo com "glosa 1801" pesquisa exatamente
   isso. Os concorrentes respondem com uma tabela única ou um PDF; aqui
   cada código tem endereço próprio, com o termo oficial, o que fazer, e
   — quando cabe recurso — o texto de contestação que o produto usaria.

   Estática: geradas no build a partir de tabela38.ts / motivos.ts.
   ============================================================ */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PaginaPublica, { Cta } from '@/app/_components/publico/PaginaPublica';
import s from '@/app/_components/publico/publico.module.css';
import CopiarModelo from '@/app/_components/publico/CopiarModelo';
import { OG_IMAGE, SITE, breadcrumb, jsonLd } from '@/lib/seo';
import { ACOES, GRUPOS, TABELA_38, MOTIVOS, VERSAO_TABELA, faixaDe, legivel } from '../dados';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(TABELA_38).map((codigo) => ({ codigo }));
}

function dadosDe(codigo) {
  const m = MOTIVOS[codigo];
  if (!m) return null;
  return { m, faixa: faixaDe(codigo), acao: ACOES[m.acao], grupo: GRUPOS[codigo.slice(0, 2)] };
}

export function generateMetadata({ params }) {
  const d = dadosDe(params.codigo);
  if (!d) return {};
  const nome = legivel(d.m.descricao);
  const curto = nome.length > 60 ? `${nome.slice(0, 57).trimEnd()}…` : nome;
  const titulo = `Glosa ${params.codigo}: ${curto}`;
  const descricao =
    `O que significa o código de glosa ${params.codigo} da Tabela 38 TISS (“${nome}”), ` +
    `se cabe recurso e o que fazer. ${d.acao.rotulo}` +
    (d.m.acao === 'recorrer' ? ' — com modelo de recurso de glosa.' : '.');
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/motivos-de-glosa/${params.codigo}` },
    openGraph: { title: titulo, description: descricao, url: `/motivos-de-glosa/${params.codigo}`, type: 'article', images: [OG_IMAGE] },
  };
}

function modeloRecurso(codigo, descricao, argumento) {
  return `RECURSO DE GLOSA
Prestador: [nome da clínica] — CNPJ [00.000.000/0000-00]
Operadora: [nome da operadora] (ANS [registro])
Guia do prestador: [nº da guia] | Data do atendimento: [dd/mm/aaaa]

Prezados,

Vimos, tempestivamente, apresentar recurso administrativo contra a glosa aplicada na guia acima, sob o código ${codigo} da Tabela 38 do padrão TISS — “${descricao}”, no valor de R$ [valor glosado].

${argumento}

Documentos anexos: [guia, autorização, prontuário, laudo, nota fiscal — o que se aplicar].

Requer-se a reanálise e o consequente reprocessamento do valor glosado, com o respectivo pagamento na próxima competência.

Atenciosamente,
[nome e assinatura do responsável]`;
}

export default function CodigoPage({ params }) {
  const { codigo } = params;
  const d = dadosDe(codigo);
  if (!d) notFound();
  const { m, faixa, acao, grupo } = d;
  const nome = legivel(m.descricao);
  const recorrer = m.acao === 'recorrer';

  /* Vizinhos no mesmo grupo: amarra as páginas entre si e ajuda quem
     recebeu vários códigos parecidos no mesmo demonstrativo. */
  const idx = faixa.codigos.indexOf(codigo);
  const vizinhos = faixa.codigos
    .filter((c) => c !== codigo)
    .sort((a, b) => Math.abs(faixa.codigos.indexOf(a) - idx) - Math.abs(faixa.codigos.indexOf(b) - idx))
    .slice(0, 8)
    .sort();

  const perguntas = [
    {
      q: `O que significa a glosa ${codigo}?`,
      a: `Na Tabela 38 do padrão TISS da ANS, o código ${codigo} corresponde à mensagem “${m.descricao}”. Faz parte do grupo “${faixa.titulo}”, que reúne glosas ligadas a ${grupo.causa}.`,
    },
    {
      q: `Cabe recurso para a glosa ${codigo}?`,
      a: `${acao.rotulo}: ${acao.resumo} ${m.argumento}`,
    },
  ];

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        ['Início', '/'],
        ['Códigos de glosa', '/motivos-de-glosa'],
        [`Glosa ${codigo}`, `/motivos-de-glosa/${codigo}`],
      ]),
      {
        '@type': 'DefinedTerm',
        '@id': `${SITE}/motivos-de-glosa/${codigo}#termo`,
        termCode: codigo,
        name: m.descricao,
        description: `${acao.rotulo}. ${m.argumento}`,
        url: `${SITE}/motivos-de-glosa/${codigo}`,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          '@id': `${SITE}/motivos-de-glosa#tabela-38`,
          name: 'Tabela 38 TISS — Terminologia de mensagens (glosas, negativas e outras)',
          url: `${SITE}/motivos-de-glosa`,
        },
      },
      {
        '@type': 'FAQPage',
        mainEntity: perguntas.map(({ q, a }) => ({
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
          <Link href="/">Início</Link> › <Link href="/motivos-de-glosa">Códigos de glosa</Link> ›{' '}
          <Link href={`/motivos-de-glosa#faixa-${faixa.prefixo}`}>{faixa.titulo}</Link> › <span>{codigo}</span>
        </nav>

        <span className={s.eyebrow}>Tabela 38 TISS · {faixa.titulo}</span>
        <h1>Glosa {codigo}: {nome}</h1>

        <div className={s.resposta}>
          <p>
            <strong>O código {codigo} da Tabela 38 (padrão TISS/ANS) significa “{m.descricao}”.</strong>{' '}
            Orientação: <strong>{acao.rotulo.toLowerCase()}</strong> — {acao.resumo}
          </p>
        </div>

        <div className={s.fatos}>
          <div className={s.fato}><small>Código</small><strong>{codigo}</strong></div>
          <div className={s.fato}><small>Grupo</small><strong>{faixa.titulo}</strong></div>
          <div className={s.fato}><small>O que fazer</small><strong><span className={s[acao.classe]}>{acao.rotulo}</span></strong></div>
        </div>

        <h2>O que fazer diante da glosa {codigo}</h2>
        <p>{m.argumento}</p>

        {recorrer && (
          <>
            <h2>Modelo de recurso para a glosa {codigo}</h2>
            <p>
              Ponto de partida para a contestação. Troque os campos entre colchetes, acrescente o contexto do
              atendimento e anexe a documentação. Cite sempre o termo oficial do código — alegar um motivo
              diferente do que a operadora usou é o caminho mais curto para o indeferimento.
            </p>
            <div className={s.modelo}>{modeloRecurso(codigo, m.descricao, m.argumento)}</div>
            <CopiarModelo texto={modeloRecurso(codigo, m.descricao, m.argumento)} />
            <p>
              Quer esse texto já preenchido com guia, beneficiário e valores? O RecuperaGlosa lê o XML do
              demonstrativo e gera o recurso de cada guia automaticamente.{' '}
              <Link href="/login?modo=cadastro">Testar grátis com meu XML →</Link>
            </p>
          </>
        )}

        <h2>Por que glosas do grupo “{faixa.titulo}” acontecem</h2>
        <p>
          Os códigos da faixa {faixa.prefixo}xx apontam problemas ligados a {grupo.causa}. A orientação acima é
          específica para o código {codigo}; a prevenção abaixo vale para o grupo todo.
        </p>
        <h3>Como evitar</h3>
        <p>{grupo.prevencao}</p>

        <h2>Códigos de glosa relacionados</h2>
        <ul className={s.relacionados}>
          {vizinhos.map((c) => (
            <li key={c}>
              <Link href={`/motivos-de-glosa/${c}`}><b>{c}</b>{legivel(TABELA_38[c])}</Link>
            </li>
          ))}
        </ul>
        <p>
          <Link href={`/motivos-de-glosa#faixa-${faixa.prefixo}`}>Ver todos os códigos do grupo {faixa.titulo} →</Link>
          {' · '}
          <Link href="/recurso-de-glosa">Guia completo: como fazer recurso de glosa →</Link>
        </p>

        <h2>Perguntas frequentes</h2>
        <div className={s.faq}>
          {perguntas.map(({ q, a }) => (
            <details key={q} open>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>

        <Cta
          titulo={`Tem a glosa ${codigo} no seu demonstrativo?`}
          texto="Envie o XML TISS do convênio e veja em segundos quanto foi glosado, por qual motivo, o que dá para recuperar — e o recurso já redigido para cada guia."
        />

        <p className={s.aviso}>
          Fonte do termo oficial: Tabela 38 — Terminologia de mensagens (glosas, negativas e outras), padrão
          TISS, ANS (versão de {VERSAO_TABELA}). Confirme a versão vigente exigida pela sua operadora. A
          orientação e o modelo de recurso são interpretação do RecuperaGlosa, não texto oficial, e não
          garantem a reversão da glosa.
        </p>
      </article>
    </PaginaPublica>
  );
}
