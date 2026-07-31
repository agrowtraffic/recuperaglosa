/* ============================================================
   RELATÓRIOS  →  app/(app)/relatorios/page.jsx
   Aba de retenção: é o que prova o ROI todo mês.
   Regra dura: gráfico com dataset vazio não é desenhado.
   ============================================================ */
import { PageHeader, EmptyState, Money, StatusBadge } from "@/app/_components/kit/Primitives";
import { MoneyRail } from "@/app/_components/kit/Signature";
import { StatCard, RecoveryBar, RankRow, DataList } from "@/app/_components/kit/Data";
import { BarChart3, Clock, Inbox } from "lucide-react";
import {
  getContexto, getLotes, getGlosas, getRecursos, calcularResumo,
  agruparPorOperadora, agruparPorCompetencia,
} from "@/lib/dados-clinica";
import {
  desempenhoPorOperadora, recursosAguardando, resumoDosRecursos,
} from "@/lib/relatorios";
import BaixarRelatorio from "./BaixarRelatorio";

export const metadata = { title: 'Relatórios' };

export const dynamic = "force-dynamic";

export default async function Relatorios() {
  const { supabase, clinicaId } = await getContexto();

  const [lotes, glosas, recursos] = await Promise.all([
    getLotes(supabase, clinicaId),
    getGlosas(supabase, clinicaId),
    getRecursos(supabase, clinicaId),
  ]);

  const resumo = calcularResumo({ lotes, glosas, recursos });
  const porOperadora = agruparPorOperadora(lotes);
  const porCompetencia = agruparPorCompetencia(lotes);

  const temDados = lotes.length > 0;
  /* Evolução só faz sentido com mais de uma competência. */
  const temHistorico = porCompetencia.length > 1;

  /* Taxa de reversão só entre recursos já decididos. Sem decisão, não
     existe taxa — mostrar 0% seria mentir sobre desempenho. */
  const rec = resumoDosRecursos(recursos);
  const desempenho = desempenhoPorOperadora(recursos);
  const fila = recursosAguardando(recursos);

  const maiorGlosado = porOperadora[0]?.glosado || 1;

  /* As seções de recurso só existem depois que algum saiu da clínica.
     Antes disso seriam tabelas vazias explicando que estão vazias. */
  const temRecursoEnviado = rec.enviados > 0;

  return (
    <main className="rg-shell-content rg-stack">
      <PageHeader eyebrow="Relatórios" titulo="O retorno que você consegue provar"
        descricao="Acompanhe o que voltou para o caixa e onde ainda existe oportunidade."
        /* Só oferece o download quando existe demonstrativo processado:
           um PDF de relatório zerado não serve para mandar a ninguém.
           Competências da mais recente para a mais antiga — quem baixa
           quer quase sempre o mês que acabou de fechar. */
        acoes={temDados ? (
          <BaixarRelatorio
            competencias={porCompetencia.map((c) => c.competencia).reverse()}
          />
        ) : null} />

      <MoneyRail atual="recuperado" estagios={resumo.estagios} />

      {!temDados ? (
        <div className="rg-card">
          <EmptyState icone={BarChart3} titulo="Ainda sem histórico"
            texto="Envie o primeiro demonstrativo para começar a acompanhar o retorno." />
        </div>
      ) : (
        <>
          <div className="rg-grid-kpi">
            <StatCard destaque rotulo="Recuperado" valor={resumo.recuperado} variacao={null}
              ajuda="Recursos aceitos pela operadora" />
            <StatCard rotulo="Ainda recuperável" valor={resumo.recuperavel}
              ajuda="Dentro do prazo de recurso" />
            <StatCard rotulo="Perdido por prazo" valor={resumo.perdido}
              ajuda="Sem recurso possível" />
            <StatCard
              rotulo="Taxa de reversão"
              valor={rec.taxaValor ?? 0}
              tipo="numero"
              /* Por valor, não por quantidade: com aceite parcial, "80%
                 dos recursos aceitos" pode significar 20% do dinheiro
                 de volta. O cliente quer saber do dinheiro. */
              ajuda={
                rec.taxaValor == null
                  ? "sem recursos decididos ainda"
                  : `% do valor pleiteado que voltou · ${rec.ganhos} de ${rec.decididos} recursos aceitos`
              }
            />
          </div>

          <div className="rg-grid-2">
            <section className="rg-card">
              <div className="rg-card-head">
                <h2 className="rg-h2">Divisão do faturamento</h2>
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
              <div className="rg-card-head"><h2 className="rg-h2">Por operadora</h2></div>
              <div className="rg-card-pad rg-stack">
                {porOperadora.map((o) => (
                  <RankRow key={o.operadora} nome={o.operadora} valor={o.glosado}
                    max={maiorGlosado} qtd={o.lotes} />
                ))}
              </div>
            </section>
          </div>

          {/* ── Quem devolve dinheiro ──
              "Por operadora" acima mostra quanto cada uma glosou. Esta
              responde a pergunta seguinte, que é a que decide onde
              gastar tempo: quando eu brigo, ela paga? */}
          {temRecursoEnviado && (
            <section className="rg-card">
              <div className="rg-card-head">
                <h2 className="rg-h2">Resposta das operadoras aos recursos</h2>
                <span className="rg-caption">
                  {rec.enviados} {rec.enviados === 1 ? "recurso enviado" : "recursos enviados"}
                </span>
              </div>
              <DataList
                colunas={[
                  { chave: "operadora", titulo: "Operadora" },
                  {
                    chave: "recuperado", titulo: "Recuperado", alinhar: "right",
                    render: (l) => <Money valor={l.recuperado} tam="sm" cor="var(--rg-recuperado-h)" />,
                  },
                  {
                    chave: "taxaValor", titulo: "Do que foi pleiteado", alinhar: "right",
                    /* Traço, não 0%: sem decisão ainda não há taxa, e
                       zero leria como "essa operadora nunca paga". */
                    render: (l) =>
                      l.taxaValor == null ? (
                        <span className="rg-caption">—</span>
                      ) : (
                        <span className="rg-num" style={{ fontWeight: 700 }}>{l.taxaValor}%</span>
                      ),
                  },
                  {
                    chave: "decididos", titulo: "Aceitos", alinhar: "right",
                    render: (l) =>
                      l.decididos ? (
                        <span className="rg-num">{l.ganhos} de {l.decididos}</span>
                      ) : (
                        <span className="rg-caption">aguardando</span>
                      ),
                  },
                  {
                    chave: "diasMedios", titulo: "Resposta em", alinhar: "right",
                    render: (l) =>
                      l.diasMedios == null ? (
                        <span className="rg-caption">—</span>
                      ) : (
                        <span className="rg-num">{l.diasMedios} dias</span>
                      ),
                  },
                ]}
                mobile={{
                  titulo: (l) => l.operadora,
                  sub: (l) =>
                    l.decididos
                      ? `${l.ganhos} de ${l.decididos} recursos aceitos`
                      : `${l.aguardando} aguardando resposta`,
                  meta: [
                    { rotulo: "Recuperado", valor: (l) => <Money valor={l.recuperado} tam="sm" /> },
                    { rotulo: "Do pleiteado", valor: (l) => (l.taxaValor == null ? "—" : `${l.taxaValor}%`) },
                    { rotulo: "Resposta em", valor: (l) => (l.diasMedios == null ? "—" : `${l.diasMedios} dias`) },
                  ],
                }}
                linhas={desempenho.map((d) => ({ ...d, id: d.operadora }))}
              />
            </section>
          )}

          {/* ── O que está parado na mesa da operadora ──
              Lista acionável: é por aqui que a clínica sabe o que
              cobrar, em vez de esperar sem saber por quanto tempo. */}
          {fila.length > 0 && (
            <section className="rg-card">
              <div className="rg-card-head">
                <h2 className="rg-h2">Aguardando resposta</h2>
                <span className="rg-caption">
                  {fila.length} {fila.length === 1 ? "recurso" : "recursos"}
                </span>
              </div>
              <DataList
                colunas={[
                  { chave: "guia", titulo: "Guia" },
                  { chave: "operadora", titulo: "Operadora" },
                  { chave: "enviadoEm", titulo: "Enviado em", render: (l) => l.enviadoEm ?? "—" },
                  {
                    chave: "valor", titulo: "Pleiteado", alinhar: "right",
                    render: (l) => <Money valor={l.valor} tam="sm" />,
                  },
                  {
                    chave: "diasEsperando", titulo: "Esperando há", alinhar: "right",
                    render: (l) =>
                      l.diasEsperando == null ? (
                        <span className="rg-caption">—</span>
                      ) : (
                        <span
                          className="rg-num"
                          style={{
                            fontWeight: 700,
                            /* 30 dias é quando deixa de ser espera normal
                               e passa a valer uma cobrança. */
                            color: l.diasEsperando >= 30 ? "var(--rg-glosado-h)" : undefined,
                          }}
                        >
                          {l.diasEsperando} {l.diasEsperando === 1 ? "dia" : "dias"}
                        </span>
                      ),
                  },
                  {
                    chave: "acao", titulo: "", alinhar: "right",
                    render: (l) => (
                      <a href={`/recursos/${l.id}`} className="rg-btn rg-btn-secondary rg-btn-sm">
                        Abrir
                      </a>
                    ),
                  },
                ]}
                mobile={{
                  titulo: (l) => `Guia ${l.guia}`,
                  sub: (l) => `${l.operadora} · enviado em ${l.enviadoEm ?? "—"}`,
                  meta: [
                    { rotulo: "Pleiteado", valor: (l) => <Money valor={l.valor} tam="sm" /> },
                    {
                      rotulo: "Esperando há",
                      valor: (l) => (l.diasEsperando == null ? "—" : `${l.diasEsperando} dias`),
                    },
                  ],
                  acao: (l) => (
                    <a href={`/recursos/${l.id}`} className="rg-btn rg-btn-secondary rg-btn-sm">
                      Abrir recurso
                    </a>
                  ),
                }}
                linhas={fila}
              />
            </section>
          )}

          <section className="rg-card">
            <div className="rg-card-head"><h2 className="rg-h2">Evolução por competência</h2></div>
            {temHistorico ? (
              <div className="rg-card-pad rg-stack">
                {porCompetencia.map((c) => (
                  <RankRow key={c.competencia} nome={c.competencia} valor={c.glosado}
                    max={Math.max(...porCompetencia.map((x) => x.glosado)) || 1} />
                ))}
              </div>
            ) : (
              <EmptyState icone={BarChart3} titulo="Ainda sem histórico"
                texto="Depois do segundo demonstrativo, aparece aqui a evolução mês a mês." />
            )}
          </section>
        </>
      )}
    </main>
  );
}
