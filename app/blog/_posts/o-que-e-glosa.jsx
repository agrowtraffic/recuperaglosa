import Link from 'next/link';
import s from '@/app/_components/publico/publico.module.css';
import Codigo from './Codigo';

const FONTE_ANAHP =
  'https://www.gov.br/ans/pt-br/acesso-a-informacao/participacao-da-sociedade/camara-de-saude-suplementar/Glosas_nos_Servios_de_Sade__FBH.pdf';
const FONTE_RN503 = 'https://bvsms.saude.gov.br/bvs/saudelegis/ans/2022/res0503_04_04_2022.html';

export const post = {
  slug: 'o-que-e-glosa',
  titulo: 'O que é glosa? Significado, exemplos e o que fazer',
  tituloSeo: 'O que é glosa médica? Significado, exemplos e o que fazer',
  descricao:
    'Glosa é o valor que o convênio deixa de pagar de uma cobrança da clínica. Entenda o significado, veja exemplos com os códigos da Tabela 38 e saiba quando corrigir ou recorrer.',
  publicado: '2026-09-28',
  atualizado: '2026-09-28',
  resposta: (
    <>
      <strong>Glosa é o valor que a operadora do plano de saúde deixa de pagar, total ou parcialmente, de uma cobrança
      feita pela clínica, consultório, laboratório ou hospital.</strong> O motivo vem no demonstrativo de pagamento como
      um código da Tabela 38 do padrão TISS, e o prestador pode corrigir e reapresentar a cobrança ou contestá-la com um
      recurso de glosa.
    </>
  ),
  perguntas: [
    {
      q: 'Glosa é a mesma coisa que negativa?',
      a: 'Não. A negativa acontece antes do atendimento, quando a operadora recusa a autorização de um procedimento. A glosa acontece depois, quando o atendimento já foi feito e cobrado e a operadora não paga. As duas usam códigos da mesma Tabela 38 do padrão TISS, que se chama justamente “Terminologia de mensagens (glosas, negativas e outras)”.',
    },
    {
      q: 'Toda glosa pode ser revertida?',
      a: 'Não. Glosas por erro de preenchimento, documento faltando ou senha não localizada costumam ser revertidas corrigindo ou comprovando. Glosas por carência, falta de cobertura do plano ou prazo vencido raramente são. O código da glosa indica em qual caso você está.',
    },
    {
      q: 'Qual o prazo para contestar uma glosa?',
      a: 'A ANS não fixa um prazo único. Pela RN nº 503/2022, o contrato entre operadora e prestador deve prever o prazo de contestação, igual ao prazo de resposta da operadora. Confira o seu contrato ou o manual do prestador.',
    },
    {
      q: 'Onde vejo o motivo da glosa?',
      a: 'No demonstrativo de pagamento (ou de análise de conta) que a operadora disponibiliza para cada lote. Ao lado de cada item glosado vem o código da Tabela 38; no arquivo XML do padrão TISS, ele fica no campo codigoGlosa.',
    },
  ],
};

export default function Conteudo() {
  return (
    <>
      <h2 id="significado">O que significa glosa</h2>
      <p>
        Na saúde suplementar, glosar é recusar o pagamento. A clínica atende o paciente pelo convênio, envia a cobrança
        (a guia) e, ao analisar, a operadora aceita parte dela e “glosa” o restante. A palavra vem do latim <em>glossa</em>,
        anotação à margem de um texto — como a observação que o auditor faz ao lado do item que não vai pagar.
      </p>
      <p>A glosa pode ser:</p>
      <ul>
        <li><strong>Total:</strong> o item inteiro não é pago.</li>
        <li><strong>Parcial:</strong> a operadora paga menos do que foi cobrado — por exemplo, aplicando um valor de tabela menor ou pagando só parte da quantidade.</li>
      </ul>
      <p>
        A glosa parcial é a que mais passa despercebida: o dinheiro entra, só que menos, e ninguém confere item a item.
      </p>

      <h2 id="exemplo">Exemplo de glosa na prática</h2>
      <p>Imagine uma clínica que envia um lote com três atendimentos (valores ilustrativos):</p>
      <div className={s.card} style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 460 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ padding: '6px 8px' }}>Item</th>
              <th style={{ padding: '6px 8px' }}>Cobrado</th>
              <th style={{ padding: '6px 8px' }}>Pago</th>
              <th style={{ padding: '6px 8px' }}>Glosa</th>
              <th style={{ padding: '6px 8px' }}>Código</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={{ padding: '6px 8px' }}>Consulta</td><td style={{ padding: '6px 8px' }}>R$ 150</td><td style={{ padding: '6px 8px' }}>R$ 150</td><td style={{ padding: '6px 8px' }}>—</td><td style={{ padding: '6px 8px' }}>—</td></tr>
            <tr><td style={{ padding: '6px 8px' }}>Sessão de fisioterapia</td><td style={{ padding: '6px 8px' }}>R$ 90</td><td style={{ padding: '6px 8px' }}>R$ 0</td><td style={{ padding: '6px 8px' }}>R$ 90</td><td style={{ padding: '6px 8px' }}><Codigo c="3209" /></td></tr>
            <tr><td style={{ padding: '6px 8px' }}>Exame</td><td style={{ padding: '6px 8px' }}>R$ 200</td><td style={{ padding: '6px 8px' }}>R$ 140</td><td style={{ padding: '6px 8px' }}>R$ 60</td><td style={{ padding: '6px 8px' }}><Codigo c="3184" /></td></tr>
          </tbody>
        </table>
      </div>
      <p>
        O lote tinha R$ 440 e entraram R$ 290: R$ 150 glosados. A sessão foi glosada por duplicidade (<Codigo c="3209" termo />) —
        se foram duas sessões em datas diferentes, cabe recurso. O exame teve glosa parcial por valor acima do permitido (<Codigo c="3184" />) —
        vale conferir contra a tabela do contrato.
      </p>

      <h2 id="motivos">Por que as operadoras glosam</h2>
      <p>Os motivos mais comuns caem em poucos grupos. Alguns exemplos da Tabela 38 vigente:</p>
      <ul>
        <li><strong>Autorização:</strong> senha inválida ou não localizada (<Codigo c="3306" termo />).</li>
        <li><strong>Preenchimento:</strong> código do procedimento errado (<Codigo c="3219" />), data do atendimento ausente (<Codigo c="3226" />), assinatura faltando (<Codigo c="3169" />).</li>
        <li><strong>Documentação:</strong> documento incompleto, ilegível ou ausente (<Codigo c="3230" termo />).</li>
        <li><strong>Valor e quantidade:</strong> valor acima do permitido (<Codigo c="3184" />), quantidade acima da autorizada (<Codigo c="3210" />), item incluso no procedimento principal (<Codigo c="3202" />).</li>
        <li><strong>Regra do plano:</strong> carência (<Codigo c="3171" />), sem cobertura (<Codigo c="3287" />).</li>
        <li><strong>Prazo:</strong> cobrança fora do prazo do contrato (<Codigo c="3214" termo />).</li>
      </ul>
      <p>
        A lista completa, com o que fazer em cada caso, está em <Link href="/codigos-de-glosa">códigos de glosa</Link>.
      </p>

      <h2 id="quanto-custa">Quanto a glosa pesa no faturamento</h2>
      <p>
        Não é pouco. Segundo dados do Observatório Anahp 2025 apresentados à ANS, o índice de glosa inicial entre hospitais
        associados foi de <strong>15,89% em 2024</strong> (<a href={FONTE_ANAHP} target="_blank" rel="noopener noreferrer">fonte</a>).
        Em clínicas e consultórios, sem equipe de faturamento dedicada, o risco é outro: a glosa existe, mas ninguém confere o
        demonstrativo a tempo, e o prazo de recurso vence.
      </p>

      <h2 id="e-definitiva">A glosa é definitiva?</h2>
      <p>
        Não necessariamente. A <a href={FONTE_RN503} target="_blank" rel="noopener noreferrer">RN nº 503/2022 da ANS</a> garante
        ao prestador o acesso à justificativa da glosa e o direito de contestá-la, e exige que o contrato preveja os prazos de
        contestação e de resposta. Mas cada glosa pede uma ação diferente:
      </p>
      <ol className={s.passos}>
        <li><strong>Recorrer</strong> quando há argumento e prova — por exemplo, a senha estava válida ou não houve duplicidade.</li>
        <li><strong>Enviar o documento</strong> que faltou e reapresentar.</li>
        <li><strong>Corrigir o dado</strong> da guia ou do arquivo e reapresentar.</li>
        <li><strong>Aceitar e corrigir o processo</strong> quando a glosa é devida, como em carência ou prazo prescrito (<Codigo c="2909" />).</li>
      </ol>
      <p>
        O passo a passo completo, com modelo, está no <Link href="/recurso-de-glosa">guia de recurso de glosa</Link>.
      </p>

      <h2 id="como-descobrir">Como descobrir quanto foi glosado</h2>
      <p>
        O caminho manual é abrir o demonstrativo de cada lote e comparar, item a item, o valor apresentado com o valor pago.
        No RecuperaGlosa, você envia o XML do demonstrativo e em segundos vê o total glosado, a lista por guia e motivo, o que
        vale recorrer — e o recurso já redigido.
      </p>
    </>
  );
}
