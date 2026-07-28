"use client";
/* ============================================================
   ASSINATURA — as peças que fazem o Recupera Glosa parecer
   só com ele mesmo. Todas visuais, todas por props.
   ============================================================ */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Money } from "./Primitives";
import { Search } from "lucide-react";

/* ------------------------------------------------------------
   O FIO DO DINHEIRO
   As 7 abas não são 7 lugares — são 5 estágios do mesmo dinheiro.
   Este trilho fica no topo de toda tela de dado: mostra quanto tem
   parado em cada estágio, marca onde você está e leva pro próximo.
   Diagnóstico e navegação na mesma peça.

   <MoneyRail atual="glosado" estagios={{
     apresentado:{valor, qtd}, recebido:{...}, glosado:{...},
     recurso:{...}, recuperado:{...}
   }} />
   ------------------------------------------------------------ */
const ESTAGIOS = [
  { id: "apresentado", rotulo: "Apresentado", href: "/guias",     legenda: "o que você faturou" },
  { id: "recebido",    rotulo: "Recebido",    href: "/guias",     legenda: "a operadora pagou" },
  { id: "glosado",     rotulo: "Glosado",     href: "/glosas",    legenda: "não pagou", acao: true },
  { id: "recurso",     rotulo: "Em recurso",  href: "/recursos",  legenda: "você contestou" },
  { id: "recuperado",  rotulo: "Recuperado",  href: "/relatorios",legenda: "voltou pro caixa" },
];

export function MoneyRail({ atual, estagios = {} }) {
  const router = useRouter();
  return (
    <nav className="rg-rail" aria-label="Estágios do faturamento">
      {ESTAGIOS.map((e) => {
        const d = estagios[e.id] || {};
        const temAcao = e.acao && (d.valor || 0) > 0;
        return (
          <button
            key={e.id}
            className="rg-rail-no"
            aria-current={atual === e.id ? "true" : undefined}
            data-acao={temAcao ? "true" : undefined}
            onClick={() => router.push(e.href)}
            title={e.legenda}
          >
            <span className="rg-rail-rot"><i />{e.rotulo}</span>
            <Money
              valor={d.valor || 0}
              tam="md"
              cor={e.id === "recuperado" ? "var(--rg-recuperado-h)" : e.id === "glosado" ? "var(--rg-glosado)" : undefined}
            />
            <span className="rg-rail-qtd">{d.qtd != null ? `${d.qtd} guias` : e.legenda}</span>
          </button>
        );
      })}
    </nav>
  );
}

/* ------------------------------------------------------------
   PRAZO — a variável que move o cliente.
   Número + barra que esvazia. Vermelho só abaixo de 7 dias:
   se tudo é urgente, nada é.
   ------------------------------------------------------------ */
export function Prazo({ dias, total = 60 }) {
  if (dias == null) return <span className="rg-caption">—</span>;
  const nivel = dias <= 7 ? "alta" : dias <= 20 ? "media" : "baixa";
  const pct = Math.max(3, Math.min(100, (dias / total) * 100));
  return (
    <span className={`rg-prazo rg-prazo-${nivel}`}>
      <span className="rg-prazo-barra"><span style={{ width: `${pct}%` }} /></span>
      {dias}d
    </span>
  );
}

/* ------------------------------------------------------------
   SELEÇÃO EM MASSA — some até existir seleção.
   Padrão de mercado que falta no app hoje: gerar 12 recursos
   de uma vez em vez de 12 cliques.
   ------------------------------------------------------------ */
export function BulkBar({ n = 0, valor = 0, onAcao, onLimpar, rotulo = "Gerar recursos" }) {
  return (
    <div className="rg-bulk" data-visivel={n > 0}>
      <span style={{ fontSize: 13.5, fontWeight: 700 }}>
        {n} selecionada{n === 1 ? "" : "s"} ·{" "}
        <span style={{ color: "#4ade80" }}><Money valor={valor} tam="sm" /></span>
      </span>
      <div className="rg-row" style={{ gap: 8 }}>
        <button className="rg-btn rg-btn-ghost rg-btn-sm" style={{ color: "rgba(255,255,255,.7)" }} onClick={onLimpar}>
          Limpar
        </button>
        <button className="rg-btn rg-btn-primary rg-btn-sm" onClick={onAcao}>{rotulo}</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   ⌘K — atalho de comando.
   Padrão de mercado em 2026. Aqui ele não é enfeite: busca guia,
   paciente e carteirinha, que é o que a recepção faz o dia todo.
   ------------------------------------------------------------ */
const COMANDOS = [
  { texto: "Enviar XML",                    href: "/lotes" },
  { texto: "Ver glosas recorríveis",        href: "/glosas" },
  { texto: "Glosas que vencem em 7 dias",   href: "/glosas?prazo=7" },
  { texto: "Recursos gerados",              href: "/recursos" },
  { texto: "Relatório do mês",              href: "/relatorios" },
  { texto: "Dados da clínica",              href: "/configuracoes" },
];

export function CommandPalette() {
  const [aberto, setAberto] = useState(false);
  const [q, setQ] = useState("");
  const router = useRouter();

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setAberto((v) => !v); }
      if (e.key === "Escape") setAberto(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  if (!aberto) return null;

  /* ⬛ PREENCHER: além dos comandos fixos, buscar guia/paciente/carteirinha
     no Supabase quando q.length >= 3 (debounce 250ms). */
  const lista = COMANDOS.filter((c) => c.texto.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="rg-cmd-fundo" onClick={() => setAberto(false)} role="dialog" aria-modal="true">
      <div className="rg-cmd" onClick={(e) => e.stopPropagation()}>
        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar guia, paciente ou ação…" aria-label="Buscar" />
        <ul>
          {lista.length === 0 && <li style={{ padding: 16 }} className="rg-caption">Nada encontrado para “{q}”.</li>}
          {lista.map((c) => (
            <li key={c.href + c.texto}>
              <button onClick={() => { setAberto(false); router.push(c.href); }}>
                <Search size={15} color="var(--rg-ink-300)" />{c.texto}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/* Botão de busca da topbar, com a tecla à mostra */
export function CommandTrigger() {
  return (
    <button
      className="rg-btn rg-btn-secondary rg-btn-sm rg-hide-mobile"
      style={{ gap: 10, color: "var(--rg-ink-400)", fontWeight: 500 }}
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
    >
      <Search size={15} /> Buscar guia ou paciente <span className="rg-kbd">⌘K</span>
    </button>
  );
}
