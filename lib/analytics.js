/* Eventos de conversão do funil, enviados ao GA4 e, se estiver instalado,
   ao pixel da Meta.

   Regras:
   - Nunca passar dado pessoal (e-mail, nome, telefone, nome de arquivo).
     Aqui só entram rótulos e códigos de motivo.
   - Seguro chamar em qualquer lugar do cliente: sem gtag/fbq (sem
     consentimento, bloqueador, pixel desligado) vira no-op e jamais lança
     erro para o fluxo da tela.
   - Sem consentimento nada é enviado nem guardado: GA4 e pixel só existem
     na página depois do aceite (app/_components/ConsentGate.jsx). */
import { lerConsentimento } from '@/lib/consentimento';

/* Evento do app → evento padrão da Meta. O que não está aqui vai como
   evento customizado, que serve para segmentar e remarketing. */
const META_PADRAO = {
  sign_up: 'CompleteRegistration',
  upload_sucesso: 'Lead',
  begin_checkout: 'InitiateCheckout',
  purchase: 'Purchase',
};

function ferramentaDisponivel() {
  return typeof window.gtag === 'function' || typeof window.fbq === 'function';
}

/* Quem aceitou numa visita anterior abre a página com as ferramentas ainda
   carregando: o evento pode ser pedido antes de gtag/fbq existirem. Espera
   até ~9 s por elas; sem consentimento, descarta na hora. */
function quandoDisponivel(fn, tentativas = 30) {
  if (ferramentaDisponivel()) {
    fn();
    return;
  }
  if (tentativas <= 0 || lerConsentimento() !== 'granted') return;
  window.setTimeout(() => quandoDisponivel(fn, tentativas - 1), 300);
}

function enviar(evento, params) {
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

export function track(evento, params = {}) {
  if (typeof window === 'undefined') return;
  quandoDisponivel(() => enviar(evento, params));
}

/* Para eventos que a tela pode disparar de novo (recarregar a página de
   pagamento confirmado, por exemplo): conta uma vez por chave.

   Só marca como contado quando o evento de fato saiu. Marcar antes, com
   ferramentas ausentes (sem consentimento), perderia o evento para
   sempre: depois do aceite ele já constaria como enviado. */
export function trackOnce(chave, evento, params = {}) {
  if (typeof window === 'undefined') return;
  const k = `rg_ev_${chave}`;

  quandoDisponivel(() => {
    try {
      if (window.localStorage.getItem(k)) return;
      window.localStorage.setItem(k, '1');
    } catch {
      /* sem storage: dispara mesmo assim, melhor contar a mais que perder */
    }
    enviar(evento, params);
  });
}
