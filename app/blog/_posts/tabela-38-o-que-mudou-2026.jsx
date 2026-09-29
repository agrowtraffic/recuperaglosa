/* Artigo com os números da revisão da Tabela 38. Todos os números e a
   tabela de equivalências saem dos dados (tabela38.ts / motivos.ts) —
   nada digitado à mão, para o texto não descolar da tabela quando ela
   for regenerada. */
import Link from 'next/link';
import s from '@/app/_components/publico/publico.module.css';
import Codigo from './Codigo';
import {
  ASSUNTOS, DATA_ENCERRAMENTO, EQUIVALENTE_VIGENTE, MOTIVOS, TOTAL, TOTAL_ENCERRADOS, TOTAL_NOVOS_2025,
  TOTAL_VIGENTES, VERSAO_EXTENSO, dataBr,
} from '@/app/codigos-de-glosa/dados';

const PORTAL_ANS =
  'https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss';

const novos = Object.values(MOTIVOS).filter((m) => m.vigencia?.inicio === '2025-12-01' && m.codigo >= '3156');
const novosPorAssunto = Object.entries(
  novos.reduce((acc, m) => ({ ...acc, [m.categoria]: (acc[m.categoria] ?? 0) + 1 }), {}),
).sort((a, b) => b[1] - a[1]);

export const post = {
  slug: 'tabela-38-o-que-mudou-2026',
  titulo: 'O que mudou na Tabela 38 da ANS em 2026?',
  tituloSeo: `Tabela 38 TISS 2026: ${TOTAL_NOVOS_2025} códigos novos e ${TOTAL_ENCERRADOS} encerrados`,
  descricao: `A ANS criou ${TOTAL_NOVOS_2025} códigos de glosa em dezembro/2025 e encerrou ${TOTAL_ENCERRADOS} em ${dataBr(DATA_ENCERRAMENTO)}. Veja o que mudou, as equivalências entre códigos antigos e novos e o que a clínica precisa ajustar.`,
  publicado: '2026-09-28',
  atualizado: '2026-09-28',
  resposta: (
    <>
      <strong>A ANS fez uma revisão grande da Tabela 38 do padrão TISS:</strong> criou {TOTAL_NOVOS_2025} mensagens novas
      de glosa e negativa (códigos 3156 a 3312), vigentes desde 01/12/2025, e encerrou {TOTAL_ENCERRADOS} códigos antigos
      em {dataBr(DATA_ENCERRAMENTO)}. Na versão de {VERSAO_EXTENSO}, a tabela tem {TOTAL_VIGENTES} códigos vigentes.
    </>
  ),
  perguntas: [
    {
      q: 'Os códigos de glosa encerrados ainda podem aparecer no demonstrativo?',
      a: 'Sim. Demonstrativos de competências anteriores a julho/2026 e operadoras que ainda não atualizaram os sistemas continuam trazendo códigos encerrados. Ao recorrer, cite o código e o termo exatamente como vieram no demonstrativo.',
    },
    {
      q: 'Existe um de-para oficial entre códigos antigos e novos?',
      a: `Nem todo código encerrado tem substituto. Comparando os termos, ${Object.keys(EQUIVALENTE_VIGENTE).length} códigos encerrados têm um código novo com o mesmo texto (ou quase), listados neste artigo. Os demais foram absorvidos por mensagens mais genéricas ou deixaram de existir.`,
    },
    {
      q: 'Onde baixar a Tabela 38 oficial?',
      a: 'No portal do Padrão TISS da ANS, no pacote “Componente de Representação de Conceitos em Saúde”, arquivo “TUSS - Demais terminologias”, aba “Tab 38”.',
    },
  ],
};

const TH = { padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--line)' };
const TD = { padding: '8px 10px', verticalAlign: 'top', borderBottom: '1px solid var(--line)' };

export default function Conteudo() {
  const equivalencias = Object.entries(EQUIVALENTE_VIGENTE);

  return (
    <>
      <h2 id="numeros">A revisão em números</h2>
      <div className={s.fatos4}>
        <div className={s.fato}><small>Total na tabela</small><strong>{TOTAL}</strong></div>
        <div className={s.fato}><small>Vigentes ({VERSAO_EXTENSO})</small><strong>{TOTAL_VIGENTES}</strong></div>
        <div className={s.fato}><small>Criados em 01/12/2025</small><strong>{TOTAL_NOVOS_2025}</strong></div>
        <div className={s.fato}><small>Encerrados em {dataBr(DATA_ENCERRAMENTO)}</small><strong>{TOTAL_ENCERRADOS}</strong></div>
      </div>
      <p>
        Os números vêm das versões de maio/2026 e {VERSAO_EXTENSO} da Tabela 38 publicadas no{' '}
        <a href={PORTAL_ANS} target="_blank" rel="noopener noreferrer">portal do Padrão TISS da ANS</a>. A de maio ainda lista
        os {TOTAL} códigos, com a data de fim de vigência nos encerrados; a de julho traz só os vigentes.
      </p>

      <h2 id="lista-nova">A lista nova não segue mais a lógica de faixas</h2>
      <p>
        Até então, os dois primeiros dígitos indicavam o assunto: 10xx era beneficiário, 14xx autorização, 30xx odontologia. Os
        códigos criados em dezembro/2025 formam uma lista única, em ordem alfabética do termo — carência, radiografia de
        implante, formulário de reembolso e cobrança em duplicidade ficam lado a lado. Pelo assunto, os {TOTAL_NOVOS_2025} novos
        se dividem assim:
      </p>
      <ul>
        {novosPorAssunto.map(([cat, n]) => (
          <li key={cat}><strong>{ASSUNTOS[cat].titulo}:</strong> {n}</li>
        ))}
      </ul>
      <p>
        Alguns que vão aparecer bastante em consultórios e clínicas: <Codigo c="3209" termo />, <Codigo c="3306" termo />,{' '}
        <Codigo c="3230" termo /> e <Codigo c="3219" termo />.
      </p>

      <h2 id="equivalencias">Códigos encerrados que têm equivalente novo</h2>
      <p>
        Comparando os termos, {equivalencias.length} códigos encerrados ganharam um código novo com o mesmo texto (ou quase).
        Não é um de-para publicado pela ANS — é a correspondência de redação:
      </p>
      <div className={s.card} style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5, minWidth: 520 }}>
          <thead>
            <tr><th style={TH}>Encerrado</th><th style={TH}>Vigente</th><th style={TH}>Termo vigente</th></tr>
          </thead>
          <tbody>
            {equivalencias.map(([antigo, novo]) => (
              <tr key={antigo}>
                <td style={TD}><Codigo c={antigo} /></td>
                <td style={TD}><Codigo c={novo} /></td>
                <td style={TD}>{MOTIVOS[novo].descricao.charAt(0) + MOTIVOS[novo].descricao.slice(1).toLowerCase()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Os outros encerrados não têm correspondente direto. Para situações que eles cobriam — como a cobrança em duplicidade
        (<Codigo c="1702" />) —, a lista nova traz mensagens com redação diferente e mais ampla, como <Codigo c="3209" />. Não
        trate como a mesma mensagem: confira o termo antes de citá-lo num recurso.
      </p>

      <h2 id="impacto">O que isso muda para a clínica</h2>
      <ul>
        <li>
          <strong>Sistema de faturamento desatualizado não reconhece os códigos novos.</strong> O demonstrativo chega com 3209 ou
          3306 e o sistema mostra “código desconhecido” — a glosa fica sem explicação e sem prioridade.
        </li>
        <li>
          <strong>O recurso precisa citar o termo exato.</strong> Parte dos códigos que continuaram vigentes teve a redação
          ajustada na versão nova; recurso que cita o motivo com outra redação dá margem a indeferimento.
        </li>
        <li>
          <strong>Os dois conjuntos convivem por um tempo.</strong> Demonstrativos de competências antigas e operadoras que não
          migraram seguem mandando códigos encerrados. A análise precisa entender os {TOTAL} códigos, não só os vigentes.
        </li>
      </ul>

      <h2 id="checklist">Checklist de adaptação</h2>
      <ol className={s.passos}>
        <li>Confirme com o fornecedor do sistema de faturamento se ele já usa a Tabela 38 de {VERSAO_EXTENSO}.</li>
        <li>Atualize modelos de recurso que citam códigos antigos pelo termo vigente, quando houver equivalente.</li>
        <li>Revise os demonstrativos recebidos desde dezembro/2025: glosas com código novo podem ter ficado sem análise.</li>
        <li>Consulte qualquer código na <Link href="/codigos-de-glosa">lista completa de códigos de glosa</Link>, que mostra se está vigente ou encerrado.</li>
      </ol>
      <p>
        O RecuperaGlosa já usa a versão de {VERSAO_EXTENSO}: lê o XML do demonstrativo, reconhece os códigos vigentes e os
        encerrados, e redige o recurso com o termo oficial de cada um.
      </p>
    </>
  );
}
