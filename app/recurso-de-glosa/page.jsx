/* ============================================================
   /recurso-de-glosa — guia principal (página pilar).

   Mira "recurso de glosa", "como fazer recurso de glosa", "modelo de
   recurso de glosa" e "prazo recurso de glosa". Os concorrentes que
   aparecem nessas buscas são blogs de software de faturamento e de
   escritório de advocacia; o diferencial aqui é mandar para a página
   do código exato e dizer quando NÃO recorrer.

   Afirmações regulatórias ficam no que a RN 503/2022 diz e com link
   para a fonte. Prazo em dias não é citado como regra porque não é:
   cada contrato define o seu.
   ============================================================ */
import Link from 'next/link';
import PaginaPublica, { Cta } from '@/app/_components/publico/PaginaPublica';
import s from '@/app/_components/publico/publico.module.css';
import CopiarModelo from '@/app/_components/publico/CopiarModelo';
import { OG_IMAGE, ORGANIZACAO, SITE, breadcrumb, jsonLd } from '@/lib/seo';


const TITULO = 'Recurso de glosa: como fazer, prazo e modelo pronto';
const DESCRICAO =
  'Guia prático de recurso de glosa para clínicas e consultórios: quando vale recorrer, passo a passo, prazo segundo a ANS, modelo de recurso e os erros que levam ao indeferimento.';
const PUBLICADO = '2026-09-28';

export const metadata = {
  title: { absolute: `${TITULO} · RecuperaGlosa` },
  description: DESCRICAO,
  alternates: { canonical: '/recurso-de-glosa' },
  openGraph: { title: TITULO, description: DESCRICAO, url: '/recurso-de-glosa', type: 'article', images: [OG_IMAGE] },
};

const FONTE_RN503 = 'https://bvsms.saude.gov.br/bvs/saudelegis/ans/2022/res0503_04_04_2022.html';

const MODELO = `RECURSO DE GLOSA
Prestador: [nome da clínica] — CNPJ [00.000.000/0000-00]
Operadora: [nome da operadora] (ANS [registro])
Competência: [mm/aaaa] | Demonstrativo: [nº]
Guia do prestador: [nº] | Guia operadora: [nº]
Beneficiário: [nome] — Carteira [nº]
Data do atendimento: [dd/mm/aaaa]

Prezados,

Vimos, tempestivamente, apresentar recurso administrativo contra as glosas aplicadas na guia acima, pelos fundamentos a seguir:

1) Procedimento [código TUSS] — [descrição]
   Apresentado: R$ [x] | Pago: R$ [y] | Glosado: R$ [x − y]
   Motivo informado: [código] — [termo oficial da Tabela 38]
   Contestação: [argumento específico + documento que o comprova]

VALOR TOTAL PLEITEADO: R$ [soma]

Requer-se a reanálise e o consequente reprocessamento dos valores glosados, com o respectivo pagamento na próxima competência.

Atenciosamente,
[nome e assinatura do responsável]`;

const PERGUNTAS = [
  {
    q: 'O que é recurso de glosa?',
    a: 'É o pedido formal que o prestador (clínica, consultório, laboratório) faz à operadora para reverter um valor glosado — isto é, cobrado e não pago, total ou parcialmente. O recurso aponta a guia, o código da glosa e os fundamentos e documentos que mostram que o valor é devido.',
  },
  {
    q: 'Qual o prazo para fazer recurso de glosa?',
    a: 'A ANS não fixa um prazo único. Pela RN nº 503/2022, o contrato entre operadora e prestador deve prever o prazo para contestar a glosa, e esse prazo deve ser igual ao prazo que a operadora tem para responder. Consulte o seu contrato ou o manual do prestador da operadora.',
  },
  {
    q: 'Toda glosa deve ser contestada?',
    a: 'Não. Glosas por carência, falta de cobertura contratual, prazo vencido ou decisão já mantida em reanálise raramente são revertidas. Outras se resolvem enviando um documento ou corrigindo a guia, sem recurso. O recurso vale quando existe tese concreta e prova documental.',
  },
  {
    q: 'Onde envio o recurso de glosa?',
    a: 'Normalmente pelo portal do prestador da operadora, ou por mensagem eletrônica de recurso de glosa no padrão TISS. Algumas operadoras aceitam e-mail ou protocolo físico. O canal está no manual do prestador de cada operadora.',
  },
  {
    q: 'A operadora pode impedir o prestador de contestar a glosa?',
    a: 'Não. A RN nº 503/2022 veda cláusulas que impeçam o prestador de contestar glosas ou de ter acesso às justificativas delas.',
  },
  {
    q: 'Dá para automatizar o recurso de glosa?',
    a: 'Sim. O RecuperaGlosa lê o XML do demonstrativo de pagamento (padrão TISS), recalcula a diferença entre apresentado e pago em cada guia, classifica os códigos de glosa e redige o recurso só dos itens que têm tese — para a equipe revisar e enviar.',
  },
];

export default function RecursoDeGlosaPage() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      breadcrumb([
        ['Início', '/'],
        ['Recurso de glosa', '/recurso-de-glosa'],
      ]),
      {
        '@type': 'Article',
        headline: TITULO,
        description: DESCRICAO,
        inLanguage: 'pt-BR',
        datePublished: PUBLICADO,
        dateModified: PUBLICADO,
        mainEntityOfPage: `${SITE}/recurso-de-glosa`,
        image: `${SITE}/opengraph-image`,
        author: ORGANIZACAO,
        publisher: ORGANIZACAO,
      },
      {
        '@type': 'HowTo',
        name: 'Como fazer recurso de glosa',
        step: [
          'Baixe o demonstrativo de pagamento (XML TISS) da competência',
          'Identifique cada guia glosada e o código de glosa da Tabela 38',
          'Separe o que cabe recurso do que se resolve corrigindo ou reapresentando',
          'Reúna a prova documental de cada item',
          'Redija o recurso citando o termo oficial do código',
          'Envie dentro do prazo do contrato e acompanhe a resposta',
        ].map((name, i) => ({ '@type': 'HowToStep', position: i + 1, name })),
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

  return (
    <PaginaPublica>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(schema)} />
      <article className={s.article}>
        <nav className={s.crumbs} aria-label="Você está em">
          <Link href="/">Início</Link> › <span>Recurso de glosa</span>
        </nav>

        <span className={s.eyebrow}>Guia prático · atualizado em setembro de 2026</span>
        <h1>Recurso de glosa: como fazer, qual o prazo e modelo pronto</h1>
        <p className={s.lead}>
          O atendimento foi feito, a guia foi enviada e o convênio pagou menos. Este guia mostra como decidir o que
          contestar, como montar um recurso que a operadora aceita e onde a maioria das clínicas perde dinheiro.
        </p>

        <div className={s.resposta}>
          <p>
            <strong>Recurso de glosa é o pedido formal para a operadora rever um valor que ela deixou de pagar.</strong>{' '}
            Ele identifica a guia, cita o código de glosa da Tabela 38 do padrão TISS, apresenta o argumento e a prova
            documental, e deve ser enviado dentro do prazo previsto no contrato com a operadora.
          </p>
        </div>

        <h2 id="o-que-e-glosa">O que é glosa</h2>
        <p>
          Glosa é o valor cobrado pelo prestador que a operadora do plano de saúde não pagou, no todo ou em parte. O
          motivo vem no demonstrativo de pagamento como um código da{' '}
          <Link href="/motivos-de-glosa">Tabela 38 do padrão TISS</Link>. Na prática, as glosas caem em três tipos — e parte dos códigos nem é glosa:
        </p>
        <div className={s.grid2}>
          <div className={s.card}>
            <h3 style={{ marginTop: 0 }}>Administrativa</h3>
            <p style={{ margin: 0 }}>Cadastro, carteira, senha de autorização, campo da guia, assinatura, prazo de envio.</p>
          </div>
          <div className={s.card}>
            <h3 style={{ marginTop: 0 }}>Técnica</h3>
            <p style={{ margin: 0 }}>Indicação clínica, quantidade, pertinência do procedimento, ausência de laudo.</p>
          </div>
          <div className={s.card}>
            <h3 style={{ marginTop: 0 }}>Contratual / de valor</h3>
            <p style={{ margin: 0 }}>Valor acima da tabela, item incluído em pacote, código fora do contrato.</p>
          </div>
          <div className={s.card}>
            <h3 style={{ marginTop: 0 }}>Não é glosa</h3>
            <p style={{ margin: 0 }}>Parte da Tabela 38 são avisos — inclusive favoráveis, como recurso acatado.</p>
          </div>
        </div>

        <h2 id="quando-recorrer">Antes de recorrer: nem toda glosa merece recurso</h2>
        <p>
          O erro mais caro não é deixar de recorrer — é recorrer de tudo. Recurso sem tese é negado, gasta horas da
          equipe e ainda pode virar “recurso duplicado” (código <Link href="/motivos-de-glosa/2904">2904</Link>). Para
          cada código de glosa, a decisão é uma destas:
        </p>
        <ul>
          <li><strong>Recorrer</strong> — quando há argumento e prova. Ex.: procedimento autorizado glosado por falta de senha (<Link href="/motivos-de-glosa/1402">1402</Link>), duplicidade que não existe (<Link href="/motivos-de-glosa/1702">1702</Link>).</li>
          <li><strong>Enviar documento</strong> — quando falta um anexo. Ex.: documentação incompleta (<Link href="/motivos-de-glosa/3052">3052</Link>), radiografia inicial (<Link href="/motivos-de-glosa/3081">3081</Link>).</li>
          <li><strong>Corrigir e reapresentar</strong> — quando o dado está errado na guia ou no arquivo XML.</li>
          <li><strong>Deixar passar</strong> — carência (<Link href="/motivos-de-glosa/1007">1007</Link>), cobertura, prazo prescrito (<Link href="/motivos-de-glosa/2909">2909</Link>), glosa mantida (<Link href="/motivos-de-glosa/2902">2902</Link>). Aqui a ação é corrigir o processo interno.</li>
        </ul>
        <p>
          Não sabe em qual caso está? <Link href="/motivos-de-glosa">Consulte o código na Tabela 38</Link> — cada um
          dos 603 códigos tem página própria com a orientação.
        </p>

        <h2 id="passo-a-passo">Como fazer recurso de glosa: passo a passo</h2>
        <ol className={s.passos}>
          <li><strong>Baixe o demonstrativo de pagamento.</strong> De preferência o XML no padrão TISS, no portal da operadora. É ele que traz, guia a guia, o valor apresentado, o pago e o código da glosa.</li>
          <li><strong>Recalcule a diferença.</strong> Não confie só no total de glosa informado: compare apresentado e pago item a item. Glosas parciais em valor costumam passar despercebidas.</li>
          <li><strong>Classifique cada código.</strong> Separe recorrer, enviar documento, corrigir ou deixar passar, como acima. Priorize pelo valor e pelo prazo.</li>
          <li><strong>Reúna a prova.</strong> Guia assinada, comprovante de autorização/senha, prontuário, laudo, nota fiscal, tabela contratual — o que sustenta aquele item.</li>
          <li><strong>Redija citando o termo oficial.</strong> Use o código e o texto exatos da Tabela 38 que a operadora aplicou, e um argumento curto e objetivo por item.</li>
          <li><strong>Envie no prazo e acompanhe.</strong> Protocole pelo canal da operadora, guarde o comprovante e confira no próximo demonstrativo se veio o pagamento ou uma nova mensagem (ex.: <Link href="/motivos-de-glosa/3095">3095 — recurso acatado</Link>).</li>
        </ol>

        <h2 id="prazo">Qual o prazo para recurso de glosa</h2>
        <p>
          A ANS não define um número de dias igual para todos. A{' '}
          <a href={FONTE_RN503} target="_blank" rel="noopener noreferrer">Resolução Normativa nº 503/2022</a>, que regula
          os contratos entre operadoras e prestadores, determina que:
        </p>
        <ul>
          <li>o contrato deve prever as hipóteses de glosa, o <strong>prazo para contestação</strong>, o prazo de resposta da operadora e o prazo de pagamento quando a glosa é revertida;</li>
          <li>o prazo para contestar a glosa deve ser <strong>igual</strong> ao prazo que a operadora tem para responder;</li>
          <li>é vedada cláusula que impeça o prestador de contestar glosas ou de acessar a justificativa delas.</li>
        </ul>
        <p>
          Ou seja: o prazo está no seu contrato ou no manual do prestador. Perdido, a própria Tabela 38 tem código para
          isso — <Link href="/motivos-de-glosa/2909">2909, prazo para recurso prescrito</Link> — e não há mais o que fazer
          na via administrativa. Por isso a análise precisa acontecer assim que o demonstrativo chega.
        </p>

        <h2 id="modelo">Modelo de recurso de glosa</h2>
        <p>
          Estrutura que funciona para a maioria das operadoras. Um bloco por item glosado; argumento curto; documento
          citado. Para o argumento específico de cada código, abra a página do código na{' '}
          <Link href="/motivos-de-glosa">Tabela 38</Link>.
        </p>
        <div className={s.modelo}>{MODELO}</div>
        <CopiarModelo texto={MODELO} />

        <h2 id="erros">Erros que fazem o recurso ser negado</h2>
        <ul>
          <li><strong>Argumento genérico</strong> (“o procedimento foi realizado”) sem documento que prove.</li>
          <li><strong>Motivo diferente do aplicado</strong>: contestar algo que a operadora não alegou.</li>
          <li><strong>Recurso fora do prazo</strong> do contrato.</li>
          <li><strong>Recurso duplicado</strong> para a mesma guia enquanto o primeiro está em análise.</li>
          <li><strong>Recorrer de glosa contratual</strong> (carência, cobertura) em vez de corrigir o processo.</li>
          <li><strong>Não conferir o próximo demonstrativo</strong> e perder a resposta — ou o pagamento parcial.</li>
        </ul>

        <h2 id="automatizar">Como o RecuperaGlosa faz isso em segundos</h2>
        <p>
          Para consultório e clínica pequena, sem faturista dedicado, o trabalho acima leva horas por demonstrativo. No
          RecuperaGlosa você envia o XML TISS do convênio e recebe:
        </p>
        <ul>
          <li>o valor glosado recalculado guia a guia (apresentado × pago), sem depender do total que a operadora informa;</li>
          <li>cada glosa com o termo oficial da Tabela 38 e a orientação: recorrer, enviar documento, corrigir ou deixar passar;</li>
          <li>o recurso redigido só para os itens com tese, pronto para revisar e enviar.</li>
        </ul>

        <Cta
          titulo="Descubra quanto dá para recuperar no seu último demonstrativo."
          texto="Envie o XML TISS e veja o valor glosado, os motivos e o recurso já redigido. Grátis para começar."
        />

        <h2 id="perguntas">Perguntas frequentes sobre recurso de glosa</h2>
        <div className={s.faq}>
          {PERGUNTAS.map(({ q, a }) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>

        <p className={s.aviso}>
          Conteúdo informativo, não é assessoria jurídica. Regras de prazo e canal de envio variam por contrato e
          operadora. Fonte regulatória: <a href={FONTE_RN503} target="_blank" rel="noopener noreferrer">RN ANS nº 503/2022</a>.
        </p>
      </article>
    </PaginaPublica>
  );
}
