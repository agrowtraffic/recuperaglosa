/* ============================================================
   MOTIVOS DE GLOSA — camada de julgamento sobre a Tabela 38

   A descrição de cada código vem de `tabela38.ts`, transcrita do PDF
   oficial da ANS. Este arquivo não reescreve descrição: ele acrescenta
   o que a tabela não traz — o que fazer com cada mensagem.

   ── Por que existe uma "ação" e não só `recorrivel` ──

   A Tabela 38 se chama "Terminologia de mensagens (glosas, negativas e
   OUTRAS)". Boa parte dos códigos não é glosa:

     3095  RECURSO DE GLOSA ACATADO            → ganhamos
     3092  VALOR ACATADO POR GLOSA INDEVIDA    → ganhamos
     1722  PAGO CONFORME NEGOCIAÇÃO            → informativo
     3081  RADIOGRAFIA INICIAL NÃO ENVIADA     → falta documento
     2909  PRAZO PARA RECURSO PRESCRITO        → não há mais o que fazer

   Um booleano "recorrível" trata tudo isso como a mesma coisa e manda a
   clínica recorrer de uma vitória. `acao` separa os casos; `recorrivel`
   continua existindo, derivado, para não quebrar quem já o consome.

   ── Sobre o julgamento ──

   `acao` e `argumento` são interpretação, não texto oficial. A regra que
   segui: só marco `recorrer` quando existe tese concreta a sustentar. Se
   a glosa decorre de limite contratual (carência, ausência de cobertura),
   de prazo vencido ou de decisão já mantida em reanálise, recorrer gasta
   o tempo da clínica e queima credibilidade com a operadora.

   Códigos sem regra específica herdam o padrão da faixa. Isso cobre os
   603 sem fingir que cada um foi analisado individualmente — os que
   receberam análise própria estão em ESPECIFICOS, abaixo.
   ============================================================ */

import { TABELA_38 } from "./tabela38";

/** O que a clínica deve fazer diante da mensagem. */
export type Acao =
  /** Há tese de contestação. Gera recurso. */
  | "recorrer"
  /** Falta documento (radiografia, laudo, nota fiscal). Anexar e reapresentar. */
  | "enviar_documento"
  /** Dado inválido ou incompleto na guia/arquivo. Corrigir e reapresentar. */
  | "corrigir_reapresentar"
  /** Glosa legítima ou decisão final. Recurso não prospera. */
  | "sem_recurso"
  /** A operadora está aguardando algo dela mesma. Acompanhar. */
  | "aguardar"
  /** Mensagem favorável ao prestador. Nada a contestar. */
  | "favoravel";

export type Categoria =
  | "beneficiario"
  | "protocolo"
  | "credenciado"
  | "guia"
  | "autorizacao"
  | "dados_clinicos"
  | "atendimento"
  | "cobranca"
  | "procedimento"
  | "acomodacao"
  | "material"
  | "medicamento"
  | "opme"
  | "gases"
  | "taxa"
  | "serie"
  | "honorario"
  | "exame"
  | "pacote"
  | "revisao"
  | "odontologico"
  | "regra_autorizacao"
  | "comunicacao"
  | "outro";

export type Motivo = {
  codigo: string;
  /** Termo oficial da Tabela 38, literal. É o que se cita no recurso. */
  descricao: string;
  categoria: Categoria;
  acao: Acao;
  /** Derivado de `acao`. Mantido para o código que já dependia dele. */
  recorrivel: boolean;
  /**
   * Quando `acao` é "recorrer": a tese de contestação, para o recurso.
   * Nos outros casos: o que fazer em vez de recorrer.
   */
  argumento: string;
  /** false quando o código não está na Tabela 38 (operadora fora do padrão). */
  oficial: boolean;
};

/* ── Categoria por faixa ─────────────────────────────────────
   As faixas são as do próprio documento (ver FAIXAS_TABELA_38). */
const CATEGORIA_POR_FAIXA: Record<string, Categoria> = {
  "10": "beneficiario",
  "11": "protocolo",
  "12": "credenciado",
  "13": "guia",
  "14": "autorizacao",
  "15": "dados_clinicos",
  "16": "atendimento",
  "17": "cobranca",
  "18": "procedimento",
  "19": "acomodacao",
  "20": "material",
  "21": "medicamento",
  "22": "opme",
  "23": "gases",
  "24": "taxa",
  "25": "serie",
  "26": "honorario",
  "27": "exame",
  "28": "pacote",
  "29": "revisao",
  "30": "odontologico",
  "31": "regra_autorizacao",
  "50": "comunicacao",
};

/* ── Padrão por categoria ────────────────────────────────────
   Vale para todo código da faixa que não tenha regra própria. */
const PADRAO: Record<Categoria, { acao: Acao; argumento: string }> = {
  beneficiario: {
    acao: "recorrer",
    argumento:
      "A elegibilidade do beneficiário foi verificada junto à operadora no momento do atendimento, que se realizou com o plano vigente. Divergência cadastral posterior não é oponível ao prestador que atendeu de boa-fé, com base na informação disponibilizada pela própria operadora. Requer-se a revisão do cadastro e o reprocessamento do valor glosado.",
  },
  protocolo: {
    acao: "corrigir_reapresentar",
    argumento:
      "A inconsistência é de consolidação do protocolo, não do atendimento. Conferir o total das guias contra o total declarado, corrigir a divergência e reapresentar o protocolo.",
  },
  credenciado: {
    acao: "recorrer",
    argumento:
      "O prestador integrava a rede credenciada, com contrato vigente e cadastro regular na data do atendimento. A glosa decorre de divergência no cadastro do prestador mantido pela operadora. Requer-se a correção cadastral e o reprocessamento.",
  },
  guia: {
    acao: "enviar_documento",
    argumento:
      "A glosa aponta falha de preenchimento ou de instrução da guia. Recurso instruído com a guia completa, assinada e sem rasuras tende a ser acatado — anexar o documento regularizado e reapresentar.",
  },
  autorizacao: {
    acao: "recorrer",
    argumento:
      "O procedimento foi autorizado previamente pela operadora, conforme senha e número de autorização registrados na guia. A glosa por ausência ou divergência de autorização contraria a liberação que a própria operadora emitiu. Requer-se o reprocessamento com base na autorização vigente.",
  },
  dados_clinicos: {
    acao: "corrigir_reapresentar",
    argumento:
      "O campo clínico apontado está inválido ou ausente. Corrigir a informação na guia e reapresentar — este tipo de glosa se resolve na reapresentação, não em recurso.",
  },
  atendimento: {
    acao: "corrigir_reapresentar",
    argumento:
      "Há inconsistência entre as datas ou os tipos informados no atendimento. Conferir o registro, corrigir a informação divergente e reapresentar.",
  },
  cobranca: {
    acao: "recorrer",
    argumento:
      "O valor apresentado está em conformidade com a tabela contratual vigente e seus aditivos. Requer-se a aplicação do valor pactuado e o reprocessamento da diferença glosada.",
  },
  procedimento: {
    acao: "recorrer",
    argumento:
      "O procedimento executado é compatível com o quadro clínico e com a cobertura contratada, conforme registro no prontuário. Requer-se a revisão da análise e o reprocessamento.",
  },
  acomodacao: {
    acao: "recorrer",
    argumento:
      "A acomodação utilizada corresponde à contratada pelo beneficiário e à disponibilidade no momento da internação. Requer-se a revisão da glosa.",
  },
  material: {
    acao: "recorrer",
    argumento:
      "O material foi efetivamente utilizado no procedimento, com registro em prontuário e discriminação na conta. Requer-se o reprocessamento do item glosado.",
  },
  medicamento: {
    acao: "recorrer",
    argumento:
      "O medicamento foi administrado conforme prescrição registrada em prontuário, sendo indispensável ao procedimento realizado. Requer-se o reprocessamento.",
  },
  opme: {
    acao: "recorrer",
    argumento:
      "A OPME utilizada consta da autorização emitida e do registro cirúrgico, com rastreabilidade documentada. Requer-se o reprocessamento do item.",
  },
  gases: {
    acao: "recorrer",
    argumento:
      "O consumo de gases medicinais decorre do procedimento realizado e está registrado em prontuário. Requer-se a revisão da glosa.",
  },
  taxa: {
    acao: "recorrer",
    argumento:
      "A taxa cobrada corresponde a estrutura e equipamento efetivamente empregados no procedimento, conforme previsão contratual. Requer-se o reprocessamento.",
  },
  serie: {
    acao: "recorrer",
    argumento:
      "As sessões cobradas foram executadas e estão registradas no controle de frequência, dentro do quantitativo autorizado. Requer-se o reprocessamento.",
  },
  honorario: {
    acao: "recorrer",
    argumento:
      "O honorário corresponde a participação profissional efetivamente registrada no procedimento, em codificação aderente à tabela contratual. Requer-se a revisão da análise.",
  },
  exame: {
    acao: "recorrer",
    argumento:
      "O exame foi solicitado, executado e laudado, com registro em prontuário e correlação com a hipótese diagnóstica. Requer-se o reprocessamento.",
  },
  pacote: {
    acao: "recorrer",
    argumento:
      "A composição cobrada corresponde ao pacote pactuado em contrato para o procedimento realizado. Requer-se a revisão do processamento.",
  },
  revisao: {
    acao: "sem_recurso",
    argumento:
      "A mensagem trata do próprio processo de reanálise, e não do mérito da glosa. Insistir gera recurso duplicado (código 2904) e não altera a decisão.",
  },
  odontologico: {
    acao: "recorrer",
    argumento:
      "O procedimento odontológico foi executado conforme plano de tratamento e está documentado em prontuário e imagem. Requer-se a revisão da análise técnica e o reprocessamento.",
  },
  regra_autorizacao: {
    acao: "recorrer",
    argumento:
      "A solicitação atende aos critérios de cobertura e às diretrizes de utilização aplicáveis, conforme justificativa clínica registrada. Requer-se a revisão da negativa.",
  },
  comunicacao: {
    acao: "corrigir_reapresentar",
    argumento:
      "A mensagem aponta falha técnica na transmissão ou na validação do arquivo, não glosa de mérito. Corrigir o arquivo conforme o padrão TISS e reenviar.",
  },
  outro: {
    acao: "recorrer",
    argumento:
      "A glosa carece de fundamentação suficiente para permitir contestação específica. Nos termos do padrão TISS, a glosa deve ser informada de forma clara e fundamentada. Requer-se a apresentação do motivo detalhado ou o reprocessamento do valor.",
  },
};

/* ── Regras por código ───────────────────────────────────────
   Só entra aqui o código cuja ação difere do padrão da faixa, ou cujo
   argumento merece texto próprio por ser frequente na clientela
   (consultório e clínica odontológica de pequeno porte). */
const ESPECIFICOS: Record<string, { acao?: Acao; argumento?: string }> = {
  /* ---------- Favoráveis: a operadora está pagando ou já acatou ---------- */
  "1717": { acao: "favoravel", argumento: "Pagamento efetuado conforme relatório de auditoria externa. Não há valor a contestar nesta linha." },
  "1721": { acao: "favoravel", argumento: "A operadora substituiu o código cobrado pelo código pago. Conferir se o valor pago corresponde ao procedimento executado; havendo diferença, contestar o valor, não o código." },
  "1722": { acao: "favoravel", argumento: "Pagamento efetuado conforme negociação vigente. Mensagem informativa." },
  "1727": { acao: "favoravel", argumento: "A operadora pagou o valor que entende compatível com o procedimento. Conferir contra a tabela contratual; havendo diferença, o caso é de divergência de valor." },
  "3088": { acao: "favoravel", argumento: "Valor acatado em razão de reajuste retroativo. Mensagem favorável ao prestador." },
  "3092": { acao: "favoravel", argumento: "A operadora reconheceu que a glosa foi indevida e acatou o valor após o recurso. Nada a contestar." },
  "3093": { acao: "favoravel", argumento: "Valor acatado por autorização especial. Mensagem favorável ao prestador." },
  "3095": { acao: "favoravel", argumento: "Recurso de glosa acatado. O valor foi reconhecido — não gerar novo recurso." },

  /* ---------- Aguardando a operadora ---------- */
  "3019": { acao: "aguardar", argumento: "O evento está em análise técnica na operadora, aguardando liberação. Acompanhar o próximo demonstrativo antes de recorrer." },
  "3051": { acao: "aguardar", argumento: "Documentação em análise na operadora. Acompanhar o retorno; recorrer agora é prematuro." },
  "1736": { acao: "aguardar", argumento: "A conta aguarda negociação para pagamento. Acompanhar junto à operadora." },

  /* ---------- Falta documento: anexar, não argumentar ---------- */
  "1709": { acao: "enviar_documento", argumento: "Anexar a prescrição médica correspondente e reapresentar o item." },
  "1710": { acao: "enviar_documento", argumento: "Anexar o registro de enfermagem com o visto correspondente e reapresentar." },
  "1712": { acao: "enviar_documento", argumento: "Anexar o laudo do exame com assinatura do médico responsável e reapresentar." },
  "1738": { acao: "enviar_documento", argumento: "Anexar o documento fiscal correspondente e reapresentar a cobrança." },
  "1749": { acao: "enviar_documento", argumento: "Anexar o relatório de auditoria à conta e reapresentar." },
  "2004": { acao: "enviar_documento", argumento: "Anexar a nota fiscal do fornecedor do material e reapresentar o item." },
  "2104": { acao: "enviar_documento", argumento: "Anexar a nota fiscal do fornecedor do medicamento e reapresentar o item." },
  "2203": { acao: "enviar_documento", argumento: "Anexar a nota fiscal do fornecedor da OPME, com rastreabilidade, e reapresentar." },
  "3015": { acao: "enviar_documento", argumento: "Anexar o resultado ou laudo técnico do procedimento e reapresentar." },
  "3041": { acao: "enviar_documento", argumento: "Enviar a documentação de ortodontia solicitada pela operadora." },
  "3047": { acao: "enviar_documento", argumento: "Anexar a imagem, foto ou radiografia de diagnóstico pós-procedimento e reapresentar." },
  "3052": { acao: "enviar_documento", argumento: "Completar a documentação apontada como incompleta, incorreta ou ausente e reapresentar." },
  "3062": { acao: "enviar_documento", argumento: "Enviar o laudo ou relatório técnico sobre o tratamento solicitado." },
  "3067": { acao: "enviar_documento", argumento: "Enviar a radiografia final do tratamento e reapresentar o item." },
  "3080": { acao: "enviar_documento", argumento: "Enviar as radiografias inicial e final do tratamento e reapresentar o item." },
  "3081": { acao: "enviar_documento", argumento: "Enviar a radiografia inicial do tratamento e reapresentar o item." },
  "3084": { acao: "enviar_documento", argumento: "Reenviar o relatório de análise técnica com carimbo e assinatura do prestador." },
  "3090": { acao: "enviar_documento", argumento: "Enviar as etiquetas e os selos hemoterápicos do material utilizado." },

  /* ---------- Auditoria pendente: cumprir a etapa, não recorrer ---------- */
  "3058": { acao: "enviar_documento", argumento: "A operadora exige auditoria final antes de liberar o pagamento. Agendar a auditoria; recurso não substitui a etapa." },
  "3059": { acao: "enviar_documento", argumento: "A operadora exige auditoria inicial. Agendar a auditoria antes de reapresentar." },
  "3060": { acao: "enviar_documento", argumento: "A operadora exige auditoria intermediária. Agendar a etapa antes de reapresentar." },
  "3061": { acao: "enviar_documento", argumento: "A operadora exige avaliação de especialista. Encaminhar a avaliação antes de reapresentar." },

  /* ---------- Limite contratual: recurso não prospera ---------- */
  "1007": { acao: "sem_recurso", argumento: "Atendimento realizado dentro do período de carência contratual. A carência é cláusula do plano do beneficiário e a glosa é devida. Conferir carência antes de executar procedimento eletivo." },
  "1009": { acao: "sem_recurso", argumento: "A suspensão decorre de inadimplência do beneficiário perante a operadora. O valor deve ser tratado com o beneficiário, não com a operadora." },
  "1012": { acao: "sem_recurso", argumento: "O serviço não integra a cobertura do plano contratado pelo beneficiário. Glosa contratual — verificar cobertura antes de executar." },
  "1015": { acao: "sem_recurso", argumento: "Beneficiário fora da faixa de idade prevista para o procedimento no contrato. Glosa contratual." },
  "1018": { acao: "sem_recurso", argumento: "O contrato da empresa contratante está suspenso ou excluído. Glosa contratual, alheia ao prestador — tratar com o beneficiário." },
  "1025": { acao: "sem_recurso", argumento: "O plano do beneficiário não contempla assistência odontológica. Glosa contratual — conferir a segmentação do plano antes do atendimento." },
  "3097": { acao: "sem_recurso", argumento: "O tipo de atendimento não é compatível com a segmentação assistencial contratada. Glosa contratual." },

  /* ---------- Prazo: perdido é perdido ---------- */
  "1701": { acao: "sem_recurso", argumento: "Cobrança apresentada fora do prazo de validade. Recurso por prazo raramente prospera — a correção é no processo interno de faturamento, para que o envio ocorra dentro da janela contratual." },
  "3091": { acao: "sem_recurso", argumento: "Cobrança apresentada fora do prazo estipulado em contrato. Ajustar o fluxo interno de faturamento." },
  "2907": { acao: "sem_recurso", argumento: "Ultrapassado o prazo de 180 dias para solicitação de reanálise. Não há mais recurso administrativo disponível para esta glosa." },
  "2909": { acao: "sem_recurso", argumento: "Prazo para solicitação de recurso de glosa prescrito. Não há mais recurso administrativo disponível." },

  /* ---------- Decisão já tomada em reanálise ---------- */
  "1718": { acao: "sem_recurso", argumento: "A reanálise já foi negada, com pagamento conforme relatório de auditoria. Novo recurso sobre a mesma glosa cai em duplicidade (código 2904)." },
  "1719": { acao: "sem_recurso", argumento: "A reanálise já foi negada, com análise conforme tabela acordada. Discutir valor de tabela é assunto de renegociação contratual, não de recurso." },
  "2902": { acao: "sem_recurso", argumento: "Glosa mantida após reanálise. A via administrativa está esgotada para esta glosa." },
  "2904": { acao: "sem_recurso", argumento: "Já existe recurso apresentado para esta guia. Acompanhar o recurso em curso em vez de abrir outro." },

  /* ---------- Valor já pago a terceiro / a ser cobrado do beneficiário ---------- */
  "1737": { acao: "sem_recurso", argumento: "A diferença corresponde a franquia ou coparticipação, a ser cobrada do beneficiário pelo prestador, conforme contrato." },
  "1741": { acao: "sem_recurso", argumento: "O honorário ou procedimento já foi pago a outro prestador. Conferir quem executou; não havendo erro de atribuição, não há valor a recuperar." },
  "1742": { acao: "sem_recurso", argumento: "O valor já foi pago ao beneficiário por reembolso. Não há duplicidade de pagamento a reclamar." },
  "1711": { acao: "sem_recurso", argumento: "O procedimento integra pacote acordado e já cobrado. Conferir a composição do pacote no contrato antes de cobrar o item em separado." },

  /* ---------- Duplicidade: comum em odonto, e frequentemente rebatível ---------- */
  "1702": {
    acao: "recorrer",
    argumento:
      "Não há duplicidade. Os lançamentos correspondem a procedimentos distintos, executados em datas, elementos ou regiões diferentes, conforme discriminado na guia e registrado em prontuário. Requer-se o reprocessamento do item glosado.",
  },
  "3007": {
    acao: "recorrer",
    argumento:
      "Não há duplicidade. Os procedimentos foram executados em elementos dentários distintos, identificados individualmente na guia por dente, face e região, conforme registro em prontuário e documentação radiográfica. Requer-se o reprocessamento.",
  },
  "1305": {
    acao: "recorrer",
    argumento:
      "O item não foi pago em outra guia. Trata-se de atendimento distinto, com data e identificação próprias, conforme documentação anexa. Requer-se o reprocessamento.",
  },

  /* ---------- Autorização: os casos de maior volume ---------- */
  "1402": {
    acao: "recorrer",
    argumento:
      "O procedimento foi previamente autorizado pela operadora, conforme senha registrada na guia, válida na data do atendimento. Requer-se o reprocessamento com base na própria autorização emitida.",
  },
  "1403": {
    acao: "recorrer",
    argumento:
      "A senha de autorização consta da guia apresentada, emitida pela operadora antes da execução. Requer-se a localização do registro no sistema autorizador e o reprocessamento.",
  },
  "1406": {
    acao: "recorrer",
    argumento:
      "O número de senha informado é o mesmo liberado pela operadora, conforme comprovante de autorização anexo. Requer-se a conferência do registro e o reprocessamento.",
  },
  "1412": {
    acao: "recorrer",
    argumento:
      "A falha ocorreu no sistema autorizador da operadora, não no procedimento executado. Indisponibilidade de sistema próprio não pode ser convertida em glosa ao prestador. Requer-se o reprocessamento.",
  },
  "3002": {
    acao: "recorrer",
    argumento:
      "O procedimento contava com autorização prévia da operadora, conforme senha registrada na guia. Requer-se o reprocessamento com base na autorização emitida.",
  },
  "3014": {
    acao: "recorrer",
    argumento:
      "A data de autorização registrada decorre do fluxo do sistema da operadora; o procedimento foi executado sob autorização válida, conforme comprovante anexo. Requer-se a revisão.",
  },

  /* ---------- Codificação ---------- */
  "2601": {
    acao: "recorrer",
    argumento:
      "A codificação empregada corresponde ao procedimento efetivamente executado e observa a tabela vigente do contrato, conforme descrição em prontuário. Requer-se a revisão da análise e o reprocessamento.",
  },
  "1801": {
    acao: "recorrer",
    argumento:
      "O código do procedimento é válido e consta da tabela contratual vigente na data do atendimento. Requer-se a conferência da tabela de referência aplicada e o reprocessamento.",
  },

  /* ---------- Assinatura / identificação do beneficiário ---------- */
  "1008": { acao: "enviar_documento", argumento: "Anexar a guia com a assinatura do beneficiário conferida e reapresentar." },
  "1010": { acao: "enviar_documento", argumento: "Anexar a guia com a assinatura do titular ou responsável e reapresentar o item." },
  "1011": { acao: "corrigir_reapresentar", argumento: "Conferir os dados de identificação do beneficiário contra a carteira, corrigir a divergência e reapresentar." },

  /* ---------- Cancelamentos ---------- */
  "3048": { acao: "sem_recurso", argumento: "Procedimento cancelado por solicitação do beneficiário. Não há execução a cobrar." },
  "3049": { acao: "sem_recurso", argumento: "Procedimento cancelado por solicitação do prestador. Não há execução a cobrar." },
  "3009": { acao: "sem_recurso", argumento: "A operadora registra que o procedimento não foi executado. Conferir o prontuário: havendo execução documentada, o caso é de comprovação; não havendo, a glosa é devida." },
  "3096": { acao: "recorrer", argumento: "O atendimento foi efetivamente realizado, conforme registro em prontuário e assinatura do beneficiário na guia. A ausência de confirmação pelo beneficiário não infirma a execução documentada. Requer-se o reprocessamento." },
};

/* ── Montagem ──────────────────────────────────────────────── */

function categoriaDe(codigo: string): Categoria {
  return CATEGORIA_POR_FAIXA[codigo.slice(0, 2)] ?? "outro";
}

function montar(codigo: string, descricao: string, oficial: boolean): Motivo {
  const categoria = categoriaDe(codigo);
  const padrao = PADRAO[categoria];
  const especifico = ESPECIFICOS[codigo];

  const acao = especifico?.acao ?? padrao.acao;

  return {
    codigo,
    descricao,
    categoria,
    acao,
    recorrivel: acao === "recorrer",
    argumento: especifico?.argumento ?? padrao.argumento,
    oficial,
  };
}

export const MOTIVOS: Record<string, Motivo> = Object.fromEntries(
  Object.entries(TABELA_38).map(([codigo, descricao]) => [
    codigo,
    montar(codigo, descricao, true),
  ]),
);

/**
 * Resolve um código de glosa.
 *
 * Código fora da Tabela 38 não é erro nosso nem do arquivo: operadora pode
 * usar código próprio. Nesse caso o motivo volta com `oficial: false` e a
 * faixa ainda orienta a ação, porque o primeiro par de dígitos costuma ser
 * respeitado mesmo por quem estende a tabela.
 */
export function motivo(codigo?: string): Motivo {
  if (!codigo) {
    return {
      codigo: "SEM_CODIGO",
      descricao: "Glosa sem código informado pela operadora",
      categoria: "outro",
      acao: "recorrer",
      recorrivel: true,
      argumento:
        "A operadora não informou código de glosa. O padrão TISS exige que a glosa seja identificada e fundamentada, de modo a permitir contestação. Requer-se a informação do motivo ou o reprocessamento integral do valor glosado.",
      oficial: false,
    };
  }

  const conhecido = MOTIVOS[codigo];
  if (conhecido) return conhecido;

  const naFaixa = CATEGORIA_POR_FAIXA[codigo.slice(0, 2)];
  return montar(
    codigo,
    naFaixa
      ? `Código ${codigo} não consta da Tabela 38 vigente`
      : `Código ${codigo} não reconhecido`,
    false,
  );
}

/** Total de códigos oficiais carregados. Usado pelos testes. */
export const TOTAL_CODIGOS_OFICIAIS = Object.keys(TABELA_38).length;

/**
 * Rótulo em caixa mista, para tela. A Tabela 38 é toda em maiúsculas, o que
 * grita numa interface; no recurso, o termo vai literal.
 */
export function descricaoLegivel(codigo?: string): string {
  const d = motivo(codigo).descricao;
  if (d !== d.toUpperCase()) return d;
  return d.charAt(0) + d.slice(1).toLowerCase();
}
