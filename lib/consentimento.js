/* Consentimento para medição e publicidade (GA4 + pixel da Meta).

   Duas escolhas possíveis, 'granted' e 'denied'; ausente = ainda não
   escolheu, e tratado como negado: nada de medição carrega.

   Onde fica guardado:
   - localStorage, em JSON com data, para a validade de 6 meses valer
     mesmo sem o cookie;
   - cookie de 1ª parte `rg_consent`, com os mesmos 6 meses, que também
     serve de reserva quando o localStorage está bloqueado.

   Sem dependências de React: usado pelo banner, por lib/analytics.js e
   pelo botão "Preferências de cookies". */

export const CHAVE_CONSENTIMENTO = 'rg_consent';
export const EVENTO_MUDANCA = 'rg-consent-change';
export const EVENTO_ABRIR = 'rg-consent-open';

const SEIS_MESES_S = 60 * 60 * 24 * 30 * 6;

/* Cookies que GA4 e pixel criam no domínio. Ao revogar, apagamos: só
   deixar de carregar o script não remove o que ele já gravou. */
const COOKIES_DE_MEDICAO = /^(_ga|_gid|_gat|_gcl|_fbp|_fbc)/;

export function lerConsentimento() {
  if (typeof window === 'undefined') return null;

  try {
    const bruto = window.localStorage.getItem(CHAVE_CONSENTIMENTO);
    if (bruto) {
      const { v, t } = JSON.parse(bruto);
      const valido = (v === 'granted' || v === 'denied') && Date.now() - t < SEIS_MESES_S * 1000;
      if (valido) return v;
    }
  } catch {
    /* storage bloqueado ou valor antigo/corrompido: cai para o cookie */
  }

  const m = document.cookie.match(/(?:^|;\s*)rg_consent=(granted|denied)/);
  return m ? m[1] : null;
}

function limparCookiesDeMedicao() {
  const host = window.location.hostname;
  const dominios = [undefined, host, `.${host}`, `.${host.split('.').slice(-3).join('.')}`];
  document.cookie.split(';').forEach((c) => {
    const nome = c.split('=')[0].trim();
    if (!COOKIES_DE_MEDICAO.test(nome)) return;
    dominios.forEach((d) => {
      document.cookie = `${nome}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ''}`;
    });
  });
}

export function gravarConsentimento(valor) {
  if (valor !== 'granted' && valor !== 'denied') return;

  try {
    window.localStorage.setItem(CHAVE_CONSENTIMENTO, JSON.stringify({ v: valor, t: Date.now() }));
  } catch {
    /* sem storage: o cookie abaixo guarda a escolha */
  }

  const seguro = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CHAVE_CONSENTIMENTO}=${valor}; Max-Age=${SEIS_MESES_S}; Path=/; SameSite=Lax${seguro}`;

  if (valor === 'denied') limparCookiesDeMedicao();

  window.dispatchEvent(new CustomEvent(EVENTO_MUDANCA, { detail: valor }));
}

/* Reabre o banner a partir de qualquer ponto do site (rodapé, /privacidade). */
export function abrirPreferenciasCookies() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(EVENTO_ABRIR));
}
