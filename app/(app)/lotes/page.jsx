/* ============================================================
   LOTES  →  app/(app)/lotes/page.jsx
   Tela de upload + histórico. É o começo de todo fluxo.
   ============================================================ */
import { PageHeader, EmptyState, StatusBadge, Money } from "@/app/_components/kit/Primitives";
import { DataList } from "@/app/_components/kit/Data";
import { UploadCloud } from "lucide-react";

export default function Lotes() {
  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Lotes" titulo="O começo de toda recuperação"
        descricao="Cada XML da operadora vira uma leitura clara do que foi pago, glosado e recuperável." />

      {/* Zona de upload — no celular vira botão cheio; arrastar não existe no toque */}
      <section className="rg-card rg-card-pad rg-upload">
        <div className="rg-stack-sm" style={{ alignItems: "center", textAlign: "center", padding: "24px 0" }}>
          <span className="rg-empty-icon"><UploadCloud size={24} /></span>
          <h2 className="rg-h2">Arraste o XML aqui</h2>
          <p className="rg-sub">Padrão TISS. Até 10 arquivos por vez.</p>
          <label className="rg-btn rg-btn-primary rg-btn-lg" style={{ marginTop: 8 }}>
            Escolher arquivo
            <input type="file" accept=".xml" multiple className="rg-sr" /* ⬛ PREENCHER: handler */ />
          </label>
          <p className="rg-caption">{"⬛ 3 de 5 envios usados no plano gratuito"}</p>
        </div>
        {/* ⬛ PREENCHER: durante o processamento, trocar por barra de progresso
            com nome do arquivo + "Lendo guias…" / "Auditando…" / "Pronto" */}
      </section>

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
