/* ============================================================
   RECURSO  →  app/(app)/recursos/[id]/page.jsx
   O documento em si. É o que o cliente paga para ter.

   O corte do plano gratuito é feito em getRecurso(), no servidor:
   o texto completo não é enviado para quem não assinou.
   ============================================================ */
import { notFound } from "next/navigation";
import { PageHeader, Money, StatusBadge } from "@/app/_components/kit/Primitives";
import { Lock, ArrowLeft } from "lucide-react";
import { getContexto, getRecurso } from "@/lib/dados-clinica";
import { ehPago, PLANO_PAGO } from "@/lib/plano";
import BotaoAssinar from "@/app/_components/kit/BotaoAssinar";
import AcoesRecurso from "./AcoesRecurso";

export const metadata = { title: 'Recurso' };

export const dynamic = "force-dynamic";

const ROTULO_STATUS = {
  rascunho: "analise",
  enviado: "enviado",
  ganho: "recuperado",
  perdido: "perdido",
};

export default async function RecursoDetalhe({ params }) {
  const { supabase, clinicaId, clinica } = await getContexto();
  const planoPago = ehPago(clinica);

  const recurso = await getRecurso(supabase, clinicaId, params.id, { planoPago });

  if (!recurso) notFound();

  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader
        eyebrow={`Recurso · guia ${recurso.guia}`}
        titulo={recurso.operadora}
        descricao={`${recurso.paciente} · atendimento em ${recurso.dataAtendimento} · gerado em ${recurso.gerado}`}
        acoes={
          <a href="/recursos" className="rg-btn rg-btn-ghost rg-btn-sm">
            <ArrowLeft size={16} /> Todos os recursos
          </a>
        }
      />

      {/* Cabeçalho de valores */}
      <section className="rg-card rg-card-pad">
        <div className="rg-grid-half">
          <div>
            <p className="rg-eyebrow">Valor pleiteado</p>
            <Money valor={recurso.valor} tam="lg" cor="var(--rg-glosado)" />
          </div>
          <div>
            <p className="rg-eyebrow">Situação</p>
            <StatusBadge status={ROTULO_STATUS[recurso.status] || "analise"} />
            <p className="rg-caption" style={{ marginTop: 6 }}>
              Demonstrativo {recurso.demonstrativo} · competência {recurso.competencia}
            </p>
          </div>
        </div>
      </section>

      {/* O documento */}
      <section className="rg-card">
        <div className="rg-card-head">
          <h2 className="rg-h2">Documento</h2>
          <AcoesRecurso
            recursoId={recurso.id}
            guia={recurso.guia}
            texto={recurso.texto}
            liberado={recurso.completo}
          />
        </div>

        <div className="rg-card-pad">
          <pre
            style={{
              margin: 0,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              fontFamily: "ui-monospace, 'SF Mono', Consolas, monospace",
              fontSize: 13.5,
              lineHeight: 1.65,
              color: "var(--rg-ink-800)",
            }}
          >
            {recurso.texto}
          </pre>

          {!recurso.completo && (
            <div
              style={{
                marginTop: 20,
                padding: "22px 20px",
                borderRadius: 14,
                border: "1px solid var(--rg-recuperado)",
                background: "var(--rg-recuperado-bg)",
              }}
            >
              <div className="rg-row" style={{ gap: 10, marginBottom: 8 }}>
                <Lock size={18} color="var(--rg-recuperado-h)" />
                <h3 className="rg-h2" style={{ margin: 0 }}>
                  A fundamentação está no plano {PLANO_PAGO}
                </h3>
              </div>
              <p className="rg-sub" style={{ margin: "0 0 4px" }}>
                Faltam {recurso.linhasOcultas} linhas: a contestação item a item, o
                argumento técnico de cada motivo de glosa e o valor total pleiteado —
                a parte que a operadora lê.
              </p>
              <p className="rg-sub" style={{ margin: "0 0 14px" }}>
                Este recurso sozinho pleiteia{" "}
                <strong>
                  <Money valor={recurso.valor} tam="sm" cor="var(--rg-recuperado-h)" />
                </strong>
                .
              </p>
              <BotaoAssinar />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
