// Valida formato de CNPJ (aceita com ou sem máscara)
export function validarCNPJ(cnpj) {
  if (!cnpj || cnpj.trim() === '') return true; // campo opcional

  const numeros = cnpj.replace(/\D/g, '');

  // Deve ter 14 dígitos
  if (numeros.length !== 14) return false;

  // Rejeita sequências repetidas (111...111, 000...000, etc.)
  if (/^(\d)\1{13}$/.test(numeros)) return false;

  // Validar dígitos verificadores (algoritmo oficial)
  // O 1º DV usa os 12 primeiros dígitos com pesos 5,4,3,2,9,8,7,6,5,4,3,2.
  // O 2º usa os 13 primeiros (12 + DV1) com pesos 6,5,4,3,2,9,8,7,6,5,4,3,2.
  const calcularDV = (base) => {
    let multiplicador = base.length === 12 ? 5 : 6;
    let soma = 0;
    for (let i = 0; i < base.length; i++) {
      soma += parseInt(base[i]) * multiplicador;
      multiplicador = multiplicador === 2 ? 9 : multiplicador - 1;
    }
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };

  const base1 = numeros.substring(0, 12);
  const dv1 = calcularDV(base1);

  const base2 = base1 + dv1;
  const dv2 = calcularDV(base2);

  return dv1.toString() === numeros[12] && dv2.toString() === numeros[13];
}
