/* ============================================================
   Conteúdo da landing.

   HTML pré-renderizado, exportado do builder onde a página foi feita.
   Fica separado e cru de propósito: quando a landing mudar lá, o
   trabalho é substituir esta string, sem reescrever componente nenhum.

   O que mudou em relação ao original:

   - Os dois <script> saíram. A página não precisa de JS: o FAQ usa
     <details> nativo e a rolagem suave vem do CSS. Eram 270KB de bundle
     do framework do builder carregados à toa.

   - Os 11 CTAs apontavam para recuperaglosa.vercel.app. Agora são
     relativos, então a conversão acontece na mesma origem — sem salto de
     redirect e sem perder a atribuição de origem no caminho.

   - As imagens passaram a apontar para /public. A logo é byte a byte a
     mesma que o app já servia, então reaproveita /marca/horizontal.png
     em vez de subir 442KB repetidos.
   ============================================================ */
export const HTML_LANDING = String.raw`<style>
    :root{
      --ink:#10231f;--text:#17302b;--muted:#60716c;--forest:#052b25;
      --forest-2:#073b32;--lime:#c9f66b;--lime-2:#b9e85a;--cream:#f4f6ef;
      --paper:#fffef9;--line:#d8ddd4;--green:#07966f;--coral:#e96a43;
      --amber:#f2c66d;--shadow:0 18px 42px -28px rgba(5,43,37,.34);
      --radius:18px;--max:1200px;
    }
    *{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:90px}
    body{margin:0;background:var(--cream);color:var(--text);font-family:Manrope,system-ui,sans-serif;font-weight:500;line-height:1.55}
    body::before{content:"";position:fixed;inset:0;pointer-events:none;background-image:linear-gradient(rgba(5,43,37,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(5,43,37,.025) 1px,transparent 1px);background-size:48px 48px;mask-image:linear-gradient(to bottom,#000,transparent 38%);z-index:-1}
    a{color:inherit}img{display:block;max-width:100%}.wrap{width:min(var(--max),calc(100% - 40px));margin:auto}
    .nav{position:sticky;top:0;z-index:50;border-bottom:1px solid rgba(5,43,37,.1);background:rgba(244,246,239,.91);backdrop-filter:blur(14px)}
    .nav-inner{min-height:78px;display:flex;align-items:center;gap:30px}.logo{width:178px;height:auto}.nav-links{display:flex;gap:26px;margin-left:auto;align-items:center}.nav-links a{text-decoration:none;font-size:14px;font-weight:700;color:#40534e}.nav-links a:hover{color:var(--forest)}
    .button{display:inline-flex;min-height:48px;align-items:center;justify-content:center;gap:10px;padding:12px 20px;border-radius:12px;border:1px solid transparent;text-decoration:none;font-weight:800;font-size:14px;transition:.2s ease;cursor:pointer}.button:hover{transform:translateY(-2px)}
    .button-primary{background:var(--lime);color:var(--forest);box-shadow:0 12px 25px -16px #365f1a}.button-primary:hover{background:var(--lime-2)}
    .button-dark{background:var(--forest);color:#fff}.button-outline{background:rgba(255,255,255,.72);border-color:var(--line);color:var(--forest)}
    .hero{padding:76px 0 70px;overflow:hidden}.hero-grid{display:grid;grid-template-columns:.92fr 1.08fr;gap:64px;align-items:center}.eyebrow{display:inline-flex;align-items:center;gap:9px;color:#39754a;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.12em}.eyebrow::before{content:"";width:26px;height:3px;border-radius:9px;background:var(--lime)}
    h1,h2,h3,p{margin-top:0}h1{margin:20px 0 22px;font-size:clamp(43px,5.2vw,72px);line-height:1.02;letter-spacing:-.055em;color:var(--ink);font-weight:800}.accent{color:var(--green)}
    .hero-copy>p{max-width:610px;font-size:18px;color:#536761}.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}.micro{margin-top:15px!important;font-size:12px!important;color:#70817c!important}.trust{display:flex;flex-wrap:wrap;gap:10px;margin-top:30px}.trust span{border:1px solid var(--line);border-radius:999px;background:rgba(255,255,255,.66);padding:8px 11px;font-size:12px;font-weight:700}
    .deadline-note{display:grid;grid-template-columns:auto 1fr;gap:12px;align-items:center;margin-top:22px;max-width:610px;border-left:4px solid var(--coral);border-radius:0 12px 12px 0;background:#fff5ef;padding:13px 15px;color:#5d4035}.deadline-note strong{font-size:11px;letter-spacing:.08em;color:var(--coral)}.deadline-note span{font-size:13px;font-weight:700}
    .product-shell{position:relative;background:var(--forest);padding:18px;border-radius:24px;box-shadow:0 38px 80px -42px rgba(5,43,37,.72);transform:rotate(.15deg)}.product-shell::after{content:"";position:absolute;width:220px;height:220px;border-radius:50%;right:-70px;top:-70px;background:var(--lime);filter:blur(80px);opacity:.28;z-index:-1}.browser-bar{height:34px;display:flex;align-items:center;gap:7px;padding:0 5px}.browser-bar i{display:block;width:8px;height:8px;border-radius:50%;background:#fff;opacity:.55}.screen{overflow:hidden;border-radius:12px;background:white;box-shadow:0 5px 20px rgba(0,0,0,.22)}.screen img{width:100%;height:auto}.demo-label{position:absolute;right:27px;bottom:27px;background:rgba(5,43,37,.9);color:white;border:1px solid rgba(255,255,255,.18);padding:8px 10px;border-radius:9px;font-size:10px;font-weight:800;letter-spacing:.04em}
    .proof{padding:26px 0;border-block:1px solid var(--line);background:rgba(255,254,249,.75)}.proof-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:16px}.proof-card{min-height:170px;border:1px solid var(--line);border-radius:18px;padding:24px;box-shadow:var(--shadow)}.proof-stat{display:grid;grid-template-columns:auto 1fr;gap:8px 22px;align-items:center;background:#fff}.proof-number{font-size:48px;line-height:1;font-weight:800;color:var(--coral);letter-spacing:-.05em;grid-row:1 / span 2}.proof-label,.education-kicker{display:block;font-size:11px;font-weight:800;letter-spacing:.1em;text-transform:uppercase}.proof-label{color:var(--green)}.proof-text{font-size:14px;margin:0;color:#40534e}.proof-source{grid-column:2;font-size:11px;color:#71807c}.education-card{position:relative;overflow:hidden;background:var(--forest);color:#fff}.education-card::after{content:"?";position:absolute;right:18px;bottom:-35px;color:rgba(201,246,107,.12);font-size:150px;line-height:1;font-weight:800}.education-kicker{color:var(--lime)}.education-card h2{position:relative;z-index:1;margin:10px 0 8px;font-size:25px;letter-spacing:-.035em}.education-card p{position:relative;z-index:1;margin:0;max-width:520px;color:rgba(255,255,255,.76);font-size:13px}.education-card a{position:relative;z-index:1;display:inline-block;margin-top:14px;color:var(--lime);font-size:12px;font-weight:800;text-decoration:none}
    section{padding:92px 0}.section-head{max-width:760px;margin-bottom:40px}.section-head.center{text-align:center;margin-inline:auto}.section-head h2{font-size:clamp(34px,4vw,54px);line-height:1.05;letter-spacing:-.045em;color:var(--ink);margin:16px 0}.section-head p{color:var(--muted);font-size:17px}
    .pain-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}.card{background:rgba(255,254,249,.91);border:1px solid var(--line);border-radius:var(--radius);padding:24px;box-shadow:var(--shadow)}.card-icon{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:#ebf5d4;color:var(--forest);font-weight:800}.card h3{font-size:17px;line-height:1.25;color:var(--ink);margin:18px 0 10px}.card p{font-size:14px;color:var(--muted);margin:0}
    .dark{background:var(--forest);color:#fff;position:relative;overflow:hidden}.dark::before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 78% 20%,rgba(201,246,107,.14),transparent 34%)}.dark .section-head h2,.dark .section-head p{color:#fff}.dark .section-head p{opacity:.7}.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.13);border-radius:20px;overflow:hidden}.step{background:#073b32;padding:30px;min-height:235px}.step-n{color:var(--lime);font-size:12px;font-weight:800;letter-spacing:.12em}.step h3{font-size:22px;margin:40px 0 12px;color:#fff}.step p{color:rgba(255,255,255,.68);font-size:14px}.flow{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:30px;font-size:13px;font-weight:800;color:var(--lime)}.flow b{padding:9px 14px;border:1px solid rgba(255,255,255,.16);border-radius:999px;color:#fff}
    .product-grid{display:grid;grid-template-columns:1.13fr .87fr;gap:18px}.shot-card{padding:12px;background:#fff;border:1px solid var(--line);border-radius:20px;box-shadow:var(--shadow);position:relative}.shot-card.large{grid-row:span 2}.shot-card img{border-radius:11px;width:100%}.shot-caption{display:flex;gap:16px;justify-content:space-between;align-items:flex-start;padding:15px 6px 4px}.shot-caption strong{color:var(--ink);font-size:14px}.shot-caption span{color:var(--muted);font-size:11px;text-align:right}.fake{color:#6e7e79;font-size:11px;border:1px solid var(--line);padding:6px 9px;border-radius:999px;white-space:nowrap}
    .roles{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.role{border-top:5px solid var(--lime)}.role small{color:var(--green);text-transform:uppercase;font-weight:800;letter-spacing:.08em}.role ul{margin:18px 0 0;padding:0;list-style:none}.role li{font-size:14px;color:#52645f;margin-top:11px;padding-left:23px;position:relative}.role li::before{content:"✓";position:absolute;left:0;color:var(--green);font-weight:800}
    .proof-product{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.proof-product .card{position:relative;overflow:hidden}.proof-product .card::after{content:"";position:absolute;width:100px;height:100px;border-radius:50%;right:-50px;bottom:-50px;background:var(--lime);opacity:.25}.proof-product strong{display:block;color:var(--forest);font-size:23px;letter-spacing:-.03em}.proof-product p{margin-top:8px}
    .use-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}.use-card{min-height:250px;display:flex;flex-direction:column}.use-card .profile{font-size:11px;font-weight:800;letter-spacing:.1em;color:var(--green);text-transform:uppercase}.use-card h3{font-size:22px}.use-card .scenario{margin-top:auto;border-top:1px solid var(--line);padding-top:15px;font-size:13px;font-weight:700;color:var(--forest)}
    .compare{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--line);border-radius:20px;overflow:hidden}.compare-col{padding:34px;background:#fff}.compare-col.good{background:var(--forest);color:#fff}.compare h3{font-size:24px;margin-bottom:24px}.compare-list{display:grid;gap:18px}.compare-row{display:grid;grid-template-columns:34px 1fr;align-items:start;font-size:14px}.compare-row i{font-style:normal;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:#f3e5df;color:var(--coral);font-weight:800}.good .compare-row i{background:var(--lime);color:var(--forest)}.good .compare-row{color:rgba(255,255,255,.82)}
    .security-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.security-grid .card{padding:20px}.security-grid h3{font-size:15px}.security-grid p{font-size:12px}
    .pricing{display:grid;grid-template-columns:.8fr 1.2fr;gap:18px;align-items:stretch}.price{display:flex;flex-direction:column}.price.featured{background:var(--forest);color:#fff;border-color:var(--forest);position:relative}.price.featured h3,.price.featured .amount{color:#fff}.price.featured p,.price.featured li{color:rgba(255,255,255,.72)}.badge{position:absolute;top:18px;right:18px;background:var(--lime);color:var(--forest);font-size:10px;font-weight:800;padding:7px 9px;border-radius:999px}.amount{font-size:42px;line-height:1;color:var(--ink);font-weight:800;margin:26px 0}.amount span{font-size:14px;font-weight:700}.price ul{list-style:none;padding:0;margin:0 0 30px;display:grid;gap:12px}.price li{font-size:14px;color:#52645f}.price .button{margin-top:auto}
    .roi{margin-top:18px;background:var(--lime);color:var(--forest);border-radius:18px;padding:23px 25px;display:flex;align-items:center;justify-content:space-between;gap:25px}.roi strong{font-size:20px}.roi small{display:block;opacity:.74;margin-top:4px}
    .faq{max-width:850px;margin:auto}.faq details{background:#fff;border:1px solid var(--line);border-radius:14px;margin:10px 0;padding:0 20px}.faq summary{list-style:none;cursor:pointer;padding:20px 34px 20px 0;font-weight:800;color:var(--ink);position:relative}.faq summary::after{content:"+";position:absolute;right:0;font-size:24px;font-weight:500}.faq details[open] summary::after{content:"−"}.faq details p{color:var(--muted);font-size:14px;padding:0 20px 20px 0;margin:0}
    .final{padding-top:30px}.final-box{background:var(--forest);color:white;border-radius:26px;padding:65px;position:relative;overflow:hidden}.final-box::after{content:"";position:absolute;right:-60px;bottom:-120px;width:360px;height:360px;border-radius:50%;background:var(--lime);filter:blur(90px);opacity:.22}.final-box h2{font-size:clamp(35px,4.5vw,58px);line-height:1.03;letter-spacing:-.045em;max-width:780px;margin-bottom:18px}.final-box p{max-width:620px;color:rgba(255,255,255,.72)}
    footer{padding:46px 0 100px;border-top:1px solid var(--line);margin-top:80px}.footer-grid{display:grid;grid-template-columns:1.3fr 1fr;gap:40px}.footer-logo{width:170px}.footer-grid p{font-size:12px;color:var(--muted);max-width:570px;margin-top:16px}.footer-links{display:flex;justify-content:flex-end;gap:24px;align-items:flex-start;flex-wrap:wrap}.footer-links a{font-size:13px;color:#52645f;text-decoration:none}.mobile-bar{display:none}
    @media(max-width:980px){.nav-links a:not(.button){display:none}.hero-grid,.product-grid,.proof-grid{grid-template-columns:1fr}.hero-copy{max-width:720px}.pain-grid{grid-template-columns:1fr 1fr}.roles,.proof-product,.use-grid{grid-template-columns:1fr}.security-grid{grid-template-columns:1fr 1fr}.product-shell{max-width:760px}.shot-card.large{grid-row:auto}.pricing{grid-template-columns:1fr}.steps{grid-template-columns:1fr}.step{min-height:0}.step h3{margin-top:24px}}
    @media(max-width:640px){.wrap{width:min(100% - 28px,var(--max))}.nav-inner{min-height:68px}.logo{width:145px}.nav .button{display:none}.hero{padding:48px 0}.hero-grid{gap:38px}h1{font-size:42px}.hero-copy>p{font-size:16px}.actions{flex-direction:column}.actions .button{width:100%}.product-shell{padding:10px;border-radius:17px}.demo-label{position:static;display:block;margin-top:9px;text-align:center}.proof-stat{grid-template-columns:1fr}.proof-number{grid-row:auto}.proof-source{grid-column:auto}.pain-grid,.security-grid{grid-template-columns:1fr}section{padding:68px 0}.section-head h2{font-size:36px}.product-grid{gap:12px}.shot-caption{flex-direction:column}.roles{gap:12px}.compare{grid-template-columns:1fr}.roi{align-items:flex-start;flex-direction:column}.final-box{padding:44px 25px}.footer-grid{grid-template-columns:1fr}.footer-links{justify-content:flex-start}.mobile-bar{display:block;position:fixed;left:0;right:0;bottom:0;padding:10px 14px calc(10px + env(safe-area-inset-bottom));background:rgba(244,246,239,.94);backdrop-filter:blur(12px);border-top:1px solid var(--line);z-index:60}.mobile-bar .button{width:100%}}
    @media(prefers-reduced-motion:reduce){*{scroll-behavior:auto!important;transition:none!important}}
  </style><div class="landing-root">
  <nav class="nav" aria-label="Navegação principal">
    <div class="wrap nav-inner">
      <a href="#topo" aria-label="RecuperaGlosa — início"><img class="logo" src="/marca/horizontal.png" alt="RecuperaGlosa"></a>
      <div class="nav-links">
        <a href="#como">Como funciona</a><a href="#produto">Produto</a><a href="#seguranca">Segurança</a><a href="#planos">Planos</a><a href="#faq">FAQ</a>
        <a class="button button-primary" href="/login?modo=cadastro">Analisar meu XML</a>
      </div>
    </div>
  </nav>

  <header class="hero" id="topo">
    <div class="wrap hero-grid">
      <div class="hero-copy">
        <span class="eyebrow">Auditoria inteligente de glosas</span>
        <h1>O dinheiro da sua clínica não pode ficar <span class="accent">parado nas glosas.</span></h1>
        <p>Envie o XML TISS, descubra o valor recuperável e organize os recursos para sua equipe agir antes do prazo.</p>
        <div class="actions">
          <a class="button button-primary" href="/login?modo=cadastro">Analisar meu XML gratuitamente <span>→</span></a>
        </div>
        <p class="micro">Comece grátis • Sem cartão • Cancele quando quiser</p>
        <div class="deadline-note"><strong>PRAZO IMPORTA</strong><span>Os prazos variam por operadora. Cada dia sem análise reduz o tempo disponível para revisar e protocolar o recurso.</span></div>
        <div class="trust"><span>✓ XML padrão TISS</span><span>✓ Recurso revisável</span><span>✓ Sem instalação</span></div>
      </div>
      <div class="product-shell" aria-label="Demonstração do painel do RecuperaGlosa">
        <div class="browser-bar"><i></i><i></i><i></i></div>
        <div class="screen"><img src="/marketing/saas-dashboard-real.png" alt="Painel demonstrativo do RecuperaGlosa com dados fictícios"></div>
        <span class="demo-label">PRODUTO EM DEMONSTRAÇÃO • DADOS FICTÍCIOS</span>
      </div>
    </div>
  </header>

  <aside class="proof" aria-label="Educação e dados sobre glosas">
    <div class="wrap proof-grid">
      <article class="proof-card proof-stat"><strong class="proof-number">15,89%</strong><div><span class="proof-label">O tamanho do problema</span><p class="proof-text">foi o índice de glosa inicial em 2024 entre hospitais associados, segundo dados do Observatório Anahp 2025 apresentados à ANS.</p></div><a class="proof-source" target="_blank" rel="noreferrer" href="https://www.gov.br/ans/pt-br/acesso-a-informacao/participacao-da-sociedade/camara-de-saude-suplementar/Glosas_nos_Servios_de_Sade__FBH.pdf">Ver fonte ↗</a></article>
      <article class="proof-card education-card"><span class="education-kicker">Entenda antes de agir</span><h2>O que é glosa?</h2><p>É o valor de um atendimento que a operadora não pagou, ou pagou apenas parcialmente. Pode ocorrer por divergências de dados, códigos, documentos, autorizações, prazos ou regras contratuais.</p><a href="#faq">Entenda melhor no FAQ →</a></article>
    </div>
  </aside>

  <section id="prova-produto"><div class="wrap"><div class="section-head center"><span class="eyebrow">Prova do produto</span><h2>Veja o que a plataforma entrega antes de acreditar em promessas.</h2><p>Enquanto os primeiros casos reais são documentados, mostramos apenas recursos existentes e telas com dados fictícios claramente identificados.</p></div><div class="proof-product">
    <article class="card"><strong>Valor recuperável</strong><p>A diferença entre apresentado e pago aparece de forma clara para a equipe.</p></article>
    <article class="card"><strong>Fila por prazo</strong><p>As glosas são organizadas para indicar onde a atuação deve começar.</p></article>
    <article class="card"><strong>Recurso revisável</strong><p>O documento organiza o caso, mas a decisão final permanece com sua equipe.</p></article>
  </div></div></section>

  <section id="problema"><div class="wrap"><div class="section-head"><span class="eyebrow">O problema</span><h2>O serviço foi realizado. O pagamento não chegou inteiro.</h2><p>A diferença entre o faturado e o recebido costuma ficar escondida em arquivos extensos, até o prazo começar a vencer.</p></div><div class="pain-grid">
    <article class="card"><span class="card-icon">XML</span><h3>Demonstrativos difíceis</h3><p>Guias, códigos e motivos técnicos que consomem horas de conferência manual.</p></article>
    <article class="card"><span class="card-icon">R$</span><h3>Dinheiro invisível</h3><p>A receita glosada existe, mas não aparece de forma clara para a gestão.</p></article>
    <article class="card"><span class="card-icon">7d</span><h3>Prazos correndo</h3><p>Quando o caso ganha atenção, a janela de contestação pode estar terminando.</p></article>
    <article class="card"><span class="card-icon">✓</span><h3>Equipe sobrecarregada</h3><p>Planilhas paralelas e recursos redigidos um a um travam o faturamento.</p></article>
  </div></div></section>

  <section class="dark" id="como"><div class="wrap"><div class="section-head"><span class="eyebrow">Como funciona</span><h2>Do XML ao recurso organizado em três passos.</h2><p>Uma jornada curta, baseada no mesmo arquivo que a operadora já envia.</p></div><div class="steps">
    <article class="step"><span class="step-n">PASSO 01</span><h3>Envie o XML TISS</h3><p>Faça o upload do demonstrativo. Sem instalação e sem integração complexa.</p></article>
    <article class="step"><span class="step-n">PASSO 02</span><h3>Veja o que pode voltar</h3><p>Valores, motivos e prazos aparecem organizados por prioridade financeira.</p></article>
    <article class="step"><span class="step-n">PASSO 03</span><h3>Revise e acompanhe</h3><p>Use o recurso estruturado como ponto de partida e acompanhe o retorno.</p></article>
  </div><div class="flow"><b>XML</b><span>→</span><b>auditoria</b><span>→</span><b>recurso</b><span>→</span><b>retorno</b></div></div></section>

  <section id="produto"><div class="wrap"><div class="section-head"><span class="eyebrow">Produto real</span><h2>Clareza financeira com a mesma linguagem do seu faturamento.</h2><p>As telas abaixo pertencem ao produto em desenvolvimento e usam clínicas, operadoras, pacientes, guias e valores fictícios.</p></div><div class="product-grid">
    <article class="shot-card large"><img src="/marketing/saas-dashboard-real.png" alt="Visão geral demonstrativa do produto"><div class="shot-caption"><strong>Veja para onde foi o faturamento</strong><span class="fake">Dados fictícios</span></div></article>
    <article class="shot-card"><img src="/marketing/saas-glosas-real.png" alt="Fila demonstrativa de glosas"><div class="shot-caption"><strong>Priorize por valor e prazo</strong><span class="fake">Dados fictícios</span></div></article>
    <article class="shot-card"><img src="/marketing/saas-recurso-real.png" alt="Recurso de glosa demonstrativo"><div class="shot-caption"><strong>Revise o recurso antes do envio</strong><span class="fake">Dados fictícios</span></div></article>
  </div></div></section>

  <section id="beneficios"><div class="wrap"><div class="section-head center"><span class="eyebrow">Para toda a operação</span><h2>Uma visão para cada decisão.</h2></div><div class="roles">
    <article class="card role"><small>Dono e gestor</small><h3>Receita visível e priorizada</h3><ul><li>O que foi faturado, pago e glosado</li><li>Quanto ainda está dentro do prazo</li><li>Onde concentrar o esforço da equipe</li></ul></article>
    <article class="card role"><small>Financeiro</small><h3>Valores e prazos centralizados</h3><ul><li>Recálculo por apresentado e pago</li><li>Visão por operadora e competência</li><li>Acompanhamento do retorno ao caixa</li></ul></article>
    <article class="card role"><small>Faturamento</small><h3>Menos trabalho repetitivo</h3><ul><li>Fila de glosas por prioridade</li><li>Documento estruturado e revisável</li><li>Histórico organizado no mesmo lugar</li></ul></article>
  </div></div></section>

  <section id="casos-de-uso"><div class="wrap"><div class="section-head"><span class="eyebrow">Casos de uso</span><h2>Quanto pode voltar? O número confiável está no seu próprio XML.</h2><p>Em vez de usar estimativas genéricas, o RecuperaGlosa analisa o demonstrativo da sua operação e mostra o valor identificado no seu cenário.</p></div><div class="use-grid">
    <article class="card use-card"><span class="profile">Consultório individual</span><h3>Encontre glosas sem montar uma estrutura de faturamento.</h3><p>Para profissionais que atendem convênios e precisam entender os demonstrativos sem depender de leitura técnica linha a linha.</p><div class="scenario">Comece com um XML e veja o valor real do seu período.</div></article>
    <article class="card use-card"><span class="profile">Clínica com volume recorrente</span><h3>Priorize dezenas de guias pelo impacto financeiro.</h3><p>Para equipes que precisam decidir rapidamente quais glosas revisar primeiro e quais prazos merecem atenção.</p><div class="scenario">Compare operadoras, motivos, valores e competências.</div></article>
    <article class="card use-card"><span class="profile">Operação de maior porte</span><h3>Dê visibilidade à jornada da receita.</h3><p>Para gestores que precisam acompanhar apresentado, pago, glosado, em recurso e recuperado no mesmo fluxo.</p><div class="scenario">Use relatórios para orientar processo e capacidade da equipe.</div></article>
  </div><div class="actions"><a class="button button-primary" href="/login?modo=cadastro">Descobrir o valor no meu XML →</a></div></div></section>

  <section><div class="wrap"><div class="section-head"><span class="eyebrow">Antes e depois</span><h2>Saia da leitura manual para uma fila de ação.</h2></div><div class="compare">
    <div class="compare-col"><h3>Sem RecuperaGlosa</h3><div class="compare-list"><div class="compare-row"><i>×</i><span>XML bruto e planilhas paralelas</span></div><div class="compare-row"><i>×</i><span>Priorização no escuro</span></div><div class="compare-row"><i>×</i><span>Recursos redigidos caso a caso</span></div><div class="compare-row"><i>×</i><span>Prazos espalhados entre pessoas</span></div></div></div>
    <div class="compare-col good"><h3>Com RecuperaGlosa</h3><div class="compare-list"><div class="compare-row"><i>✓</i><span>Leitura financeira clara do demonstrativo</span></div><div class="compare-row"><i>✓</i><span>Fila por valor, motivo e prazo</span></div><div class="compare-row"><i>✓</i><span>Documento estruturado para revisão</span></div><div class="compare-row"><i>✓</i><span>Acompanhamento no mesmo fluxo</span></div></div></div>
  </div></div></section>

  <section id="seguranca"><div class="wrap"><div class="section-head"><span class="eyebrow">Segurança e transparência</span><h2>O que o produto faz — e o que não promete.</h2><p>A tecnologia organiza e apoia a decisão. A revisão permanece com sua equipe, e a resposta final continua sendo da operadora.</p></div><div class="security-grid">
    <article class="card"><span class="card-icon">01</span><h3>XML padrão TISS</h3><p>Leitura do demonstrativo disponibilizado pela operadora.</p></article>
    <article class="card"><span class="card-icon">02</span><h3>Múltiplas operadoras</h3><p>Desde que o arquivo siga o padrão esperado.</p></article>
    <article class="card"><span class="card-icon">03</span><h3>Recálculo independente</h3><p>Comparação entre o apresentado e o pago.</p></article>
    <article class="card"><span class="card-icon">04</span><h3>Dados separados</h3><p>Políticas de acesso por clínica em nível de linha.</p></article>
    <article class="card"><span class="card-icon">05</span><h3>Recurso revisável</h3><p>Nenhum resultado ou reversão é garantido.</p></article>
  </div></div></section>

  <section id="planos"><div class="wrap"><div class="section-head center"><span class="eyebrow">Planos</span><h2>Comece grátis. Assine quando enxergar valor.</h2></div><div class="pricing">
    <article class="card price"><h3>Gratuito</h3><p>Para descobrir onde a glosa pesa.</p><div class="amount">R$ 0</div><ul><li>✓ Até 5 análises por mês</li><li>✓ Valor recuperável identificado</li><li>✓ Sem cartão de crédito</li></ul><a class="button button-outline" href="/login?modo=cadastro">Começar gratuitamente</a></article>
    <article class="card price featured"><span class="badge">MAIS INDICADO</span><h3>Profissional</h3><p>Para clínicas com glosas recorrentes.</p><div class="amount">R$ 197 <span>/mês</span></div><ul><li>✓ Análises ilimitadas</li><li>✓ Relatórios automatizados</li><li>✓ Priorização por prazo</li><li>✓ Histórico completo</li><li>✓ Recursos administrativos revisáveis</li></ul><a class="button button-primary" href="/login?modo=cadastro">Analisar meu XML gratuitamente</a></article>
  </div><div class="roi"><div><strong>Se recuperar R$ 197 no mês, a assinatura já se paga.</strong><small>A recuperação depende da documentação e da decisão da operadora; não há garantia de resultado.</small></div><a class="button button-dark" href="/login?modo=cadastro">Começar agora</a></div></div></section>

  <section id="faq"><div class="wrap"><div class="section-head center"><span class="eyebrow">Perguntas frequentes</span><h2>Sem letras miúdas.</h2></div><div class="faq">
    <details><summary>O que é glosa?</summary><p>Glosa é o valor de um atendimento que a operadora não pagou, ou pagou apenas parcialmente, após analisar a cobrança enviada pela clínica. Ela pode ocorrer por divergências de dados, documentação, códigos, autorizações, prazos ou regras contratuais. Nem toda glosa é recuperável, mas identificar o motivo rapidamente ajuda a equipe a decidir se deve corrigir ou contestar.</p></details>
    <details><summary>Qual arquivo eu preciso enviar?</summary><p>O XML do demonstrativo de pagamento no padrão TISS, disponibilizado pela operadora.</p></details>
    <details><summary>Funciona com qualquer operadora?</summary><p>Funciona com diferentes operadoras quando o arquivo segue o padrão TISS esperado pela plataforma.</p></details>
    <details><summary>O sistema apenas repete o valor informado?</summary><p>Não. A plataforma compara os valores apresentados e pagos para calcular a diferença identificada no demonstrativo.</p></details>
    <details><summary>O recurso pode ser enviado sem revisão?</summary><p>Ele é um ponto de partida. Sua equipe deve revisar os dados e acrescentar o contexto do atendimento antes do envio.</p></details>
    <details><summary>Preciso entender de XML?</summary><p>Não. O objetivo é traduzir o arquivo técnico em valores, motivos, prazos e prioridades compreensíveis.</p></details>
    <details><summary>Isso substitui a equipe de faturamento?</summary><p>Não. O produto reduz trabalho repetitivo e organiza informações; a decisão final permanece com a equipe.</p></details>
    <details><summary>Existe garantia de recuperação?</summary><p>Não. O resultado depende da documentação e da análise de cada operadora.</p></details>
  </div></div></section>

  <section class="final"><div class="wrap"><div class="final-box"><h2>O dinheiro já foi faturado. Descubra o que ainda pode voltar.</h2><p>Comece com um demonstrativo e transforme dados técnicos em uma lista clara de ações para sua equipe.</p><div class="actions"><a class="button button-primary" href="/login?modo=cadastro">Analisar meu XML gratuitamente</a><a class="button button-outline" target="_blank" rel="noreferrer" href="https://wa.me/5511977315655">Falar no WhatsApp</a></div></div></div></section>

  <footer><div class="wrap footer-grid"><div><img class="footer-logo" src="/marca/horizontal.png" alt="RecuperaGlosa"><p>Ferramenta independente para análise de demonstrativos TISS. As telas desta página utilizam dados fictícios. Os recursos são revisáveis e não há garantia de recuperação.</p></div><div class="footer-links"><a href="/privacidade">Privacidade</a><a href="/termos">Termos</a><a href="/ajuda">Ajuda</a><a href="mailto:suporte@recuperaglosa.com.br">Contato</a></div></div></footer>
  <div class="mobile-bar"><a class="button button-primary" href="/login?modo=cadastro">Analisar meu XML gratuitamente</a></div>
</div>`;
