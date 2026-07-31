/* ============================================================
   Matemática dos relatórios.

   Separado de dados-clinica.js de propósito: aqui não se busca nada,
   só se calcula sobre o que já veio. Sem o import do Supabase, estas
   funções rodam num teste direto (src/testar-relatorios.ts) — e é
   onde mora a conta que o cliente confere contra o extrato dele.
   ============================================================ */

const MESES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
];

/** 'AAAA-MM' → 'julho/2026'. Devolve a entrada intacta se não reconhecer
 *  o formato: competência vinda de XML torto aparece como veio, em vez
 *  de virar 'undefined/NaN' na tela e no PDF. */
export function formatarCompetencia(texto) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(texto ?? '').trim());
  if (!m) return texto ?? '—';
  const mes = Number(m[2]);
  if (mes < 1 || mes > 12) return texto;
  return `${MESES[mes - 1]}/${m[1]}`;
}

/** Dias inteiros entre dois instantes.
 *  Compara meio-dia contra meio-dia em UTC para o número não variar com
 *  o fuso de quem está olhando nem com horário de verão. */
export function diasEntre(inicioISO, fimISO) {
  if (!inicioISO || !fimISO) return null;
  const a = new Date(inicioISO);
  const b = new Date(fimISO);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return null;
  const ua = Date.UTC(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate(), 12);
  const ub = Date.UTC(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate(), 12);
  return Math.round((ub - ua) / 86400000);
}

/* ------------------------------------------------------------
   Desempenho do recurso por operadora.

   Responde a pergunta que decide onde a clínica gasta energia: esta
   operadora devolve dinheiro, ou só consome tempo?

   Duas taxas, de propósito:
     - por quantidade: quantos recursos foram aceitos
     - por valor:      quanto do que se pleiteou voltou

   Elas divergem quando há aceite parcial, e a divergência é a
   informação. Operadora que aceita todo recurso mas paga 20% de cada
   um marca 100% na primeira e 20% na segunda — só a segunda descreve
   o que entrou no caixa.
   ------------------------------------------------------------ */
export function desempenhoPorOperadora(recursos = []) {
  const mapa = new Map();

  for (const r of recursos) {
    // Rascunho nunca saiu da clínica: não diz nada sobre a operadora.
    if (r.status === 'rascunho') continue;

    const chave = r.operadora || '—';
    const atual = mapa.get(chave) ?? {
      operadora: chave,
      enviados: 0,
      aguardando: 0,
      ganhos: 0,
      perdidos: 0,
      pleiteadoDecidido: 0,
      recuperado: 0,
      diasSoma: 0,
      diasAmostra: 0,
    };

    atual.enviados += 1;

    if (r.status === 'enviado') {
      atual.aguardando += 1;
    } else if (r.status === 'ganho' || r.status === 'perdido') {
      /* Só recurso decidido entra na taxa. Incluir os que ainda
         aguardam derrubaria o índice de quem simplesmente ainda não
         respondeu — puniria a operadora pela demora, não pelo mérito,
         e as duas coisas já aparecem separadas. */
      atual.pleiteadoDecidido += Number(r.valor ?? 0);

      if (r.status === 'ganho') {
        atual.ganhos += 1;
        /* valorRecuperado nulo em recurso ganho = aceite integral
           (registro anterior à coluna existir). */
        atual.recuperado += Number(r.valorRecuperado ?? r.valor ?? 0);
      } else {
        atual.perdidos += 1;
      }

      const dias = diasEntre(r.enviadoEmISO, r.resolvidoEmISO);
      if (dias != null && dias >= 0) {
        atual.diasSoma += dias;
        atual.diasAmostra += 1;
      }
    }

    mapa.set(chave, atual);
  }

  return [...mapa.values()]
    .map((o) => {
      const decididos = o.ganhos + o.perdidos;
      return {
        operadora: o.operadora,
        enviados: o.enviados,
        aguardando: o.aguardando,
        ganhos: o.ganhos,
        perdidos: o.perdidos,
        decididos,
        pleiteadoDecidido: o.pleiteadoDecidido,
        recuperado: o.recuperado,
        /* null, não zero: sem recurso decidido não existe taxa, e 0%
           leria como "essa operadora nunca aceita nada". */
        taxaQtd: decididos ? Math.round((o.ganhos / decididos) * 100) : null,
        taxaValor: o.pleiteadoDecidido
          ? Math.round((o.recuperado / o.pleiteadoDecidido) * 100)
          : null,
        diasMedios: o.diasAmostra ? Math.round(o.diasSoma / o.diasAmostra) : null,
      };
    })
    .sort((a, b) => b.recuperado - a.recuperado || b.enviados - a.enviados);
}

/* ------------------------------------------------------------
   Recursos enviados que a operadora ainda não respondeu, do que
   espera há mais tempo para o mais recente.

   É a lista acionável da tela: são estes que valem uma cobrança.
   ------------------------------------------------------------ */
export function recursosAguardando(recursos = [], agora = new Date()) {
  return recursos
    .filter((r) => r.status === 'enviado')
    .map((r) => ({
      ...r,
      diasEsperando: diasEntre(r.enviadoEmISO, agora.toISOString()),
    }))
    .sort((a, b) => (b.diasEsperando ?? -1) - (a.diasEsperando ?? -1));
}

/* ------------------------------------------------------------
   Números do topo da tela de relatórios.
   ------------------------------------------------------------ */
export function resumoDosRecursos(recursos = []) {
  const enviados = recursos.filter((r) => r.status !== 'rascunho');
  const ganhos = recursos.filter((r) => r.status === 'ganho');
  const perdidos = recursos.filter((r) => r.status === 'perdido');
  const decididos = ganhos.length + perdidos.length;

  const pleiteadoDecidido = [...ganhos, ...perdidos].reduce(
    (s, r) => s + Number(r.valor ?? 0),
    0,
  );
  const recuperado = ganhos.reduce(
    (s, r) => s + Number(r.valorRecuperado ?? r.valor ?? 0),
    0,
  );

  return {
    gerados: recursos.length,
    enviados: enviados.length,
    aguardando: recursos.filter((r) => r.status === 'enviado').length,
    ganhos: ganhos.length,
    perdidos: perdidos.length,
    decididos,
    pleiteadoDecidido,
    recuperado,
    taxaQtd: decididos ? Math.round((ganhos.length / decididos) * 100) : null,
    taxaValor: pleiteadoDecidido
      ? Math.round((recuperado / pleiteadoDecidido) * 100)
      : null,
  };
}
