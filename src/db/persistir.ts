import { supabase as defaultSupabase } from "./client";
import type { LoteParsed } from "../tiss/parser";
import type { SupabaseClient } from "@supabase/supabase-js";
import { gerarRecurso } from "../tiss/recurso";

/**
 * Persiste um demonstrativo já parseado: lote -> guias -> itens,
 * e gera+salva o recurso de cada guia que tiver item recorrível.
 *
 * ⚠️ IMPORTANTE: Se `supabaseClient` não for fornecido, usa service_role (scripts de teste).
 * Para upload de usuário real, DEVE passar o cliente autenticado do usuário para respeitar RLS.
 *
 * Idempotência simples: não existe ainda deduplicação por
 * numeroDemonstrativo. Isso é aceitável no Dia 4 (single-tenant de teste);
 * antes de v1 pública, adicionar unique constraint em
 * (clinica_id, operadora, numeroDemonstrativo) e checar antes de inserir.
 */
export async function salvarLote(
  clinicaId: string,
  arquivoUrl: string | null,
  lote: LoteParsed,
  clinica: { nome: string; cnpj?: string },
  supabaseClient?: SupabaseClient,
) {
  const supabase = supabaseClient || defaultSupabase;

  const { data: loteRow, error: erroLote } = await supabase
    .from("lote")
    .insert({
      clinica_id: clinicaId,
      operadora: lote.operadora ?? null,
      registro_ans: lote.registroAns ?? null,
      competencia: lote.competencia ?? null,
      numero_demonstr: lote.numeroDemonstrativo ?? null,
      arquivo_url: arquivoUrl,
      status: lote.guias.length > 0 ? "ok" : "erro",
      erro_msg: lote.avisos.join(" | ") || null,
      total_apresentado: lote.totalApresentado,
      total_pago: lote.totalPago,
      total_glosado: lote.totalGlosado,
    })
    .select("id")
    .single();

  if (erroLote) throw erroLote;
  const loteId = loteRow.id as string;

  for (const g of lote.guias) {
    const { data: guiaRow, error: erroGuia } = await supabase
      .from("guia")
      .insert({
        lote_id: loteId,
        numero_guia: g.numeroGuia,
        numero_guia_oper: g.numeroGuiaOperadora ?? null,
        beneficiario: g.beneficiario ?? null,
        carteira: g.carteira ?? null,
        data_atendimento: g.dataAtendimento ?? null,
        valor_apresentado: g.valorApresentado,
        valor_pago: g.valorPago,
        valor_glosado: g.valorGlosado,
      })
      .select("id")
      .single();

    if (erroGuia) throw erroGuia;
    const guiaId = guiaRow.id as string;

    if (g.itens.length > 0) {
      const { error: erroItens } = await supabase.from("item").insert(
        g.itens.map((i) => ({
          guia_id: guiaId,
          codigo_tuss: i.codigoTuss ?? null,
          descricao: i.descricao ?? null,
          quantidade: i.quantidade,
          valor_apresentado: i.valorApresentado,
          valor_pago: i.valorPago,
          valor_glosado: i.valorGlosado,
          codigo_glosa: i.codigoGlosa ?? null,
          motivo_glosa: i.motivoGlosa,
          recorrivel: i.recorrivel,
        })),
      );
      if (erroItens) throw erroItens;
    }

    const rec = gerarRecurso(g, lote, clinica);
    if (rec) {
      const { error: erroRecurso } = await supabase.from("recurso").insert({
        guia_id: guiaId,
        texto_gerado: rec.texto,
        valor_pleiteado: rec.valorPleiteado,
        status: "rascunho",
      });
      if (erroRecurso) throw erroRecurso;
    }
  }

  return { loteId, guias: lote.guias.length };
}

/** Busca o resumo de glosa por motivo direto da view do banco (v_glosa_por_motivo). */
export async function resumoGlosaPorMotivo(clinicaId: string, loteId: string) {
  const { data, error } = await defaultSupabase
    .from("v_glosa_por_motivo")
    .select("*")
    .eq("clinica_id", clinicaId)
    .eq("lote_id", loteId)
    .order("total_glosado", { ascending: false });

  if (error) throw error;
  return data;
}
