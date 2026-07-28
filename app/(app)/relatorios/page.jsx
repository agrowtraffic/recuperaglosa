/* ============================================================
   RELATÓRIOS  →  app/(app)/relatorios/page.jsx
   Aba de retenção: é o que prova o ROI todo mês.
   Regra dura: gráfico com dataset vazio não é desenhado.
   ============================================================ */
import { PageHeader, EmptyState, Money } from "@/app/_components/kit/Primitives";
import { MoneyRail } from "@/app/_components/kit/Signature";
import { StatCard, RecoveryBar, RankRow } from "@/app/_components/kit/Data";
import { BarChart3 } from "lucide-react";

export default function Relatorios() {
  const temDados = false; /* ⬛ PREENCHER */

  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Relatórios" titulo="O retorno que você consegue provar"
        descricao="Acompanhe o que voltou para o caixa e onde ainda existe oportunidade."
        acoes={<>
          <button className="rg-btn rg-btn-secondary">Período</button>
          <button className="rg-btn rg-btn-secondary" disabled title="Em breve">Exportar PDF</button>
        </>} />


      {/* O fio do dinheiro — mesma peça em todas as telas de dado.
          ⬛ PREENCHER: somas por estágio. */}
      <MoneyRail atual="recuperado" estagios={{
        apresentado: { valor: 0, qtd: 0 },
        recebido:    { valor: 0 },
        glosado:     { valor: 0, qtd: 0 },
        recurso:     { valor: 0, qtd: 0 },
        recuperado:  { valor: 0 },
      }} />

      {!temDados ? (
        <div className="rg-card">
          <EmptyState icone={BarChart3} titulo="Ainda sem histórico"
            texto="Depois do segundo demonstrativo, aparece aqui a evolução mês a mês." />
        </div>
      ) : (
        <>
          <div className="rg-grid-kpi">
            <StatCard destaque rotulo="Recuperado no período" valor={0 /* ⬛ */} variacao={null} />
            <StatCard rotulo="Taxa de reversão" valor={0 /* ⬛ */} tipo="numero" ajuda="% dos recursos aceitos" />
            <StatCard rotulo="Tempo médio de resposta" valor={0 /* ⬛ */} tipo="numero" ajuda="dias" />
            <StatCard rotulo="Perdido por prazo" valor={0 /* ⬛ */} />
          </div>

          <div className="rg-grid-2">
            <section className="rg-card">
              <div className="rg-card-head"><h2 className="rg-h2">Evolução mensal</h2></div>
              <div className="rg-card-pad">
                {/* ⬛ PREENCHER: Recharts. Desktop 280px, celular 190px.
                    No celular: sem grade, sem eixo Y, no máximo 6 rótulos no eixo X. */}
              </div>
            </section>
            <section className="rg-card">
              <div className="rg-card-head"><h2 className="rg-h2">Por operadora</h2></div>
              <div className="rg-card-pad rg-stack">
                <RankRow nome="⬛" valor={0} max={1} qtd={0} />
              </div>
            </section>
          </div>
        </>
      )}
    </main>
  );
}
