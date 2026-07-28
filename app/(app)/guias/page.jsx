/* ============================================================
   GUIAS  →  app/(app)/guias/page.jsx
   Tabela densa. É aqui que a responsividade quebra hoje: no celular
   a tabela vira cartão, e os filtros viram trilho rolável.
   ============================================================ */
import { PageHeader, EmptyState, StatusBadge, Money, Chip } from "@/app/_components/kit/Primitives";
import { MoneyRail } from "@/app/_components/kit/Signature";
import { DataList, RecoveryBar } from "@/app/_components/kit/Data";
import { FileText, Search } from "lucide-react";

export default function Guias() {
  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Guias" titulo="Cada guia, sem ponto cego"
        descricao="Do apresentado ao glosado, veja exatamente para onde foi cada valor."
        acoes={<button className="rg-btn rg-btn-secondary">Exportar</button>} />


      {/* O fio do dinheiro — mesma peça em todas as telas de dado.
          ⬛ PREENCHER: somas por estágio. */}
      <MoneyRail atual="recebido" estagios={{
        apresentado: { valor: 0, qtd: 0 },
        recebido:    { valor: 0 },
        glosado:     { valor: 0, qtd: 0 },
        recurso:     { valor: 0, qtd: 0 },
        recuperado:  { valor: 0 },
      }} />

      <section className="rg-card">
        {/* Filtros: no desktop linha única; no celular trilho horizontal (não empilha) */}
        <div className="rg-toolbar">
          <div style={{ position: "relative", flex: "1 1 240px", minWidth: 200 }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: 15, color: "var(--rg-ink-300)" }} />
            <input className="rg-input" style={{ paddingLeft: 36, height: 38 }}
              placeholder="Buscar por guia, paciente ou carteirinha" /* ⬛ PREENCHER */ />
          </div>
          <Chip>Operadora</Chip>
          <Chip>Período</Chip>
          <Chip>Com glosa</Chip>
          <Chip>Só recorríveis</Chip>
        </div>

        <DataList
          colunas={[
            { chave: "numero", titulo: "Guia", largura: 110 },
            { chave: "paciente", titulo: "Paciente" },
            { chave: "operadora", titulo: "Operadora" },
            { chave: "data", titulo: "Atendimento", largura: 120 },
            { chave: "apresentado", titulo: "Apresentado", alinhar: "right", render: (l) => <Money valor={l.apresentado} tam="sm" /> },
            { chave: "pago", titulo: "Pago", alinhar: "right", render: (l) => <Money valor={l.pago} tam="sm" cor="var(--rg-recuperado-h)" /> },
            { chave: "glosado", titulo: "Glosado", alinhar: "right", render: (l) => <Money valor={l.glosado} tam="sm" cor="var(--rg-glosado)" /> },
            { chave: "divisao", titulo: "Divisão", largura: 120, render: (l) => <RecoveryBar sm pago={l.pago} recuperavel={l.glosado} perdido={0} /> },
          ]}
          mobile={{
            titulo: (l) => `Guia ${l.numero}`,
            sub: (l) => `${l.paciente} · ${l.operadora}`,
            status: (l) => (l.glosado > 0 ? "glosado" : "processado"),
            meta: [
              { rotulo: "Apresentado", valor: (l) => <Money valor={l.apresentado} tam="sm" /> },
              { rotulo: "Pago", valor: (l) => <Money valor={l.pago} tam="sm" /> },
              { rotulo: "Glosado", valor: (l) => <Money valor={l.glosado} tam="sm" /> },
              { rotulo: "Atendimento", valor: (l) => l.data },
            ],
            barra: (l) => ({ pago: l.pago, recuperavel: l.glosado, perdido: 0 }),
          }}
          linhas={[] /* ⬛ PREENCHER: tabela guia + item */}
          onLinhaClick={undefined /* ⬛ PREENCHER: abre detalhe da guia */}
          vazio={<EmptyState icone={FileText} titulo="Nenhuma guia encontrada"
            texto="Ajuste os filtros ou envie um novo demonstrativo." />}
        />
      </section>
    </main>
  );
}
