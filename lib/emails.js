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
const SITE = process.env.NEXT_PUBLIC_SITE_URL || 'https://recuperaglosa.vercel.app';

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
   PEÇA 2 — resumo mensal
   ------------------------------------------------------------ */
export async function enviarRelatorioMensal({
  para, nomeClinica, competencia, apresentado, pago, glosado, planoPago,
  recuperado = 0, ganhos = 0, perdidos = 0, aguardando = 0, operadorasMorosas = [], desempenho = [],
}) {
  if (!para) return { enviado: false, motivo: 'clínica sem e-mail' };

  const valorGlosado = formatarBRL(glosado);
  const valorRecuperado = formatarBRL(recuperado);

  /* Quantas vezes a mensalidade se pagou. Piso de 1x sempre que houve
     alguma glosa — abaixo de R$ 197 o arredondamento daria 0x, o que
     leria como "não se pagou" mesmo tendo achado dinheiro. */
  const vezes = glosado > 0 ? Math.max(1, Math.floor(glosado / 197)) : 0;

  /* Operadora mais morosa (parado há 30+ dias). */
  const operadoraMaisMorosa = operadorasMorosas.length > 0
    ? operadorasMorosas.reduce((a, b) => b.valor > a.valor ? b : a)
    : null;

  const corpo = `
    <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:${INK};">
      Resumo do seu mês em <strong>${competencia}</strong>:
    </p>

    <div style="background:${CANVAS};border:1px solid ${LINHA};border-radius:12px;padding:14px 16px;margin:0 0 18px;">
      ${linhaValor('Valor apresentado', apresentado)}
      ${linhaValor('Pago pelas operadoras', pago, '#0b9a73')}
      ${linhaValor('Glosado (recuperável)', glosado, '#e36d45', true)}
    </div>

    ${recuperado > 0 ? `
      <div style="background:${CANVAS};border:1px solid ${LINHA};border-radius:12px;padding:14px 16px;margin:0 0 18px;border-left:4px solid #16a34a;">
        <p style="margin:0 0 8px;font-size:13px;color:#666;text-transform:uppercase;font-weight:600;">Recursos neste mês</p>
        ${linhaValor('Recuperado (ganhos aceitos)', recuperado, '#16a34a', true)}
        ${ganhos > 0 ? `<p style="margin:8px 0 0;font-size:13px;color:#666;">✓ ${ganhos} recurso(s) ganho(s)${perdidos > 0 ? ` • ✗ ${perdidos} perdido(s)` : ''}</p>` : ''}
      </div>
    ` : ''}

    ${operadoraMaisMorosa ? `
      <div style="background:${CANVAS};border:1px solid ${LINHA};border-radius:12px;padding:14px 16px;margin:0 0 18px;border-left:4px solid #e36d45;">
        <p style="margin:0 0 8px;font-size:13px;color:#666;text-transform:uppercase;font-weight:600;">⏱ Parado há mais de 30 dias</p>
        <p style="margin:0;font-size:15px;color:#333;"><strong>${operadoraMaisMorosa.operadora}</strong>: ${formatarBRL(operadoraMaisMorosa.valor)}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#999;">Considere fazer uma cobrança nesta operadora.</p>
      </div>
    ` : ''}

    <p style="margin:0;font-size:15px;line-height:1.6;color:${INK};">
      ${planoPago
        ? (recuperado > 0
            ? `Sua assinatura de R$ 197 se pagou <strong>${Math.max(1, Math.floor(recuperado / 197))}x</strong> só com os recursos aceitos este mês.`
            : (vezes > 0
                ? `Sua assinatura de R$ 197 já se pagou <strong>${vezes}x</strong> este mês em potencial de recuperação.`
                : 'Nenhuma glosa neste período — as operadoras pagaram tudo que foi apresentado.'))
        : (glosado > 0
            ? `Você já tem <strong>${valorGlosado}</strong> esperando para virar recurso de contestação. Assine para desbloquear.`
            : 'Nenhuma glosa neste período — as operadoras pagaram tudo que foi apresentado.')}
    </p>`;

  const html = montarHtml({
    titulo: `Seu resumo de ${competencia}`,
    saudacao: `Olá, ${nomeClinica}!`,
    corpo,
    ctaTexto: planoPago || glosado === 0 ? 'Ver relatório completo' : 'Assinar e liberar os recursos',
    ctaHref: planoPago || glosado === 0 ? `${SITE}/relatorios` : `${SITE}/configuracoes?tab=assinatura`,
    rodape: planoPago || glosado === 0 ? null : `<a href="${SITE}/relatorios" style="color:${PINHO};">Ver detalhes completos</a>`,
  });

  const assunto = recuperado > 0
    ? `Seu resumo de ${competencia} — ${valorRecuperado} recuperados`
    : `Seu resumo de ${competencia} — ${valorGlosado} identificados`;

  if (!resend) return { enviado: false, motivo: 'RESEND_API_KEY ausente', assunto, html };

  await resend.emails.send({ from: REMETENTE, to: para, subject: assunto, html });

  return { enviado: true, assunto, html };
}
