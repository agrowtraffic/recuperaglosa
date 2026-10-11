/* Reforma tributária × clínicas × glosa. Só o que foi confirmado em fonte
   entra como afirmação; o que depende de regime tributário ou do momento do
   fato gerador vira pergunta para o contador, nunca conclusão. */
import Link from 'next/link';
import s from '@/app/_components/publico/publico.module.css';

const MIGALHAS = 'https://www.migalhas.com.br/depeso/433225/reforma-tributaria-30-planos-de-saude';
const AMDJUS = 'https://amdjus.com.br/reforma-tributaria-traz-alivio-de-60-nos-impostos-para-setor-de-saude-e-dispositivos-medicos/';
const OZAI = 'https://www.ozai.com.br/reforma-tributaria-medicos-clinicas-consultorios/';

export const post = {
  slug: 'reforma-tributaria-2026-clinicas-glosa',
  titulo: 'Reforma tributária 2026: o que muda para clínicas e como a glosa entra na conta?',
  tituloSeo: 'Reforma tributária para clínicas: CBS, IBS e o impacto da glosa na receita',
  descricao:
    'A LC 214/2025 reduz em 60% as alíquotas de IBS e CBS para serviços de saúde. Entenda o calendário, o que ainda depende de regulamentação e as perguntas que a clínica deve levar ao contador sobre glosa.',
  publicado: '2026-10-10',
  atualizado: '2026-10-10',
  resposta: (
    <>
      <strong>A reforma tributária (EC 132/2023 e LC 214/2025) substitui PIS, Cofins, ICMS, ISS e IPI por CBS e IBS e prevê
      redução de 60% nas alíquotas para serviços de saúde.</strong> O ano de 2026 é de teste, e a cobrança plena de CBS começa em
      2027, com IBS entrando gradualmente até 2033. Como a glosa afeta a base de cálculo de quem fatura para convênio
      depende do regime da clínica e do momento do fato gerador, e deve ser confirmado com o contador.
    </>
  ),
  perguntas: [
    {
      q: 'A redução de 60% vale automaticamente para toda clínica?',
      a: 'A redução está prevista no art. 128 da LC 214/2025 para serviços de saúde, observadas as definições e demais disposições da lei. A carga efetiva depende do regime (Simples, lucro presumido, lucro real), do tipo de serviço e da forma como a nota é emitida. Não use o percentual como alíquota final sem a análise do contador.',
    },
    {
      q: 'A glosa reduz o tributo que a clínica paga?',
      a: 'Depende do regime e do momento em que o tributo é devido. As fontes consultadas não tratam especificamente desse ponto para prestadores de serviço. Leve ao contador a pergunta: se a nota foi emitida pelo valor cobrado e parte foi glosada, como fica o tributo sobre a parcela não paga?',
    },
    {
      q: 'O regime de caixa da operadora vale também para a clínica?',
      a: 'O art. 235 da LC 214/2025, que trata de planos de saúde, define para as operadoras a base de cálculo sobre contraprestações efetivamente recebidas (regime de caixa). Esse dispositivo se refere às operadoras, não à clínica prestadora.',
    },
    {
      q: 'Preciso mudar algo no faturamento agora?',
      a: 'Em 2026 a CBS é apurada em fase de teste. O que vale fazer agora é organizar os dados: faturamento por operadora, valor glosado, valor recuperado e valor não recuperado. Esses números sustentam qualquer análise tributária futura.',
    },
  ],
};

const TH = { padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid var(--line)' };
const TD = { padding: '8px 10px', verticalAlign: 'top', borderBottom: '1px solid var(--line)' };

export default function Conteudo() {
  return (
    <>
      <h2 id="o-que-muda">O que muda, em resumo</h2>
      <p>
        A LC 214/2025 institui o IBS e a CBS, que substituem tributos sobre consumo como PIS, Cofins, ICMS, ISS e IPI.
        Segundo <a href={MIGALHAS} target="_blank" rel="noopener noreferrer">análise publicada no Migalhas</a>, o art. 128 prevê
        redução de 60% nas alíquotas de IBS e CBS para operações com serviços de saúde. Outros textos, como o do{' '}
        <a href={AMDJUS} target="_blank" rel="noopener noreferrer">AmdJus</a>, citam também os arts. 130 e 131 e o uso da alíquota
        reduzida no documento fiscal. Confira a redação original antes de aplicar em qualquer cálculo.
      </p>

      <h2 id="calendario">Calendário geral da transição</h2>
      <div className={s.card} style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14.5, minWidth: 520 }}>
          <thead>
            <tr><th style={TH}>Ano</th><th style={TH}>Etapa</th></tr>
          </thead>
          <tbody>
            <tr><td style={TD}>2026</td><td style={TD}>Teste: CBS a 0,9% e IBS a 0,1%, compensados com outros tributos.</td></tr>
            <tr><td style={TD}>2027</td><td style={TD}>CBS passa a ser cobrada de forma plena; PIS e Cofins são extintos.</td></tr>
            <tr><td style={TD}>2029 a 2032</td><td style={TD}>IBS cresce gradualmente enquanto ICMS e ISS diminuem.</td></tr>
            <tr><td style={TD}>2033</td><td style={TD}>Novo sistema em plena vigência.</td></tr>
          </tbody>
        </table>
      </div>
      <p>
        Esse é o cronograma geral previsto pela reforma, conforme material de contabilidade como o da{' '}
        <a href={OZAI} target="_blank" rel="noopener noreferrer">Ozai</a>, que cita transição até 2033. Prazos e regras
        complementares podem ser ajustados por regulamentação; verifique com o contador a versão vigente.
      </p>

      <h2 id="glosa">Onde a glosa entra</h2>
      <p>
        A clínica emite a nota pelo valor cobrado da operadora. Quando parte do valor é glosada e não recuperada, o dinheiro
        que entra é menor do que o faturado. A reforma não cria regra específica sobre glosa nas fontes consultadas, mas muda
        o tipo de cálculo (não cumulativo, com créditos), o que torna a conciliação entre faturado e recebido mais importante.
      </p>
      <h3>Perguntas para levar ao contador</h3>
      <ol className={s.passos}>
        <li>Em que momento nasce a obrigação do tributo no meu regime: na emissão da nota ou no recebimento?</li>
        <li>Se parte do valor for glosada e não paga, como esse valor é tratado na apuração?</li>
        <li>Uma glosa revertida meses depois altera algum período já apurado?</li>
        <li>A minha nota está classificada de modo a ter a redução de 60% prevista para serviços de saúde?</li>
        <li>Quais créditos de insumos e serviços eu passo a aproveitar e que documentos preciso guardar?</li>
      </ol>

      <h2 id="dados">Os dados que a clínica deve ter organizados</h2>
      <ul>
        <li>Valor apresentado, valor pago e valor glosado, por operadora e por competência.</li>
        <li>Quanto da glosa foi recuperado em recurso e quanto foi perdido (inclusive por prazo).</li>
        <li>Data de envio do lote, de pagamento e de resposta do recurso.</li>
      </ul>
      <p>
        O <Link href="/">RecuperaGlosa</Link> recalcula a glosa guia a guia a partir do XML do demonstrativo e gera esse
        histórico por motivo. Para entender os motivos, consulte os <Link href="/codigos-de-glosa">códigos de glosa</Link>.
      </p>
      <p className={s.aviso}>
        Conteúdo informativo, sem caráter de consultoria tributária. As fontes tributárias citadas são secundárias; a
        interpretação para o seu caso deve ser feita pelo contador com base na LC 214/2025 e em sua regulamentação.
      </p>
    </>
  );
}
