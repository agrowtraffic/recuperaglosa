/* ============================================================
   RELATÓRIOS  →  app/(app)/relatorios/page.jsx
   Aba de retenção: é o que prova o ROI todo mês.
   Regra dura: gráfico com dataset vazio não é desenhado.
   ============================================================ */
import { PageHeader, EmptyState, Money } from "@/app/_components/kit/Primitives";
import { MoneyRail } from "@/app/_components/kit/Signature";
import { StatCard, RecoveryBar, RankRow } from "@/app/_components/kit/Data";
import { BarChart3 } from "lucide-react";
import {
  getContexto, getLotes, getGlosas, getRecursos, calcularResumo,
  agruparPorOperadora, agruparPorCompetencia,
} from "@/lib/dados-clinica";

export const metadata = { title: 'Relatórios' };

export const dynamic = "force-dynamic";

export default async function Relatorios() {
  const { supabase, clinicaId } = await getContexto();

  const [lotes, glosas, recursos] = await Promise.all([
    getLotes(supabase, clinicaId),
    getGlosas(supabase, clinicaId),
    getRecursos(supabase, clinicaId),
  ]);

  const resumo = calcularResumo({ lotes, glosas, recursos });
  const porOperadora = agruparPorOperadora(lotes);
  const porCompetencia = agruparPorCompetencia(lotes);

  const temDados = lotes.length > 0;
  /* Evolução só faz sentido com mais de uma competência. */
  const temHistorico = porCompetencia.length > 1;

  /* Taxa de reversão só entre recursos já decididos. Sem decisão, não
     existe taxa — mostrar 0% seria mentir sobre desempenho. */
  const decididos = recursos.filter((r) => r.status === "ganho" || r.status === "perdido");
  const ganhos = recursos.filter((r) => r.status === "ganho");
  const taxaReversao = decididos.length
    ? Math.round((ganhos.length / decididos.length) * 100)
    : null;

  const maiorGlosado = porOperadora[0]?.glosado || 1;

  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Relatórios" titulo="O retorno que você consegue provar"
        descricao="Acompanhe o que voltou para o caixa e onde ainda existe oportunidade."
        acoes={<button className="rg-btn rg-btn-secondary" disabled title="Em breve">Exportar PDF</button>} />

      <MoneyRail atual="recuperado" estagios={resumo.estagios} />

      {!temDados ? (
        <div className="rg-card">
          <EmptyState icone={BarChart3} titulo="Ainda sem histórico"
            texto="Envie o primeiro demonstrativo para começar a acompanhar o retorno." />
        </div>
      ) : (
        <>
          <div className="rg-grid-kpi">
            <StatCard destaque rotulo="Recuperado" valor={resumo.recuperado} variacao={null}
              ajuda="Recursos aceitos pela operadora" />
            <StatCard rotulo="Ainda recuperável" valor={resumo.recuperavel}
              ajuda="Dentro do prazo de recurso" />
            <StatCard rotulo="Perdido por prazo" valor={resumo.perdido}
              ajuda="Sem recurso possível" />
            <StatCard
              rotulo="Taxa de reversão"
              valor={taxaReversao ?? 0}
              tipo="numero"
              ajuda={taxaReversao == null ? "sem recursos decididos ainda" : "% dos recursos aceitos"}
            />
          </div>

          <div className="rg-grid-2">
            <section className="rg-card">
              <div className="rg-card-head">
                <h2 className="rg-h2">Divisão do faturamento</h2>
                <span className="rg-caption">{lotes.length} {lotes.length === 1 ? "lote" : "lotes"}</span>
              </div>
              <div className="rg-card-pad rg-stack">
                <RecoveryBar pago={resumo.pago} recuperavel={resumo.recuperavel} perdido={resumo.perdido} legenda />
                <div className="rg-grid-half">
                  <div><p className="rg-eyebrow">Apresentado</p><Money valor={resumo.apresentado} tam="lg" /></div>
                  <div><p className="rg-eyebrow">Recebido</p><Money valor={resumo.pago} tam="lg" cor="var(--rg-recuperado-h)" /></div>
                </div>
              </div>
            </section>

            <section className="rg-card">
              <div className="rg-card-head"><h2 className="rg-h2">Por operadora</h2></div>
              <div className="rg-card-pad rg-stack">
                {porOperadora.map((o) => (
                  <RankRow key={o.operadora} nome={o.operadora} valor={o.glosado}
                    max={maiorGlosado} qtd={o.lotes} />
                ))}
              </div>
            </section>
          </div>

          <section className="rg-card">
            <div className="rg-card-head"><h2 className="rg-h2">Evolução por competência</h2></div>
            {temHistorico ? (
              <div className="rg-card-pad rg-stack">
                {porCompetencia.map((c) => (
                  <RankRow key={c.competencia} nome={c.competencia} valor={c.glosado}
                    max={Math.max(...porCompetencia.map((x) => x.glosado)) || 1} />
                ))}
              </div>
            ) : (
              <EmptyState icone={BarChart3} titulo="Ainda sem histórico"
                texto="Depois do segundo demonstrativo, aparece aqui a evolução mês a mês." />
            )}
          </section>
        </>
      )}
    </main>
  );
}
