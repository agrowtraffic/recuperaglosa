/* ============================================================
   Vocabulário do plano — fonte única.

   Antes disto o mesmo botão aparecia como "Assinar", "Assinar agora —
   R$ 197/mês", "Liberar recursos" e "Liberar por R$ 197/mês", às vezes
   na mesma tela, apontando para lugares diferentes. E o plano se chamava
   'Ativo' na barra lateral, 'Profissional' em Configurações e 'plano
   pago' nos textos.

   Regra: nenhum arquivo escreve esses rótulos à mão nem compara
   `plano === 'ativo'` direto. Tudo passa por aqui.
   ============================================================ */

export const PRECO_MENSAL = 197;

export const PLANO_PAGO = 'Profissional';
export const PLANO_GRATUITO = 'Gratuito';

/* O banco grava 'ativo' (webhook do Stripe) ou 'trial'. 'profissional' é
   aceito para tolerar uma renomeação futura do valor sem quebrar telas. */
const VALORES_PAGOS = new Set(['ativo', 'profissional']);

export function ehPago(clinica) {
  return VALORES_PAGOS.has(clinica?.plano);
}

export function nomeDoPlano(clinica) {
  return ehPago(clinica) ? PLANO_PAGO : PLANO_GRATUITO;
}

/* Um rótulo só para a ação de assinar, em qualquer tela. Traz o preço
   porque esconder valor em botão de compra é hostil. */
export const CTA_ASSINAR = `Assinar — R$ ${PRECO_MENSAL}/mês`;

/* Limite do plano gratuito, usado no upload e nas telas que o anunciam. */
export const LOTES_GRATIS_POR_MES = 3;
