import { readFileSync } from "node:fs";
import { supabase } from "./db/client";
import { parseDemonstrativo } from "./tiss/parser";
import { salvarLote, resumoGlosaPorMotivo } from "./db/persistir";

async function main() {
  // 1. clínica de teste (idempotente: reaproveita se já existir)
  const nomeClinica = "Clinica Exemplo Ltda";
  let { data: existente } = await supabase
    .from("clinica")
    .select("id")
    .eq("nome", nomeClinica)
    .maybeSingle();

  let clinicaId = existente?.id as string | undefined;
  if (!clinicaId) {
    const { data, error } = await supabase
      .from("clinica")
      .insert({ nome: nomeClinica, cnpj: "00.000.000/0001-00" })
      .select("id")
      .single();
    if (error) throw error;
    clinicaId = data.id;
    console.log("Clínica de teste criada:", clinicaId);
  } else {
    console.log("Clínica de teste já existia:", clinicaId);
  }

  // 2. parseia e persiste o fixture 1
  const xml = readFileSync("fixtures/demonstrativo-1.xml", "utf8");
  const lote = parseDemonstrativo(xml);

  const { loteId, guias } = await salvarLote(clinicaId!, null, lote, {
    nome: nomeClinica,
    cnpj: "00.000.000/0001-00",
  });
  console.log(`Lote salvo: ${loteId} (${guias} guias)`);

  // 3. confere direto do banco (prova que RLS/view funcionam)
  const resumo = await resumoGlosaPorMotivo(clinicaId!, loteId);
  console.log("\nResumo direto do banco (v_glosa_por_motivo):");
  console.table(resumo);
}

main().catch((e) => {
  console.error("ERRO:", e.message ?? e);
  process.exit(1);
});
