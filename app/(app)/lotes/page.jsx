/* ============================================================
   LOTES  →  app/(app)/lotes/page.jsx
   Tela de upload + histórico. É o começo de todo fluxo.
   ============================================================ */
import { createClient } from "@/lib/supabase/server";
import { PageHeader, EmptyState, StatusBadge, Money } from "@/app/_components/kit/Primitives";
import { DataList } from "@/app/_components/kit/Data";
import { UploadCloud } from "lucide-react";
import UploadZone from "./UploadZone";

export const dynamic = "force-dynamic";

export default async function Lotes() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: usuario } = await supabase
    .from("usuario")
    .select("clinica_id")
    .eq("id", user.id)
    .single();

  const clinicaId = usuario?.clinica_id;

  const { data: clinica } = await supabase
    .from("clinica")
    .select("plano")
    .eq("id", clinicaId)
    .single();

  const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const { count: lotesDoMes } = await supabase
    .from("lote")
    .select("*", { count: "exact", head: true })
    .eq("clinica_id", clinicaId)
    .gte("criado_em", inicioMes);

  const isGratuito = clinica?.plano !== "ativo";
  const analisesRestantes = Math.max(0, 3 - (lotesDoMes ?? 0));

  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Lotes" titulo="O começo de toda recuperação"
        descricao="Cada XML da operadora vira uma leitura clara do que foi pago, glosado e recuperável." />

      <UploadZone isGratuito={isGratuito} analisesRestantes={analisesRestantes} />

      <section className="rg-card">
        <div className="rg-card-head"><h2 className="rg-h2">Histórico</h2></div>
        <DataList
          colunas={[
            { chave: "arquivo", titulo: "Arquivo" },
            { chave: "operadora", titulo: "Operadora" },
            { chave: "data", titulo: "Enviado em" },
            { chave: "guias", titulo: "Guias", alinhar: "right" },
            { chave: "recuperavel", titulo: "Recuperável", alinhar: "right", render: (l) => <Money valor={l.recuperavel} tam="sm" /> },
            { chave: "status", titulo: "Status", render: (l) => <StatusBadge status={l.status} /> },
          ]}
          mobile={{
            titulo: (l) => l.arquivo,
            sub: (l) => `${l.operadora} · ${l.data}`,
            status: (l) => l.status,
            meta: [
              { rotulo: "Guias", valor: (l) => l.guias },
              { rotulo: "Recuperável", valor: (l) => <Money valor={l.recuperavel} tam="sm" /> },
            ],
          }}
          linhas={[] /* ⬛ PREENCHER: tabela lote */}
          vazio={<EmptyState icone={UploadCloud} titulo="Nenhum lote enviado"
            texto="Assim que você enviar o primeiro XML, ele aparece aqui com o resultado da auditoria." />}
        />
      </section>
    </main>
  );
}
