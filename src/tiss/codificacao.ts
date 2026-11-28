/* Lê os bytes do XML respeitando a codificação.

   Arquivos TISS costumam vir em ISO-8859-1. Ler tudo como UTF-8 troca
   cada letra acentuada por "�" no nome, na descrição e no recurso. */
export function decodificarXml(bytes: ArrayBuffer | Uint8Array): string {
  const dados = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const inicio = new TextDecoder('windows-1252').decode(dados.subarray(0, 200));
  const declarada = /<\?xml[^>]*encoding\s*=\s*["']([^"']+)["']/i.exec(inicio)?.[1]?.toLowerCase();

  if (declarada && /8859-1|1252|latin1/.test(declarada)) {
    return new TextDecoder('windows-1252').decode(dados);
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(dados);
  } catch {
    // Diz ser UTF-8 (ou não diz nada) mas não é: o caso comum é Latin-1.
    return new TextDecoder('windows-1252').decode(dados);
  }
}
