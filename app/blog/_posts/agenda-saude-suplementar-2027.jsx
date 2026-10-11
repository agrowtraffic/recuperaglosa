/* Agenda a acompanhar na saúde suplementar a partir de 2027. Escrito
   antes do 2º turno: não assume resultado. Revisar em 26/10/2026. */
import Link from 'next/link';
import s from '@/app/_components/publico/publico.module.css';

const FONTE_AGENDA = 'https://futurodasaude.com.br/?p=42493';
const FONTE_REGULATORIA = 'https://futurodasaude.com.br/agenda-regulatoria-da-ans-2026-2028-aprovada/';
const FONTE_CONTRATOS = 'https://futurodasaude.com.br/ans-revisao-norma-contratos-glosas/';
const FONTE_PL = 'https://futurodasaude.com.br/planos-de-saude-congresso-2026/';

export const post = {
  slug: 'agenda-saude-suplementar-2027',
  titulo: 'Agenda da saúde suplementar para 2027: o que acompanhar?',
  tituloSeo: 'Saúde suplementar 2027: agenda da ANS e do Congresso',
  descricao:
    'Quatro frentes que influenciam clínicas e consultórios a partir de 2027: agenda regulatória da ANS 2026-2028, PL dos planos de saúde, fiscalização e reforma tributária, com fontes e status.',
  publicado: '2026-10-10',
  atualizado: '2026-10-10',
  resposta: (
    <>
      <strong>Quatro frentes concentram a agenda que afeta clínicas e consultórios em 2027:</strong> a agenda regulatória da
      ANS para 2026–2028 (aprovada em 17/07/2026, com 14 temas), a revisão da norma de contratos com prestadores, o
      Congresso (onde o setor vê baixa expectativa para o PL dos planos) e a transição da reforma tributária. Nenhuma depende do resultado da eleição para existir; o que a eleição define é a
      composição do governo e do Congresso que vão conduzi-las.
    </>
  ),
  perguntas: [
    {
      q: 'O que é a agenda regulatória da ANS?',
      a: 'É o documento em que a agência lista os temas que pretende regulamentar em um período. A de 2026–2028 foi aprovada em 17/07/2026 e define 14 temas em três eixos: proteção dos beneficiários; qualidade do cuidado e transformação assistencial; e sustentabilidade, dados e governança da informação. Itens da agenda ainda passam por consulta pública antes de virar norma.',
    },
    {
      q: 'Quando uma mudança na ANS passa a valer para a clínica?',
      a: 'Quando a resolução é publicada e entra em vigor, e, para a relação com a operadora, quando o contrato é adequado. Muitas normas preveem prazo de adaptação. Acompanhe o Diário Oficial e os comunicados da ANS.',
    },
    {
      q: 'O PL dos planos de saúde já foi aprovado?',
      a: 'Não. Reportagem de 22/04/2026 do Futuro da Saúde registra que a avaliação do setor é de que o PL dos planos de saúde não deve ganhar grande destaque em 2026, embora outros projetos possam ser protocolados ou acelerados em resposta a denúncias. Acompanhe a tramitação nos sites da Câmara e do Senado.',
    },
    {
      q: 'Este conteúdo será atualizado depois do 2º turno?',
      a: 'Sim. Está programado para ser revisado em 26/10/2026, com data de atualização visível no topo.',
    },
  ],
};

export default function Conteudo() {
  return (
    <>
      <h2 id="quatro-frentes">As quatro frentes</h2>
      <h3>1. Agenda regulatória da ANS 2026–2028</h3>
      <p>
        A <a href={FONTE_REGULATORIA} target="_blank" rel="noopener noreferrer">agenda regulatória 2026–2028</a>, aprovada pela ANS
        em 17/07/2026, define 14 temas, entre eles reajustes coletivos, portabilidade, reembolsos, franquia e coparticipação,
        política de preços e reajuste e indução a novos modelos de remuneração. Há ainda estudos preliminares sobre
        judicialização e sobre o registro de reclamações na ANS. Para a clínica, o que mais pesa é a{' '}
        <a href={FONTE_CONTRATOS} target="_blank" rel="noopener noreferrer">revisão da norma de contratualização</a>, onde estão as
        regras de glosa: veja a <Link href="/blog/existe-lei-contra-glosa-abusiva">RN nº 503/2022</Link> e a proposta em
        discussão. Para o balanço geral do ano, veja também a <a href={FONTE_AGENDA} target="_blank" rel="noopener noreferrer">agenda da saúde em
        ano eleitoral</a>.
      </p>

      <h3>2. PL dos planos de saúde no Congresso</h3>
      <p>
        Segundo o <a href={FONTE_PL} target="_blank" rel="noopener noreferrer">Futuro da Saúde (22/04/2026)</a>, a avaliação do setor é
        de que o PL dos planos de saúde não deve ganhar grande destaque em 2026, mas outros projetos podem ser protocolados ou
        acelerados. A reportagem cita, entre os já mapeados, o PL 667/2021 (acordos de compartilhamento de risco), e registra a
        criação, no fim de 2025, da Frente Parlamentar em Defesa da Ética na Saúde Suplementar. A saúde suplementar tem 53,2
        milhões de beneficiários, segundo a ANS. Até uma lei ser sancionada, valem a legislação e as normas atuais.
      </p>

      <h3>3. Revisão da norma de contratos com prestadores</h3>
      <p>
        A minuta da nova norma, que unifica duas resoluções anteriores, ficou em consulta pública até 16/05/2026. Segundo a{' '}
        <a href={FONTE_CONTRATOS} target="_blank" rel="noopener noreferrer">reportagem do Futuro da Saúde</a>, prevê contratos
        digitais, modelos alternativos de remuneração, canal para solução consensual de conflitos, aplicação do IPCA quando
        não houver acordo de reajuste e a vedação de glosa de procedimento autorizado sem divergência técnica. A própria ANS
        informa que não regula prestadores, mas induz o setor, e que mantém canal para receber reclamações sobre glosas e
        inadimplência. Confira se a norma final já foi publicada.
      </p>

      <h3>4. Reforma tributária</h3>
      <p>
        A transição de CBS e IBS segue calendário próprio até 2033, independentemente da eleição. Detalhes e perguntas para o
        contador em <Link href="/blog/reforma-tributaria-2026-clinicas-glosa">reforma tributária e glosa</Link>.
      </p>

      <h2 id="linha-do-tempo">Linha do tempo para acompanhar</h2>
      <ol className={s.passos}>
        <li><strong>25/10/2026:</strong> 2º turno da eleição presidencial.</li>
        <li><strong>Novembro e dezembro de 2026:</strong> transição de governo; possíveis sinalizações sobre ministro da Saúde e ANS.</li>
        <li><strong>Janeiro de 2027:</strong> posse do governo eleito e início do ano da CBS plena.</li>
        <li><strong>Fevereiro de 2027:</strong> início da nova legislatura no Congresso.</li>
      </ol>

      <h2 id="o-que-fazer">O que a clínica pode fazer sem esperar</h2>
      <ul>
        <li>Revisar contratos e manuais do prestador de cada operadora, com atenção aos prazos de recurso e hipóteses de glosa.</li>
        <li>Atualizar o sistema de faturamento para a <Link href="/blog/tabela-38-o-que-mudou-2026">Tabela 38 vigente</Link>.</li>
        <li>Manter histórico de glosa por operadora e motivo, para negociar e para fins tributários.</li>
        <li>Seguir o <Link href="/blog/checklist-proteger-receita-mudanca-regulatoria">checklist de proteção da receita</Link>.</li>
      </ul>
      <p className={s.aviso}>
        Conteúdo informativo e apartidário. Não representa previsão sobre resultado eleitoral nem avaliação de candidatos.
      </p>
    </>
  );
}
