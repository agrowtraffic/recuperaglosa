/* ============================================================
   Conteúdo da landing — texto separado do layout.

   Para mudar uma frase, mude aqui. O FAQ alimenta também o JSON-LD
   (FAQPage) em page.jsx, então o que a página mostra e o que vai para
   o Google são sempre a mesma coisa.

   Regras de texto desta página:
   - Os ganchos falam das dores de quem é o próprio faturamento:
     consultório de 1 a 5 profissionais, sem faturista.
   - Nenhum número que pareça resultado de cliente. Valores de tela e de
     exemplo são fictícios e vêm marcados como tal.
   - Nenhuma garantia de recuperação.
   ============================================================ */

/* Dores na voz de quem vive o problema. Cada uma vira um gancho. */
export const DORES = [
  {
    frase: '“O depósito caiu menor. Menor quanto, e por quê?”',
    texto: 'O extrato mostra o que entrou, não o que deveria ter entrado. A diferença fica sem nome e sem dono.',
  },
  {
    frase: '“3209, 3306, 3230… isso quer dizer o quê?”',
    texto: 'Cada glosa chega com um código da Tabela 38 da ANS. Explicação de verdade, nenhuma.',
  },
  {
    frase: '“A secretária confere se pagou. Não confere quanto.”',
    texto: 'Na glosa parcial a guia aparece como paga, só que pela metade. É a que mais passa batido.',
  },
  {
    frase: '“O financeiro fica para o sábado.”',
    texto: 'Depois do último paciente, conferir demonstrativo não é prioridade. O prazo de recurso não espera.',
  },
  {
    frase: '“Cada convênio é um portal, um prazo e um formulário.”',
    texto: 'Três operadoras, três regras diferentes. E ninguém na equipe cuida só disso.',
  },
  {
    frase: '“Escrever recurso? Nem sei se essa glosa tem chance.”',
    texto: 'Recurso do zero, um por um, sem saber se aquele código vale o esforço ou é glosa contratual.',
  },
];

/* Códigos mais pesquisados no site, com a ação que o produto atribui
   (src/tiss/motivos.ts). Termos oficiais de src/tiss/tabela38.ts. */
export const CODIGOS = [
  { codigo: '3209', termo: 'Cobrança de procedimento em duplicidade', acao: 'recorrer' },
  { codigo: '3306', termo: 'Senha ou guia de autorização inválida', acao: 'recorrer' },
  { codigo: '3230', termo: 'Documentação incompleta, ilegível ou ausente', acao: 'documento' },
  { codigo: '3287', termo: 'Procedimento sem cobertura pelo plano', acao: 'nao' },
];

export const ROTULO_ACAO = {
  recorrer: 'Cabe recurso',
  documento: 'Enviar documento',
  nao: 'Não vale recorrer',
};

export const PARA_QUEM = [
  'Médicos, dentistas, psicólogos, fisioterapeutas e fonoaudiólogos que atendem convênio',
  'Consultórios e clínicas de 1 a 5 profissionais',
  'Quem não tem faturista e cuida do financeiro entre um paciente e outro',
  'Quem recebe o demonstrativo de pagamento em XML padrão TISS',
];

export const COMPARACAO = {
  colunas: ['Conferir na mão', 'Assessoria de recuperação', 'RecuperaGlosa'],
  linhas: [
    ['Quanto custa', 'Suas noites e sábados', 'Muitas cobram um percentual do que recuperam', 'R$ 0 para começar, R$ 197/mês no Profissional'],
    ['Quando você vê o valor glosado', 'Só se conferir guia por guia', 'Quando o relatório deles chegar', 'Segundos depois de enviar o XML'],
    ['Quem decide o que recorrer', 'Você, no escuro', 'Eles', 'Você, com a recomendação por código'],
    ['O recurso', 'Escrito do zero', 'Feito por terceiros', 'Já redigido, para você revisar e enviar'],
  ],
};

export const FAQ = [
  {
    q: 'O que é glosa?',
    a: 'Glosa é o valor de um atendimento que a operadora não pagou, ou pagou só em parte, depois de analisar a cobrança da clínica. Pode acontecer por divergência de dados, documentação, códigos, autorizações, prazos ou regras do contrato. Nem toda glosa é recuperável, mas saber o motivo rápido ajuda a decidir se vale corrigir ou contestar.',
    link: { href: '/blog/o-que-e-glosa', texto: 'Entenda com exemplos' },
  },
  {
    q: 'Quanto tempo leva a análise?',
    a: 'Segundos depois do upload do XML. Você vê o total glosado, a lista por guia e motivo e os recursos já redigidos na mesma tela.',
  },
  {
    q: 'Qual arquivo eu preciso enviar?',
    a: 'O XML do demonstrativo de pagamento no padrão TISS, que a operadora disponibiliza ao prestador.',
  },
  {
    q: 'E se o convênio só me manda PDF?',
    a: 'Por enquanto o RecuperaGlosa lê apenas o XML do demonstrativo no padrão TISS. Em geral ele fica disponível no portal do prestador da operadora; se não encontrar, peça o arquivo ao suporte do convênio.',
  },
  {
    q: 'Preciso entender de XML ou de faturamento?',
    a: 'Não. O RecuperaGlosa traduz o arquivo técnico em valores, motivos, prazos e prioridades. Para cada código de glosa ele diz o que fazer: recorrer, enviar documento, corrigir e reapresentar ou deixar passar.',
  },
  {
    q: 'Quais códigos de glosa o sistema reconhece?',
    a: 'Todos os 784 códigos da Tabela 38 do padrão TISS: os 470 vigentes na versão de julho/2026, incluindo as mensagens criadas em dezembro/2025, e os encerrados em 30/06/2026 que ainda aparecem em demonstrativos antigos.',
    link: { href: '/codigos-de-glosa', texto: 'Consulte qualquer código' },
  },
  {
    q: 'Qual o prazo para recurso de glosa?',
    a: 'A ANS não fixa um prazo único: pela RN nº 503/2022, ele está no contrato entre a clínica e a operadora e deve ser igual ao prazo de resposta da operadora.',
    link: { href: '/recurso-de-glosa', texto: 'Guia completo de recurso de glosa' },
  },
  {
    q: 'Funciona com qualquer operadora?',
    a: 'Funciona com diferentes operadoras quando o arquivo segue o padrão TISS esperado pela plataforma.',
  },
  {
    q: 'O recurso pode ser enviado sem revisão?',
    a: 'Ele é um ponto de partida já redigido. Revise os dados e acrescente o contexto do atendimento antes de enviar à operadora.',
  },
  {
    q: 'Tem fidelidade? Como cancelo?',
    a: 'O plano gratuito não pede cartão. O Profissional é uma assinatura mensal que você cancela quando quiser pelo portal de cobrança, e o acesso continua até o fim do período já pago.',
  },
  {
    q: 'Os dados da clínica e dos pacientes ficam seguros?',
    a: 'Sim. Cada clínica só acessa os próprios registros, isolados por políticas de segurança no banco de dados, e o tratamento segue a LGPD.',
    link: { href: '/privacidade', texto: 'Política de privacidade' },
  },
  {
    q: 'Existe garantia de recuperação?',
    a: 'Não. O resultado depende da documentação e da análise de cada operadora. O RecuperaGlosa mostra o que foi glosado e o que vale contestar, para você não deixar dinheiro na mesa por falta de tempo.',
  },
];
