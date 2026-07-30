/* ============================================================
   Camada de leitura das telas do app.
   Todas as consultas passam pelo cliente autenticado, então o RLS
   já restringe cada clínica ao que é dela — não filtramos por
   clinica_id à mão exceto onde a tabela tem a coluna.

   Relações (src/schema.sql):
     lote  (clinica_id)
       └── guia (lote_id)
             └── item (guia_id)
             └── recurso (guia_id)
   `guia` e `item` NÃO têm clinica_id — o vínculo é via lote.
   ============================================================ */
import { createClient } from '@/lib/supabase/server';

const num = (v) => Number(v ?? 0);

/* Datas do Postgres tipo `date` chegam como 'AAAA-MM-DD'. new Date() nessa
   string assume meia-noite UTC e, em fuso negativo (Brasil, UTC-3),
   toLocaleDateString devolve o dia anterior. Formata pelos componentes. */
function formatarData(valor) {
  if (!valor) return '—';
  const soData = String(valor).slice(0, 10);
  const [ano, mes, dia] = soData.split('-');
  if (!ano || !mes || !dia) return '—';
  return `${dia}/${mes}/${ano}`;
}

/* Para timestamptz (criado_em), o instante importa e o fuso local é o
   correto — aqui toLocaleDateString serve. */
function formatarDataHora(valor) {
  if (!valor) return '—';
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
}

/* Identifica o usuário logado e a clínica dele. */
export async function getContexto() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, clinicaId: null, clinica: null };

  const { data: usuario } = await supabase
    .from('usuario')
    .select('clinica_id')
    .eq('id', user.id)
    .single();

  if (!usuario?.clinica_id) return { supabase, user, clinicaId: null, clinica: null };

  const { data: clinica } = await supabase
    .from('clinica')
    .select(
      'id, nome, cnpj, plano, status_assinatura, logo_url, ' +
      'responsavel_nome, responsavel_conselho, responsavel_registro, responsavel_uf, cnes, codigo_prestador'
    )
    .eq('id', usuario.clinica_id)
    .single();

  return { supabase, user, clinicaId: usuario.clinica_id, clinica };
}

/* Lotes da clínica, mais recentes primeiro, com contagem de guias. */
export async function getLotes(supabase, clinicaId) {
  if (!clinicaId) return [];

  const { data: lotes } = await supabase
    .from('lote')
    .select('id, operadora, competencia, numero_demonstr, status, total_apresentado, total_pago, total_glosado, criado_em')
    .eq('clinica_id', clinicaId)
    .order('criado_em', { ascending: false });

  if (!lotes?.length) return [];

  // Uma consulta só para contar guias de todos os lotes
  const { data: guias } = await supabase
    .from('guia')
    .select('id, lote_id')
    .in('lote_id', lotes.map((l) => l.id));

  const porLote = new Map();
  for (const g of guias ?? []) {
    porLote.set(g.lote_id, (porLote.get(g.lote_id) ?? 0) + 1);
  }

  return lotes.map((l) => ({
    id: l.id,
    arquivo: l.numero_demonstr || `Lote ${l.id.slice(0, 8)}`,
    operadora: l.operadora || '—',
    competencia: l.competencia || '—',
    data: formatarDataHora(l.criado_em),
    guias: porLote.get(l.id) ?? 0,
    apresentado: num(l.total_apresentado),
    pago: num(l.total_pago),
    recuperavel: num(l.total_glosado),
    status: l.status === 'ok' ? 'processado' : l.status === 'erro' ? 'erro' : 'processando',
  }));
}

/* Guias da clínica com os valores agregados que o parser já gravou. */
export async function getGuias(supabase, clinicaId) {
  if (!clinicaId) return [];

  const { data: lotes } = await supabase
    .from('lote')
    .select('id, operadora')
    .eq('clinica_id', clinicaId);

  if (!lotes?.length) return [];

  const operadoraPorLote = new Map(lotes.map((l) => [l.id, l.operadora]));

  const { data: guias } = await supabase
    .from('guia')
    .select('id, lote_id, numero_guia, beneficiario, carteira, data_atendimento, valor_apresentado, valor_pago, valor_glosado')
    .in('lote_id', lotes.map((l) => l.id))
    .order('data_atendimento', { ascending: false });

  return (guias ?? []).map((g) => ({
    id: g.id,
    numero: g.numero_guia,
    paciente: g.beneficiario || '—',
    carteira: g.carteira || '',
    operadora: operadoraPorLote.get(g.lote_id) || '—',
    data: formatarData(g.data_atendimento),
    apresentado: num(g.valor_apresentado),
    pago: num(g.valor_pago),
    glosado: num(g.valor_glosado),
  }));
}

/* Itens glosados — a lista que o cliente usa para decidir o que contestar. */
export async function getGlosas(supabase, clinicaId) {
  if (!clinicaId) return [];

  const { data: lotes } = await supabase
    .from('lote')
    .select('id, operadora')
    .eq('clinica_id', clinicaId);

  if (!lotes?.length) return [];

  const operadoraPorLote = new Map(lotes.map((l) => [l.id, l.operadora]));

  const { data: guias } = await supabase
    .from('guia')
    .select('id, lote_id, numero_guia, beneficiario, data_atendimento')
    .in('lote_id', lotes.map((l) => l.id));

  if (!guias?.length) return [];

  const guiaPorId = new Map(guias.map((g) => [g.id, g]));

  const { data: itens } = await supabase
    .from('item')
    .select('id, guia_id, codigo_tuss, descricao, valor_apresentado, valor_pago, valor_glosado, codigo_glosa, motivo_glosa, recorrivel')
    .in('guia_id', guias.map((g) => g.id))
    .gt('valor_glosado', 0);

  const { data: recursos } = await supabase
    .from('recurso')
    .select('guia_id, status')
    .in('guia_id', guias.map((g) => g.id));

  /* salvarLote() já cria um recurso 'rascunho' para toda guia com item
     recorrível. Rascunho é documento gerado, não contestação entregue —
     a glosa continua acionável. Só conta como contestada a partir de
     'enviado'. */
  const guiasContestadas = new Set(
    (recursos ?? [])
      .filter((r) => r.status && r.status !== 'rascunho')
      .map((r) => r.guia_id)
  );

  return (itens ?? [])
    .map((i) => {
      const g = guiaPorId.get(i.guia_id);
      const contestada = guiasContestadas.has(i.guia_id);
      const prazo = prazoRestante(g?.data_atendimento);
      const recorrivelPorMotivo = i.recorrivel !== false;
      // Vencido só conta como perdido quando temos data para afirmar isso.
      const prazoVencido = prazo != null && prazo <= 0;
      const recorrivel = recorrivelPorMotivo && !prazoVencido;

      return {
        id: i.id,
        guiaId: i.guia_id,
        guia: g?.numero_guia ?? '—',
        paciente: g?.beneficiario ?? '—',
        operadora: operadoraPorLote.get(g?.lote_id) || '—',
        procedimento: i.descricao || i.codigo_tuss || '—',
        codigoGlosa: i.codigo_glosa || '—',
        motivo: i.motivo_glosa || 'Motivo não informado',
        valor: num(i.valor_glosado),
        recorrivel,
        prazo,
        // Rótulos do vocabulário fixo em Primitives.jsx (STATUS)
        status: contestada ? 'enviado' : recorrivel ? 'recorrivel' : 'perdido',
      };
    })
    .sort((a, b) => b.valor - a.valor);
}

/* Recursos já gerados. */
export async function getRecursos(supabase, clinicaId) {
  if (!clinicaId) return [];

  const { data: lotes } = await supabase
    .from('lote')
    .select('id, operadora')
    .eq('clinica_id', clinicaId);

  if (!lotes?.length) return [];

  const operadoraPorLote = new Map(lotes.map((l) => [l.id, l.operadora]));

  const { data: guias } = await supabase
    .from('guia')
    .select('id, lote_id, numero_guia')
    .in('lote_id', lotes.map((l) => l.id));

  if (!guias?.length) return [];

  const guiaPorId = new Map(guias.map((g) => [g.id, g]));

  const { data: recursos } = await supabase
    .from('recurso')
    .select('id, guia_id, valor_pleiteado, status, criado_em')
    .in('guia_id', guias.map((g) => g.id))
    .order('criado_em', { ascending: false });

  return (recursos ?? []).map((r) => {
    const g = guiaPorId.get(r.guia_id);
    return {
      id: r.id,
      guia: g?.numero_guia ?? '—',
      operadora: operadoraPorLote.get(g?.lote_id) || '—',
      gerado: formatarDataHora(r.criado_em),
      valor: num(r.valor_pleiteado),
      status: r.status,
    };
  });
}

/* Marca onde o texto do recurso deixa de ser cabeçalho e passa a ser o
   trabalho de verdade — a fundamentação item a item. É por aí que o
   plano gratuito é cortado. */
const CORTE_PREVIA = 'pelos fundamentos a seguir:';

/* Um recurso específico, com o texto gerado.

   O corte do plano gratuito acontece AQUI, no servidor: o texto completo
   nunca chega ao navegador de quem não assinou. Borrar com CSS não é
   paywall — o conteúdo estaria no HTML para quem abrisse o inspetor. */
export async function getRecurso(supabase, clinicaId, recursoId, { planoPago }) {
  if (!clinicaId || !recursoId) return null;

  const { data: recurso } = await supabase
    .from('recurso')
    .select('id, guia_id, texto_gerado, valor_pleiteado, status, criado_em')
    .eq('id', recursoId)
    .maybeSingle();

  // RLS já impede ver recurso de outra clínica; sem linha, não existe.
  if (!recurso) return null;

  const { data: guia } = await supabase
    .from('guia')
    .select('id, lote_id, numero_guia, beneficiario, carteira, data_atendimento')
    .eq('id', recurso.guia_id)
    .maybeSingle();

  const { data: lote } = guia
    ? await supabase
        .from('lote')
        .select('operadora, competencia, numero_demonstr')
        .eq('id', guia.lote_id)
        .maybeSingle()
    : { data: null };

  const textoCompleto = recurso.texto_gerado ?? '';
  const corte = textoCompleto.indexOf(CORTE_PREVIA);

  const texto = planoPago
    ? textoCompleto
    : corte > -1
      ? textoCompleto.slice(0, corte + CORTE_PREVIA.length)
      : textoCompleto.split('\n').slice(0, 12).join('\n');

  return {
    id: recurso.id,
    guia: guia?.numero_guia ?? '—',
    paciente: guia?.beneficiario ?? '—',
    carteira: guia?.carteira ?? '',
    dataAtendimento: formatarData(guia?.data_atendimento),
    operadora: lote?.operadora ?? '—',
    competencia: lote?.competencia ?? '—',
    demonstrativo: lote?.numero_demonstr ?? '—',
    valor: num(recurso.valor_pleiteado),
    status: recurso.status,
    gerado: formatarDataHora(recurso.criado_em),
    texto,
    completo: planoPago,
    /* Quanto ficou de fora, para a tela dizer o tamanho do que está
       trancado em vez de só mostrar um cadeado. */
    linhasOcultas: planoPago
      ? 0
      : Math.max(0, textoCompleto.split('\n').length - texto.split('\n').length),
  };
}

/* Top motivos de glosa, direto da view do banco. */
export async function getMotivos(supabase, clinicaId, limite = 5) {
  if (!clinicaId) return [];

  const { data } = await supabase
    .from('v_glosa_por_motivo')
    .select('codigo_glosa, motivo_glosa, qtd_itens, total_glosado')
    .eq('clinica_id', clinicaId)
    .order('total_glosado', { ascending: false });

  // A view agrupa por lote também, então consolida por motivo aqui
  const consolidado = new Map();
  for (const linha of data ?? []) {
    const chave = linha.codigo_glosa || 'SEM_CODIGO';
    const atual = consolidado.get(chave) ?? {
      codigo: chave,
      motivo: linha.motivo_glosa || 'Motivo não informado',
      qtd: 0,
      total: 0,
    };
    atual.qtd += num(linha.qtd_itens);
    atual.total += num(linha.total_glosado);
    consolidado.set(chave, atual);
  }

  /* A view agrupa todo item, inclusive os que não tiveram glosa (código
     nulo, valor zero). Motivo com R$ 0 não é "maior motivo de glosa". */
  return [...consolidado.values()]
    .filter((m) => m.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, limite);
}

/* Somas por estágio, para o MoneyRail que aparece em todas as telas. */
export function calcularResumo({ lotes = [], glosas = [], recursos = [] }) {
  const apresentado = lotes.reduce((s, l) => s + l.apresentado, 0);
  const pago = lotes.reduce((s, l) => s + l.pago, 0);
  const glosado = lotes.reduce((s, l) => s + l.recuperavel, 0);
  const qtdGuias = lotes.reduce((s, l) => s + l.guias, 0);

  const recuperavel = glosas.filter((g) => g.recorrivel).reduce((s, g) => s + g.valor, 0);
  const perdido = glosas.filter((g) => !g.recorrivel).reduce((s, g) => s + g.valor, 0);

  /* "Em recurso" é todo recurso que ainda está em jogo — gerado mas não
     resolvido. Isso inclui 'rascunho' (documento pronto, ainda não
     enviado): é dinheiro que já saiu de "glosado" e está esperando ação,
     mesmo que a ação ainda seja nossa, não da operadora.

     Antes este estágio só contava status === 'enviado' — e nenhum lugar
     do app jamais escreve esse valor (salvarLote() cria tudo como
     'rascunho' e não existe UI para avançar o status). Resultado: o card
     ficava zerado sempre, para toda clínica, enquanto a tabela de
     recursos mostrava os documentos reais. Só sai daqui quando chega a
     um resultado final — 'ganho' ou 'perdido'. */
  const finalizados = new Set(['ganho', 'perdido']);
  const emJogo = recursos.filter((r) => !finalizados.has(r.status));
  const emRecurso = emJogo.reduce((s, r) => s + r.valor, 0);
  const recuperado = recursos
    .filter((r) => r.status === 'ganho')
    .reduce((s, r) => s + r.valor, 0);

  const guiasComGlosa = new Set(glosas.map((g) => g.guiaId)).size;

  return {
    apresentado,
    pago,
    glosado,
    recuperavel,
    perdido,
    emRecurso,
    recuperado,
    qtdGuias,
    qtdGlosas: glosas.length,
    qtdRecursos: recursos.length,
    // O MoneyRail rotula `qtd` como "guias" — então aqui vai contagem de
    // guias, não de itens.
    estagios: {
      apresentado: { valor: apresentado, qtd: qtdGuias },
      recebido: { valor: pago },
      glosado: { valor: glosado, qtd: guiasComGlosa },
      recurso: { valor: emRecurso, qtd: emJogo.length },
      recuperado: { valor: recuperado },
    },
  };
}

/* Agrupa o glosado por operadora, do maior para o menor. */
export function agruparPorOperadora(lotes) {
  const mapa = new Map();
  for (const l of lotes) {
    const atual = mapa.get(l.operadora) ?? { operadora: l.operadora, glosado: 0, apresentado: 0, lotes: 0 };
    atual.glosado += l.recuperavel;
    atual.apresentado += l.apresentado;
    atual.lotes += 1;
    mapa.set(l.operadora, atual);
  }
  return [...mapa.values()].sort((a, b) => b.glosado - a.glosado);
}

/* Série mensal por competência do demonstrativo. Só faz sentido a partir
   do segundo mês — a tela decide se desenha. */
export function agruparPorCompetencia(lotes) {
  const mapa = new Map();
  for (const l of lotes) {
    const chave = l.competencia && l.competencia !== '—' ? l.competencia : null;
    if (!chave) continue;
    const atual = mapa.get(chave) ?? { competencia: chave, apresentado: 0, pago: 0, glosado: 0 };
    atual.apresentado += l.apresentado;
    atual.pago += l.pago;
    atual.glosado += l.recuperavel;
    mapa.set(chave, atual);
  }
  return [...mapa.values()].sort((a, b) => a.competencia.localeCompare(b.competencia));
}

/* Dias restantes para recorrer. Regra usual das operadoras: 90 dias
   a partir do atendimento. Sem data, não inventa prazo. */
function prazoRestante(dataAtendimento) {
  if (!dataAtendimento) return null;
  const [ano, mes, dia] = String(dataAtendimento).slice(0, 10).split('-').map(Number);
  if (!ano || !mes || !dia) return null;

  // Compara meio-dia contra meio-dia, em UTC, para o resultado não variar
  // com o fuso de quem está olhando nem com horário de verão.
  const limite = Date.UTC(ano, mes - 1, dia + 90, 12);
  const hoje = new Date();
  const agora = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate(), 12);

  return Math.round((limite - agora) / 86400000);
}
