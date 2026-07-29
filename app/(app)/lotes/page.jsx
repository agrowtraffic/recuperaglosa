/* ============================================================
   LOTES  →  app/(app)/lotes/page.jsx
   Tela de upload + histórico. É o começo de todo fluxo.
   ============================================================ */
import { PageHeader, EmptyState, StatusBadge, Money } from "@/app/_components/kit/Primitives";
import { DataList } from "@/app/_components/kit/Data";
import { UploadCloud } from "lucide-react";
import { getContexto, getLotes } from "@/lib/dados-clinica";
import UploadZone from "./UploadZone";

export const dynamic = "force-dynamic";

export default async function Lotes() {
  const { supabase, clinicaId, clinica } = await getContexto();
  const lotes = await getLotes(supabase, clinicaId);

  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const lotesDoMes = lotes.filter((l) => {
    const [dia, mes, ano] = l.data.split("/");
    return new Date(`${ano}-${mes}-${dia}`) >= inicioMes;
  }).length;

  const isGratuito = clinica?.plano !== "ativo";
  const analisesRestantes = Math.max(0, 3 - lotesDoMes);

  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Lotes" titulo="O começo de toda recuperação"
        descricao="Cada XML da operadora vira uma leitura clara do que foi pago, glosado e recuperável." />

      <UploadZone isGratuito={isGratuito} analisesRestantes={analisesRestantes} />

      <section className="rg-card">
        <div className="rg-card-head">
          <h2 className="rg-h2">Histórico</h2>
          {lotes.length > 0 && (
            <span className="rg-caption">{lotes.length} {lotes.length === 1 ? "lote" : "lotes"}</span>
          )}
        </div>
        <DataList
          colunas={[
            { chave: "arquivo", titulo: "Demonstrativo" },
            { chave: "operadora", titulo: "Operadora" },
            { chave: "data", titulo: "Enviado em" },
            { chave: "guias", titulo: "Guias", alinhar: "right" },
            { chave: "recuperavel", titulo: "Glosado", alinhar: "right", render: (l) => <Money valor={l.recuperavel} tam="sm" cor="var(--rg-glosado)" /> },
            { chave: "status", titulo: "Status", render: (l) => <StatusBadge status={l.status} /> },
          ]}
          mobile={{
            titulo: (l) => l.arquivo,
            sub: (l) => `${l.operadora} · ${l.data}`,
            status: (l) => l.status,
            meta: [
              { rotulo: "Guias", valor: (l) => l.guias },
              { rotulo: "Glosado", valor: (l) => <Money valor={l.recuperavel} tam="sm" /> },
            ],
          }}
          linhas={lotes}
          vazio={<EmptyState icone={UploadCloud} titulo="Nenhum lote enviado"
            texto="Assim que você enviar o primeiro XML, ele aparece aqui com o resultado da auditoria." />}
        />
      </section>
    </main>
  );
}
