/**
 * Parser do Demonstrativo de Análise de Conta (TISS/ANS).
 *
 * Estratégia deliberada: NÃO amarrar em um caminho fixo do XML.
 * Cada operadora entrega o mesmo padrão com pequenas variações de prefixo de
 * namespace (ans:, tiss:, sem prefixo) e de aninhamento. Então:
 *   1. removemos prefixos de namespace,
 *   2. varremos a árvore procurando NÓS DE GUIA (heurística por campos),
 *   3. dentro de cada guia, varremos NÓS DE ITEM,
 *   4. calculamos glosa = apresentado - pago (nunca confiamos só no campo da operadora).
 *
 * Isso faz o parser sobreviver a operadora nova sem reescrita.
 */

import { XMLParser } from "fast-xml-parser";
import { motivo } from "./motivos";

// ---------- tipos ----------
export type ItemParsed = {
  codigoTuss?: string;
  descricao?: string;
  quantidade: number;
  valorApresentado: number;
  valorPago: number;
  valorGlosado: number;
  codigoGlosa?: string;
  motivoGlosa: string;
  recorrivel: boolean;
};

export type GuiaParsed = {
  numeroGuia: string;
  numeroGuiaOperadora?: string;
  beneficiario?: string;
  carteira?: string;
  dataAtendimento?: string;
  valorApresentado: number;
  valorPago: number;
  valorGlosado: number;
  itens: ItemParsed[];
};

export type LoteParsed = {
  operadora?: string;
  registroAns?: string;
  competencia?: string;
  numeroDemonstrativo?: string;
  totalApresentado: number;
  totalPago: number;
  totalGlosado: number;
  guias: GuiaParsed[];
  avisos: string[];
};

// ---------- helpers ----------
/**
 * Aceita os dois mundos:
 *   ISO   "380.00"     -> 380
 *   pt-BR "1.234,56"   -> 1234.56
 *   pt-BR "380,00"     -> 380
 */
const num = (v: unknown): number => {
  if (v === undefined || v === null || v === "") return 0;
  let s = String(v).trim().replace(/\s/g, "");
  const temPonto = s.includes(".");
  const temVirgula = s.includes(",");

  if (temPonto && temVirgula) {
    s = s.replace(/\./g, "").replace(",", "."); // 1.234,56
  } else if (temVirgula) {
    s = s.replace(",", "."); // 380,00
  } // só ponto -> já é ISO, não mexe

  const n = Number(s);
  return Number.isFinite(n) ? n : 0;
};

const txt = (v: unknown): string | undefined => {
  if (v === undefined || v === null) return undefined;
  if (typeof v === "object") return undefined;
  const s = String(v).trim();
  return s === "" ? undefined : s;
};

const arr = <T,>(v: T | T[] | undefined): T[] =>
  v === undefined ? [] : Array.isArray(v) ? v : [v];

/** procura a primeira chave que bata com algum dos aliases (case-insensitive) */
function pick(node: any, ...aliases: string[]): any {
  if (!node || typeof node !== "object") return undefined;
  const keys = Object.keys(node);
  for (const a of aliases) {
    const k = keys.find((k) => k.toLowerCase() === a.toLowerCase());
    if (k !== undefined) return node[k];
  }
  return undefined;
}

/** varre a árvore inteira e devolve todo nó cuja chave bata com o alias */
function findAll(node: any, ...aliases: string[]): any[] {
  const out: any[] = [];
  const low = aliases.map((a) => a.toLowerCase());
  const walk = (n: any) => {
    if (!n || typeof n !== "object") return;
    for (const [k, v] of Object.entries(n)) {
      if (low.includes(k.toLowerCase())) out.push(...arr(v as any));
      walk(v);
    }
  };
  walk(node);
  return out;
}

// ---------- parser ----------
export function parseDemonstrativo(xml: string): LoteParsed {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@",
    removeNSPrefix: true, // <- mata ans:, tiss:, etc.
    parseTagValue: false,
    trimValues: true,
  });

  const doc = parser.parse(xml);
  const avisos: string[] = [];

  const operadora =
    txt(findAll(doc, "nomeOperadora", "razaoSocial")[0]) ?? undefined;
  const registroAns = txt(findAll(doc, "registroANS")[0]);
  const competencia = txt(findAll(doc, "competencia", "mesCompetencia")[0]);
  const numeroDemonstrativo = txt(
    findAll(doc, "numeroDemonstrativo", "numeroProtocolo")[0],
  );

  // guias: qualquer nó chamado guia* dentro do demonstrativo
  const nosGuia = findAll(
    doc,
    "guiaDemonstrativo",
    "dadosGuia",
    "guia",
    "guiasTISS",
  );

  const guias: GuiaParsed[] = [];

  for (const g of nosGuia) {
    if (!g || typeof g !== "object") continue;

    const numeroGuia =
      txt(pick(g, "numeroGuiaPrestador", "numeroGuia", "numeroGuiaTISS")) ?? "";
    if (!numeroGuia) continue; // não é guia de verdade

    const nosItem = findAll(
      g,
      "procedimento",
      "itemGuia",
      "procedimentoExecutado",
      "servicoExecutado",
      "detalheGuia",
    );

    const itens: ItemParsed[] = [];

    for (const it of nosItem) {
      if (!it || typeof it !== "object") continue;

      const valorApresentado = num(
        pick(it, "valorApresentado", "valorInformado", "valorProcedimento"),
      );
      const valorPago = num(pick(it, "valorPago", "valorLiberado"));
      const valorGlosadoOperadora = num(
        pick(it, "valorGlosa", "valorGlosado"),
      );

      // regra de ouro: recalculamos. Se divergir do campo da operadora, avisamos.
      const valorGlosado = Math.max(0, +(valorApresentado - valorPago).toFixed(2));
      if (
        valorGlosadoOperadora > 0 &&
        Math.abs(valorGlosadoOperadora - valorGlosado) > 0.01
      ) {
        avisos.push(
          `Guia ${numeroGuia}: valor de glosa informado (${valorGlosadoOperadora}) diverge do calculado (${valorGlosado}).`,
        );
      }

      if (valorApresentado === 0 && valorPago === 0) continue;

      const codigoGlosa = txt(
        pick(it, "codigoGlosa", "motivoGlosa", "codGlosa"),
      );
      const m = motivo(codigoGlosa);

      itens.push({
        codigoTuss: txt(
          pick(it, "codigoProcedimento", "codigoTUSS", "codigoItem"),
        ),
        descricao: txt(pick(it, "descricaoProcedimento", "descricao")),
        quantidade: num(pick(it, "quantidadeExecutada", "quantidade")) || 1,
        valorApresentado,
        valorPago,
        valorGlosado,
        codigoGlosa,
        motivoGlosa: m.descricao,
        recorrivel: valorGlosado > 0 ? m.recorrivel : false,
      });
    }

    const somaAp = itens.reduce((s, i) => s + i.valorApresentado, 0);
    const somaPg = itens.reduce((s, i) => s + i.valorPago, 0);

    guias.push({
      numeroGuia,
      numeroGuiaOperadora: txt(pick(g, "numeroGuiaOperadora")),
      beneficiario: txt(pick(g, "nomeBeneficiario", "beneficiario")),
      carteira: txt(pick(g, "numeroCarteira", "carteira")),
      dataAtendimento: txt(
        pick(g, "dataAtendimento", "dataExecucao", "dataRealizacao"),
      ),
      valorApresentado: +somaAp.toFixed(2),
      valorPago: +somaPg.toFixed(2),
      valorGlosado: +(somaAp - somaPg).toFixed(2),
      itens,
    });
  }

  if (guias.length === 0) {
    avisos.push(
      "Nenhuma guia reconhecida. Provável layout novo — capture o arquivo e mapeie os aliases em parser.ts.",
    );
  }

  const totalApresentado = +guias
    .reduce((s, g) => s + g.valorApresentado, 0)
    .toFixed(2);
  const totalPago = +guias.reduce((s, g) => s + g.valorPago, 0).toFixed(2);

  return {
    operadora,
    registroAns,
    competencia,
    numeroDemonstrativo,
    totalApresentado,
    totalPago,
    totalGlosado: +(totalApresentado - totalPago).toFixed(2),
    guias,
    avisos,
  };
}

// ---------- agregação: o número que vende ----------
export function glosaPorMotivo(lote: LoteParsed) {
  const mapa = new Map<
    string,
    { codigo: string; motivo: string; qtd: number; total: number; recorrivel: boolean }
  >();

  for (const g of lote.guias) {
    for (const i of g.itens) {
      if (i.valorGlosado <= 0) continue;
      const k = i.codigoGlosa ?? "SEM_CODIGO";
      const cur = mapa.get(k) ?? {
        codigo: k,
        motivo: i.motivoGlosa,
        qtd: 0,
        total: 0,
        recorrivel: i.recorrivel,
      };
      cur.qtd += 1;
      cur.total = +(cur.total + i.valorGlosado).toFixed(2);
      mapa.set(k, cur);
    }
  }

  return [...mapa.values()].sort((a, b) => b.total - a.total);
}

/** quanto DÁ para recorrer (o número da proposta comercial) */
export function valorRecorrivel(lote: LoteParsed): number {
  let t = 0;
  for (const g of lote.guias)
    for (const i of g.itens) if (i.recorrivel) t += i.valorGlosado;
  return +t.toFixed(2);
}
