/* Testes do parser de valor em dinheiro.

   O campo de "quanto a operadora pagou" alimenta o card "Recuperado"
   do funil. Errar a leitura aqui não quebra a tela — só reporta um
   número errado, que é pior, porque ninguém percebe.

   Rodar: npx tsx src/testar-valor.ts */
import { parseValorBRL, formatarValorInput } from '../lib/valor.js';

let falhas = 0;

function eq(entrada: unknown, esperado: number | null, nota = '') {
  const obtido = parseValorBRL(entrada as string);
  const ok = obtido === esperado;
  if (!ok) falhas++;
  // JSON.stringify(undefined) devolve undefined, não string — daí o ??.
  const rotulo = JSON.stringify(entrada) ?? String(entrada);
  console.log(
    `  ${ok ? '✓' : '✗'} ${rotulo.padEnd(16)} -> ${String(obtido).padEnd(10)}` +
      (ok ? '' : ` ESPERADO ${esperado}`) +
      (nota ? `   (${nota})` : ''),
  );
}

console.log('\n=== Formato brasileiro ===');
eq('300', 300);
eq('300,50', 300.5);
eq('1.234,50', 1234.5, 'ponto de milhar + vírgula decimal');
eq('1.234.567,89', 1234567.89);
eq('0,05', 0.05, 'cinco centavos');
eq('300,5', 300.5, 'uma casa decimal');

console.log('\n=== Colado de planilha em inglês ===');
eq('300.50', 300.5, 'ponto decimal, duas casas');
eq('1,234.50', 1234.5, 'vírgula de milhar + ponto decimal');
eq('300.5', 300.5, 'ponto decimal, uma casa');

console.log('\n=== Ambiguidade do ponto sozinho ===');
eq('1.234', 1234, 'três casas depois do ponto = milhar, não decimal');
eq('1.234.567', 1234567);
eq('12.34', 12.34, 'duas casas = decimal');

console.log('\n=== Com símbolo e espaços ===');
eq('R$ 300,50', 300.5);
eq('  R$1.234,50  ', 1234.5);
eq('R$ 300,50', 300.5, 'espaço não-quebrável, comum ao copiar de site');

console.log('\n=== Entradas que não são valor ===');
eq('', null);
eq('   ', null);
eq('abc', null);
eq('R$', null, 'símbolo sem número');
eq(null, null);
eq(undefined, null);
eq('-50', null, 'negativo não é recuperação');
eq('-1.234,50', null);

console.log('\n=== Número direto ===');
eq(300.5, 300.5);
eq(0, 0);
eq(NaN, null);
eq(Infinity, null);
eq(-10, null);

console.log('\n=== Arredondamento para centavos ===');
eq('300,555', 300.56, 'meio centavo arredonda para cima');
eq('0,001', 0, 'abaixo de meio centavo vira zero');

console.log('\n=== O erro que motivou este parser ===');
{
  const ingenuo = parseFloat('1.234,50');
  const correto = parseValorBRL('1.234,50');
  const ok = correto === 1234.5 && ingenuo !== correto;
  if (!ok) falhas++;
  console.log(
    `  ${ok ? '✓' : '✗'} parseFloat('1.234,50') = ${ingenuo} (errado) ` +
      `vs parseValorBRL = ${correto} (certo)`,
  );
}

console.log('\n=== Formatação de volta ===');
{
  const casos: [number, string][] = [
    [1234.5, '1.234,50'],
    [300, '300,00'],
    [0.05, '0,05'],
  ];
  for (const [n, esperado] of casos) {
    const obtido = formatarValorInput(n);
    const ok = obtido === esperado;
    if (!ok) falhas++;
    console.log(`  ${ok ? '✓' : '✗'} ${n} -> "${obtido}"` + (ok ? '' : ` ESPERADO "${esperado}"`));
  }
}

console.log('\n=== Ida e volta ===');
{
  for (const n of [1234.5, 300, 0.05, 999999.99]) {
    const voltou = parseValorBRL(formatarValorInput(n));
    const ok = voltou === n;
    if (!ok) falhas++;
    console.log(`  ${ok ? '✓' : '✗'} ${n} -> "${formatarValorInput(n)}" -> ${voltou}`);
  }
}

console.log(falhas === 0 ? '\n✅ TUDO PASSOU\n' : `\n❌ ${falhas} FALHA(S)\n`);
process.exit(falhas === 0 ? 0 : 1);
