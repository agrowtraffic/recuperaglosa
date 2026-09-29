import Link from 'next/link';
import s from '@/app/_components/publico/publico.module.css';
import Codigo from './Codigo';

const FONTE_RN503 = 'https://bvsms.saude.gov.br/bvs/saudelegis/ans/2022/res0503_04_04_2022.html';

export const post = {
  slug: 'tipos-de-glosa',
  titulo: 'Quais são os tipos de glosa? Administrativa, técnica e linear',
  tituloSeo: 'Tipos de glosa: administrativa, técnica e linear (com exemplos)',
  descricao:
    'Entenda a diferença entre glosa administrativa, técnica e linear, com exemplos de códigos da Tabela 38, como identificar cada uma e o que fazer para reverter.',
  publicado: '2026-09-28',
  atualizado: '2026-09-28',
  resposta: (
    <>
      <strong>As glosas costumam ser divididas em três tipos: administrativa, técnica e linear.</strong> A administrativa
      vem de erro de preenchimento, cadastro, autorização ou prazo; a técnica questiona se o procedimento era necessário ou
      compatível com o caso; e a linear é um corte sem justificativa individualizada. Cada tipo pede uma resposta diferente.
    </>
  ),
  perguntas: [
    {
      q: 'Qual o tipo de glosa mais comum?',
      a: 'Em clínicas e consultórios, a administrativa: senha de autorização, código do procedimento, data, assinatura e documentação. É também a mais fácil de evitar com um checklist antes de enviar o lote, e a mais fácil de reverter quando o erro foi da operadora.',
    },
    {
      q: 'Glosa linear é permitida?',
      a: '“Glosa linear” é um termo do mercado, não uma categoria da Tabela 38. O que a RN nº 503/2022 da ANS garante é que o prestador tenha acesso à justificativa de cada glosa e possa contestá-la, e que o contrato preveja as hipóteses de glosa. Um corte genérico sem justificativa individualizada pode — e deve — ser contestado pedindo o motivo item a item.',
    },
    {
      q: 'Como sei o tipo de uma glosa?',
      a: 'Pelo código da Tabela 38 que vem no demonstrativo. Códigos de senha, preenchimento, prazo e documento indicam glosa administrativa; códigos de incompatibilidade com diagnóstico, quantidade, diretriz de utilização ou auditoria indicam glosa técnica. Glosa sem código, ou com código genérico de auditoria, é o sinal típico de glosa linear.',
    },
  ],
};

const TH = { padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--line)' };
const TD = { padding: '8px 10px', verticalAlign: 'top', borderBottom: '1px solid var(--line)' };

export default function Conteudo() {
  return (
    <>
      <h2 id="resumo">Os três tipos em uma tabela</h2>
      <div className={s.card} style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 15, minWidth: 560 }}>
          <thead>
            <tr><th style={TH}>Tipo</th><th style={TH}>O que questiona</th><th style={TH}>Como se resolve</th></tr>
          </thead>
          <tbody>
            <tr><td style={TD}><strong>Administrativa</strong></td><td style={TD}>Forma: dados, guia, senha, prazo, documento</td><td style={TD}>Corrigir, anexar ou comprovar e reapresentar</td></tr>
            <tr><td style={TD}><strong>Técnica</strong></td><td style={TD}>Mérito: indicação, quantidade, compatibilidade</td><td style={TD}>Recurso com justificativa clínica e prontuário</td></tr>
            <tr><td style={TD}><strong>Linear</strong></td><td style={TD}>Nada específico: corte genérico</td><td style={TD}>Pedir a justificativa item a item e contestar</td></tr>
          </tbody>
        </table>
      </div>

      <h2 id="administrativa">Glosa administrativa</h2>
      <p>
        É a glosa por problema de forma: o atendimento pode ter sido perfeito, mas algo na cobrança não bate com as regras
        da operadora. É a mais frequente em consultórios e clínicas pequenas, porque depende de detalhes de preenchimento que
        mudam de operadora para operadora. Exemplos da Tabela 38:
      </p>
      <ul>
        <li>Senha ou guia de autorização inválida — <Codigo c="3306" /></li>
        <li>Código do procedimento preenchido incorretamente — <Codigo c="3219" /></li>
        <li>Data do atendimento não informada — <Codigo c="3226" /></li>
        <li>Assinatura do beneficiário inexistente ou divergente — <Codigo c="3169" /></li>
        <li>Documentação incompleta, ilegível ou ausente — <Codigo c="3230" /></li>
        <li>Cobrança fora do prazo do contrato — <Codigo c="3214" /></li>
      </ul>
      <p>
        <strong>O que fazer:</strong> se o erro foi seu, corrija e reapresente. Se foi da operadora — a senha era válida, o
        documento foi enviado —, recorra anexando a prova. Glosa por prazo perdido raramente é revertida; aí a correção é no
        processo interno.
      </p>

      <h2 id="tecnica">Glosa técnica</h2>
      <p>
        Aqui a operadora não discute a forma, e sim o mérito: se o procedimento era necessário, se a quantidade faz sentido,
        se o material combina com o que foi feito. Normalmente vem de auditoria médica, de enfermagem ou odontológica.
        Exemplos:
      </p>
      <ul>
        <li>Item incompatível com o diagnóstico ou a evolução clínica — <Codigo c="3194" /></li>
        <li>Procedimento que não atende à diretriz de utilização (DUT) da ANS — <Codigo c="3288" /></li>
        <li>Quantidade incompatível com o procedimento ou a evolução — <Codigo c="3204" /></li>
        <li>Solicitação sem justificativa ou com justificativa insuficiente — <Codigo c="3217" /></li>
        <li>Na odontologia, achados de radiografia — por exemplo <Codigo c="3297" termo /></li>
      </ul>
      <p>
        <strong>O que fazer:</strong> recurso com fundamentação clínica objetiva: o que o prontuário registra, por que a
        indicação se sustenta, qual critério da diretriz foi atendido. Argumento genérico (“o procedimento foi realizado”)
        não reverte glosa técnica.
      </p>

      <h2 id="linear">Glosa linear</h2>
      <p>
        É o corte feito sem motivo individualizado: um percentual aplicado sobre a conta inteira, ou vários itens glosados
        com o mesmo código genérico, sem dizer o que está errado em cada um. “Glosa linear” é um termo do mercado — não
        existe esse código na Tabela 38 —, e costuma aparecer como glosa sem código ou com mensagens amplas como{' '}
        <Codigo c="3234" termo />.
      </p>
      <p>
        A <a href={FONTE_RN503} target="_blank" rel="noopener noreferrer">RN nº 503/2022</a> veda que o contrato impeça o
        prestador de acessar a justificativa das glosas ou de contestá-las. Por isso:
      </p>
      <ol className={s.passos}>
        <li><strong>Peça a justificativa item a item</strong> — o parecer de auditoria que sustentou o corte.</li>
        <li><strong>Conteste o que não foi justificado,</strong> apontando que a glosa precisa ser identificada e fundamentada para permitir defesa.</li>
        <li><strong>Registre a recorrência.</strong> Corte linear que se repete é assunto para a renegociação do contrato.</li>
      </ol>

      <h2 id="outras-classificacoes">Outras classificações que você vai ouvir</h2>
      <ul>
        <li><strong>Total ou parcial:</strong> o item inteiro não foi pago, ou foi pago a menor.</li>
        <li><strong>Devida ou indevida:</strong> a glosa tem fundamento (ex.: carência, <Codigo c="3171" />) ou não tem (ex.: duplicidade que não existe, <Codigo c="3209" />).</li>
        <li><strong>Negativa:</strong> não é glosa — é a recusa de autorização antes do atendimento, mas usa a mesma Tabela 38.</li>
      </ul>

      <h2 id="identificar">Como identificar o tipo sem ler código por código</h2>
      <p>
        Na <Link href="/codigos-de-glosa">lista de códigos de glosa</Link>, cada código mostra o assunto e a ação indicada.
        Se preferir não fazer isso à mão, o RecuperaGlosa lê o XML do demonstrativo, classifica cada glosa e separa o que
        corrigir, o que anexar e o que recorrer — com o recurso já redigido. Veja também o{' '}
        <Link href="/recurso-de-glosa">guia de recurso de glosa</Link> e <Link href="/blog/o-que-e-glosa">o que é glosa</Link>.
      </p>
    </>
  );
}
