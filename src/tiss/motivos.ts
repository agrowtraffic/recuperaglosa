/**
 * Motivos de glosa (base do padrão TISS/ANS — Tabela de Motivo de Glosa).
 *
 * ⚠️ IMPORTANTE: os códigos abaixo são a base inicial e PRECISAM ser conferidos
 * contra a tabela oficial vigente da ANS antes de ir para produção. O parser é
 * config-driven: você troca este arquivo, não o código.
 *
 * `recorrivel: true`  -> vale a pena gerar recurso (erro operacional / da operadora)
 * `recorrivel: false` -> glosa legítima, recurso só gasta seu tempo
 */

export type Motivo = {
  codigo: string;
  descricao: string;
  categoria: "cadastro" | "autorizacao" | "codificacao" | "contrato" | "prazo" | "duplicidade" | "outro";
  recorrivel: boolean;
  /** argumento base usado pelo gerador de recurso */
  argumento: string;
};

export const MOTIVOS: Record<string, Motivo> = {
  "1001": {
    codigo: "1001",
    descricao: "Beneficiário sem cobertura na data do atendimento",
    categoria: "cadastro",
    recorrivel: true,
    argumento:
      "O beneficiário encontrava-se ativo no plano na data do atendimento, conforme elegibilidade verificada no momento da execução. Solicita-se reprocessamento.",
  },
  "1004": {
    codigo: "1004",
    descricao: "Divergência de código de procedimento (TUSS)",
    categoria: "codificacao",
    recorrivel: true,
    argumento:
      "O código TUSS informado corresponde ao procedimento efetivamente executado e está aderente à tabela vigente do contrato. Solicita-se revisão da análise.",
  },
  "1007": {
    codigo: "1007",
    descricao: "Procedimento não autorizado / sem senha",
    categoria: "autorizacao",
    recorrivel: true,
    argumento:
      "A autorização foi concedida previamente, conforme número de senha registrado na guia. Solicita-se reprocessamento com base na autorização já emitida.",
  },
  "1010": {
    codigo: "1010",
    descricao: "Quantidade executada acima da autorizada",
    categoria: "autorizacao",
    recorrivel: true,
    argumento:
      "A quantidade executada corresponde à necessidade clínica documentada e à autorização vigente. Solicita-se revisão do quantitativo glosado.",
  },
  "1301": {
    codigo: "1301",
    descricao: "Cobrança em duplicidade",
    categoria: "duplicidade",
    recorrivel: true,
    argumento:
      "Não há duplicidade: trata-se de atendimentos distintos, em datas e/ou guias distintas, conforme documentação anexa. Solicita-se reprocessamento.",
  },
  "1401": {
    codigo: "1401",
    descricao: "Valor apresentado diverge do valor contratado",
    categoria: "contrato",
    recorrivel: true,
    argumento:
      "O valor apresentado está em conformidade com a tabela contratual vigente e seus aditivos. Solicita-se aplicação do valor pactuado.",
  },
  "1701": {
    codigo: "1701",
    descricao: "Guia apresentada fora do prazo",
    categoria: "prazo",
    recorrivel: false,
    argumento:
      "Glosa por prazo: recurso costuma ser indeferido. Ação recomendada: corrigir o processo interno de envio, não recorrer.",
  },
  "1801": {
    codigo: "1801",
    descricao: "Procedimento não coberto pelo contrato",
    categoria: "contrato",
    recorrivel: false,
    argumento:
      "Glosa contratual. Verificar cobertura antes de executar. Recurso raramente prospera.",
  },
};

export function motivo(codigo?: string): Motivo {
  if (codigo && MOTIVOS[codigo]) return MOTIVOS[codigo];
  return {
    codigo: codigo ?? "SEM_CODIGO",
    descricao: codigo
      ? `Motivo ${codigo} não mapeado`
      : "Glosa sem código informado pela operadora",
    categoria: "outro",
    recorrivel: true,
    argumento:
      "A operadora não informou motivo de glosa válido. Nos termos do padrão TISS, a glosa deve ser fundamentada. Solicita-se justificativa ou reprocessamento.",
  };
}
