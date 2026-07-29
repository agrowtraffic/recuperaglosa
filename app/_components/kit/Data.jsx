/* ============================================================
   DADOS — componentes de apresentação de números.
   Nenhum busca dado: tudo entra por props.
   ============================================================ */

import { Money, StatusBadge } from "./Primitives";
import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";

/* ------------------------------------------------------------
   ASSINATURA DO PRODUTO: BARRA DE RECUPERAÇÃO
   Uma linha responde a pergunta que o cliente faz todo dia:
   "do que faturei, quanto entrou, quanto dá pra brigar, quanto perdi?"
   Aparece no KPI, na linha da tabela, no cartão do celular e no PDF.
   ------------------------------------------------------------ */
export function RecoveryBar({ pago = 0, recuperavel = 0, perdido = 0, legenda = false, sm = false }) {
  const total = pago + recuperavel + perdido || 1;
  const pct = (v) => `${(v / total) * 100}%`;
  const rot = `Pago ${((pago / total) * 100).toFixed(0)}%, recuperável ${((recuperavel / total) * 100).toFixed(0)}%, sem recurso ${((perdido / total) * 100).toFixed(0)}%`;
  return (
    <div>
      <div className={`rg-bar ${sm ? "rg-bar-sm" : ""}`} role="img" aria-label={rot}>
        <span className="rg-bar-seg rg-bar-pago"        style={{ width: pct(pago) }} />
        <span className="rg-bar-seg rg-bar-recuperavel" style={{ width: pct(recuperavel) }} />
        <span className="rg-bar-seg rg-bar-perdido"     style={{ width: pct(perdido) }} />
      </div>
      {legenda && (
        <div className="rg-bar-legend">
          <span><i style={{ background: "var(--rg-recuperado)" }} />Pago</span>
          <span><i style={{ background: "var(--rg-glosado)" }} />Recuperável</span>
          <span><i style={{ background: "var(--rg-ink-300)" }} />Sem recurso</span>
        </div>
      )}
    </div>
  );
}

/* ---- Cartão de indicador ----
   Regra: só desenha tendência se houver período anterior real.
   Sem dado anterior → nada. Zero nunca vira gráfico bonito. */
export function StatCard({ rotulo, valor, tipo = "dinheiro", variacao = null, ajuda, barra = null, destaque = false }) {
  const subiu = variacao > 0;
  return (
    <div className="rg-card rg-card-pad rg-stack-sm rg-stat" data-featured={destaque ? "true" : undefined}>
      <p className="rg-eyebrow">{rotulo}</p>
      {tipo === "dinheiro"
        ? <Money valor={valor} tam="xl" cor={destaque ? "var(--rg-recuperado-h)" : undefined} />
        : <span className="rg-money rg-money-xl rg-num">{Number(valor || 0).toLocaleString("pt-BR")}</span>}

      {barra && <RecoveryBar {...barra} sm />}

      {(variacao !== null || ajuda) && (
        <div className="rg-row" style={{ gap: 8 }}>
          {variacao !== null && (
            <span className="rg-row" style={{ gap: 4, fontSize: 12.5, fontWeight: 800, color: subiu ? "var(--rg-recuperado-h)" : "var(--rg-perdido)" }}>
              {subiu ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {subiu ? "+" : ""}{variacao}%
            </span>
          )}
          {ajuda && <span className="rg-caption">{ajuda}</span>}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------
   LISTA RESPONSIVA — tabela no desktop, cartão no celular.
   Mesma fonte de dados, dois desenhos. Zero rolagem horizontal.

   colunas: [{ chave, titulo, alinhar?, largura?, render?(linha) }]
   mobile:  { titulo(l), status?(l), meta:[{rotulo, valor(l)}], barra?(l) }
   ------------------------------------------------------------ */
export function DataList({ colunas = [], linhas = [], mobile, onLinhaClick, vazio }) {
  if (!linhas.length) return vazio || null;

  return (
    <>
      {/* Desktop */}
      <div className="rg-table-wrap">
        <table className="rg-table">
          <thead>
            <tr>{colunas.map((c) => (
              <th key={c.chave} style={{ width: c.largura, textAlign: c.alinhar || "left" }}>{c.titulo}</th>
            ))}</tr>
          </thead>
          <tbody>
            {linhas.map((l, i) => (
              <tr key={l.id ?? i} onClick={onLinhaClick ? () => onLinhaClick(l) : undefined}
                  style={onLinhaClick ? { cursor: "pointer" } : undefined}>
                {colunas.map((c) => (
                  <td key={c.chave} style={{ textAlign: c.alinhar || "left" }}>
                    {c.render ? c.render(l) : l[c.chave]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Celular */}
      <div className="rg-cardlist">
        {linhas.map((l, i) => (
          <article key={l.id ?? i} className="rg-rowcard" onClick={onLinhaClick ? () => onLinhaClick(l) : undefined}>
            <div className="rg-rowcard-top">
              <div style={{ minWidth: 0 }}>
                <strong style={{ fontSize: 15, display: "block" }}>{mobile?.titulo?.(l)}</strong>
                {mobile?.sub?.(l) && <span className="rg-caption">{mobile.sub(l)}</span>}
              </div>
              {mobile?.status?.(l) && <StatusBadge status={mobile.status(l)} />}
            </div>

            {mobile?.meta && (
              <dl className="rg-rowcard-meta">
                {mobile.meta.map((m) => (
                  <div key={m.rotulo}>
                    <dt>{m.rotulo}</dt>
                    <dd>{m.valor(l)}</dd>
                  </div>
                ))}
              </dl>
            )}

            {mobile?.barra?.(l) && <RecoveryBar {...mobile.barra(l)} sm />}

            {/* Ação da linha no celular. Sem isto, colunas de ação some
                no cartão e o usuário de celular fica sem o botão. */}
            {mobile?.acao?.(l) && (
              <div className="rg-row" style={{ marginTop: 4 }}>{mobile.acao(l)}</div>
            )}

            {onLinhaClick && (
              <span className="rg-row rg-caption" style={{ gap: 4, color: "var(--rg-recuperado-h)", fontWeight: 700 }}>
                Ver detalhes <ChevronRight size={14} />
              </span>
            )}
          </article>
        ))}
      </div>
    </>
  );
}

/* ---- Linha de ranking (operadoras, motivos de glosa) ----
   Barra proporcional dentro da própria linha: comparação sem gráfico. */
export function RankRow({ nome, valor, max, qtd }) {
  const pct = max ? Math.max(4, (valor / max) * 100) : 0;
  return (
    <div className="rg-stack-sm" style={{ gap: 6 }}>
      <div className="rg-row">
        <strong style={{ fontSize: 13.5 }}>{nome}</strong>
        <div className="rg-spacer" />
        <Money valor={valor} tam="sm" />
      </div>
      <div className="rg-bar rg-bar-sm">
        <span className="rg-bar-seg rg-bar-recuperavel" style={{ width: `${pct}%` }} />
      </div>
      {qtd != null && <span className="rg-caption">{qtd} {qtd === 1 ? "glosa" : "glosas"}</span>}
    </div>
  );
}
