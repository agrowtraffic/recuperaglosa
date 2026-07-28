/* ============================================================
   RECURSOS  →  app/(app)/recursos/page.jsx
   Onde mora o valor pago. O bloqueio do freemium acontece aqui —
   e ele mostra o que a pessoa ganha, não uma parede.
   ============================================================ */
import { PageHeader, EmptyState, Money, StatusBadge } from "@/app/_components/kit/Primitives";
import { MoneyRail } from "@/app/_components/kit/Signature";
import { DataList } from "@/app/_components/kit/Data";
import { FileCheck2, Lock } from "lucide-react";

export default function Recursos() {
  const assinante = false; /* ⬛ PREENCHER: verificar plano do usuário */
  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Recursos" titulo="Contestações prontas para avançar"
        descricao="Documentos claros, revisáveis e organizados pelo valor que pode voltar." />


      {/* O fio do dinheiro — mesma peça em todas as telas de dado.
          ⬛ PREENCHER: somas por estágio. */}
      <MoneyRail atual="recurso" estagios={{
        apresentado: { valor: 0, qtd: 0 },
        recebido:    { valor: 0 },
        glosado:     { valor: 0, qtd: 0 },
        recurso:     { valor: 0, qtd: 0 },
        recuperado:  { valor: 0 },
      }} />

      {!assinante && (
        /* Bloqueio honesto: mostra o valor real que está travado */
        <section className="rg-card rg-card-pad rg-stack-sm"
          style={{ borderColor: "var(--rg-recuperado)", background: "var(--rg-recuperado-bg)" }}>
          <div className="rg-row" style={{ gap: 10 }}>
            <Lock size={18} color="var(--rg-recuperado-h)" />
            <h2 className="rg-h2">Você tem <Money valor={0 /* ⬛ */} tam="md" cor="var(--rg-recuperado-h)" /> pronto para contestar</h2>
          </div>
          <p className="rg-sub">A auditoria é livre. A geração dos recursos entra no plano de R$ 197/mês, sem fidelidade.</p>
          <div className="rg-row rg-row-wrap" style={{ marginTop: 8 }}>
            <button className="rg-btn rg-btn-primary">Liberar recursos</button>
            <button className="rg-btn rg-btn-ghost">Ver exemplo de recurso</button>
          </div>
        </section>
      )}

      <section className="rg-card">
        <DataList
          colunas={[
            { chave: "guia", titulo: "Guia" },
            { chave: "operadora", titulo: "Operadora" },
            { chave: "gerado", titulo: "Gerado em" },
            { chave: "valor", titulo: "Valor contestado", alinhar: "right", render: (l) => <Money valor={l.valor} tam="sm" /> },
            { chave: "status", titulo: "Status", render: (l) => <StatusBadge status={l.status} /> },
            { chave: "acao", titulo: "", alinhar: "right",
              render: () => <button className="rg-btn rg-btn-secondary rg-btn-sm">Baixar PDF</button> },
          ]}
          mobile={{
            titulo: (l) => `Guia ${l.guia}`,
            sub: (l) => `${l.operadora} · ${l.gerado}`,
            status: (l) => l.status,
            meta: [{ rotulo: "Contestado", valor: (l) => <Money valor={l.valor} tam="sm" /> }],
          }}
          linhas={[] /* ⬛ PREENCHER */}
          vazio={<EmptyState icone={FileCheck2} titulo="Nenhum recurso gerado"
            texto="Escolha uma glosa recorrível e gere o documento em um clique."
            acao={<a href="/glosas" className="rg-btn rg-btn-primary">Ver glosas recorríveis</a>} />}
        />
      </section>
    </main>
  );
}
