import { readFileSync } from "node:fs";
import { parseDemonstrativo, glosaPorMotivo, valorRecorrivel } from "./tiss/parser";
import { gerarRecurso } from "./tiss/recurso";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const arquivos = [
  "fixtures/demonstrativo-1.xml",
  "fixtures/demonstrativo-2.xml",
  "fixtures/demonstrativo-3.xml",
  "fixtures/demonstrativo-4-recorrivel.xml",
];

for (const f of arquivos) {
  const lote = parseDemonstrativo(readFileSync(f, "utf8"));

  console.log("\n" + "=".repeat(62));
  console.log(`${f}  →  ${lote.operadora ?? "?"} | comp. ${lote.competencia ?? "?"}`);
  console.log("=".repeat(62));
  console.log(
    `Apresentado ${brl(lote.totalApresentado)} | Pago ${brl(lote.totalPago)} | ` +
      `GLOSADO ${brl(lote.totalGlosado)}`,
  );
  console.log(`Recorrível (vale a pena brigar): ${brl(valorRecorrivel(lote))}`);
  console.log(`Guias: ${lote.guias.length}`);

  console.log("\n-- Glosa por motivo --");
  for (const m of glosaPorMotivo(lote)) {
    console.log(
      `  [${m.codigo}] ${m.motivo}\n      ${m.qtd} item(ns) · ${brl(m.total)} · ${
        m.recorrivel ? "RECORRER" : "não recorrer"
      }`,
    );
  }

  if (lote.avisos.length) {
    console.log("\n-- Avisos --");
    lote.avisos.forEach((a) => console.log("  ! " + a));
  }
}

/* Exemplo de recurso gerado.

   Percorre as guias em vez de assumir a primeira: guia cujos itens são
   todos de glosa legítima (carência, prazo) não gera recurso — e isso é
   o comportamento certo, não uma falha. Antes daqui saía "undefined". */
const clinica = { nome: "CLINICA EXEMPLO LTDA", cnpj: "00.000.000/0001-00" };

console.log("\n" + "#".repeat(62));
console.log("EXEMPLO DE RECURSO GERADO");
console.log("#".repeat(62));

let achou = false;
for (const f of arquivos) {
  const lote = parseDemonstrativo(readFileSync(f, "utf8"));
  for (const guia of lote.guias) {
    const r = gerarRecurso(guia, lote, clinica);
    if (r) {
      console.log(`(${f} — guia ${guia.numeroGuia})\n`);
      console.log(r.texto);
      achou = true;
      break;
    }
  }
  if (achou) break;
}

if (!achou) {
  console.log(
    "Nenhuma guia dos fixtures gerou recurso — todos os itens glosados\n" +
      "caíram em motivo não recorrível. Se isso não era esperado, conferir\n" +
      "a ação atribuída aos códigos em src/tiss/motivos.ts.",
  );
}
