/* Checklist prático. Fatos de norma vêm da RN ANS 503/2022 (arts. 5º, 12,
   14); o restante é procedimento de rotina da clínica. */
import Link from 'next/link';
import s from '@/app/_components/publico/publico.module.css';
import Codigo from './Codigo';

const RN503 = 'https://www.legisweb.com.br/legislacao/?id=429858';

export const post = {
  slug: 'checklist-proteger-receita-mudanca-regulatoria',
  titulo: 'Checklist: como proteger a receita da clínica em ano de mudança regulatória',
  tituloSeo: 'Checklist de 10 passos para proteger a receita da clínica contra glosa em 2026 e 2027',
  descricao:
    'Dez passos práticos para clínicas e consultórios: contrato, prazos de recurso, Tabela 38, reajuste, TISS e organização de dados, para não perder receita com glosa em ano de mudanças.',
  publicado: '2026-10-10',
  atualizado: '2026-10-10',
  resposta: (
    <>
      <strong>Em ano de mudança regulatória, a proteção da receita depende de dez rotinas:</strong> conhecer o prazo de
      contestação do contrato, usar a Tabela 38 vigente, conferir o demonstrativo guia a guia, recorrer com prova e
      protocolo, acompanhar o reajuste, manter o padrão TISS atualizado e registrar os números de glosa por operadora e
      motivo. Nenhuma delas depende de lei nova.
    </>
  ),
  perguntas: [
    {
      q: 'Qual é a primeira coisa a fazer?',
      a: 'Localizar o prazo de contestação de glosa no contrato de cada operadora. É nele, e não em prazo legal único, que está o limite para recorrer.',
    },
    {
      q: 'Com que frequência conferir o demonstrativo?',
      a: 'A cada lote pago. A glosa parcial passa despercebida porque o dinheiro entra, só que menor. Conferir item a item, comparando apresentado e pago, é o que revela o valor.',
    },
    {
      q: 'Quando negociar reajuste com a operadora?',
      a: 'A RN nº 503/2022 prevê reajuste anual na data de aniversário do contrato e admite livre negociação, com período de 90 dias corridos improrrogáveis contados de 1º de janeiro de cada ano, ressalvada a RN nº 508/2022. Confira a cláusula do seu contrato.',
    },
    {
      q: 'Preciso de faturista para isso?',
      a: 'Não necessariamente. O que importa é a rotina e o registro. Ferramentas de análise automatizam a leitura do XML, o cálculo da glosa e a redação do recurso, e a equipe da clínica revisa antes de enviar.',
    },
  ],
};

export default function Conteudo() {
  return (
    <>
      <h2 id="checklist">Os dez passos</h2>
      <ol className={s.passos}>
        <li>
          <strong>Mapeie o prazo de contestação de cada contrato.</strong> A <a href={RN503} target="_blank" rel="noopener noreferrer">RN nº
          503/2022</a> exige que o contrato preveja o prazo de contestação, o de resposta da operadora e o de pagamento se a
          glosa for revertida (art. 14).
        </li>
        <li>
          <strong>Registre as hipóteses de glosa do contrato.</strong> Elas orientam se a glosa recebida tem fundamento
          contratual ou não.
        </li>
        <li>
          <strong>Atualize o sistema de faturamento para a Tabela 38 vigente.</strong> Veja{' '}
          <Link href="/blog/tabela-38-o-que-mudou-2026">o que mudou em 2026</Link>. Códigos como <Codigo c="3209" /> e{' '}
          <Codigo c="3306" /> aparecem sem tradução em sistemas defasados.
        </li>
        <li>
          <strong>Confira cada demonstrativo guia a guia.</strong> Compare valor apresentado e valor pago. A glosa parcial é a
          que mais escapa.
        </li>
        <li>
          <strong>Classifique cada glosa:</strong> recorrer, enviar documento, corrigir e reapresentar ou aceitar. Veja os
          tipos em <Link href="/blog/tipos-de-glosa">tipos de glosa</Link>.
        </li>
        <li>
          <strong>Recorra com termo oficial e prova.</strong> Cite o termo da Tabela 38 como veio no demonstrativo e anexe
          senha, guia assinada ou laudo. Modelo em <Link href="/recurso-de-glosa">recurso de glosa</Link>.
        </li>
        <li>
          <strong>Guarde protocolo e data de envio.</strong> É a prova de que o prazo foi cumprido.
        </li>
        <li>
          <strong>Acompanhe o reajuste.</strong> A norma veda reajuste que mantenha ou reduza o valor nominal do serviço
          (art. 5º, VIII) e condicionado à sinistralidade da operadora (art. 5º, VII).
        </li>
        <li>
          <strong>Mantenha o envio no padrão TISS vigente.</strong> As proteções sobre acesso às justificativas e contestação
          se aplicam quando o faturamento é enviado nesse padrão (parágrafo único do art. 5º).
        </li>
        <li>
          <strong>Registre números por operadora e motivo:</strong> apresentado, pago, glosado, recuperado e perdido. Servem
          para negociação, para o contador e para identificar a operadora que mais glosa.
        </li>
      </ol>

      <h2 id="por-que">Por que agora</h2>
      <p>
        O ambiente tem várias frentes em movimento: revisão da Tabela 38, agenda regulatória da ANS, discussão de projetos no
        Congresso e transição tributária. Veja o panorama em{' '}
        <Link href="/blog/agenda-saude-suplementar-2027">agenda da saúde suplementar para 2027</Link> e em{' '}
        <Link href="/blog/reforma-tributaria-2026-clinicas-glosa">reforma tributária e glosa</Link>. A rotina descrita aqui
        funciona qualquer que seja o desfecho de cada uma.
      </p>
      <p>
        Para executar os passos 4 a 7 em segundos, envie o XML do demonstrativo no{' '}
        <Link href="/">RecuperaGlosa</Link> e veja a glosa por motivo, com o recurso já redigido.
      </p>
      <p className={s.aviso}>Conteúdo informativo. Prazos e canais dependem do contrato com cada operadora.</p>
    </>
  );
}
