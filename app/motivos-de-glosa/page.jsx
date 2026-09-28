/* ============================================================
   /motivos-de-glosa — a Tabela 38 inteira, navegável.

   Página-mãe das ~600 páginas de código: recebe o link de todas elas e
   distribui para todas. Mira buscas como "tabela 38 tiss", "códigos de
   glosa" e "motivos de glosa".
   ============================================================ */
import Link from 'next/link';
import PaginaPublica, { Cta } from '@/app/_components/publico/PaginaPublica';
import s from '@/app/_components/publico/publico.module.css';
import { OG_IMAGE, SITE, breadcrumb, jsonLd } from '@/lib/seo';
import BuscaCodigos from './BuscaCodigos';
import { ACOES, CONTAGEM, FAIXAS, TABELA_38, TOTAL, VERSAO_TABELA, legivel } from './dados';


const TITULO = 'Códigos de glosa TISS: Tabela 38 completa e o que fazer';
const DESCRICAO = `Consulte os ${TOTAL} códigos de glosa da Tabela 38 do padrão TISS (ANS): o significado de cada um, se cabe recurso e o modelo de contestação.`;

export const metadata = {
  title: { absolute: `${TITULO} · RecuperaGlosa` },
  description: DESCRICAO,
  alternates: { canonical: '/motivos-de-glosa' },
  openGraph: { title: TITULO, description: DESCRICAO, url: '/motivos-de-glosa', type: 'article', images: [OG_IMAGE] },
};

/* Códigos que costumam pesar em consultório e clínica pequena —
   os mesmos que ganharam análise própria em motivos.ts. */
const DESTAQUES = ['1402', '1403', '1702', '1801', '2601', '3007', '3052', '1008', '1701', '2909'];

export default function MotivosPage() {
  const faixas = FAIXAS.map((f) => ({
    prefixo: f.prefixo,
    titulo: f.titulo,
    itens: f.codigos.map((c) => [c, legivel(TABELA_38[c])]),
  }));

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        ['Início', '/'],
        ['Códigos de glosa', '/motivos-de-glosa'],
      ]),
      {
        '@type': 'DefinedTermSet',
        '@id': `${SITE}/motivos-de-glosa#tabela-38`,
        name: 'Tabela 38 TISS — Terminologia de mensagens (glosas, negativas e outras)',
        description: DESCRICAO,
        url: `${SITE}/motivos-de-glosa`,
        inLanguage: 'pt-BR',
      },
    ],
  };

  return (
    <PaginaPublica>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <div className={s.article} style={{ maxWidth: 900 }}>
        <nav className={s.crumbs} aria-label="Você está em">
          <Link href="/">Início</Link> › <span>Códigos de glosa</span>
        </nav>

        <span className={s.eyebrow}>Tabela 38 · padrão TISS</span>
        <h1>Códigos de glosa: a Tabela 38 completa, com o que fazer em cada um</h1>

        <div className={s.resposta}>
          <p>
            <strong>A Tabela 38 do padrão TISS, da ANS, lista as mensagens que as operadoras usam para justificar
            glosas e negativas.</strong> São {TOTAL} códigos em {FAIXAS.length} grupos. Pelo código que vem no
            demonstrativo de pagamento você sabe o motivo da glosa — e se vale recorrer, corrigir ou deixar passar.
          </p>
        </div>

        <div className={s.fatos}>
          <div className={s.fato}><small>{ACOES.recorrer.rotulo}</small><strong>{CONTAGEM.recorrer ?? 0} códigos</strong></div>
          <div className={s.fato}><small>Corrigir ou enviar documento</small><strong>{(CONTAGEM.corrigir_reapresentar ?? 0) + (CONTAGEM.enviar_documento ?? 0)} códigos</strong></div>
          <div className={s.fato}><small>Sem recurso, aguardar ou favorável</small><strong>{(CONTAGEM.sem_recurso ?? 0) + (CONTAGEM.aguardar ?? 0) + (CONTAGEM.favoravel ?? 0)} códigos</strong></div>
        </div>

        <p>
          Nem todo código é uma glosa contra você: a tabela também traz avisos favoráveis (como <Link href="/motivos-de-glosa/3095">3095 — recurso de glosa acatado</Link>)
          e mensagens de que o prazo acabou (<Link href="/motivos-de-glosa/2909">2909</Link>). Recorrer de tudo
          desperdiça o tempo da equipe e a credibilidade com a operadora. Cada página abaixo diz qual é o caso.
        </p>

        <h2>Códigos que merecem atenção</h2>
        <ul className={s.relacionados}>
          {DESTAQUES.map((c) => (
            <li key={c}>
              <Link href={`/motivos-de-glosa/${c}`}><b>{c}</b>{legivel(TABELA_38[c])}</Link>
            </li>
          ))}
        </ul>

        <h2>Grupos da Tabela 38</h2>
        <div className={s.indice}>
          {FAIXAS.map((f) => (
            <a key={f.prefixo} href={`#faixa-${f.prefixo}`}>{f.prefixo}xx · {f.titulo}</a>
          ))}
        </div>

        <BuscaCodigos faixas={faixas} />

        <Cta
          titulo="Não precisa procurar código por código."
          texto="Envie o XML do demonstrativo e o RecuperaGlosa identifica cada glosa, explica o motivo, separa o que dá para recuperar e redige o recurso."
        />

        <p className={s.aviso}>
          Termos transcritos da Tabela 38 — Terminologia de mensagens (glosas, negativas e outras), padrão TISS,
          ANS, versão de {VERSAO_TABELA}. Operadoras podem usar versões mais recentes ou códigos próprios;
          confirme a versão vigente no seu contrato. As orientações são interpretação do RecuperaGlosa.
        </p>
      </div>
    </PaginaPublica>
  );
}
