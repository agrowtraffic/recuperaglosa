/* ============================================================
   Roteiro do tutorial.

   Regras que valem para todo passo novo:

   - `alvo` é um seletor do app real, ou null para um cartão
     centralizado. Passo com alvo inexistente é PULADO, não derruba o
     tutorial: a tela de quem acabou de entrar não tem trilho de dinheiro
     nem KPI, e é justamente essa pessoa que mais precisa do tutorial.

   - Nada de valor em reais escrito à mão. Número inventado no tutorial
     vira reclamação quando não bate com a tela.

   - Só falar de coisa que existe. Descrever filtro ou status que o
     produto não tem ensina a pessoa a procurar o que não vai achar.
   ============================================================ */

export const PASSOS = [
  {
    id: 'boas-vindas',
    alvo: null,
    titulo: 'Bem-vindo ao Recupera Glosa',
    texto:
      'Quando o convênio paga menos do que você faturou, a diferença é uma glosa. ' +
      'Este é o lugar onde você descobre quanto foi glosado, por qual motivo, e sai com a contestação escrita. ' +
      'São 40 segundos de tutorial.',
  },
  {
    id: 'caminho',
    alvo: '.rg-nav',
    posicao: 'direita',
    titulo: 'O caminho, de cima para baixo',
    texto:
      'Lotes é onde você envia o demonstrativo. Guias e Glosas mostram o que a auditoria encontrou. ' +
      'Recursos guarda as contestações prontas. Relatórios prova o retorno no fim do mês.',
  },
  {
    id: 'enviar',
    alvo: '[data-tour="enviar-xml"]',
    posicao: 'baixo',
    titulo: 'Tudo começa com o XML',
    texto:
      'É o demonstrativo de pagamento que a operadora disponibiliza no portal dela, no padrão TISS. ' +
      'O mesmo arquivo que ela manda quando fecha o pagamento de um lote de guias.',
  },
  {
    id: 'trilho',
    alvo: '.rg-rail',
    posicao: 'baixo',
    titulo: 'Para onde foi o seu dinheiro',
    texto:
      'Da esquerda para a direita: o que você faturou, o que a operadora pagou, o que ela não pagou, ' +
      'o que você já contestou e o que voltou pro caixa. Cada etapa leva para a lista por trás dela.',
  },
  {
    id: 'prioridade',
    alvo: '.rg-grid-kpi',
    posicao: 'baixo',
    titulo: 'Onde agir primeiro',
    texto:
      'Valor recuperável é o que ainda dá para contestar. Prazo mais próximo é quantos dias faltam ' +
      'para a glosa mais urgente vencer — passou do prazo, o dinheiro é perdido.',
  },
  {
    id: 'recurso',
    alvo: null,
    titulo: 'A contestação sai escrita',
    texto:
      'Para cada glosa recorrível o sistema monta o recurso com a fundamentação do motivo que a ' +
      'operadora usou. Você revisa, baixa em PDF e envia. Revisar vale a pena: sua equipe sabe do ' +
      'atendimento o que o sistema não tem como saber.',
  },
  {
    id: 'fim',
    alvo: null,
    titulo: 'É só isso',
    texto:
      'Envie o primeiro demonstrativo e a auditoria roda em segundos. ' +
      'Para rever este tutorial, use o menu da clínica no topo da tela.',
    acao: { texto: 'Enviar meu primeiro XML', href: '/lotes' },
  },
];
