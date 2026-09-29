/* ============================================================
   Camada editorial das páginas públicas da Tabela 38.

   O termo oficial e a vigência de cada código vêm de
   src/tiss/tabela38.ts, e a orientação (categoria, ação, argumento) de
   src/tiss/motivos.ts — as mesmas fontes que o produto usa para montar
   o recurso. Aqui só entra o que é de página: rótulos, e causa/prevenção
   por assunto.

   Causa e prevenção são por categoria, não por código, e o texto da
   página diz isso. Não fingir análise individual onde ela não existe é
   a mesma regra que motivos.ts segue.
   ============================================================ */
import {
  TABELA_38,
  FAIXAS_TABELA_38,
  VERSAO_TABELA_38,
  EQUIVALENTE_VIGENTE,
} from '@/src/tiss/tabela38';
import { MOTIVOS } from '@/src/tiss/motivos';

export { TABELA_38, MOTIVOS, EQUIVALENTE_VIGENTE };

/** "202607" → "julho/2026" */
const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
export const VERSAO = VERSAO_TABELA_38;
export const VERSAO_EXTENSO = `${MESES[Number(VERSAO.slice(4)) - 1]}/${VERSAO.slice(0, 4)}`;

export const ACOES = {
  recorrer: {
    rotulo: 'Cabe recurso',
    classe: 'seloRecorrer',
    resumo: 'há tese para contestar, e vale apresentar recurso de glosa com a fundamentação abaixo.',
  },
  enviar_documento: {
    rotulo: 'Enviar documento',
    classe: 'seloDocumento',
    resumo: 'a glosa se resolve anexando o documento que faltou e reapresentando, não com argumentação.',
  },
  corrigir_reapresentar: {
    rotulo: 'Corrigir e reapresentar',
    classe: 'seloCorrigir',
    resumo: 'o problema é dado incorreto ou incompleto; corrija a guia ou o arquivo e reapresente.',
  },
  sem_recurso: {
    rotulo: 'Recurso não prospera',
    classe: 'seloSem',
    resumo: 'a glosa decorre de regra contratual, prazo vencido ou decisão final; recorrer gasta tempo e credibilidade.',
  },
  aguardar: {
    rotulo: 'Aguardar a operadora',
    classe: 'seloAguardar',
    resumo: 'a operadora ainda está analisando ou já liberou; acompanhe antes de agir.',
  },
  favoravel: {
    rotulo: 'Mensagem favorável',
    classe: 'seloFavoravel',
    resumo: 'não é uma glosa contra o prestador — é um aviso de pagamento ou de recurso acatado.',
  },
};

/* Causa típica e prevenção por assunto (categoria de motivos.ts). */
export const ASSUNTOS = {
  beneficiario: {
    titulo: 'Beneficiário e elegibilidade',
    causa: 'dados do beneficiário: carteira, elegibilidade, carência, cobertura ou situação cadastral na operadora na data do atendimento',
    prevencao: 'Confirme a elegibilidade no portal da operadora no dia do atendimento e guarde o comprovante. Confira validade da carteira, carência e segmentação do plano antes de procedimentos eletivos.',
  },
  protocolo: {
    titulo: 'Protocolo',
    causa: 'a consolidação do protocolo de envio: quantidade de guias, valor total ou tipo de apresentação diferentes do que foi cadastrado',
    prevencao: 'Antes de fechar o lote, confira quantidade de guias e soma dos valores contra o total declarado no protocolo.',
  },
  credenciado: {
    titulo: 'Credenciado / prestador',
    causa: 'o cadastro do prestador ou do profissional: CNES, CPF/CNPJ, conselho, código na operadora, vigência do contrato ou vínculo com a rede',
    prevencao: 'Mantenha CNES, CNPJ, conselho e código de prestador atualizados na operadora e acompanhe a vigência do contrato de credenciamento.',
  },
  guia: {
    titulo: 'Guia, preenchimento e documentos',
    causa: 'o preenchimento e a instrução da guia: campos obrigatórios, códigos, assinaturas, rasuras ou documentos que deveriam acompanhá-la',
    prevencao: 'Use um checklist de campos obrigatórios e anexos por tipo de guia (consulta, SP/SADT, honorários, odontologia) e revise assinaturas antes do faturamento.',
  },
  autorizacao: {
    titulo: 'Autorização e senha',
    causa: 'a autorização prévia: senha ausente, inválida, vencida ou divergente do que foi executado',
    prevencao: 'Registre a senha e a data de validade na guia, guarde o comprovante de autorização e confira se o executado bate com o autorizado.',
  },
  dados_clinicos: {
    titulo: 'Dados clínicos',
    causa: 'dados clínicos: CID, indicação clínica, caráter do atendimento ou outras informações clínicas inválidas ou ausentes',
    prevencao: 'Padronize o preenchimento de CID e indicação clínica e confira compatibilidade com o procedimento cobrado.',
  },
  atendimento: {
    titulo: 'Atendimento e internação',
    causa: 'dados do atendimento ou da internação: datas, caráter, local, regime ou sequência de eventos inconsistentes',
    prevencao: 'Confira datas de início, fim e execução, caráter e local do atendimento contra o prontuário antes de fechar a conta.',
  },
  cobranca: {
    titulo: 'Cobrança, valores e prazo',
    causa: 'a cobrança: valor ou quantidade acima do permitido, item incluso em outro procedimento ou pacote, duplicidade, prazo de apresentação ou pagamento conforme negociação',
    prevencao: 'Mantenha a tabela contratual, os pacotes e os aditivos atualizados no faturamento, e respeite o prazo contratual de envio das contas.',
  },
  procedimento: {
    titulo: 'Procedimento',
    causa: 'o procedimento cobrado: código inválido, incompatível com sexo, idade, cobertura ou com o que foi executado',
    prevencao: 'Valide o código TUSS contra a tabela vigente do contrato e a compatibilidade com o perfil do beneficiário e com a descrição em prontuário.',
  },
  acomodacao: {
    titulo: 'Acomodação e permanência',
    causa: 'acomodação e diárias: tipo de acomodação, quantidade de diárias ou permanência acima do autorizado',
    prevencao: 'Confira a acomodação contratada e as diárias autorizadas, e solicite prorrogação antes de ultrapassá-las.',
  },
  material: {
    titulo: 'Material',
    causa: 'materiais: item não coberto, quantidade, valor ou falta de nota fiscal e de registro de utilização',
    prevencao: 'Registre em prontuário o material usado e mantenha nota fiscal e tabela de referência (ex.: Simpro/Brasíndice) conforme o contrato.',
  },
  medicamento: {
    titulo: 'Medicamento',
    causa: 'medicamentos: item não coberto, dose, quantidade, valor ou falta de prescrição e de registro de administração',
    prevencao: 'Garanta prescrição e checagem de enfermagem para cada medicamento cobrado e use a tabela de preço pactuada.',
  },
  opme: {
    titulo: 'OPME',
    causa: 'órteses, próteses e materiais especiais (OPME): autorização, rastreabilidade, nota fiscal ou valor',
    prevencao: 'Só utilize OPME com autorização prévia e guarde etiquetas de rastreabilidade e nota fiscal do fornecedor.',
  },
  gases: {
    titulo: 'Gases medicinais',
    causa: 'gases medicinais: quantidade, tempo de uso ou valor cobrado',
    prevencao: 'Registre horário de início e fim do uso de gases em prontuário e cobre conforme a unidade do contrato.',
  },
  taxa: {
    titulo: 'Taxas e aluguéis',
    causa: 'taxas e aluguéis de sala ou equipamento: cobrança não prevista, duplicada ou incompatível com o procedimento',
    prevencao: 'Confira no contrato quais taxas estão incluídas no procedimento ou no pacote antes de cobrá-las em separado.',
  },
  serie: {
    titulo: 'Procedimento em série',
    causa: 'procedimentos em série (fisioterapia, psicoterapia, fonoaudiologia etc.): quantidade de sessões, modalidade ou frequência',
    prevencao: 'Controle as sessões autorizadas por guia e colete a assinatura do beneficiário em cada sessão.',
  },
  honorario: {
    titulo: 'Honorários e codificação',
    causa: 'honorários profissionais: grau de participação, via de acesso, codificação ou profissional executante',
    prevencao: 'Confira grau de participação e codificação de honorários contra a descrição cirúrgica e a tabela do contrato.',
  },
  exame: {
    titulo: 'Exames',
    causa: 'exames: solicitação, quantidade, repetição em curto prazo ou ausência de laudo',
    prevencao: 'Mantenha pedido médico e laudo assinados para cada exame e verifique regras de periodicidade da operadora.',
  },
  pacote: {
    titulo: 'Pacotes',
    causa: 'pacotes: itens cobrados fora de um pacote que já os inclui, ou composição diferente da pactuada',
    prevencao: 'Tenha a composição de cada pacote contratado à mão e não cobre em separado o que já está incluído.',
  },
  revisao: {
    titulo: 'Revisão de glosa',
    causa: 'o próprio processo de revisão de glosa: recurso fora do prazo, sem justificativa, duplicado ou glosa mantida',
    prevencao: 'Controle o prazo de recurso de cada demonstrativo e apresente um único recurso por guia, bem fundamentado.',
  },
  odontologico: {
    titulo: 'Odontologia',
    causa: 'procedimentos odontológicos: documentação radiográfica, dente/face/região, plano de tratamento, achados da análise técnica ou auditoria',
    prevencao: 'Guarde radiografias inicial e final legíveis, identifique dente, face e região em cada item e cumpra as auditorias exigidas.',
  },
  regra_autorizacao: {
    titulo: 'Regras de autorização',
    causa: 'regras de autorização da operadora e da ANS: Rol de Procedimentos, diretrizes de utilização (DUT), execução única ou vínculos exigidos na solicitação',
    prevencao: 'Consulte o Rol e as diretrizes de utilização (DUT) da ANS e as regras de autorização da operadora antes de solicitar o procedimento.',
  },
  reembolso: {
    titulo: 'Reembolso ao beneficiário',
    causa: 'o pedido de reembolso do beneficiário: formulário, recibo, comprovante de desembolso, dados bancários ou prazo',
    prevencao: 'Oriente o paciente a guardar recibo no padrão da Receita Federal e a enviar o pedido completo dentro do prazo do plano.',
  },
  comunicacao: {
    titulo: 'Comunicação e padrão TISS',
    causa: 'a comunicação eletrônica: arquivo XML fora do padrão TISS, token, biometria, lote, protocolo ou dados de envio inválidos',
    prevencao: 'Valide o XML na versão TISS exigida pela operadora antes de enviar e confira lote, protocolo e dados do remetente.',
  },
  outro: {
    titulo: 'Outras mensagens',
    causa: 'situações que não se encaixam nos demais grupos',
    prevencao: 'Consulte o manual do prestador da operadora para o procedimento específico.',
  },
};

export const FAIXAS = FAIXAS_TABELA_38.map((f) => ({
  ...f,
  codigos: Object.keys(TABELA_38).filter((c) => c >= f.de && c <= f.ate),
}));

export function faixaDe(codigo) {
  return FAIXAS.find((f) => codigo >= f.de && codigo <= f.ate);
}

/** "PROCEDIMENTO INVÁLIDO" → "Procedimento inválido". */
export function legivel(texto) {
  if (texto !== texto.toUpperCase()) return texto;
  return texto.charAt(0) + texto.slice(1).toLowerCase();
}

/** "2026-06-30" → "30/06/2026" */
export function dataBr(iso) {
  return iso ? iso.split('-').reverse().join('/') : '';
}

const todos = Object.values(MOTIVOS);
export const TOTAL = todos.length;
export const TOTAL_VIGENTES = todos.filter((m) => m.vigente).length;
export const TOTAL_ENCERRADOS = TOTAL - TOTAL_VIGENTES;
export const TOTAL_NOVOS_2025 = todos.filter((m) => m.vigencia?.inicio === '2025-12-01' && m.codigo >= '3156').length;
export const DATA_ENCERRAMENTO = todos.find((m) => m.vigencia?.fim)?.vigencia.fim;

/* Contagem por ação entre os vigentes — número citável ("X dos 470
   códigos vigentes admitem recurso"). */
export const CONTAGEM = todos
  .filter((m) => m.vigente)
  .reduce((acc, m) => {
    acc[m.acao] = (acc[m.acao] ?? 0) + 1;
    return acc;
  }, {});
