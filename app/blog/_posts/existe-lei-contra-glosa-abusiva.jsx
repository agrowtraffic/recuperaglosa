/* Artigo sobre o que existe (e o que não existe) em norma sobre glosa.
   Fatos de norma saem da RN ANS 503/2022 lida no texto. O que está em
   revisão ou tramitação só entra com ressalva de status — conferir antes
   de atualizar. */
import Link from 'next/link';
import s from '@/app/_components/publico/publico.module.css';
import Codigo from './Codigo';

const RN503 = 'https://www.legisweb.com.br/legislacao/?id=429858';
const PL1653 = 'https://www.camara.leg.br/propostas-legislativas/2613918';
const REVISAO = 'https://futurodasaude.com.br/ans-revisao-norma-contratos-glosas/';
const CONJUR = 'https://www.conjur.com.br/2025-set-24/glosa-e-jabuticaba-para-consumidor-e-jaca-na-cabeca-de-fornecedor-de-produto-para-saude//?print=1';

export const post = {
  slug: 'existe-lei-contra-glosa-abusiva',
  titulo: 'Existe lei contra glosa abusiva? O que a norma diz em 2026',
  tituloSeo: 'Existe lei contra glosa abusiva? O que diz a norma (2026)',
  descricao:
    'Não há, nas fontes consultadas, lei federal específica sobre glosa abusiva. Veja o que a RN 503/2022 da ANS garante ao prestador, a proposta da ANS de vedar glosa de procedimento autorizado e o que fazer hoje.',
  publicado: '2026-10-10',
  atualizado: '2026-10-10',
  resposta: (
    <>
      <strong>Nas fontes consultadas até 10/10/2026, não há lei federal específica que trate de “glosa abusiva”.</strong> O que
      existe é a RN nº 503/2022 da ANS, que obriga o contrato entre operadora e prestador a prever as hipóteses de glosa, o
      prazo de contestação e o acesso às justificativas, e veda cláusulas que impeçam o prestador de contestar. O que a
      clínica pode fazer hoje é recorrer dentro do prazo do contrato, citando o termo oficial da Tabela 38.
    </>
  ),
  perguntas: [
    {
      q: 'A operadora pode glosar procedimento que ela mesma autorizou?',
      a: 'A RN nº 503/2022, no texto lido, não traz vedação expressa. A minuta da nova norma de contratualização, que esteve em consulta pública até 16/05/2026, propõe que procedimentos autorizados previamente não possam ser glosados, desde que não haja divergência técnica apontada por auditoria. Até a norma final ser publicada, a autorização prévia é argumento de recurso, e a senha deve constar na guia.',
    },
    {
      q: 'O prestador tem direito de saber por que foi glosado?',
      a: 'Sim. O art. 5º, inciso V, da RN nº 503/2022 veda regras contratuais que impeçam o prestador de acessar as rotinas de auditoria e as justificativas das glosas. A vedação vale quando o faturamento é enviado no padrão TISS vigente.',
    },
    {
      q: 'Existe prazo legal único para contestar glosa?',
      a: 'Não. O prazo é o do contrato. A norma exige que o contrato preveja o prazo de contestação, o de resposta da operadora e o de pagamento se a glosa for revertida, e que o prazo de contestação seja igual ao de resposta da operadora (art. 14 e parágrafo único).',
    },
    {
      q: 'Onde reclamar quando a operadora descumpre o contrato?',
      a: 'A ANS recebe denúncias de prestadores sobre descumprimento das regras de contratualização. Reúna antes o contrato, o demonstrativo e o protocolo do recurso. Para disputas de valor, avalie assessoria jurídica; este artigo não é orientação legal.',
    },
  ],
};

export default function Conteudo() {
  return (
    <>
      <h2 id="resposta-curta">Resposta curta</h2>
      <p>
        Procurando por “glosa abusiva” em projetos de lei de 2026, não foi encontrada proposição que tenha o tema como objeto
        principal. Colunas jurídicas, como a do <a href={CONJUR} target="_blank" rel="noopener noreferrer">Consultor Jurídico de
        setembro/2025</a>, descrevem a frequência das glosas e a discussão sobre as que atingem procedimentos já autorizados,
        mas descrever o problema é diferente de haver lei. Se um projeto específico existir e não aparecer aqui, ele deve ser
        confirmado nos sites da Câmara e do Senado.
      </p>

      <h2 id="rn-503">O que a RN nº 503/2022 já garante</h2>
      <p>
        A <a href={RN503} target="_blank" rel="noopener noreferrer">Resolução Normativa DC/ANS nº 503, de 30/03/2022</a>, trata
        dos contratos escritos entre operadoras e prestadores. Os dispositivos que importam para a glosa:
      </p>
      <ul>
        <li><strong>Art. 5º, V:</strong> é vedada regra que impeça o prestador de acessar as rotinas de auditoria técnica ou administrativa e as justificativas das glosas.</li>
        <li><strong>Art. 5º, VI:</strong> é vedada regra que impeça o prestador de contestar as glosas, respeitado o disposto na norma.</li>
        <li><strong>Parágrafo único do art. 5º:</strong> as vedações dos incisos V e VI se aplicam se o faturamento for enviado no padrão TISS vigente.</li>
        <li><strong>Art. 14:</strong> a rotina de auditoria deve estar expressa no contrato, com as hipóteses de glosa, o prazo de contestação, o prazo de resposta da operadora e o prazo de pagamento se a glosa for revertida. O prazo de contestação deve ser igual ao de resposta.</li>
        <li><strong>Art. 6º:</strong> a troca de dados de atenção à saúde deve seguir o padrão TISS vigente.</li>
      </ul>
      <p>
        Na prática, o direito existe, mas o prazo e as hipóteses de glosa estão no seu contrato. Por isso o primeiro documento
        a ter em mãos é ele, junto com o manual do prestador da operadora.
      </p>

      <h2 id="em-revisao">O que está em revisão ou tramitação</h2>
      <ul>
        <li>
          <strong>Revisão da norma de contratualização.</strong> Segundo reportagem do Futuro da Saúde de 06/05/2026, a ANS
          iniciou a revisão das resoluções sobre contratos entre operadoras e prestadores, e a minuta ficou em consulta
          pública até 16 de maio. A proposta prevê, entre outros pontos, que{' '}
          <a href={REVISAO} target="_blank" rel="noopener noreferrer">procedimentos autorizados previamente por operadoras não poderão
          ser glosados</a>, desde que não tenham divergências técnicas apontadas por auditoria, além de contratos digitais, canal de
          solução consensual de conflitos e transparência sobre reajustes. É uma proposta em processo regulatório, não uma regra
          vigente: confira no portal da ANS se a norma final foi publicada antes de citá-la em um recurso.
        </li>
        <li>
          <strong>PL 1653/2026.</strong> Propõe atrelar parte do reajuste anual dos planos a indicadores de reclamações. Não
          trata de glosa, mas mostra a direção do debate: <a href={PL1653} target="_blank" rel="noopener noreferrer">ficha de tramitação na Câmara</a>.
        </li>
      </ul>

      <h2 id="numeros">Os números da glosa no setor</h2>
      <p>
        Segundo a mesma reportagem, o Painel de Indicadores de Glosa da ANS, com dados consolidados até o 1º semestre de 2025,
        mostra prazo médio de pagamento de <strong>33,61 dias</strong>, glosa inicial de <strong>7,31%</strong> e glosa final de{' '}
        <strong>7,14%</strong>. Já o Observatório Anahp (9ª edição), com hospitais associados, aponta para 2025 glosa inicial de
        cerca de <strong>15,93%</strong>, glosa final em torno de <strong>1,72%</strong> e prazo médio de recebimento de{' '}
        <strong>77,35 dias</strong>. As bases são diferentes (setor inteiro × hospitais privados associados) e não devem ser
        comparadas diretamente.
      </p>

      <h2 id="hoje">O que a clínica pode fazer hoje</h2>
      <ol className={s.passos}>
        <li><strong>Localize o prazo no contrato</strong> e marque na agenda a data do recurso de cada lote.</li>
        <li><strong>Peça a justificativa por escrito</strong> quando o demonstrativo trouxer só o código. Você tem o direito de acessá-la.</li>
        <li><strong>Cite o termo oficial</strong> da Tabela 38 no recurso. Exemplos: <Codigo c="3209" termo />, <Codigo c="3306" termo /> e <Codigo c="3214" termo />.</li>
        <li><strong>Anexe a prova</strong>: senha de autorização, guia assinada, laudo, comprovante de envio.</li>
        <li><strong>Guarde o protocolo</strong> do recurso. Sem ele, não há como demonstrar que o prazo foi cumprido.</li>
      </ol>
      <p>
        O modelo e o passo a passo estão no guia de <Link href="/recurso-de-glosa">recurso de glosa</Link>. A lista completa de
        motivos está em <Link href="/codigos-de-glosa">códigos de glosa</Link>.
      </p>
      <p>
        Relacionado: <Link href="/blog/o-que-e-glosa">o que é glosa</Link> e{' '}
        <Link href="/blog/eleicoes-2026-planos-de-saude-clinicas">o debate eleitoral de 2026 sobre planos de saúde</Link>.
      </p>
    </>
  );
}
