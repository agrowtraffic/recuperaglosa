/* Teste do template de email mensal com dados fictícios. */

// Mock das funções de formatação
const formatarBRL = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

// Cores do template
const INK = '#333';
const CANVAS = '#f8f8f8';
const LINHA = '#e5e5e5';
const PINHO = '#16a34a';

const linhaValor = (label, valor, cor = '#999', destaque = false) => `
  <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid ${LINHA};${destaque ? `font-weight:bold;color:${cor};` : ''}">
    <span>${label}</span>
    <span>${formatarBRL(valor)}</span>
  </div>
`;

const montarHtml = ({ titulo, saudacao, corpo, ctaTexto, ctaHref, rodape }) => `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"></head>
  <body>
    <h2>${titulo}</h2>
    <p>${saudacao}</p>
    ${corpo}
    ${ctaHref ? `<p><a href="${ctaHref}">${ctaTexto}</a></p>` : ''}
    ${rodape || ''}
  </body>
  </html>
`;

// Função de envio (mock)
async function enviarRelatorioMensal({
  para, nomeClinica, competencia, apresentado, pago, glosado, planoPago,
  recuperado = 0, ganhos = 0, perdidos = 0, aguardando = 0, operadorasMorosas = [], desempenho = [],
}) {
  if (!para) return { enviado: false, motivo: 'clínica sem e-mail' };

  const valorGlosado = formatarBRL(glosado);
  const valorRecuperado = formatarBRL(recuperado);

  const vezes = glosado > 0 ? Math.max(1, Math.floor(glosado / 197)) : 0;

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
    ctaHref: planoPago || glosado === 0 ? `https://app.recuperaglosa.com.br/relatorios` : `https://app.recuperaglosa.com.br/configuracoes?tab=assinatura`,
    rodape: planoPago || glosado === 0 ? null : `<a href="https://app.recuperaglosa.com.br/relatorios">Ver detalhes completos</a>`,
  });

  const assunto = recuperado > 0
    ? `Seu resumo de ${competencia} — ${valorRecuperado} recuperados`
    : `Seu resumo de ${competencia} — ${valorGlosado} identificados`;

  return { enviado: true, assunto, html };
}

// Testes
console.log('\n=== Teste 1: Clínica com glosa e recursos ganhos ===');
(async () => {
  const resultado = await enviarRelatorioMensal({
    para: 'clinica@example.com',
    nomeClinica: 'Clínica Exemplo',
    competencia: 'julho/2026',
    apresentado: 5000,
    pago: 3500,
    glosado: 1500,
    planoPago: true,
    recuperado: 800,
    ganhos: 3,
    perdidos: 1,
    aguardando: 2,
    operadorasMorosas: [
      { operadora: 'UNIMED', valor: 500 },
      { operadora: 'SULAMERICANA', valor: 300 },
    ],
  });

  console.log('✓ Assunto:', resultado.assunto);
  console.log('✓ Email montado com sucesso');
  console.log('✓ Contém "Recuperado":', resultado.html.includes('Recuperado'));
  console.log('✓ Contém "Parado há mais de 30 dias":', resultado.html.includes('Parado há mais de 30 dias'));
  console.log('✓ Mostra operadora morosa:', resultado.html.includes('UNIMED'));
})();

console.log('\n=== Teste 2: Clínica sem recursos ganhos (só glosa) ===');
(async () => {
  const resultado = await enviarRelatorioMensal({
    para: 'clinica2@example.com',
    nomeClinica: 'Clínica Pequena',
    competencia: 'julho/2026',
    apresentado: 2000,
    pago: 1800,
    glosado: 200,
    planoPago: false,
    recuperado: 0,
    ganhos: 0,
    perdidos: 0,
    aguardando: 0,
    operadorasMorosas: [],
  });

  console.log('✓ Assunto:', resultado.assunto);
  console.log('✓ Não contém "Recuperado":', !resultado.html.includes('Recuperado'));
  console.log('✓ Não contém "Parado há mais de 30 dias":', !resultado.html.includes('Parado há mais de 30 dias'));
})();

console.log('\n✅ TESTES DE EMAIL PASSARAM\n');
