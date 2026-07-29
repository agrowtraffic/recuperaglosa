/* ============================================================
   VISÃO GERAL  →  app/(app)/page.jsx
   A tela responde, de cima pra baixo:
   1) quanto dá pra recuperar   2) onde está   3) o que fazer agora
   Sem dado = zero + estado vazio. Nunca inventar número.
   ============================================================ */
import { PageHeader, EmptyState, Money } from "@/app/_components/kit/Primitives";
import { MoneyRail } from "@/app/_components/kit/Signature";
import { StatCard, RecoveryBar, RankRow, DataList } from "@/app/_components/kit/Data";
import { Upload } from "lucide-react";
import {
  getContexto, getLotes, getGlosas, getRecursos, getMotivos, calcularResumo,
} from "@/lib/dados-clinica";

export const dynamic = "force-dynamic";

export default async function VisaoGeral() {
  const { supabase, clinicaId } = await getContexto();

  const [lotes, glosas, recursos, motivos] = await Promise.all([
    getLotes(supabase, clinicaId),
    getGlosas(supabase, clinicaId),
    getRecursos(supabase, clinicaId),
    getMotivos(supabase, clinicaId),
  ]);

  /* Sem nenhum lote → só o bloco de primeiro uso. */
  if (lotes.length === 0) {
    return (
      <main className="rg-shell-content rg-stack">
        <PageHeader eyebrow="Visão geral" titulo="Coloque o primeiro valor em movimento"
          descricao="Envie o XML da operadora e descubra o que entrou, o que parou e o que ainda pode voltar." />
        <div className="rg-card">
          <EmptyState icone={Upload}
            titulo="Nenhum demonstrativo enviado"
            texto="Aceita arquivo XML no padrão TISS."
            acao={<a href="/lotes" className="rg-btn rg-btn-primary rg-btn-lg">Enviar XML</a>} />
        </div>
      </main>
    );
  }

  const resumo = calcularResumo({ lotes, glosas, recursos });

  const recorriveis = glosas.filter((g) => g.status === "recorrivel");
  const prazos = recorriveis.map((g) => g.prazo).filter((p) => p != null && p > 0);
  const prazoMaisProximo = prazos.length ? Math.min(...prazos) : 0;
  const maiorMotivo = motivos[0]?.total ?? 1;

  /* Prioridade = maior valor entre as que ainda dá para recorrer. */
  const prioridade = recorriveis.slice(0, 5);

  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader
        eyebrow="Visão geral"
        titulo="O dinheiro da clínica, em movimento."
        descricao="Veja o que entrou, o que parou e onde agir primeiro."
        acoes={<a href="/lotes" className="rg-btn rg-btn-primary">Enviar XML</a>}
      />

      <MoneyRail atual="apresentado" estagios={resumo.estagios} />

      <div className="rg-grid-kpi">
        <StatCard destaque rotulo="Valor recuperável" valor={resumo.recuperavel}
          ajuda="Glosas ainda dentro do prazo de recurso" />
        <StatCard rotulo="Já recuperado" valor={resumo.recuperado} variacao={null} />
        <StatCard rotulo="Glosas abertas" valor={recorriveis.length} tipo="numero"
          ajuda="Aguardando recurso" />
        <StatCard rotulo="Prazo mais próximo" valor={prazoMaisProximo} tipo="numero"
          ajuda="dias para vencer" />
      </div>

      <div className="rg-grid-2">
        <section className="rg-card">
          <div className="rg-card-head">
            <h2 className="rg-h2">Para onde foi o faturamento</h2>
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
          <div className="rg-card-head"><h2 className="rg-h2">Maiores motivos de glosa</h2></div>
          <div className="rg-card-pad rg-stack">
            {motivos.length === 0
              ? <p className="rg-caption">Nenhuma glosa registrada ainda.</p>
              : motivos.map((m) => (
                  <RankRow key={m.codigo} nome={m.motivo} valor={m.total} max={maiorMotivo} qtd={m.qtd} />
                ))}
          </div>
        </section>
      </div>

      <section className="rg-card">
        <div className="rg-card-head">
          <h2 className="rg-h2">Prioridade da semana</h2>
          <a href="/glosas" className="rg-btn rg-btn-ghost rg-btn-sm">Ver todas</a>
        </div>
        <DataList
          colunas={[
            { chave: "guia", titulo: "Guia" },
            { chave: "operadora", titulo: "Operadora" },
            { chave: "motivo", titulo: "Motivo" },
            { chave: "prazo", titulo: "Prazo", render: (l) => <span className="rg-num">{l.prazo != null ? `${l.prazo} dias` : "—"}</span> },
            { chave: "valor", titulo: "Recuperável", alinhar: "right", render: (l) => <Money valor={l.valor} tam="sm" /> },
          ]}
          mobile={{
            titulo: (l) => `Guia ${l.guia}`,
            sub: (l) => l.operadora,
            status: (l) => (l.prazo != null && l.prazo <= 7 ? "perdido" : "recorrivel"),
            meta: [
              { rotulo: "Recuperável", valor: (l) => <Money valor={l.valor} tam="sm" /> },
              { rotulo: "Prazo", valor: (l) => (l.prazo != null ? `${l.prazo} dias` : "—") },
            ],
          }}
          linhas={prioridade}
          vazio={<EmptyState titulo="Nada pendente" texto="Todas as glosas do período já têm recurso gerado." />}
        />
      </section>
    </main>
  );
}
