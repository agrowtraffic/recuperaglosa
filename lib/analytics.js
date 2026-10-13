/* Eventos de conversão do funil, enviados ao GA4 e, se estiver instalado,
   ao pixel da Meta.

   Regras:
   - Nunca passar dado pessoal (e-mail, nome, telefone, nome de arquivo).
     Aqui só entram rótulos e códigos de motivo.
   - Seguro chamar em qualquer lugar do cliente: sem gtag/fbq (bloqueador,
     pixel desligado) vira no-op e jamais lança erro para o fluxo da tela. */

/* Evento do app → evento padrão da Meta. O que não está aqui vai como
   evento customizado, que serve para segmentar e remarketing. */
const META_PADRAO = {
  sign_up: 'CompleteRegistration',
  upload_sucesso: 'Lead',
  begin_checkout: 'InitiateCheckout',
  purchase: 'Purchase',
};

export function track(evento, params = {}) {
  if (typeof window === 'undefined') return;
  try {
    if (typeof window.gtag === 'function') window.gtag('event', evento, params);
    if (typeof window.fbq === 'function') {
      const padrao = META_PADRAO[evento];
      if (padrao) window.fbq('track', padrao, params);
      else window.fbq('trackCustom', evento, params);
    }
  } catch {
    /* medição nunca pode quebrar a tela */
  }
}

/* Para eventos que a tela pode disparar de novo (recarregar a página de
   pagamento confirmado, por exemplo): conta uma vez por chave. */
export function trackOnce(chave, evento, params = {}) {
  if (typeof window === 'undefined') return;
  const k = `rg_ev_${chave}`;
  try {
    if (window.localStorage.getItem(k)) return;
    window.localStorage.setItem(k, '1');
  } catch {
    /* sem storage: dispara mesmo assim, melhor contar a mais que perder */
  }
  track(evento, params);
}
