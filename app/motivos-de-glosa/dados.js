/* ============================================================
   Camada editorial das páginas públicas da Tabela 38.

   O termo oficial de cada código vem de src/tiss/tabela38.ts e a
   orientação (ação + argumento) de src/tiss/motivos.ts — as mesmas
   fontes que o produto usa para montar o recurso. Aqui só entra o que
   é de página: rótulos, e causa/prevenção por grupo de códigos.

   Causa e prevenção são por faixa, não por código, e o texto diz isso.
   Não fingir análise individual onde ela não existe é a mesma regra
   que motivos.ts segue.
   ============================================================ */
import { TABELA_38, FAIXAS_TABELA_38 } from '@/src/tiss/tabela38';
import { MOTIVOS } from '@/src/tiss/motivos';

export const VERSAO_TABELA = 'dezembro/2017';

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
    resumo: 'a operadora ainda está analisando; acompanhe o próximo demonstrativo antes de agir.',
  },
  favoravel: {
    rotulo: 'Mensagem favorável',
    classe: 'seloFavoravel',
    resumo: 'não é uma glosa contra o prestador — é um aviso de pagamento ou de recurso acatado.',
  },
};

/* Causas típicas e prevenção por faixa da Tabela 38. */
export const GRUPOS = {
  '10': {
    causa: 'dados do beneficiário: carteira, elegibilidade, carência, cobertura ou situação cadastral na operadora na data do atendimento',
    prevencao: 'Confirme a elegibilidade no portal da operadora no dia do atendimento e guarde o comprovante. Confira validade da carteira, carência e segmentação do plano antes de procedimentos eletivos.',
  },
  '11': {
    causa: 'a consolidação do protocolo de envio: quantidade de guias, valor total ou tipo de apresentação diferentes do que foi cadastrado',
    prevencao: 'Antes de fechar o lote, confira quantidade de guias e soma dos valores contra o total declarado no protocolo.',
  },
  '12': {
    causa: 'o cadastro do prestador na operadora: CNES, CPF/CNPJ, código do prestador, vigência do contrato ou vínculo com a rede',
    prevencao: 'Mantenha CNES, CNPJ e código de prestador atualizados na operadora e acompanhe a vigência do contrato de credenciamento.',
  },
  '13': {
    causa: 'o preenchimento da guia: campos obrigatórios, assinaturas, rasuras, número de guia ou tipo de guia incorreto',
    prevencao: 'Use um checklist de campos obrigatórios por tipo de guia (consulta, SP/SADT, honorários) e revise assinaturas antes do faturamento.',
  },
  '14': {
    causa: 'a autorização prévia: senha ausente, inválida, vencida ou divergente do que foi executado',
    prevencao: 'Registre a senha e a data de validade na guia, guarde o comprovante de autorização e confira se o executado bate com o autorizado.',
  },
  '15': {
    causa: 'dados clínicos: CID, indicação clínica, caráter do atendimento ou outras informações clínicas inválidas ou ausentes',
    prevencao: 'Padronize o preenchimento de CID e indicação clínica e confira compatibilidade com o procedimento cobrado.',
  },
  '16': {
    causa: 'dados do atendimento ou da internação: datas, tipo de atendimento, regime ou sequência de eventos inconsistentes',
    prevencao: 'Confira datas de início, fim e execução contra o prontuário antes de fechar a conta.',
  },
  '17': {
    causa: 'a cobrança: valor acima da tabela, prazo de apresentação, duplicidade, franquia/coparticipação ou pagamento conforme negociação',
    prevencao: 'Mantenha a tabela contratual e aditivos atualizados no sistema de faturamento e respeite o prazo contratual de envio das contas.',
  },
  '18': {
    causa: 'o procedimento cobrado: código inválido, incompatível com sexo, idade ou cobertura, ou não previsto na tabela',
    prevencao: 'Valide o código TUSS contra a tabela vigente do contrato e a compatibilidade com o perfil do beneficiário.',
  },
  '19': {
    causa: 'acomodação e diárias: tipo de acomodação, quantidade de diárias ou permanência acima do autorizado',
    prevencao: 'Confira a acomodação contratada e as diárias autorizadas, e solicite prorrogação antes de ultrapassá-las.',
  },
  '20': {
    causa: 'materiais: item não coberto, quantidade, valor ou falta de nota fiscal e de registro de utilização',
    prevencao: 'Registre em prontuário o material usado e mantenha nota fiscal e tabela de referência (ex.: Simpro/Brasíndice) conforme o contrato.',
  },
  '21': {
    causa: 'medicamentos: item não coberto, dose, quantidade, valor ou falta de prescrição e de registro de administração',
    prevencao: 'Garanta prescrição e checagem de enfermagem para cada medicamento cobrado e use a tabela de preço pactuada.',
  },
  '22': {
    causa: 'órteses, próteses e materiais especiais (OPME): autorização, rastreabilidade, nota fiscal ou valor',
    prevencao: 'Só utilize OPME com autorização prévia e guarde etiquetas de rastreabilidade e nota fiscal do fornecedor.',
  },
  '23': {
    causa: 'gases medicinais: quantidade, tempo de uso ou valor cobrado',
    prevencao: 'Registre horário de início e fim do uso de gases em prontuário e cobre conforme a unidade do contrato.',
  },
  '24': {
    causa: 'taxas e aluguéis de sala ou equipamento: cobrança não prevista, duplicada ou incompatível com o procedimento',
    prevencao: 'Confira no contrato quais taxas estão incluídas no procedimento ou no pacote antes de cobrá-las em separado.',
  },
  '25': {
    causa: 'procedimentos em série (fisioterapia, psicoterapia, fonoaudiologia etc.): quantidade de sessões, modalidade ou frequência',
    prevencao: 'Controle as sessões autorizadas por guia e colete a assinatura do beneficiário em cada sessão.',
  },
  '26': {
    causa: 'honorários profissionais: grau de participação, via de acesso, codificação ou profissional executante',
    prevencao: 'Confira grau de participação e codificação de honorários contra a descrição cirúrgica e a tabela do contrato.',
  },
  '27': {
    causa: 'exames: solicitação, quantidade, repetição em curto prazo ou ausência de laudo',
    prevencao: 'Mantenha pedido médico e laudo assinados para cada exame e verifique regras de periodicidade da operadora.',
  },
  '28': {
    causa: 'pacotes: itens cobrados fora de um pacote que já os inclui, ou composição diferente da pactuada',
    prevencao: 'Tenha a composição de cada pacote contratado à mão e não cobre em separado o que já está incluído.',
  },
  '29': {
    causa: 'o próprio processo de revisão de glosa: recurso fora do prazo, sem justificativa, duplicado ou glosa mantida',
    prevencao: 'Controle o prazo de recurso de cada demonstrativo e apresente um único recurso por guia, bem fundamentado.',
  },
  '30': {
    causa: 'procedimentos odontológicos: documentação radiográfica, dente/face/região, plano de tratamento ou auditoria',
    prevencao: 'Guarde radiografias inicial e final, identifique dente, face e região em cada item e cumpra as auditorias exigidas.',
  },
  '31': {
    causa: 'regras de autorização da operadora: diretrizes de utilização, execução única, cadastros ou vínculos exigidos na solicitação',
    prevencao: 'Consulte as diretrizes de utilização (DUT) e as regras de autorização da operadora antes de solicitar o procedimento.',
  },
  '50': {
    causa: 'a comunicação eletrônica: arquivo XML fora do padrão TISS, versão, hash ou dados de envio inválidos',
    prevencao: 'Valide o XML na versão TISS exigida pela operadora antes de enviar e confira os dados do remetente.',
  },
};

export const FAIXAS = FAIXAS_TABELA_38.map((f) => ({
  ...f,
  codigos: Object.keys(TABELA_38).filter((c) => c.startsWith(f.prefixo)),
}));

export function faixaDe(codigo) {
  return FAIXAS.find((f) => codigo.startsWith(f.prefixo));
}

/** "PROCEDIMENTO INVÁLIDO" → "Procedimento inválido". */
export function legivel(texto) {
  return texto.charAt(0) + texto.slice(1).toLowerCase();
}

export { TABELA_38, MOTIVOS };

/* Contagem por ação — número citável ("X dos 603 códigos admitem
   recurso"), útil para a página e para quem cita a página. */
export const CONTAGEM = Object.values(MOTIVOS).reduce((acc, m) => {
  acc[m.acao] = (acc[m.acao] ?? 0) + 1;
  return acc;
}, {});

export const TOTAL = Object.keys(TABELA_38).length;
