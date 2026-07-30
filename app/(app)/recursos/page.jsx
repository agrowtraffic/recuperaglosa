/* ============================================================
   RECURSOS  →  app/(app)/recursos/page.jsx
   Onde mora o valor pago. O bloqueio do freemium acontece aqui —
   e ele mostra o que a pessoa ganha, não uma parede.
   ============================================================ */
import { PageHeader, EmptyState, Money, StatusBadge } from "@/app/_components/kit/Primitives";
import { MoneyRail } from "@/app/_components/kit/Signature";
import { DataList } from "@/app/_components/kit/Data";
import { FileCheck2, Lock } from "lucide-react";
import { getContexto, getLotes, getGlosas, getRecursos, calcularResumo } from "@/lib/dados-clinica";
import { ehPago, PRECO_MENSAL } from "@/lib/plano";
import BotaoAssinar from "@/app/_components/kit/BotaoAssinar";

export const metadata = { title: 'Recursos' };

export const dynamic = "force-dynamic";

const ROTULO_STATUS = {
  rascunho: "rascunho",
  enviado: "enviado",
  ganho: "recuperado",
  perdido: "recusado",
};

export default async function Recursos() {
  const { supabase, clinicaId, clinica } = await getContexto();

  const [lotes, glosas, recursos] = await Promise.all([
    getLotes(supabase, clinicaId),
    getGlosas(supabase, clinicaId),
    getRecursos(supabase, clinicaId),
  ]);

  const resumo = calcularResumo({ lotes, glosas, recursos });
  const assinante = ehPago(clinica);

  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Recursos" titulo="Contestações prontas para avançar"
        descricao="Documentos claros, revisáveis e organizados pelo valor que pode voltar." />

      <MoneyRail atual="recurso" estagios={resumo.estagios} />

      {!assinante && resumo.recuperavel > 0 && (
        /* Bloqueio honesto: mostra o valor real que está travado */
        <section className="rg-card rg-card-pad rg-stack-sm"
          style={{ borderColor: "var(--rg-recuperado)", background: "var(--rg-recuperado-bg)" }}>
          <div className="rg-row" style={{ gap: 10 }}>
            <Lock size={18} color="var(--rg-recuperado-h)" />
            <h2 className="rg-h2">
              Você tem <Money valor={resumo.recuperavel} tam="md" cor="var(--rg-recuperado-h)" /> pronto para contestar
            </h2>
          </div>
          <p className="rg-sub">A auditoria é livre. A geração dos recursos entra no plano de R$ {PRECO_MENSAL}/mês, sem fidelidade.</p>
          <div className="rg-row rg-row-wrap" style={{ marginTop: 8 }}>
            <BotaoAssinar />
          </div>
        </section>
      )}

      <section className="rg-card">
        <div className="rg-card-head">
          <h2 className="rg-h2">Documentos gerados</h2>
          {recursos.length > 0 && (
            <span className="rg-caption">{recursos.length} {recursos.length === 1 ? "recurso" : "recursos"}</span>
          )}
        </div>
        <DataList
          colunas={[
            { chave: "guia", titulo: "Guia" },
            { chave: "operadora", titulo: "Operadora" },
            { chave: "gerado", titulo: "Gerado em" },
            { chave: "valor", titulo: "Valor contestado", alinhar: "right", render: (l) => <Money valor={l.valor} tam="sm" /> },
            { chave: "status", titulo: "Status", render: (l) => <StatusBadge status={ROTULO_STATUS[l.status] || "analise"} /> },
            {
              chave: "acao", titulo: "", alinhar: "right",
              render: (l) => (
                <a href={`/recursos/${l.id}`} className="rg-btn rg-btn-secondary rg-btn-sm">
                  {assinante ? "Abrir" : "Ver prévia"}
                </a>
              ),
            },
          ]}
          mobile={{
            titulo: (l) => `Guia ${l.guia}`,
            sub: (l) => `${l.operadora} · ${l.gerado}`,
            status: (l) => ROTULO_STATUS[l.status] || "analise",
            meta: [{ rotulo: "Contestado", valor: (l) => <Money valor={l.valor} tam="sm" /> }],
            acao: (l) => (
              <a href={`/recursos/${l.id}`} className="rg-btn rg-btn-secondary rg-btn-sm">
                {assinante ? "Abrir recurso" : "Ver prévia"}
              </a>
            ),
          }}
          linhas={recursos}
          vazio={<EmptyState icone={FileCheck2} titulo="Nenhum recurso gerado"
            texto="Escolha uma glosa recorrível e gere o documento em um clique."
            acao={<a href="/glosas" className="rg-btn rg-btn-primary">Ver glosas recorríveis</a>} />}
        />
      </section>
    </main>
  );
}
