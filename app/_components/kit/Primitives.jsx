/* ============================================================
   PRIMITIVOS — peças pequenas, sem estado de dados.
   import { Money, StatusBadge, PageHeader, EmptyState, Field, Skeleton } from "@/components/kit/Primitives";
   ============================================================ */

import { Inbox } from "lucide-react";

/* ---- Dinheiro ----
   Centavos menores e mais claros: o olho lê o valor inteiro primeiro.
   Sempre tabular — colunas de números ficam alinhadas. */
export function Money({ valor = 0, tam = "md", sinal = false, cor }) {
  const n = Number(valor) || 0;
  const [reais, cent] = Math.abs(n).toFixed(2).split(".");
  const inteiro = Number(reais).toLocaleString("pt-BR");
  const prefixo = sinal && n > 0 ? "+" : n < 0 ? "−" : "";
  return (
    <span className={`rg-money rg-money-${tam}`} style={cor ? { color: cor } : undefined}>
      {prefixo}R$ {inteiro}<span className="cent">,{cent}</span>
    </span>
  );
}

/* ---- Selo de status ----
   Vocabulário fixo do produto. Nunca inventar rótulo novo. */
const STATUS = {
  recuperado: { classe: "rg-badge-recuperado", texto: "Recuperado" },
  analise:    { classe: "rg-badge-analise",    texto: "Em análise" },
  /* 'rascunho' é o recurso assim que o sistema gera o documento — ainda
     não foi revisado nem enviado a ninguém. "Em análise" sugere que a
     operadora já está avaliando, o que não é o caso: era o rótulo
     antigo do rascunho, e confundia quem lê a tabela. */
  rascunho:   { classe: "rg-badge-neutro",     texto: "Rascunho" },
  glosado:    { classe: "rg-badge-glosado",    texto: "Glosado" },
  recorrivel: { classe: "rg-badge-glosado",    texto: "Recorrível" },
  perdido:    { classe: "rg-badge-perdido",    texto: "Prazo vencido" },
  /* Glosa 'perdido' é prazo vencido; recurso 'perdido' é a operadora ter
     mantido a glosa depois de analisar. Coisas diferentes, rótulos
     diferentes — o badge de prazo em um recurso analisado mentiria. */
  recusado:   { classe: "rg-badge-perdido",    texto: "Glosa mantida" },
  enviado:    { classe: "rg-badge-neutro",     texto: "Recurso enviado" },
  processado: { classe: "rg-badge-recuperado", texto: "Processado" },
  processando:{ classe: "rg-badge-analise",    texto: "Processando" },
  erro:       { classe: "rg-badge-perdido",    texto: "Falhou" },
};
export function StatusBadge({ status = "neutro", texto }) {
  const s = STATUS[status] || { classe: "rg-badge-neutro", texto: texto || status };
  return <span className={`rg-badge ${s.classe}`}>{texto || s.texto}</span>;
}

/* ---- Cabeçalho de página ---- */
export function PageHeader({ eyebrow, titulo, descricao, acoes }) {
  return (
    <div className="rg-pagehead">
      <div className="rg-stack-sm" style={{ minWidth: 0 }}>
        {eyebrow && <p className="rg-eyebrow">{eyebrow}</p>}
        <h1 className="rg-h1"><span>{titulo}</span></h1>
        {descricao && <p className="rg-sub">{descricao}</p>}
      </div>
      {acoes && <div className="rg-pagehead-actions">{acoes}</div>}
    </div>
  );
}

/* ---- Estado vazio ----
   Tela vazia é convite pra agir: sempre uma ação. Nunca "nenhum dado". */
export function EmptyState({ icone: Icone = Inbox, titulo, texto, acao }) {
  return (
    <div className="rg-empty">
      <span className="rg-empty-icon"><Icone size={24} /></span>
      <h2 className="rg-h2">{titulo}</h2>
      {texto && <p>{texto}</p>}
      {acao}
    </div>
  );
}

/* ---- Campo de formulário ---- */
export function Field({ id, label, ajuda, erro, children }) {
  return (
    <div className="rg-field">
      <label className="rg-label" htmlFor={id}>{label}</label>
      {children}
      {erro ? <span className="rg-error" role="alert">{erro}</span>
            : ajuda && <span className="rg-help">{ajuda}</span>}
    </div>
  );
}

/* ---- Esqueleto de carregamento ----
   Usar no lugar de spinner: mantém o layout parado, sem salto. */
export function Skeleton({ h = 16, w = "100%", r = 8, style }) {
  return <span className="rg-skel" style={{ display: "block", height: h, width: w, borderRadius: r, ...style }} />;
}

export function SkeletonKPIs({ n = 4 }) {
  return (
    <div className="rg-grid-kpi">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="rg-card rg-card-pad rg-stack-sm">
          <Skeleton h={11} w="55%" />
          <Skeleton h={30} w="70%" />
          <Skeleton h={8} />
        </div>
      ))}
    </div>
  );
}

/* ---- Filtro em pílula ---- */
export function Chip({ ativo, children, ...props }) {
  return <button className="rg-chip" aria-pressed={!!ativo} {...props}>{children}</button>;
}
