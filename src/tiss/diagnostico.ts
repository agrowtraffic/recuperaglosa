/* Diagnóstico de um XML TISS que o parser não leu como demonstrativo.
   Olha só os nomes dos elementos do arquivo (com ou sem prefixo de
   namespace) e devolve uma mensagem que o cliente consegue seguir. Não
   interpreta o conteúdo, só reconhece o tipo de mensagem. */

export type TipoXml =
  | 'recurso_glosa' | 'envio_lote' | 'odonto' | 'pagamento'
  | 'layout_nao_reconhecido' | 'desconhecido';

/* Fecha toda mensagem de arquivo que deveria servir e não serviu. */
const AJUDA = ' Sua análise gratuita não foi usada. Deixe seu WhatsApp abaixo que ajudamos com o arquivo.';

const tem = (xml: string, tag: string) =>
  new RegExp(`<([A-Za-z0-9_]+:)?${tag}[\\s>/]`, 'i').test(xml);

export function diagnosticarXml(xml: string): { tipo: TipoXml; mensagem: string } {
  if (tem(xml, 'demonstrativoPagamentoOdonto') || tem(xml, 'demonstrativoOdontologia')) {
    return {
      tipo: 'odonto',
      mensagem: 'Reconhecemos um demonstrativo odontológico, formato que ainda não lemos.' + AJUDA,
    };
  }
  if (tem(xml, 'demonstrativoPagamento')) {
    return {
      tipo: 'pagamento',
      mensagem:
        'Este é o demonstrativo de pagamento, que não traz as glosas item a item. ' +
        'Baixe no portal da operadora o demonstrativo de análise de conta.' + AJUDA,
    };
  }
  if (tem(xml, 'demonstrativoAnaliseConta')) {
    return {
      tipo: 'layout_nao_reconhecido',
      mensagem:
        'Reconhecemos um demonstrativo de análise de conta, mas não conseguimos ler os valores dele.' + AJUDA,
    };
  }
  if (tem(xml, 'recursoGlosa') || tem(xml, 'guiaRecursoGlosa')) {
    return {
      tipo: 'recurso_glosa',
      mensagem:
        'Este arquivo é um modelo de recurso de glosa: é o XML que a clínica envia à operadora para contestar. ' +
        'O RecuperaGlosa lê o contrário: o demonstrativo de análise de conta que a operadora devolve. ' +
        'Peça esse arquivo no portal da operadora ou use o botão "Analisar um exemplo".',
    };
  }
  if (tem(xml, 'loteGuias') || tem(xml, 'guiaConsulta') || tem(xml, 'guiaSP-SADT') || tem(xml, 'guiaSP_SADT')) {
    return {
      tipo: 'envio_lote',
      mensagem:
        'Este arquivo é um lote de guias, o XML que a clínica envia para cobrar a operadora. ' +
        'O RecuperaGlosa precisa do demonstrativo de análise de conta, que a operadora devolve com o valor pago e as glosas.',
    };
  }
  return {
    tipo: 'desconhecido',
    mensagem:
      'Não encontramos guias de demonstrativo neste arquivo. Envie o XML de demonstrativo de análise de conta que a operadora disponibiliza no portal, ' +
      'ou use o botão "Analisar um exemplo" para ver como funciona.' + AJUDA,
  };
}
