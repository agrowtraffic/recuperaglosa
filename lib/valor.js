/* ============================================================
   Leitura de valor em dinheiro digitado por gente.

   O campo de "quanto a operadora pagou" recebe o que a pessoa tem na
   mão: um extrato, um e-mail, um demonstrativo. Ela vai digitar
   "1.234,50", "1234,50", "R$ 1.234,50" ou colar "1234.50" de uma
   planilha. Tudo isso é o mesmo número.

   Um `parseFloat` simples erra feio aqui: parseFloat('1.234,50') dá
   1.234 — a clínica registraria um real e vinte e três centavos onde
   recuperou mil e duzentos.
   ============================================================ */

/**
 * Converte texto em número. Devolve null quando não dá para afirmar
 * que a pessoa digitou um valor — null é "não sei", não zero.
 *
 * @param {string|number|null|undefined} entrada
 * @returns {number|null}
 */
export function parseValorBRL(entrada) {
  if (entrada == null) return null;
  if (typeof entrada === 'number') {
    return Number.isFinite(entrada) && entrada >= 0 ? arredondar(entrada) : null;
  }

  /* Fora dígitos e separadores: some "R$", espaço, espaço fino que vem
     de PDF, e o não-quebrável que vem de site. */
  const limpo = String(entrada).replace(/[^\d.,-]/g, '');
  if (!limpo || !/\d/.test(limpo)) return null;

  // Negativo não é recuperação. Rejeita em vez de virar positivo calado.
  if (limpo.includes('-')) return null;

  const temVirgula = limpo.includes(',');
  const temPonto = limpo.includes('.');

  let normalizado;

  if (temVirgula && temPonto) {
    /* Os dois presentes: o que aparece por último é o decimal, e o
       outro é separador de milhar. Cobre "1.234,50" (pt-BR) e
       "1,234.50" (planilha em inglês) sem precisar adivinhar locale. */
    const decimal = limpo.lastIndexOf(',') > limpo.lastIndexOf('.') ? ',' : '.';
    const milhar = decimal === ',' ? '.' : ',';
    normalizado = limpo.split(milhar).join('').replace(decimal, '.');
  } else if (temVirgula) {
    // Só vírgula, num app em português: é o decimal.
    normalizado = limpo.replace(',', '.');
  } else if (temPonto) {
    /* Só ponto, e aí mora a ambiguidade: "1.234" é mil e duzentos (pt-BR)
       ou um e pouco (planilha)? Decide pelo formato: um único ponto com
       uma ou duas casas depois é decimal — ninguém escreve milhar com
       dois dígitos. O resto é separador de milhar. */
    const partes = limpo.split('.');
    const ultima = partes[partes.length - 1];
    normalizado =
      partes.length === 2 && ultima.length > 0 && ultima.length <= 2
        ? limpo
        : partes.join('');
  } else {
    normalizado = limpo;
  }

  const n = Number(normalizado);
  if (!Number.isFinite(n) || n < 0) return null;

  return arredondar(n);
}

/* Centavos são a unidade real — evita 0.1+0.2 aparecendo na tela. */
function arredondar(n) {
  return Math.round(n * 100) / 100;
}

/** Formata para exibição/prefill do input, sem o "R$". */
export function formatarValorInput(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return '';
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
