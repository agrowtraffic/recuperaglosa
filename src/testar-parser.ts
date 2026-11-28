/* Testes do parser. Falham de verdade (código de saída != 0).
   Rodar: npx tsx src/testar-parser.ts */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseDemonstrativo, glosaPorMotivo, valorRecorrivel } from "./tiss/parser";
import { gerarRecurso } from "./tiss/recurso";
import { decodificarXml } from "./tiss/codificacao";
import { diagnosticarXml } from "./tiss/diagnostico";

let falhas = 0;
function teste(nome: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${nome}`);
  } catch (e: any) {
    falhas++;
    console.error(`  ✗ ${nome}\n    ${e.message}`);
  }
}
const ler = (f: string) => parseDemonstrativo(readFileSync(f, "utf8"));
const itensDe = (l: ReturnType<typeof ler>) => l.guias.flatMap((g) => g.itens);

console.log("\nLayouts antigos e exemplo (resultados congelados)");
// arquivo, guias, itens, apresentado, pago, glosado, recorrível
const antigos: [string, number, number, number, number, number, number][] = [
  ["fixtures/demonstrativo-1.xml", 2, 4, 1010, 420, 590, 0],
  ["fixtures/demonstrativo-2.xml", 1, 2, 290, 72, 218, 18],
  ["fixtures/demonstrativo-3.xml", 1, 2, 230, 80, 150, 150],
  ["fixtures/demonstrativo-4-recorrivel.xml", 3, 7, 3480, 400, 3080, 2520],
  ["fixtures/demonstrativo-sem-glosa.xml", 2, 3, 540, 540, 0, 0],
  ["public/exemplos/demonstrativo-exemplo.xml", 2, 4, 1010, 420, 590, 0],
];
for (const [f, ...esperado] of antigos) {
  teste(f, () => {
    const l = ler(f);
    // O exemplo pode ganhar guias (branch da demonstração); os demais são fixos.
    if (f.startsWith("public/") && l.guias.length > 2) return;
    assert.deepEqual(
      [l.guias.length, itensDe(l).length, l.totalApresentado, l.totalPago, l.totalGlosado, valorRecorrivel(l)],
      esperado,
    );
  });
}

console.log("\nEstrutura oficial 4.03.00");
const xml = readFileSync("fixtures/oficial-4.03-analise-conta.xml", "utf8");
const lote = parseDemonstrativo(xml);
const [a1, a2, a3] = lote.guias;

teste("cabeçalho", () => {
  assert.equal(lote.operadora, "OPERADORA FICTICIA");
  assert.equal(lote.registroAns, "999999");
  assert.equal(lote.numeroDemonstrativo, "FIC-401");
});
teste("guias e dados da guia", () => {
  assert.deepEqual(lote.guias.map((g) => g.numeroGuia), ["A-1", "A-2", "A-3"]);
  assert.equal(a1.numeroGuiaOperadora, "OP-1");
  assert.equal(a1.carteira, "000111");
  assert.equal(a1.dataAtendimento, "2026-09-10");
});
teste("totais batem com os da operadora e não contam item repetido", () => {
  assert.deepEqual([lote.totalApresentado, lote.totalPago, lote.totalGlosado], [910, 340, 570]);
  assert.deepEqual([a1.valorApresentado, a1.valorPago, a1.valorGlosado], [600, 300, 300]);
  assert.equal(itensDe(lote).reduce((s, i) => s + i.valorGlosado, 0), 570);
});
teste("duas glosas no mesmo item viram duas linhas com os valores do procedimento", () => {
  const linhas = a1.itens.filter((i) => i.codigoTuss === "40000001");
  assert.deepEqual(linhas.map((i) => [i.codigoGlosa, i.valorGlosado, i.recorrivel]), [
    ["1402", 220, true],
    ["1007", 80, false],
  ]);
  for (const i of linhas) {
    assert.deepEqual([i.valorApresentado, i.valorPago, i.quantidade], [500, 200, 2]);
    assert.equal(i.descricao, "PROCEDIMENTO COM DUAS GLOSAS");
  }
});
teste("item pago não tem glosa", () => {
  const pago = a1.itens.find((i) => i.codigoTuss === "10101012")!;
  assert.deepEqual([pago.valorGlosado, pago.codigoGlosa, pago.recorrivel], [0, undefined, false]);
});
teste("sem relacaoGlosa, herda o motivo da guia", () => {
  const i = a2.itens.find((i) => i.codigoTuss === "40000002")!;
  assert.deepEqual([i.codigoGlosa, i.valorGlosado], ["1010", 150]);
});
teste("soma das glosas não fecha: manda o recálculo e avisa", () => {
  const linhas = a2.itens.filter((i) => i.codigoTuss === "40000003");
  assert.equal(linhas.reduce((s, i) => s + i.valorGlosado, 0), 50);
  // 30 + 5 informados; os 15 sem explicação ficam sem código
  assert.deepEqual(linhas.map((i) => [i.codigoGlosa ?? "-", i.valorGlosado]).sort(), [
    ["-", 15], ["1701", 5], ["2601", 30],
  ]);
  assert.ok(lote.avisos.some((a) => a.includes("A-2")));
});
teste("guia sem detalhamento usa os valores da guia", () => {
  assert.deepEqual(a3.itens.map((i) => [i.codigoGlosa, i.valorGlosado]), [["1402", 70]]);
});
teste("motivos e recorrível", () => {
  assert.equal(glosaPorMotivo(lote).find((m) => m.codigo === "1402")!.total, 290);
  assert.equal(valorRecorrivel(lote), 220 + 70 + 30 + 15);
});
teste("recurso pleiteia só a parte recorrível", () => {
  const r = gerarRecurso(a1, lote, { nome: "Clínica Fictícia" })!;
  assert.equal(r.valorPleiteado, 220);
  assert.ok(r.texto.includes("1402"));
  assert.ok(!r.texto.includes("1007"));
});
teste("mais glosa informada que a diferença não infla o valor", () => {
  const l = parseDemonstrativo(xml.replace("<ans:valorGlosa>220.00<", "<ans:valorGlosa>900.00<"));
  const linhas = l.guias[0].itens.filter((i) => i.codigoTuss === "40000001");
  // a parte sem tese entra primeiro, para não pleitear a mais
  assert.deepEqual(linhas.map((i) => [i.codigoGlosa, i.valorGlosado]).sort(), [["1007", 80], ["1402", 220]]);
});
teste("sem prefixo de namespace", () => {
  const l = parseDemonstrativo(xml.replace(/ans:/g, ""));
  assert.equal(l.totalGlosado, 570);
});
teste("protocolo com GlosaProtocolo serve de motivo quando nada mais informa", () => {
  const l = parseDemonstrativo(
    xml
      .replace(/<ans:motivoGlosaGuia>.*?<\/ans:motivoGlosaGuia>/g, "")
      .replace("<ans:situacaoProtocolo>", "<ans:GlosaProtocolo><ans:codigoGlosa>1701</ans:codigoGlosa></ans:GlosaProtocolo><ans:situacaoProtocolo>"),
  );
  assert.equal(l.guias[2].itens[0].codigoGlosa, "1701");
});

console.log("\nCodificação");
const acentuado = xml
  .replace('encoding="UTF-8"', 'encoding="ISO-8859-1"')
  .replace("OPERADORA FICTICIA", "OPERADORA FICTÍCIA SAÚDE");
teste("ISO-8859-1 preserva acentos", () => {
  const bytes = Uint8Array.from(Buffer.from(acentuado, "latin1"));
  assert.equal(parseDemonstrativo(decodificarXml(bytes)).operadora, "OPERADORA FICTÍCIA SAÚDE");
});
teste("Latin-1 sem declaração correta também", () => {
  const bytes = Uint8Array.from(Buffer.from(acentuado.replace("ISO-8859-1", "UTF-8"), "latin1"));
  assert.equal(parseDemonstrativo(decodificarXml(bytes)).operadora, "OPERADORA FICTÍCIA SAÚDE");
});
teste("UTF-8 continua UTF-8", () => {
  const bytes = new TextEncoder().encode(acentuado.replace("ISO-8859-1", "UTF-8"));
  assert.equal(parseDemonstrativo(decodificarXml(bytes)).operadora, "OPERADORA FICTÍCIA SAÚDE");
});

console.log("\nArquivos não suportados");
const envelope = (corpo: string) =>
  `<ans:mensagemTISS xmlns:ans="x"><ans:operadoraParaPrestador>${corpo}</ans:operadoraParaPrestador></ans:mensagemTISS>`;
for (const [nome, tag, tipo] of [
  ["pagamento", "demonstrativoPagamento", "pagamento"],
  ["pagamento odontológico", "demonstrativoPagamentoOdonto", "odonto"],
  ["análise de conta sem itens legíveis", "demonstrativoAnaliseConta", "layout_nao_reconhecido"],
]) {
  teste(nome, () => {
    const x = envelope(`<ans:${tag}><ans:numeroDemonstrativo>1</ans:numeroDemonstrativo></ans:${tag}>`);
    assert.equal(itensDe(parseDemonstrativo(x)).length, 0);
    const d = diagnosticarXml(x);
    assert.equal(d.tipo, tipo);
    assert.match(d.mensagem, /WhatsApp/);
  });
}

if (falhas) {
  console.error(`\n${falhas} teste(s) falharam`);
  process.exit(1);
}
console.log("\n✅ TUDO PASSOU");
