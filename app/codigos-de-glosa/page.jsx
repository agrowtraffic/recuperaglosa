/* ============================================================
   /codigos-de-glosa — a Tabela 38 inteira, navegável.

   Página-mãe das ~800 páginas de código: recebe o link de todas elas e
   distribui para todas. Mira "códigos de glosa", "tabela 38 tiss" e
   "motivos de glosa".

   Traz os vigentes e os encerrados em 30/06/2026. Quem pesquisa um
   código geralmente tem um demonstrativo na mão, e demonstrativo antigo
   (ou de operadora que não migrou) ainda vem com código encerrado.
   ============================================================ */
import Link from 'next/link';
import PaginaPublica, { Cta } from '@/app/_components/publico/PaginaPublica';
import s from '@/app/_components/publico/publico.module.css';
import { OG_IMAGE, SITE, breadcrumb, jsonLd } from '@/lib/seo';
import BuscaCodigos from './BuscaCodigos';
import {
  ACOES, CONTAGEM, DATA_ENCERRAMENTO, EQUIVALENTE_VIGENTE, FAIXAS, MOTIVOS, TOTAL, TOTAL_ENCERRADOS,
  TOTAL_NOVOS_2025, TOTAL_VIGENTES, VERSAO_EXTENSO, dataBr, legivel,
} from './dados';

const TITULO = `Códigos de glosa TISS: Tabela 38 atualizada (${VERSAO_EXTENSO})`;
const DESCRICAO = `Consulte os códigos de glosa da Tabela 38 do padrão TISS (ANS): ${TOTAL_VIGENTES} vigentes e ${TOTAL_ENCERRADOS} encerrados em ${dataBr(DATA_ENCERRAMENTO)}. Significado, se cabe recurso e modelo de contestação para cada um.`;

export const metadata = {
  title: { absolute: `${TITULO} · RecuperaGlosa` },
  description: DESCRICAO,
  alternates: { canonical: '/codigos-de-glosa' },
  openGraph: { title: TITULO, description: DESCRICAO, url: '/codigos-de-glosa', type: 'article', images: [OG_IMAGE] },
};

/* Vigentes que pesam no dia a dia de consultório e clínica pequena:
   duplicidade, senha, documentação, codificação, carência, prazo. */
const DESTAQUES = ['3209', '3306', '3230', '3219', '1801', '2601', '3202', '3288', '3171', '3214', '2909', '3095'];

const PERGUNTAS = [
  {
    q: 'O que é código de glosa?',
    a: 'É o número que a operadora usa no demonstrativo de pagamento para dizer por que não pagou, no todo ou em parte, um item cobrado. Cada código corresponde a uma mensagem padronizada da Tabela 38 do padrão TISS — por exemplo, 3209 indica cobrança em duplicidade.',
  },
  {
    q: 'O que é a Tabela 38 do padrão TISS?',
    a: 'É a terminologia oficial da ANS para as mensagens de glosa, negativa de autorização e outros avisos trocados entre operadoras e prestadores. Faz parte das terminologias da TUSS e é atualizada periodicamente pela ANS; esta página segue a versão de ' + VERSAO_EXTENSO + '.',
  },
  {
    q: 'Qual a diferença entre TISS e TUSS?',
    a: 'TISS (Troca de Informações na Saúde Suplementar) é o padrão obrigatório da ANS para a troca eletrônica de dados entre operadoras e prestadores: define os arquivos, as guias e os demonstrativos. TUSS (Terminologia Unificada da Saúde Suplementar) é o vocabulário usado dentro desse padrão: os códigos de procedimentos, materiais, medicamentos e também as tabelas de apoio, como a Tabela 38.',
  },
  {
    q: 'Onde encontro o código de glosa no demonstrativo?',
    a: 'No demonstrativo de pagamento ou de análise de conta, ao lado de cada item glosado. No arquivo XML do padrão TISS, ele aparece no campo codigoGlosa, junto do valor glosado. O RecuperaGlosa lê esse campo automaticamente e traduz cada código.',
  },
  {
    q: `O que aconteceu com os códigos encerrados em ${dataBr(DATA_ENCERRAMENTO)}?`,
    a: `A ANS encerrou ${TOTAL_ENCERRADOS} códigos em ${dataBr(DATA_ENCERRAMENTO)}, e a partir de dezembro/2025 criou ${TOTAL_NOVOS_2025} mensagens novas (3156 a 3312), várias com o mesmo termo de códigos antigos. Os encerrados ainda aparecem em demonstrativos de competências anteriores; o recurso deve citar o código exatamente como veio.`,
  },
  {
    q: 'Todo código de glosa permite recurso?',
    a: `Não. Dos ${TOTAL_VIGENTES} códigos vigentes, ${CONTAGEM.recorrer ?? 0} têm tese de contestação; os demais se resolvem enviando documento, corrigindo e reapresentando, ou são limites contratuais, decisões finais e avisos favoráveis. Cada página de código diz qual é o caso.`,
  },
];

export default function CodigosPage() {
  const faixas = FAIXAS.map((f) => ({
    id: f.id,
    rotulo: f.rotulo,
    titulo: f.titulo,
    nota:
      f.id === '2025'
        ? 'Lista criada pela ANS em dezembro/2025, em ordem alfabética: aqui o número não indica o assunto. O assunto de cada código aparece na página dele.'
        : null,
    itens: f.codigos.map((c) => [c, legivel(MOTIVOS[c].descricao), MOTIVOS[c].vigente]),
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        ['Início', '/'],
        ['Códigos de glosa', '/codigos-de-glosa'],
      ]),
      {
        '@type': 'DefinedTermSet',
        '@id': `${SITE}/codigos-de-glosa#tabela-38`,
        name: 'Tabela 38 TISS — Terminologia de mensagens (glosas, negativas e outras)',
        description: DESCRICAO,
        url: `${SITE}/codigos-de-glosa`,
        inLanguage: 'pt-BR',
        version: VERSAO_EXTENSO,
      },
      {
        '@type': 'FAQPage',
        mainEntity: PERGUNTAS.map(({ q, a }) => ({
          '@type': 'Question',
          name: q,
          acceptedAnswer: { '@type': 'Answer', text: a },
        })),
      },
    ],
  };

  const exemplosEquivalencia = ['1007', '3052', '3048'].filter((c) => EQUIVALENTE_VIGENTE[c]);

  return (
    <PaginaPublica>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <div className={s.article} style={{ maxWidth: 900 }}>
        <nav className={s.crumbs} aria-label="Você está em">
          <Link href="/">Início</Link> › <span>Códigos de glosa</span>
        </nav>

        <span className={s.eyebrow}>Tabela 38 · padrão TISS · versão {VERSAO_EXTENSO}</span>
        <h1>Códigos de glosa TISS: a Tabela 38 completa e o que fazer em cada um</h1>

        <div className={s.resposta}>
          <p>
            <strong>Os códigos de glosa são as mensagens padronizadas da Tabela 38 do padrão TISS, da ANS</strong>, que
            a operadora usa no demonstrativo para justificar o que não pagou. Aqui estão todos os {TOTAL} códigos, com os{' '}
            {TOTAL_VIGENTES} vigentes e os {TOTAL_ENCERRADOS} encerrados em {dataBr(DATA_ENCERRAMENTO)}, e, para cada um,
            o significado, se vale recorrer e o modelo de recurso.
          </p>
        </div>

        <div className={s.fatos4}>
          <div className={s.fato}><small>Vigentes</small><strong>{TOTAL_VIGENTES}</strong></div>
          <div className={s.fato}><small>Encerrados em {dataBr(DATA_ENCERRAMENTO)}</small><strong>{TOTAL_ENCERRADOS}</strong></div>
          <div className={s.fato}><small>Criados em dez/2025</small><strong>{TOTAL_NOVOS_2025}</strong></div>
          <div className={s.fato}><small>Vigentes com tese de recurso</small><strong>{CONTAGEM.recorrer ?? 0}</strong></div>
        </div>

        <h2>Códigos que merecem atenção</h2>
        <ul className={s.relacionados}>
          {DESTAQUES.map((c) => (
            <li key={c}>
              <Link href={`/codigos-de-glosa/${c}`}><b>{c}</b>{legivel(MOTIVOS[c].descricao)}</Link>
            </li>
          ))}
        </ul>

        <h2 id="o-que-mudou">O que mudou na Tabela 38</h2>
        <p>
          A ANS fez a maior revisão da Tabela 38 em anos. A partir de dezembro/2025 entraram {TOTAL_NOVOS_2025} mensagens
          novas (3156 a 3312), organizadas numa lista única em ordem alfabética, e em {dataBr(DATA_ENCERRAMENTO)}{' '}
          {TOTAL_ENCERRADOS} códigos antigos foram encerrados. Na prática:
        </p>
        <ul>
          <li>
            <strong>Vários códigos antigos têm substituto com o mesmo termo</strong>
            {exemplosEquivalencia.length > 0 && (
              <>
                {' '}— por exemplo,{' '}
                {exemplosEquivalencia.map((c, i) => (
                  <span key={c}>
                    {i > 0 && ', '}
                    <Link href={`/codigos-de-glosa/${c}`}>{c}</Link> → <Link href={`/codigos-de-glosa/${EQUIVALENTE_VIGENTE[c]}`}>{EQUIVALENTE_VIGENTE[c]}</Link>
                  </span>
                ))}
              </>
            )}
            . A página de cada código encerrado indica o equivalente, quando existe.
          </li>
          <li>
            <strong>Nas mensagens novas, o número não indica mais o assunto.</strong> Carência, odontologia, reembolso e
            cobrança ficam lado a lado; a classificação de cada uma está na página do código.
          </li>
          <li>
            <strong>Código encerrado ainda aparece.</strong> Demonstrativos de competências anteriores e operadoras que não
            atualizaram os sistemas seguem enviando-os. O recurso deve citar o código e o termo exatamente como vieram.
          </li>
        </ul>

        <h2>O que fazer com cada tipo de código</h2>
        <ul>
          {Object.entries(ACOES).map(([k, a]) => (
            <li key={k}>
              <span className={s[a.classe]}>{a.rotulo}</span> — {CONTAGEM[k] ?? 0} vigentes: {a.resumo}
            </li>
          ))}
        </ul>
        <p>
          Recorrer de tudo desperdiça o tempo da equipe e a credibilidade com a operadora. Veja o{' '}
          <Link href="/recurso-de-glosa">guia de recurso de glosa</Link> para o passo a passo.
        </p>

        <h2>Todos os códigos de glosa</h2>
        <div className={s.indice}>
          {FAIXAS.map((f) => (
            <a key={f.id} href={`#faixa-${f.id}`}>{f.rotulo} · {f.titulo}</a>
          ))}
        </div>

        <BuscaCodigos faixas={faixas} />

        <Cta
          titulo="Não precisa procurar código por código."
          texto="Envie o XML do demonstrativo e o RecuperaGlosa identifica cada glosa, explica o motivo, separa o que dá para recuperar e redige o recurso."
        />

        <h2 id="perguntas">Perguntas frequentes sobre códigos de glosa</h2>
        <div className={s.faq}>
          {PERGUNTAS.map(({ q, a }) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>

        <p className={s.aviso}>
          Termos e datas de vigência transcritos da Tabela 38 — Terminologia de mensagens (glosas, negativas e outras),
          padrão TISS, ANS, versões de maio/2026 e {VERSAO_EXTENSO}, disponíveis no{' '}
          <a href="https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss" target="_blank" rel="noopener noreferrer">portal da ANS</a>.
          Operadoras podem usar códigos próprios; confirme no seu contrato. Orientações e equivalências são
          interpretação do RecuperaGlosa.
        </p>
      </div>
    </PaginaPublica>
  );
}
