/* ============================================================
   GUIAS  →  app/(app)/guias/page.jsx
   Tabela densa. No celular a tabela vira cartão e os filtros
   viram trilho rolável.
   ============================================================ */
import { PageHeader } from "@/app/_components/kit/Primitives";
import { MoneyRail } from "@/app/_components/kit/Signature";
import { getContexto, getLotes, getGlosas, getRecursos, getGuias, calcularResumo } from "@/lib/dados-clinica";
import GuiasTabela from "./GuiasTabela";

export const dynamic = "force-dynamic";

export default async function Guias() {
  const { supabase, clinicaId } = await getContexto();

  const [lotes, guias, glosas, recursos] = await Promise.all([
    getLotes(supabase, clinicaId),
    getGuias(supabase, clinicaId),
    getGlosas(supabase, clinicaId),
    getRecursos(supabase, clinicaId),
  ]);

  const resumo = calcularResumo({ lotes, glosas, recursos });

  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Guias" titulo="Cada guia, sem ponto cego"
        descricao="Do apresentado ao glosado, veja exatamente para onde foi cada valor." />

      <MoneyRail atual="recebido" estagios={resumo.estagios} />

      <GuiasTabela guias={guias} />
    </main>
  );
}
