/* Nome provisório da clínica para quem pula esse campo no cadastro:
   "Clínica de <primeiro nome>". Fica num módulo próprio porque duas telas
   precisam concordar sobre ele: /completar-cadastro grava, e /lotes
   reconhece para lembrar a pessoa de trocar (o nome entra no texto do
   recurso de glosa). */
export function nomeClinicaPadrao(nomeCompleto) {
  const primeiro = String(nomeCompleto ?? '').trim().split(/\s+/)[0];
  return primeiro ? `Clínica de ${primeiro}` : 'Minha clínica';
}
