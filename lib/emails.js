/* ============================================================
   E-mails transacionais — Resend
   Usa a mesma RESEND_API_KEY e o mesmo remetente do e-mail de
   boas-vindas pós-pagamento (app/api/webhooks/stripe/route.js).

   Se a chave não estiver configurada, `resend` fica nulo e as
   funções devolvem { enviado: false, motivo }. Nenhum caminho de
   e-mail pode derrubar o fluxo que o chamou.
   ============================================================ */
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const REMETENTE = 'Recupera Glosa <naoresponda@recuperaglosa.com.br>';
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://recuperaglosa.com.br';
const TEMPLATE_FINALIZAR_PAGAMENTO = 'recupera-glosa-finalizar-pagamento';
const TEMPLATE_RELATORIO_MENSAL = 'recupera-glosa-relatorio-mensal';

const PINHO = '#073b32';
const PULSE = '#c9f66b';
const INK = '#17302b';
const APOIO = '#5c706a';
const LINHA = '#dce5df';
const CANVAS = '#f4f6ef';

export function formatarBRL(valor) {
  return Number(valor ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/* Casca comum. E-mail não é página: tudo inline e em tabela, porque
   Outlook e Gmail descartam <style> e regras modernas de layout. */
function montarHtml({ titulo, saudacao, corpo, ctaTexto, ctaHref, rodape }) {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${CANVAS};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#fffefb;border:1px solid ${LINHA};border-radius:16px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

        <tr><td style="background:${PINHO};padding:20px 28px;">
          <span style="color:${PULSE};font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">RecuperaGlosa</span>
        </td></tr>

        <tr><td style="padding:28px 28px 8px;">
          <h1 style="margin:0 0 6px;font-size:21px;line-height:1.3;font-weight:700;color:${INK};">${titulo}</h1>
          <p style="margin:0;font-size:15px;color:${APOIO};">${saudacao}</p>
        </td></tr>

        <tr><td style="padding:12px 28px 0;">${corpo}</td></tr>

        ${ctaTexto ? `
        <tr><td style="padding:24px 28px 4px;">
          <a href="${ctaHref}" style="display:inline-block;background:${PINHO};color:#ffffff;text-decoration:none;padding:13px 26px;border-radius:10px;font-size:15px;font-weight:600;">${ctaTexto}</a>
        </td></tr>` : ''}

        ${rodape ? `
        <tr><td style="padding:18px 28px 0;">
          <p style="margin:0;font-size:14px;color:${APOIO};">${rodape}</p>
        </td></tr>` : ''}

        <tr><td style="padding:26px 28px 24px;">
          <hr style="border:none;border-top:1px solid ${LINHA};margin:0 0 14px;">
          <p style="margin:0;font-size:12px;color:#83958f;line-height:1.5;">
            Você recebe este e-mail porque tem uma conta no RecuperaGlosa.<br>
            Dúvidas? Responda para suporte@recuperaglosa.com.br
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/* Linha de valor: rótulo à esquerda, número tabular à direita. */
function linhaValor(rotulo, valor, cor = INK, destaque = false) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px;">
    <tr>
      <td style="font-size:14px;color:${APOIO};padding:6px 0;">${rotulo}</td>
      <td align="right" style="font-size:${destaque ? '19px' : '15px'};font-weight:${destaque ? '700' : '600'};color:${cor};padding:6px 0;font-variant-numeric:tabular-nums;">${formatarBRL(valor)}</td>
    </tr>
  </table>`;
}

/* ------------------------------------------------------------
   PEÇA 1 — lote processado com glosas
   ------------------------------------------------------------ */
export async function enviarNotificacaoGlosa({ para, nomeClinica, totalGlosado, qtdGuias, planoPago }) {
  if (!para) return { enviado: false, motivo: 'clínica sem e-mail' };
  if (!(totalGlosado > 0)) return { enviado: false, motivo: 'lote sem glosa' };

  const valor = formatarBRL(totalGlosado);
  const guiasTexto = `${qtdGuias} ${qtdGuias === 1 ? 'guia' : 'guias'}`;

  const corpo = `
    <p style="margin:0 0 18px;font-size:15px;line-height:1.6;color:${INK};">
      Processamos o demonstrativo que você enviou e encontramos
      <strong style="color:#e36d45;">${valor}</strong> em glosas recuperáveis,
      distribuídas em ${guiasTexto}.
    </p>
    <p style="margin:0;font-size:15px;line-height:1.6;color:${INK};">
      ${planoPago
        ? 'Acesse o painel para revisar e gerar os recursos de contestação.'
        : 'Assine o plano Profissional para gerar os recursos de contestação prontos para enviar.'}
    </p>`;

  const html = montarHtml({
    titulo: `Encontramos ${valor} em glosas`,
    saudacao: `Olá, ${nomeClinica}!`,
    corpo,
    ctaTexto: planoPago ? 'Revisar glosas' : 'Assinar o plano Profissional',
    ctaHref: planoPago ? `${SITE}/glosas` : `${SITE}/configuracoes?tab=assinatura`,
    rodape: `<a href="${SITE}/lotes" style="color:${PINHO};">Ver detalhes completos do envio</a>`,
  });

  const assunto = `Encontramos ${valor} em glosas no seu último envio`;

  /* Sem chave configurada não dá para enviar, mas o assunto e o corpo já
     foram montados — devolvê-los permite conferir o conteúdo em ambiente
     sem Resend, em vez de sair cedo e não testar nada. */
  if (!resend) return { enviado: false, motivo: 'RESEND_API_KEY ausente', assunto, html };

  await resend.emails.send({ from: REMETENTE, to: para, subject: assunto, html });

  return { enviado: true, assunto, html };
}

/* ------------------------------------------------------------
   CHECKOUT CRIADO — permite retomar um pagamento ainda não concluído
   ------------------------------------------------------------ */
export async function enviarFinalizacaoPagamento({
  para,
  paymentUrl,
  orderId,
  paymentDueDate,
  valor,
}) {
  if (!para) return { enviado: false, motivo: 'cliente sem e-mail' };
  if (!paymentUrl) return { enviado: false, motivo: 'checkout sem URL' };

  const assunto = 'Finalize seu pagamento na Recupera Glosa';

  if (!resend) return { enviado: false, motivo: 'RESEND_API_KEY ausente', assunto };

  const { error } = await resend.emails.send(
    {
      from: REMETENTE,
      to: para,
      template: {
        id: TEMPLATE_FINALIZAR_PAGAMENTO,
        variables: {
          PAYMENT_URL: paymentUrl,
          PRODUCT_NAME: 'Plano Profissional',
          ORDER_ID: orderId,
          PAYMENT_DUE_DATE: paymentDueDate,
          AMOUNT: formatarBRL(valor),
        },
      },
    },
    {
      headers: {
        'Idempotency-Key': `finalizar-pagamento-${orderId}`,
      },
    }
  );

  if (error) throw error;

  return { enviado: true, assunto };
}

/* ------------------------------------------------------------
   PEÇA 2 — resumo mensal
   ------------------------------------------------------------ */
export async function enviarRelatorioMensal({
  para,
  nomeClinica,
  competencia,
  apresentado,
  pago,
  glosado,
  qtdGuias,
  qtdGlosas,
  recuperavel,
  recuperado,
  taxaRecuperacao,
  valorAtrasado,
  operadoraPrioritaria,
}) {
  if (!para) return { enviado: false, motivo: 'clínica sem e-mail' };

  const valorGlosado = formatarBRL(glosado);
  const assunto = `Seu resumo de ${competencia} — ${valorGlosado} identificados`;

  if (!resend) return { enviado: false, motivo: 'RESEND_API_KEY ausente', assunto };

  const { error } = await resend.emails.send({
    from: REMETENTE,
    to: para,
    subject: assunto,
    template: {
      id: TEMPLATE_RELATORIO_MENSAL,
      variables: {
        REPORT_PERIOD: competencia,
        CLINIC_NAME: nomeClinica || 'sua clínica',
        PRESENTED_AMOUNT: formatarBRL(apresentado),
        GUIDE_COUNT: Number(qtdGuias ?? 0),
        RECEIVED_AMOUNT: formatarBRL(pago),
        GLOSSED_AMOUNT: valorGlosado,
        GLOSS_COUNT: Number(qtdGlosas ?? 0),
        RECOVERABLE_AMOUNT: formatarBRL(recuperavel),
        RECOVERED_AMOUNT: formatarBRL(recuperado),
        RECOVERY_RATE: taxaRecuperacao == null ? '—' : `${taxaRecuperacao}%`,
        OVERDUE_AMOUNT: valorAtrasado > 0 ? formatarBRL(valorAtrasado) : 'Nenhum valor',
        OPERATOR_NAME: valorAtrasado > 0
          ? (operadoraPrioritaria || 'operadora não identificada')
          : 'nenhuma operadora — tudo em dia',
        REPORT_URL: `${SITE}/relatorios`,
      },
    },
  });

  if (error) throw error;

  return { enviado: true, assunto };
}
