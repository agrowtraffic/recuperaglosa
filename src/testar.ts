import { readFileSync } from "node:fs";
import { parseDemonstrativo, glosaPorMotivo, valorRecorrivel } from "./tiss/parser.js";
import { gerarRecurso } from "./tiss/recurso.js";

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const arquivos = [
  "fixtures/demonstrativo-1.xml",
  "fixtures/demonstrativo-2.xml",
  "fixtures/demonstrativo-3.xml",
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

// exemplo de recurso gerado
const lote1 = parseDemonstrativo(readFileSync(arquivos[0], "utf8"));
const r = gerarRecurso(lote1.guias[0], lote1, {
  nome: "CLINICA EXEMPLO LTDA",
  cnpj: "00.000.000/0001-00",
});

console.log("\n" + "#".repeat(62));
console.log("EXEMPLO DE RECURSO GERADO");
console.log("#".repeat(62));
console.log(r?.texto);
