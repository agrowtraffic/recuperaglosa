import { MOTIVOS, motivo, TOTAL_CODIGOS_OFICIAIS, descricaoLegivel, type Acao } from './tiss/motivos';

let falhas = 0;
function ok(cond: boolean, msg: string) {
  if (!cond) { console.log('  ✗ ' + msg); falhas++; }
  else console.log('  ✓ ' + msg);
}

console.log('\n=== Volume ===');
ok(TOTAL_CODIGOS_OFICIAIS === 603, `603 códigos oficiais (achou ${TOTAL_CODIGOS_OFICIAIS})`);

console.log('\n=== Descrições oficiais (as que estavam erradas antes) ===');
ok(MOTIVOS['1001'].descricao === 'NÚMERO DA CARTEIRA INVÁLIDO', '1001 = NÚMERO DA CARTEIRA INVÁLIDO');
ok(MOTIVOS['1010'].descricao === 'ASSINATURA DO TITULAR / RESPONSÁVEL INEXISTENTE', '1010 = ASSINATURA DO TITULAR');
ok(MOTIVOS['1301'].descricao === 'TIPO GUIA INVÁLIDO', '1301 = TIPO GUIA INVÁLIDO');
ok(MOTIVOS['1401'].descricao === 'ACOMODAÇÃO NÃO AUTORIZADA', '1401 = ACOMODAÇÃO NÃO AUTORIZADA');

console.log('\n=== Não recorrer de uma vitória ===');
for (const c of ['3095', '3092', '3088', '3093', '1717', '1722', '1727', '1721']) {
  ok(MOTIVOS[c].acao === 'favoravel' && !MOTIVOS[c].recorrivel, `${c} é favorável e não gera recurso`);
}

console.log('\n=== Prazo perdido / decisão final ===');
for (const c of ['1701', '2907', '2909', '2902', '2904', '1718', '1719', '3091']) {
  ok(MOTIVOS[c].acao === 'sem_recurso' && !MOTIVOS[c].recorrivel, `${c} não gera recurso`);
}

console.log('\n=== Limite contratual ===');
for (const c of ['1007', '1009', '1012', '1015', '1018', '1025', '3097']) {
  ok(MOTIVOS[c].acao === 'sem_recurso', `${c} é limite contratual`);
}

console.log('\n=== Falta documento (ação ≠ recorrer) ===');
for (const c of ['3081', '3080', '3067', '3052', '3047', '1709', '2004', '3058', '3059']) {
  ok(MOTIVOS[c].acao === 'enviar_documento' && !MOTIVOS[c].recorrivel, `${c} pede documento`);
}

console.log('\n=== Aguardando operadora ===');
for (const c of ['3019', '3051', '1736']) {
  ok(MOTIVOS[c].acao === 'aguardar' && !MOTIVOS[c].recorrivel, `${c} é aguardar`);
}

console.log('\n=== Casos que DEVEM gerar recurso ===');
for (const c of ['1702', '3007', '1402', '1403', '1412', '2601', '3002', '3096', '1305']) {
  ok(MOTIVOS[c].recorrivel, `${c} gera recurso`);
}

console.log('\n=== Categoria por faixa ===');
ok(MOTIVOS['1001'].categoria === 'beneficiario', '10xx -> beneficiario');
ok(MOTIVOS['3001'].categoria === 'odontologico', '30xx -> odontologico');
ok(MOTIVOS['5001'].categoria === 'comunicacao', '50xx -> comunicacao');
ok(!MOTIVOS['5001'].recorrivel, '50xx não gera recurso (erro de arquivo)');

console.log('\n=== Código desconhecido ===');
const inventado = motivo('9999');
ok(inventado.oficial === false, '9999 volta oficial:false');
ok(inventado.descricao.includes('9999'), '9999 diz que não é oficial');
const semCodigo = motivo(undefined);
ok(semCodigo.recorrivel === true, 'sem código gera recurso (glosa infundada)');
ok(semCodigo.oficial === false, 'sem código é oficial:false');

const daFaixa = motivo('1099');
ok(daFaixa.categoria === 'beneficiario', '1099 (fora da tabela) herda faixa 10xx');

console.log('\n=== Todos os campos preenchidos ===');
const vazios = Object.values(MOTIVOS).filter(
  (m) => !m.descricao || !m.argumento || !m.categoria || !m.acao
);
ok(vazios.length === 0, `nenhum motivo com campo vazio (achou ${vazios.length})`);

const semCategoria = Object.values(MOTIVOS).filter((m) => m.categoria === 'outro');
ok(semCategoria.length === 0, `toda faixa mapeada (${semCategoria.length} caíram em 'outro')`);

console.log('\n=== Distribuição de ações ===');
const dist: Record<string, number> = {};
for (const m of Object.values(MOTIVOS)) dist[m.acao] = (dist[m.acao] ?? 0) + 1;
for (const [a, n] of Object.entries(dist).sort((x, y) => y[1] - x[1])) {
  console.log(`  ${a.padEnd(22)} ${String(n).padStart(3)}  (${((n / 603) * 100).toFixed(1)}%)`);
}

console.log('\n=== Rótulo legível ===');
console.log('  1001 ->', descricaoLegivel('1001'));
console.log('  3095 ->', descricaoLegivel('3095'));

console.log(falhas === 0 ? '\n✅ TUDO PASSOU\n' : `\n❌ ${falhas} FALHA(S)\n`);
process.exit(falhas === 0 ? 0 : 1);
