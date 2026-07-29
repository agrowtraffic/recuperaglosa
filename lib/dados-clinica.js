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
    .select('id, nome, cnpj, plano, status_assinatura')
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
    data: l.criado_em ? new Date(l.criado_em).toLocaleDateString('pt-BR') : '—',
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
    data: g.data_atendimento ? new Date(g.data_atendimento).toLocaleDateString('pt-BR') : '—',
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
      gerado: r.criado_em ? new Date(r.criado_em).toLocaleDateString('pt-BR') : '—',
      valor: num(r.valor_pleiteado),
      status: r.status,
    };
  });
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

  return [...consolidado.values()]
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

  /* 'rascunho' é recurso gerado mas não entregue à operadora — ainda não
     é dinheiro em disputa. Só entra no estágio "em recurso" a partir de
     'enviado'. */
  const enviados = recursos.filter((r) => r.status === 'enviado');
  const emRecurso = enviados.reduce((s, r) => s + r.valor, 0);
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
      recurso: { valor: emRecurso, qtd: enviados.length },
      recuperado: { valor: recuperado },
    },
  };
}

/* Dias restantes para recorrer. Regra usual das operadoras: 90 dias
   a partir do atendimento. Sem data, não inventa prazo. */
function prazoRestante(dataAtendimento) {
  if (!dataAtendimento) return null;
  const base = new Date(dataAtendimento);
  if (Number.isNaN(base.getTime())) return null;
  const limite = new Date(base);
  limite.setDate(limite.getDate() + 90);
  const dias = Math.ceil((limite - new Date()) / 86400000);
  return dias;
}
