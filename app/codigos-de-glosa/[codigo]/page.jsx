/* ============================================================
   /codigos-de-glosa/[codigo] — uma página por código da Tabela 38.

   Quem recebe um demonstrativo com "glosa 1801" pesquisa exatamente
   isso. Os concorrentes respondem com uma tabela única ou um PDF; aqui
   cada código tem endereço próprio, com o termo oficial, a vigência, o
   que fazer e — quando cabe recurso — o texto de contestação que o
   produto usaria.

   Códigos encerrados pela ANS também têm página: demonstrativos antigos
   e operadoras que não migraram continuam a mandá-los, e é justamente
   quem recebe um deles que vai pesquisar.

   Estáticas: geradas no build a partir de tabela38.ts / motivos.ts.
   ============================================================ */
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PaginaPublica, { Cta } from '@/app/_components/publico/PaginaPublica';
import s from '@/app/_components/publico/publico.module.css';
import CopiarModelo from '@/app/_components/publico/CopiarModelo';
import { OG_IMAGE, SITE, breadcrumb, jsonLd } from '@/lib/seo';
import {
  ACOES, ASSUNTOS, EQUIVALENTE_VIGENTE, MOTIVOS, TABELA_38, VERSAO_EXTENSO,
  dataBr, faixaDe, legivel,
} from '../dados';

export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(TABELA_38).map((codigo) => ({ codigo }));
}

function dadosDe(codigo) {
  const m = MOTIVOS[codigo];
  if (!m) return null;
  return { m, faixa: faixaDe(codigo), acao: ACOES[m.acao], assunto: ASSUNTOS[m.categoria] };
}

export function generateMetadata({ params }) {
  const d = dadosDe(params.codigo);
  if (!d) return {};
  const nome = legivel(d.m.descricao);
  const curto = nome.length > 55 ? `${nome.slice(0, 52).trimEnd()}…` : nome;
  const titulo = `Glosa ${params.codigo}: ${curto}`;
  const status = d.m.vigente ? '' : ` Código encerrado pela ANS em ${dataBr(d.m.vigencia.fim)}.`;
  const descricao =
    `O que significa o código de glosa ${params.codigo} da Tabela 38 TISS (“${nome}”), ` +
    `se cabe recurso e o que fazer. ${d.acao.rotulo}` +
    (d.m.acao === 'recorrer' ? ', com modelo de recurso de glosa.' : '.') + status;
  return {
    title: titulo,
    description: descricao,
    alternates: { canonical: `/codigos-de-glosa/${params.codigo}` },
    openGraph: { title: titulo, description: descricao, url: `/codigos-de-glosa/${params.codigo}`, type: 'article', images: [OG_IMAGE] },
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

/* Relacionados: mesmo assunto, vigentes primeiro, depois os mais
   próximos em número. Amarra as páginas entre si e ajuda quem recebeu
   vários códigos parecidos no mesmo demonstrativo. */
function relacionados(m, excluir) {
  return Object.values(MOTIVOS)
    .filter((o) => o.categoria === m.categoria && o.codigo !== m.codigo && !excluir.includes(o.codigo))
    .sort((a, b) =>
      (b.vigente - a.vigente) ||
      Math.abs(Number(a.codigo) - Number(m.codigo)) - Math.abs(Number(b.codigo) - Number(m.codigo)))
    .slice(0, 8)
    .sort((a, b) => a.codigo.localeCompare(b.codigo));
}

export default function CodigoPage({ params }) {
  const { codigo } = params;
  const d = dadosDe(codigo);
  if (!d) notFound();
  const { m, faixa, acao, assunto } = d;
  const nome = legivel(m.descricao);
  const recorrer = m.acao === 'recorrer';
  const equivalente = !m.vigente ? EQUIVALENTE_VIGENTE[codigo] : null;
  const substituiu = Object.entries(EQUIVALENTE_VIGENTE).filter(([, v]) => v === codigo).map(([k]) => k);
  const vizinhos = relacionados(m, [equivalente, ...substituiu].filter(Boolean));

  const statusTexto = m.vigente
    ? `vigente desde ${dataBr(m.vigencia.inicio)}`
    : `encerrado pela ANS em ${dataBr(m.vigencia.fim)}`;

  const perguntas = [
    {
      q: `O que significa a glosa ${codigo}?`,
      a: `Na Tabela 38 do padrão TISS da ANS, o código ${codigo} corresponde à mensagem “${m.descricao}”. É uma mensagem sobre ${assunto.causa}. O código está ${statusTexto}.`,
    },
    {
      q: `Cabe recurso para a glosa ${codigo}?`,
      a: `${acao.rotulo}: ${acao.resumo} ${m.argumento}`,
    },
  ];
  if (!m.vigente) {
    perguntas.push({
      q: `A glosa ${codigo} ainda vale?`,
      a: `A ANS encerrou o código ${codigo} em ${dataBr(m.vigencia.fim)}. Ele ainda aparece em demonstrativos de competências anteriores e de operadoras que não atualizaram os sistemas; nesses casos, o recurso deve citar o código e o termo exatamente como vieram no demonstrativo.` +
        (equivalente ? ` A mensagem vigente com o mesmo termo é a ${equivalente}.` : ''),
    });
  }

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        ['Início', '/'],
        ['Códigos de glosa', '/codigos-de-glosa'],
        [`Glosa ${codigo}`, `/codigos-de-glosa/${codigo}`],
      ]),
      {
        '@type': 'DefinedTerm',
        '@id': `${SITE}/codigos-de-glosa/${codigo}#termo`,
        termCode: codigo,
        name: m.descricao,
        description: `${acao.rotulo}. ${m.argumento}`,
        url: `${SITE}/codigos-de-glosa/${codigo}`,
        inDefinedTermSet: {
          '@type': 'DefinedTermSet',
          '@id': `${SITE}/codigos-de-glosa#tabela-38`,
          name: 'Tabela 38 TISS — Terminologia de mensagens (glosas, negativas e outras)',
          url: `${SITE}/codigos-de-glosa`,
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
          <Link href="/">Início</Link> › <Link href="/codigos-de-glosa">Códigos de glosa</Link> ›{' '}
          <Link href={`/codigos-de-glosa#faixa-${faixa.id}`}>{faixa.titulo}</Link> › <span>{codigo}</span>
        </nav>

        <span className={s.eyebrow}>Tabela 38 TISS · {assunto.titulo}</span>
        <h1>Glosa {codigo}: {nome}</h1>

        {!m.vigente && (
          <div className={s.alerta}>
            <p>
              <strong>Código encerrado pela ANS em {dataBr(m.vigencia.fim)}.</strong> Ele ainda aparece em
              demonstrativos de competências anteriores e de operadoras que não migraram. Se veio no seu, o recurso
              continua citando este código e este termo.
              {equivalente && (
                <> Mensagem vigente com o mesmo termo:{' '}
                  <Link href={`/codigos-de-glosa/${equivalente}`}><strong>{equivalente} — {legivel(TABELA_38[equivalente])}</strong></Link>.
                </>
              )}
            </p>
          </div>
        )}

        <div className={s.resposta}>
          <p>
            <strong>O código {codigo} da Tabela 38 (padrão TISS/ANS) significa “{m.descricao}”.</strong>{' '}
            Orientação: <strong>{acao.rotulo.toLowerCase()}</strong> — {acao.resumo}
          </p>
        </div>

        <div className={s.fatos}>
          <div className={s.fato}><small>Situação</small><strong><span className={m.vigente ? s.seloFavoravel : s.seloSem}>{m.vigente ? 'Vigente' : 'Encerrado'}</span></strong></div>
          <div className={s.fato}><small>Assunto</small><strong>{assunto.titulo}</strong></div>
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

        <h2>Por que essa glosa acontece</h2>
        <p>
          A glosa {codigo} é do grupo de mensagens sobre {assunto.causa}. A orientação acima é específica para o
          código {codigo}; a prevenção abaixo vale para o assunto todo.
        </p>
        <h3>Como evitar</h3>
        <p>{assunto.prevencao}</p>

        <h2>Vigência na Tabela 38</h2>
        <ul>
          <li>Início de vigência: {dataBr(m.vigencia.inicio)}</li>
          <li>{m.vigente ? `Situação: vigente na versão ${VERSAO_EXTENSO} da Tabela 38` : `Fim de vigência: ${dataBr(m.vigencia.fim)}`}</li>
          {substituiu.length > 0 && (
            <li>
              Tem o mesmo termo de código(s) encerrado(s):{' '}
              {substituiu.map((c, i) => (
                <span key={c}>{i > 0 && ', '}<Link href={`/codigos-de-glosa/${c}`}>{c}</Link></span>
              ))}
            </li>
          )}
        </ul>

        <h2>Códigos de glosa relacionados</h2>
        <ul className={s.relacionados}>
          {vizinhos.map((o) => (
            <li key={o.codigo}>
              <Link href={`/codigos-de-glosa/${o.codigo}`}>
                <b>{o.codigo}</b>{legivel(o.descricao)}{!o.vigente && <em className={s.tagEncerrado}>encerrado</em>}
              </Link>
            </li>
          ))}
        </ul>
        <p>
          <Link href={`/codigos-de-glosa#faixa-${faixa.id}`}>Ver todos os códigos {faixa.rotulo} →</Link>
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
          Fonte do termo e da vigência: Tabela 38 — Terminologia de mensagens (glosas, negativas e outras), padrão
          TISS, ANS (versões de maio/2026 e {VERSAO_EXTENSO}). A orientação e o modelo de recurso são interpretação
          do RecuperaGlosa, não texto oficial, e não garantem a reversão da glosa.
        </p>
      </article>
    </PaginaPublica>
  );
}
