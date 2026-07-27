// Valida formato de CNPJ (aceita com ou sem máscara)
export function validarCNPJ(cnpj) {
  if (!cnpj || cnpj.trim() === '') return true; // campo opcional

  const numeros = cnpj.replace(/\D/g, '');

  // Deve ter 14 dígitos
  if (numeros.length !== 14) return false;

  // Rejeita sequências repetidas (111...111, 000...000, etc.)
  if (/^(\d)\1{13}$/.test(numeros)) return false;

  // Validar dígitos verificadores (algoritmo oficial)
  const calcularDV = (base) => {
    let multiplicador = base.length === 8 ? 5 : 6;
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base[i]) * multiplicador;
      multiplicador = multiplicador === 2 ? 9 : multiplicador - 1;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const base1 = numeros.substring(0, 8);
  const dv1 = calcularDV(base1);

  const base2 = numeros.substring(0, 8) + dv1;
  const dv2 = calcularDV(base2);

  return dv1.toString() === numeros[8] && dv2.toString() === numeros[9];
}
