/* Testes da matemática dos relatórios.

   Estes números vão para a tela como "sua taxa de reversão com a
   operadora X é 40%". Se estiverem errados, ninguém percebe — e a
   clínica toma decisão de onde investir tempo com base neles.

   Rodar: npx tsx src/testar-relatorios.ts */
import {
  diasEntre,
  desempenhoPorOperadora,
  recursosAguardando,
  resumoDosRecursos,
} from '../lib/relatorios.js';

let falhas = 0;
function ok(cond: boolean, msg: string) {
  if (!cond) { console.log('  ✗ ' + msg); falhas++; }
  else console.log('  ✓ ' + msg);
}

const r = (over: Record<string, unknown> = {}) => ({
  id: Math.random().toString(36).slice(2),
  operadora: 'ALFA',
  status: 'rascunho',
  valor: 100,
  valorRecuperado: null,
  enviadoEmISO: null,
  resolvidoEmISO: null,
  ...over,
});

console.log('\n=== diasEntre ===');
ok(diasEntre('2026-07-01T10:00:00Z', '2026-07-11T10:00:00Z') === 10, '10 dias');
ok(diasEntre('2026-07-01T23:00:00Z', '2026-07-02T01:00:00Z') === 1, 'vira o dia, mesmo com 2h de diferença');
ok(diasEntre(null, '2026-07-01T00:00:00Z') === null, 'sem início devolve null');
ok(diasEntre('2026-07-01T00:00:00Z', null) === null, 'sem fim devolve null');
ok(diasEntre('lixo', '2026-07-01T00:00:00Z') === null, 'data inválida devolve null');

console.log('\n=== Rascunho não conta como envio ===');
{
  const d = desempenhoPorOperadora([r(), r(), r()]);
  ok(d.length === 0, 'só rascunho -> nenhuma operadora avaliada');
}

console.log('\n=== Aguardando não entra na taxa ===');
{
  const d = desempenhoPorOperadora([
    r({ status: 'enviado' }),
    r({ status: 'enviado' }),
  ]);
  ok(d[0].enviados === 2, '2 enviados');
  ok(d[0].aguardando === 2, '2 aguardando');
  ok(d[0].decididos === 0, 'nenhum decidido');
  ok(d[0].taxaQtd === null, 'taxa por qtd é null, não 0%');
  ok(d[0].taxaValor === null, 'taxa por valor é null, não 0%');
}

console.log('\n=== Taxa por quantidade vs por valor ===');
{
  /* O caso que motivou as duas taxas: a operadora aceita TODOS os
     recursos, mas paga só um quinto de cada. */
  const d = desempenhoPorOperadora([
    r({ status: 'ganho', valor: 1000, valorRecuperado: 200 }),
    r({ status: 'ganho', valor: 1000, valorRecuperado: 200 }),
  ]);
  ok(d[0].taxaQtd === 100, '100% dos recursos aceitos');
  ok(d[0].taxaValor === 20, 'mas só 20% do valor voltou');
  ok(d[0].recuperado === 400, 'recuperado = 400, não 2000');
}

console.log('\n=== Aceite integral (valorRecuperado nulo) ===');
{
  const d = desempenhoPorOperadora([
    r({ status: 'ganho', valor: 300, valorRecuperado: null }),
  ]);
  ok(d[0].recuperado === 300, 'nulo em ganho = aceite integral, cai no pleiteado');
  ok(d[0].taxaValor === 100, '100% por valor');
}

console.log('\n=== Perdido derruba a taxa, não o recuperado ===');
{
  const d = desempenhoPorOperadora([
    r({ status: 'ganho', valor: 100, valorRecuperado: 100 }),
    r({ status: 'perdido', valor: 300 }),
  ]);
  ok(d[0].decididos === 2, '2 decididos');
  ok(d[0].taxaQtd === 50, '50% por quantidade');
  ok(d[0].taxaValor === 25, '25% por valor (100 de 400 pleiteados)');
  ok(d[0].recuperado === 100, 'recuperado ignora o perdido');
}

console.log('\n=== Tempo médio de resposta ===');
{
  const d = desempenhoPorOperadora([
    r({ status: 'ganho', enviadoEmISO: '2026-06-01T12:00:00Z', resolvidoEmISO: '2026-06-11T12:00:00Z' }),
    r({ status: 'perdido', enviadoEmISO: '2026-06-01T12:00:00Z', resolvidoEmISO: '2026-06-21T12:00:00Z' }),
  ]);
  ok(d[0].diasMedios === 15, 'média de 10 e 20 dias = 15');
}
{
  const d = desempenhoPorOperadora([
    r({ status: 'ganho', enviadoEmISO: null, resolvidoEmISO: null }),
  ]);
  ok(d[0].diasMedios === null, 'sem datas, não inventa média');
}

console.log('\n=== Separa por operadora e ordena por recuperado ===');
{
  const d = desempenhoPorOperadora([
    r({ operadora: 'ALFA', status: 'ganho', valor: 100, valorRecuperado: 100 }),
    r({ operadora: 'BETA', status: 'ganho', valor: 900, valorRecuperado: 900 }),
    r({ operadora: 'BETA', status: 'enviado', valor: 50 }),
  ]);
  ok(d.length === 2, 'duas operadoras');
  ok(d[0].operadora === 'BETA', 'BETA primeiro, recuperou mais');
  ok(d[0].enviados === 2 && d[0].aguardando === 1, 'BETA: 2 enviados, 1 aguardando');
  ok(d[1].operadora === 'ALFA', 'ALFA depois');
}

console.log('\n=== Fila de espera ===');
{
  const agora = new Date('2026-07-30T12:00:00Z');
  const fila = recursosAguardando(
    [
      r({ id: 'novo', status: 'enviado', enviadoEmISO: '2026-07-25T12:00:00Z' }),
      r({ id: 'velho', status: 'enviado', enviadoEmISO: '2026-06-01T12:00:00Z' }),
      r({ id: 'ganho', status: 'ganho' }),
      r({ id: 'rascunho', status: 'rascunho' }),
    ],
    agora,
  );
  ok(fila.length === 2, 'só os enviados entram na fila');
  ok(fila[0].id === 'velho', 'o que espera há mais tempo vem primeiro');
  ok(fila[0].diasEsperando === 59, 'velho espera há 59 dias');
  ok(fila[1].diasEsperando === 5, 'novo espera há 5 dias');
}

console.log('\n=== Resumo geral ===');
{
  const res = resumoDosRecursos([
    r({ status: 'rascunho', valor: 50 }),
    r({ status: 'enviado', valor: 200 }),
    r({ status: 'ganho', valor: 300, valorRecuperado: 200 }),
    r({ status: 'perdido', valor: 100 }),
  ]);
  ok(res.gerados === 4, '4 gerados');
  ok(res.enviados === 3, '3 saíram da clínica (rascunho não conta)');
  ok(res.aguardando === 1, '1 aguardando resposta');
  ok(res.decididos === 2, '2 decididos');
  ok(res.recuperado === 200, 'recuperado usa o valor parcial');
  ok(res.taxaQtd === 50, '50% por quantidade');
  ok(res.taxaValor === 50, '50% por valor (200 de 400)');
}

console.log('\n=== Lista vazia não quebra ===');
{
  ok(desempenhoPorOperadora([]).length === 0, 'desempenho de lista vazia');
  ok(recursosAguardando([]).length === 0, 'fila de lista vazia');
  const res = resumoDosRecursos([]);
  ok(res.taxaQtd === null && res.taxaValor === null, 'sem recursos, taxas são null');
  ok(res.recuperado === 0, 'recuperado zero');
}

console.log(falhas === 0 ? '\n✅ TUDO PASSOU\n' : `\n❌ ${falhas} FALHA(S)\n`);
process.exit(falhas === 0 ? 0 : 1);
