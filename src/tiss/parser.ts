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
 *
 * Estrutura oficial (demonstrativo de análise de conta, esquema oficial 4.03.00):
 *   dadosProtocolo > relacaoGuias > detalhesGuia > relacaoGlosa
 * Um item pode trazer várias glosas. Cada código vira uma linha própria,
 * com os valores do procedimento repetidos e só a sua parte em
 * valorGlosado. Por isso totais de apresentado e pago são somados por
 * procedimento, nunca por linha.
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

const centavos = (n: number) => +n.toFixed(2);

/** código de um nó de motivo (motivoGlosaGuia, GlosaProtocolo) */
const codigoDoMotivo = (no: unknown): string | undefined =>
  txt(pick(arr(no as any)[0], "codigoGlosa"));

/**
 * Divide a glosa CALCULADA de um item entre os códigos de relacaoGlosa.
 * Os valores da operadora só definem a proporção: a soma das partes é
 * sempre a diferença recalculada. Códigos sem tese de recurso entram
 * primeiro, para uma soma inflada nunca aumentar o valor pleiteado. O que
 * sobrar sem explicação fica sem código.
 */
function repartirGlosa(
  total: number,
  glosas: { codigo?: string; valor: number }[],
): { codigo?: string; valor: number }[] {
  const porCodigo = new Map<string | undefined, number>();
  for (const g of glosas) porCodigo.set(g.codigo, (porCodigo.get(g.codigo) ?? 0) + g.valor);
  const unicas = [...porCodigo].map(([codigo, valor]) => ({ codigo, valor }));

  if (unicas.length === 1) return [{ codigo: unicas[0].codigo, valor: total }];

  const prioridade = [...unicas].sort(
    (a, b) => Number(motivo(a.codigo).recorrivel) - Number(motivo(b.codigo).recorrivel),
  );

  let resto = total;
  const partes: { codigo?: string; valor: number }[] = [];
  for (const g of prioridade) {
    const valor = centavos(Math.min(g.valor, resto));
    if (valor <= 0) continue;
    partes.push({ codigo: g.codigo, valor });
    resto = centavos(resto - valor);
  }
  // as linhas saem na ordem em que o arquivo traz os códigos
  const posicao = (c?: string) => unicas.findIndex((u) => u.codigo === c);
  partes.sort((a, b) => posicao(a.codigo) - posicao(b.codigo));
  if (resto > 0) partes.push({ codigo: undefined, valor: resto });
  return partes;
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
  /* Motivo informado no protocolo inteiro: vale para as guias dele quando
     nem o item nem a guia dizem o código. */
  const glosaDoProtocolo = new Map<unknown, string>();
  for (const prot of findAll(doc, "dadosProtocolo")) {
    const codigo = codigoDoMotivo(pick(prot, "GlosaProtocolo"));
    if (!codigo) continue;
    for (const g of findAll(prot, "relacaoGuias")) glosaDoProtocolo.set(g, codigo);
  }

  const nosGuia = findAll(
    doc,
    "relacaoGuias",
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
      "detalhesGuia",
      "procedimento",
      "itemGuia",
      "procedimentoExecutado",
      "servicoExecutado",
      "detalheGuia",
    );

    const glosaDaGuia =
      codigoDoMotivo(pick(g, "motivoGlosaGuia")) ?? glosaDoProtocolo.get(g);

    const itens: ItemParsed[] = [];
    // somados por procedimento: um item com duas glosas ocupa duas linhas
    let somaAp = 0;
    let somaPg = 0;
    let dataDoItem: string | undefined;

    const incluir = (
      it: any,
      valorApresentado: number,
      valorPago: number,
    ) => {
      const glosas = arr<any>(pick(it, "relacaoGlosa")).map((r) => {
        const tipo = pick(r, "tipoGlosa", "codigoGlosa");
        return {
          codigo: txt(tipo) ?? txt(pick(tipo, "codigoGlosa")),
          valor: num(pick(r, "valorGlosa")),
        };
      });
      const valorGlosadoOperadora = glosas.length
        ? centavos(glosas.reduce((s, x) => s + x.valor, 0))
        : num(pick(it, "valorGlosa", "valorGlosado"));

      // regra de ouro: recalculamos. Se divergir do campo da operadora, avisamos.
      const valorGlosado = Math.max(0, centavos(valorApresentado - valorPago));
      if (
        valorGlosadoOperadora > 0 &&
        Math.abs(valorGlosadoOperadora - valorGlosado) > 0.01
      ) {
        avisos.push(
          `Guia ${numeroGuia}: valor de glosa informado (${valorGlosadoOperadora}) diverge do calculado (${valorGlosado}).`,
        );
      }

      if (valorApresentado === 0 && valorPago === 0) return;

      somaAp += valorApresentado;
      somaPg += valorPago;

      const proc = pick(it, "procedimento");
      const codigoProprio = txt(
        pick(it, "codigoGlosa", "motivoGlosa", "codGlosa"),
      );
      const partes =
        glosas.length && valorGlosado > 0
          ? repartirGlosa(valorGlosado, glosas)
          : [{
              codigo: codigoProprio ?? (valorGlosado > 0 ? glosaDaGuia : undefined),
              valor: valorGlosado,
            }];

      for (const parte of partes) {
        const m = motivo(parte.codigo);
        itens.push({
          codigoTuss: txt(
            pick(it, "codigoProcedimento", "codigoTUSS", "codigoItem") ??
              pick(proc, "codigoProcedimento"),
          ),
          descricao: txt(
            pick(it, "descricaoProcedimento", "descricao") ??
              pick(proc, "descricaoProcedimento"),
          ),
          quantidade:
            num(pick(it, "quantidadeExecutada", "qtdExecutada", "quantidade")) || 1,
          valorApresentado,
          valorPago,
          valorGlosado: parte.valor,
          codigoGlosa: parte.codigo,
          motivoGlosa: m.descricao,
          recorrivel: parte.valor > 0 ? m.recorrivel : false,
        });
      }
    };

    for (const it of nosItem) {
      if (!it || typeof it !== "object") continue;
      dataDoItem ??= txt(pick(it, "dataRealizacao"));
      incluir(
        it,
        num(pick(it, "valorApresentado", "valorInformado", "valorProcedimento")),
        num(pick(it, "valorPago", "valorLiberado")),
      );
    }

    /* No esquema oficial detalhesGuia é opcional: a guia pode trazer só
       os próprios totais. */
    if (nosItem.length === 0 && pick(g, "valorInformadoGuia") !== undefined) {
      incluir(
        { descricao: "Guia sem detalhamento por item" },
        num(pick(g, "valorInformadoGuia")),
        num(pick(g, "valorLiberadoGuia")),
      );
    }

    guias.push({
      numeroGuia,
      numeroGuiaOperadora: txt(pick(g, "numeroGuiaOperadora")),
      beneficiario: txt(pick(g, "nomeBeneficiario", "beneficiario")),
      carteira: txt(pick(g, "numeroCarteira", "carteira")),
      dataAtendimento:
        txt(pick(g, "dataAtendimento", "dataExecucao", "dataRealizacao", "dataInicioFat")) ??
        dataDoItem,
      valorApresentado: centavos(somaAp),
      valorPago: centavos(somaPg),
      valorGlosado: centavos(somaAp - somaPg),
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
