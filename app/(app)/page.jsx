/* ============================================================
   VISÃO GERAL  →  app/(app)/page.jsx
   Só o desenho. Onde há ⬛ PREENCHER, o Claude Code liga no Supabase.
   A tela responde, de cima pra baixo:
   1) quanto dá pra recuperar   2) onde está   3) o que fazer agora
   ============================================================ */
import { PageHeader, EmptyState, Money } from "@/app/_components/kit/Primitives";
import { MoneyRail } from "@/app/_components/kit/Signature";
import { StatCard, RecoveryBar, RankRow, DataList } from "@/app/_components/kit/Data";
import { Upload } from "lucide-react";

export default async function VisaoGeral() {
  /* ⬛ PREENCHER: consultas no Supabase (Server Component).
     Sem nenhum lote → renderizar SÓ o bloco de primeiro uso.
     Nunca inventar número. Sem dado = zero + estado vazio. */
  const dados = null;

  if (!dados) {
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

  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader
        eyebrow="Visão geral"
        titulo="O dinheiro da clínica, em movimento."
        descricao="Veja o que entrou, o que parou e onde agir primeiro."
        acoes={<>
          <button className="rg-btn rg-btn-secondary">Últimos 30 dias</button>
          <button className="rg-btn rg-btn-primary">Enviar XML</button>
        </>}
      />


      {/* O fio do dinheiro — mesma peça em todas as telas de dado.
          ⬛ PREENCHER: somas por estágio. */}
      <MoneyRail atual="apresentado" estagios={{
        apresentado: { valor: 0, qtd: 0 },
        recebido:    { valor: 0 },
        glosado:     { valor: 0, qtd: 0 },
        recurso:     { valor: 0, qtd: 0 },
        recuperado:  { valor: 0 },
      }} />

      {/* 4 → 2 → 1 coluna. O recuperável é o destaque da tela. */}
      <div className="rg-grid-kpi">
        <StatCard destaque rotulo="Valor recuperável" valor={0 /* ⬛ */}
          ajuda="Glosas ainda dentro do prazo de recurso" />
        <StatCard rotulo="Já recuperado" valor={0 /* ⬛ */}
          variacao={null /* ⬛ só preencher se existir período anterior real */} />
        <StatCard rotulo="Glosas abertas" valor={0 /* ⬛ */} tipo="numero" ajuda="Aguardando recurso" />
        <StatCard rotulo="Prazo mais próximo" valor={0 /* ⬛ */} tipo="numero" ajuda="dias para vencer" />
      </div>

      <div className="rg-grid-2">
        <section className="rg-card">
          <div className="rg-card-head">
            <h2 className="rg-h2">Para onde foi o faturamento</h2>
            <span className="rg-caption">{"⬛ período"}</span>
          </div>
          <div className="rg-card-pad rg-stack">
            <RecoveryBar pago={0} recuperavel={0} perdido={0} legenda /* ⬛ */ />
            <div className="rg-grid-half">
              <div><p className="rg-eyebrow">Apresentado</p><Money valor={0 /* ⬛ */} tam="lg" /></div>
              <div><p className="rg-eyebrow">Recebido</p><Money valor={0 /* ⬛ */} tam="lg" cor="var(--rg-recuperado-h)" /></div>
            </div>
            {/* ⬛ PREENCHER: gráfico Recharts. Altura 240px desktop / 180px celular,
                sem eixo Y no celular, tooltip por toque. Se todos os pontos = 0,
                não renderizar gráfico: mostrar "Sem histórico ainda". */}
          </div>
        </section>

        <section className="rg-card">
          <div className="rg-card-head"><h2 className="rg-h2">Maiores motivos de glosa</h2></div>
          <div className="rg-card-pad rg-stack">
            {/* ⬛ PREENCHER: view v_glosa_por_motivo, top 5 */}
            <RankRow nome="⬛ motivo" valor={0} max={1} qtd={0} />
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
            { chave: "prazo", titulo: "Prazo", render: (l) => <span className="rg-num">{l.prazo} dias</span> },
            { chave: "valor", titulo: "Recuperável", alinhar: "right", render: (l) => <Money valor={l.valor} tam="sm" /> },
            { chave: "acao", titulo: "", alinhar: "right", render: () => <button className="rg-btn rg-btn-secondary rg-btn-sm">Gerar recurso</button> },
          ]}
          mobile={{
            titulo: (l) => `Guia ${l.guia}`,
            sub: (l) => l.operadora,
            status: (l) => (l.prazo <= 5 ? "perdido" : "recorrivel"),
            meta: [
              { rotulo: "Recuperável", valor: (l) => <Money valor={l.valor} tam="sm" /> },
              { rotulo: "Prazo", valor: (l) => `${l.prazo} dias` },
            ],
          }}
          linhas={[] /* ⬛ PREENCHER: top 5 por valor × urgência */}
          vazio={<EmptyState titulo="Nada pendente" texto="Todas as glosas do período já têm recurso gerado." />}
        />
      </section>
    </main>
  );
}
