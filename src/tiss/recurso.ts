import type { GuiaParsed, LoteParsed } from "./parser.js";
import { motivo } from "./motivos.js";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/**
 * Gera o texto do recurso de glosa para UMA guia.
 * Só entra item recorrível — não desperdiça o tempo da clínica.
 */
export function gerarRecurso(
  guia: GuiaParsed,
  lote: LoteParsed,
  clinica: { nome: string; cnpj?: string },
): { texto: string; valorPleiteado: number } | null {
  const itens = guia.itens.filter((i) => i.recorrivel && i.valorGlosado > 0);
  if (itens.length === 0) return null;

  const valorPleiteado = +itens
    .reduce((s, i) => s + i.valorGlosado, 0)
    .toFixed(2);

  const linhas = itens
    .map((i, n) => {
      const m = motivo(i.codigoGlosa);
      return [
        `${n + 1}) Procedimento ${i.codigoTuss ?? "—"} — ${i.descricao ?? "sem descrição"}`,
        `   Apresentado: ${brl(i.valorApresentado)} | Pago: ${brl(i.valorPago)} | Glosado: ${brl(i.valorGlosado)}`,
        `   Motivo informado: ${i.codigoGlosa ?? "não informado"} — ${m.descricao}`,
        `   Contestação: ${m.argumento}`,
      ].join("\n");
    })
    .join("\n\n");

  const texto = `RECURSO DE GLOSA

Prestador: ${clinica.nome}${clinica.cnpj ? ` — CNPJ ${clinica.cnpj}` : ""}
Operadora: ${lote.operadora ?? "—"}${lote.registroAns ? ` (ANS ${lote.registroAns})` : ""}
Competência: ${lote.competencia ?? "—"}
Demonstrativo: ${lote.numeroDemonstrativo ?? "—"}
Guia do prestador: ${guia.numeroGuia}${guia.numeroGuiaOperadora ? ` | Guia operadora: ${guia.numeroGuiaOperadora}` : ""}
Beneficiário: ${guia.beneficiario ?? "—"}${guia.carteira ? ` — Carteira ${guia.carteira}` : ""}
Data do atendimento: ${guia.dataAtendimento ?? "—"}

Prezados,

Vimos, tempestivamente, apresentar recurso administrativo contra as glosas
aplicadas na guia acima, pelos fundamentos a seguir:

${linhas}

VALOR TOTAL PLEITEADO: ${brl(valorPleiteado)}

Requer-se a reanálise e o consequente reprocessamento dos valores glosados,
com o respectivo pagamento na próxima competência.

Atenciosamente,
${clinica.nome}
`;

  return { texto, valorPleiteado };
}

export function gerarTodosRecursos(
  lote: LoteParsed,
  clinica: { nome: string; cnpj?: string },
) {
  return lote.guias
    .map((g) => ({ guia: g.numeroGuia, ...(gerarRecurso(g, lote, clinica) ?? {}) }))
    .filter((r) => r.texto);
}
