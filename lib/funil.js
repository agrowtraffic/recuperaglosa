/* Medição própria do funil, gravada no Supabase (tabela funil_evento).

   Sem cookie, sem identificador de visitante e sem dado pessoal: cada
   linha é um acontecimento solto. A origem (UTM e domínio de quem
   indicou) fica no sessionStorage só enquanto a aba está aberta.

   A tabela aceita apenas INSERT; ninguém lê pelo site. Falha de medição
   nunca aparece para o usuário. */

const CHAVE_ORIGEM = 'rg_origem';
const CHAVE_INTERNO = 'rg_interno';
const HOSTS_PRODUCAO = new Set(['recuperaglosa.com.br', 'www.recuperaglosa.com.br']);
const CAMPOS_ORIGEM = ['utm_source', 'utm_medium', 'utm_campaign', 'referrer'];

/* Só letras, números e pontuação de rótulo. Descarta o que tiver "@" para
   um e-mail colado numa UTM não ir parar no banco. */
export function rotulo(valor, max = 60) {
  const t = String(valor ?? '').trim().toLowerCase();
  if (!t || t.includes('@')) return null;
  return t.replace(/[^a-z0-9._-]+/g, '-').slice(0, max) || null;
}

export function limparOrigem(origem) {
  const limpa = {};
  for (const c of CAMPOS_ORIGEM) {
    const v = rotulo(origem?.[c], c === 'referrer' ? 100 : 60);
    if (v) limpa[c] = v;
  }
  return limpa;
}

/* Primeira origem vista na aba. */
export function capturarOrigem() {
  try {
    const salva = window.sessionStorage.getItem(CHAVE_ORIGEM);
    if (salva) return limparOrigem(JSON.parse(salva));
    const q = new URLSearchParams(window.location.search);
    let referrer = '';
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host !== window.location.hostname) referrer = host;
    }
    const origem = limparOrigem({
      utm_source: q.get('utm_source'),
      utm_medium: q.get('utm_medium'),
      utm_campaign: q.get('utm_campaign'),
      referrer,
    });
    window.sessionStorage.setItem(CHAVE_ORIGEM, JSON.stringify(origem));
    return origem;
  } catch {
    return {};
  }
}

/* Acesso da equipe: abrir o site com ?rg_interno=1 marca o navegador (0
   desfaz). Fora do domínio de produção tudo já conta como interno. */
export function ehInterno() {
  try {
    const q = new URLSearchParams(window.location.search).get('rg_interno');
    if (q === '1') window.localStorage.setItem(CHAVE_INTERNO, '1');
    if (q === '0') window.localStorage.removeItem(CHAVE_INTERNO);
    if (window.localStorage.getItem(CHAVE_INTERNO)) return true;
  } catch {
    /* sem storage, decide só pelo domínio */
  }
  return !HOSTS_PRODUCAO.has(window.location.hostname);
}

const ehRobo = () =>
  navigator.webdriver || /bot|crawl|spider|slurp|headless|lighthouse/i.test(navigator.userAgent);

export function registrar(evento, { detalhe, origem } = {}) {
  if (typeof window === 'undefined' || ehRobo()) return;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !chave) return;
  fetch(`${url}/rest/v1/funil_evento`, {
    method: 'POST',
    keepalive: true, // sobrevive à navegação disparada pelo próprio clique
    headers: {
      apikey: chave,
      Authorization: `Bearer ${chave}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({
      evento,
      pagina: window.location.pathname.slice(0, 120),
      detalhe: rotulo(detalhe),
      interno: ehInterno(),
      ...limparOrigem(origem ?? capturarOrigem()),
    }),
  }).catch(() => {});
}
