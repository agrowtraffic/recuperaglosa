/* ============================================================
   GLOSAS  →  app/(app)/glosas/page.jsx
   O coração comercial: é onde o cliente decide "vou brigar por essa".
   Ordenação padrão: valor × prazo (não por data).
   ============================================================ */
import { PageHeader, EmptyState, Money, Chip, StatusBadge } from "@/app/_components/kit/Primitives";
import { MoneyRail, Prazo, BulkBar } from "@/app/_components/kit/Signature";
import { DataList } from "@/app/_components/kit/Data";
import { AlertTriangle } from "lucide-react";

export default function Glosas() {
  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Glosas" titulo="Dinheiro parado, ação clara"
        descricao="Priorize o que contestar pelo valor, pelo motivo e pelo prazo que ainda resta."
        acoes={<button className="rg-btn rg-btn-primary">Gerar recursos em lote</button>} />


      {/* O fio do dinheiro — mesma peça em todas as telas de dado.
          ⬛ PREENCHER: somas por estágio. */}
      <MoneyRail atual="glosado" estagios={{
        apresentado: { valor: 0, qtd: 0 },
        recebido:    { valor: 0 },
        glosado:     { valor: 0, qtd: 0 },
        recurso:     { valor: 0, qtd: 0 },
        recuperado:  { valor: 0 },
      }} />

      {/* Faixa de resumo: 3 números que orientam a decisão */}
      <div className="rg-grid-kpi" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
        {/* ⬛ PREENCHER */}
      </div>

      <section className="rg-card">
        <div className="rg-toolbar">
          <Chip ativo>Recorríveis</Chip>
          <Chip>Vence em 7 dias</Chip>
          <Chip>Recurso enviado</Chip>
          <Chip>Prazo vencido</Chip>
          <Chip>Operadora</Chip>
          <Chip>Motivo</Chip>
        </div>

        <DataList
          colunas={[
            { chave: "guia", titulo: "Guia", largura: 100 },
            { chave: "procedimento", titulo: "Procedimento" },
            { chave: "motivo", titulo: "Motivo da glosa" },
            { chave: "operadora", titulo: "Operadora" },
            { chave: "sel", titulo: "", largura: 36,
              render: (l) => <input type="checkbox" className="rg-check" aria-label={`Selecionar guia ${l.guia}`} /* ⬛ */ /> },
            { chave: "prazo", titulo: "Prazo", largura: 96, render: (l) => <Prazo dias={l.prazo} /> },
            { chave: "valor", titulo: "Recuperável", alinhar: "right", render: (l) => <Money valor={l.valor} tam="sm" cor="var(--rg-glosado)" /> },
            { chave: "status", titulo: "Status", render: (l) => <StatusBadge status={l.status} /> },
            { chave: "acao", titulo: "", alinhar: "right",
              render: () => <button className="rg-btn rg-btn-primary rg-btn-sm rg-acao-linha">Gerar recurso</button> },
          ]}
          mobile={{
            titulo: (l) => l.procedimento,
            sub: (l) => `Guia ${l.guia} · ${l.operadora}`,
            status: (l) => l.status,
            meta: [
              { rotulo: "Recuperável", valor: (l) => <Money valor={l.valor} tam="sm" /> },
              { rotulo: "Prazo", valor: (l) => <Prazo dias={l.prazo} /> },
              { rotulo: "Motivo", valor: (l) => l.motivo },
            ],
          }}
          linhas={[] /* ⬛ PREENCHER: itens com valor glosado > 0 */}
          vazio={<EmptyState icone={AlertTriangle} titulo="Nenhuma glosa no período"
            texto="Quando a operadora glosar algum item, ele aparece aqui com o motivo e o prazo." />}
        />
      </section>

      {/* Seleção em massa: 12 recursos em um clique, não 12 cliques.
          ⬛ PREENCHER: estado da seleção + ação de gerar em lote. */}
      <BulkBar n={0} valor={0} rotulo="Gerar recursos" />
    </main>
  );
}
