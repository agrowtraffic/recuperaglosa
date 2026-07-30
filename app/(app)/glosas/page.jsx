/* ============================================================
   GLOSAS  →  app/(app)/glosas/page.jsx
   O coração comercial: é onde o cliente decide "vou brigar por essa".
   Ordenação padrão: maior valor primeiro (getGlosas já ordena).
   ============================================================ */
import { PageHeader, Money } from "@/app/_components/kit/Primitives";
import { MoneyRail } from "@/app/_components/kit/Signature";
import { getContexto, getLotes, getGlosas, getRecursos, calcularResumo } from "@/lib/dados-clinica";
import GlosasTabela from "./GlosasTabela";

export const metadata = { title: 'Glosas' };

export const dynamic = "force-dynamic";

export default async function Glosas() {
  const { supabase, clinicaId } = await getContexto();

  const [lotes, glosas, recursos] = await Promise.all([
    getLotes(supabase, clinicaId),
    getGlosas(supabase, clinicaId),
    getRecursos(supabase, clinicaId),
  ]);

  const resumo = calcularResumo({ lotes, glosas, recursos });
  const urgentes = glosas.filter((g) => g.status === "recorrivel" && g.prazo != null && g.prazo <= 7);

  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Glosas" titulo="Dinheiro parado, ação clara"
        descricao="Priorize o que contestar pelo valor, pelo motivo e pelo prazo que ainda resta." />

      <MoneyRail atual="glosado" estagios={resumo.estagios} />

      {/* 3 números que orientam a decisão */}
      <div className="rg-grid-kpi" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        <div className="rg-card rg-card-pad">
          <p className="rg-eyebrow">Recuperável</p>
          <Money valor={resumo.recuperavel} tam="lg" cor="var(--rg-glosado-h)" />
          <p className="rg-caption">
            {glosas.filter((g) => g.status === "recorrivel").length} glosas recorríveis
          </p>
        </div>
        <div className="rg-card rg-card-pad">
          <p className="rg-eyebrow">Vence em 7 dias</p>
          <Money valor={urgentes.reduce((s, g) => s + g.valor, 0)} tam="lg" />
          <p className="rg-caption">{urgentes.length} glosas urgentes</p>
        </div>
        <div className="rg-card rg-card-pad">
          <p className="rg-eyebrow">Fora de prazo</p>
          <Money valor={resumo.perdido} tam="lg" />
          <p className="rg-caption">
            {glosas.filter((g) => g.status === "perdido").length} sem recurso possível
          </p>
        </div>
      </div>

      <GlosasTabela glosas={glosas} />
    </main>
  );
}
