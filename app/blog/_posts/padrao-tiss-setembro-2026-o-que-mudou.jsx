/* Artigo sobre a atualização de setembro/2026 do Padrão TISS.

   Todos os números e versões saem do "Componente Organizacional –
   setembro de 2026" (versão 202609), seção "Histórico das alterações",
   lido no PDF oficial da ANS em 03/11/2026. O que não pôde ser confirmado
   no documento (data de início de vigência e limite de implantação) NÃO
   aparece aqui como fato: o texto manda o leitor ao portal da ANS. Antes
   de acrescentar essas datas, conferir na página "Padrão TISS –
   Setembro/2026" do gov.br/ans. */
import Link from 'next/link';
import s from '@/app/_components/publico/publico.module.css';
import Codigo from './Codigo';

const PORTAL = 'https://www.gov.br/ans/pt-br/assuntos/prestadores/padrao-para-troca-de-informacao-de-saude-suplementar-2013-tiss';
const PDF_202609 = `${PORTAL}/PadroTISS_ComponenteOrganizacional_202609.pdf`;

export const post = {
  slug: 'padrao-tiss-setembro-2026-o-que-mudou',
  titulo: 'Padrão TISS de setembro/2026: o que mudou e o que não mudou na Tabela 38?',
  tituloSeo: 'Padrão TISS setembro/2026: o que mudou e o que não mudou',
  descricao:
    'A atualização 202609 do Padrão TISS alterou as tabelas 19, 20, 22 e 64, mas não a Tabela 38 de glosas. Veja os números, as versões de cada componente e o que 04.03.00 significa.',
  publicado: '2026-11-03',
  atualizado: '2026-11-03',
  resposta: (
    <>
      <strong>A atualização de setembro/2026 do Padrão TISS (competência 202609) alterou as tabelas 19, 20, 22 e 64 e o
      Componente Organizacional. A Tabela 38, que traz os códigos de glosa, não foi alterada:</strong> continua valendo a
      redação da versão de julho/2026. Segundo o documento oficial da ANS, o histórico da versão lista inclusões em quatro
      tabelas de terminologia, alterações em duas e inativação de termos em uma.
    </>
  ),
  perguntas: [
    {
      q: 'A Tabela 38 mudou na atualização de setembro/2026?',
      a: 'Não. O histórico de alterações do Componente Organizacional 202609 lista mudanças nas tabelas 19 (materiais e OPME), 20 (medicamentos), 22 (procedimentos e eventos em saúde) e 64 (forma de envio de itens para a ANS). A Tabela 38, de mensagens de glosa e negativa, não aparece entre elas.',
    },
    {
      q: 'O que significa “04.03.00” nos arquivos e modelos TISS?',
      a: 'É a versão do Componente de Comunicação do Padrão TISS, que define o formato das mensagens XML trocadas entre prestadores e operadoras. A versão 202609 do Padrão lista os componentes de Comunicação nas versões 04.03.00 e 01.06.00. O número não indica a versão da Tabela 38, que é identificada por competência (como 202607).',
    },
    {
      q: 'Qual é o prazo para adaptar o sistema de faturamento à versão de setembro/2026?',
      a: 'A ANS divulga as datas de início de vigência e de limite de implantação de cada versão na página do Padrão TISS. Confira a data da competência 202609 no portal da ANS ou com o fornecedor do seu sistema: este artigo não reproduz prazos que não foram confirmados no documento oficial.',
    },
    {
      q: 'Onde baixar a documentação oficial da versão 202609?',
      a: 'No portal do Padrão TISS da ANS, na página da competência setembro/2026. O Componente Organizacional 202609 é um PDF que traz a exposição de motivos e o histórico completo das alterações.',
    },
  ],
};

const TH = { padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--line)' };
const TD = { padding: '8px 10px', verticalAlign: 'top', borderBottom: '1px solid var(--line)' };

export default function Conteudo() {
  return (
    <>
      <h2 id="numeros">A atualização 202609 em números</h2>
      <p>
        Pelo histórico de alterações do <a href={PDF_202609} target="_blank" rel="noopener noreferrer">Componente Organizacional
        202609</a>, a versão de setembro/2026 trouxe:
      </p>
      <div className={s.card} style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5, minWidth: 560 }}>
          <thead>
            <tr><th style={TH}>Tabela</th><th style={TH}>Incluídos</th><th style={TH}>Alterados</th><th style={TH}>Inativados</th></tr>
          </thead>
          <tbody>
            <tr><td style={TD}>19 · Materiais e OPME</td><td style={TD}>21.234</td><td style={TD}>—</td><td style={TD}>—</td></tr>
            <tr><td style={TD}>20 · Medicamentos</td><td style={TD}>781</td><td style={TD}>—</td><td style={TD}>—</td></tr>
            <tr><td style={TD}>22 · Procedimentos e eventos em saúde</td><td style={TD}>2</td><td style={TD}>8</td><td style={TD}>2</td></tr>
            <tr><td style={TD}>64 · Forma de envio de itens para a ANS</td><td style={TD}>22.017</td><td style={TD}>2</td><td style={TD}>—</td></tr>
            <tr><td style={TD}><strong>38 · Mensagens (glosas e negativas)</strong></td><td style={TD} colSpan={3}><strong>Sem alterações nesta versão</strong></td></tr>
          </tbody>
        </table>
      </div>
      <p>
        O traço indica que o documento não registra mudança daquele tipo na tabela. Os números são da própria ANS; para a lista
        de cada termo, use as planilhas da competência no portal.
      </p>

      <h2 id="tabela-38">O que isso significa para a Tabela 38</h2>
      <p>
        A Tabela 38 reúne as mensagens de glosa, negativa e outras trocadas entre operadoras e prestadores. Como ela não
        entrou na atualização, os códigos que aparecem no demonstrativo continuam sendo os da versão de julho/2026, e o termo
        oficial de cada um segue o mesmo. Se você já adaptou modelos de recurso ao{' '}
        <Link href="/blog/tabela-38-o-que-mudou-2026">que mudou na Tabela 38 em 2026</Link>, não há nada novo a refazer por
        causa de setembro. A lista completa e atualizada está em <Link href="/codigos-de-glosa">códigos de glosa</Link>.
      </p>

      <h2 id="versoes">As versões de cada componente</h2>
      <div className={s.card} style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5, minWidth: 520 }}>
          <thead>
            <tr><th style={TH}>Componente do Padrão TISS</th><th style={TH}>Versão em setembro/2026</th></tr>
          </thead>
          <tbody>
            <tr><td style={TD}>Organizacional</td><td style={TD}>202609</td></tr>
            <tr><td style={TD}>Representação de Conceitos em Saúde (onde ficam as tabelas, inclusive a 38)</td><td style={TD}>202609</td></tr>
            <tr><td style={TD}>Conteúdo e Estrutura</td><td style={TD}>202511</td></tr>
            <tr><td style={TD}>Segurança e Privacidade</td><td style={TD}>202511</td></tr>
            <tr><td style={TD}>Comunicação</td><td style={TD}>04.03.00 e 01.06.00</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        É daqui que vem o “04.03.00” que aparece em nomes de arquivos e modelos de XML: é a versão do Componente de Comunicação,
        não a da Tabela 38.
      </p>

      <h2 id="clinica">O que a clínica deve conferir</h2>
      <ol className={s.passos}>
        <li>
          <strong>Pergunte ao fornecedor do sistema de faturamento</strong> se ele já usa a competência 202609 e peça a data de
          implantação. O prazo oficial está na página do Padrão TISS; confirme lá antes de agir.
        </li>
        <li>
          <strong>Revise os códigos de procedimento (tabela 22).</strong> Dois termos foram inativados e oito foram alterados.
          Cobrança com código fora da tabela pode virar glosa de preenchimento, como código do procedimento errado (
          <Codigo c="3219" />).
        </li>
        <li>
          <strong>Mantenha os modelos de recurso.</strong> Como a Tabela 38 não mudou, o termo oficial citado nos recursos
          continua o mesmo.
        </li>
        <li>
          <strong>Guarde a competência usada</strong> em cada lote: ao recorrer, ela ajuda a mostrar qual versão do padrão valia
          na época.
        </li>
      </ol>

      <h2 id="fontes">Fontes</h2>
      <ul>
        <li><a href={PDF_202609} target="_blank" rel="noopener noreferrer">Padrão TISS – Componente Organizacional, setembro de 2026 (versão 202609)</a>, ANS</li>
        <li><a href={PORTAL} target="_blank" rel="noopener noreferrer">Portal do Padrão TISS</a>, ANS</li>
      </ul>
      <p>
        O RecuperaGlosa já lê os códigos da Tabela 38 vigente e gera o recurso com o termo oficial de cada um: envie o XML do
        demonstrativo e veja o resultado em segundos.
      </p>
      <p className={s.aviso}>
        Conteúdo informativo, com base no documento oficial da ANS consultado em 03/11/2026. Datas de vigência e implantação
        devem ser confirmadas no portal da ANS.
      </p>
    </>
  );
}
