/* ============================================================
   LANDING  →  servida em / para quem não tem sessão.

   O middleware reescreve (não redireciona) a raiz para cá quando não há
   sessão, então a URL que a pessoa vê continua sendo recuperaglosa.com.br.
   Reescrita e não redirect porque o endereço de uma landing é ativo de
   marketing: um 307 para /inicio jogaria fora o link que vai em anúncio,
   e-mail e busca.

   Quem tem sessão nunca chega aqui — a raiz segue servindo o painel.

   Estrutura (cada seção responde a uma objeção de quem é o próprio
   faturamento do consultório):
     hero        → "seu convênio glosou, você sabe quanto?" (mesma frase
                    dos anúncios: quem clica encontra o que leu)
     dores       → as frases que o dono já disse em voz alta
     invisível   → a glosa parcial, que parece paga
     calculadora → o tamanho do problema em reais, com os números dele
     como        → três passos
     códigos     → uma decisão por código, inclusive "não recorra"
     produto     → telas reais com dados fictícios
     comparação  → na mão × assessoria × RecuperaGlosa
     para quem   → quem é (e quem não é) o cliente
     planos, FAQ, CTA final

   Texto em ./conteudo.js. Fotos: Vitaly Gariev / Unsplash (licença
   Unsplash, uso comercial livre).
   ============================================================ */
import Image from 'next/image';
import { COMPARACAO, CODIGOS, DORES, FAQ, PARA_QUEM, ROTULO_ACAO } from './conteudo';
import Calculadora from './Calculadora';
import s from './landing.module.css';
import { LIMITE_GRATIS, NOME, OG_IMAGE, ORGANIZACAO, PRECO_PRO, SITE, jsonLd } from '@/lib/seo';

const CADASTRO = '/login?modo=cadastro';
const WHATSAPP = 'https://wa.me/5511977315655';

const SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    ORGANIZACAO,
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#site`,
      name: NOME,
      url: SITE,
      inLanguage: 'pt-BR',
      publisher: { '@id': ORGANIZACAO['@id'] },
    },
    {
      '@type': 'SoftwareApplication',
      name: NOME,
      url: SITE,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Auditoria de glosas de convênio',
      operatingSystem: 'Web',
      inLanguage: 'pt-BR',
      description:
        'Auditoria de glosas de convênio para clínicas e consultórios: lê o XML do demonstrativo TISS, recalcula o valor glosado por guia e motivo e redige o recurso de glosa.',
      featureList: [
        'Leitura do demonstrativo de pagamento XML padrão TISS',
        'Recálculo da glosa por guia (apresentado × pago)',
        'Classificação dos 784 códigos da Tabela 38 da ANS (versão julho/2026)',
        'Geração automática de recurso de glosa',
        'Priorização por valor e prazo',
      ],
      publisher: { '@id': ORGANIZACAO['@id'] },
      offers: [
        {
          '@type': 'Offer',
          name: 'Gratuito',
          price: '0',
          priceCurrency: 'BRL',
          description: `${LIMITE_GRATIS} análises de XML por mês`,
        },
        {
          '@type': 'Offer',
          name: 'Profissional',
          price: String(PRECO_PRO),
          priceCurrency: 'BRL',
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: String(PRECO_PRO),
            priceCurrency: 'BRL',
            billingDuration: 'P1M',
            unitText: 'mês',
          },
        },
      ],
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQ.map(({ q, a }) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: a },
      })),
    },
  ],
};

export const metadata = {
  /* `absolute` para escapar do template `%s · RecuperaGlosa` do layout. */
  title: { absolute: 'Auditoria de glosas e recurso de glosa automático | RecuperaGlosa' },
  description:
    'Seu convênio glosou e você não sabe quanto? Envie o XML TISS e veja em segundos o valor glosado por guia e motivo, o que vale contestar e o recurso de glosa já redigido. Grátis para começar.',
  /* A raiz concentra o sinal de busca; /inicio é só o endereço interno. */
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Seu convênio glosou. Você sabe quanto? — RecuperaGlosa',
    description:
      'Envie o XML TISS e saia com o valor glosado por motivo e o recurso de glosa pronto. Grátis para começar.',
    url: '/',
    type: 'website',
    images: [OG_IMAGE],
  },
};

const brl = (n) => n.toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export default function Landing() {
  return (
    <div className={s.lp}>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(SCHEMA)} />

      {/* ── Navegação ── */}
      <nav className={s.nav} aria-label="Navegação principal">
        <div className={`${s.wrap} ${s.navInner}`}>
          <a href="#topo" aria-label="RecuperaGlosa — início">
            <Image src="/marca/horizontal.png" alt="RecuperaGlosa" width={152} height={45} className={s.logo} priority />
          </a>
          <div className={s.navLinks}>
            <a href="#como">Como funciona</a>
            <a href="#planos">Planos</a>
            <a href="/codigos-de-glosa">Códigos de glosa</a>
            <a href="/blog">Blog</a>
            <a className={s.navLogin} href="/login">Entrar</a>
            <a className={`${s.btn} ${s.btnLime} ${s.navCta}`} href={CADASTRO}>Analisar meu XML</a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <header className={s.hero} id="topo">
        <div className={`${s.wrap} ${s.heroGrid}`}>
          <div className={s.heroCopy}>
            <span className={s.eyebrow}>Para consultórios que atendem convênio sem faturista</span>
            <h1>
              Seu convênio glosou. <span className={s.accent}>Você sabe quanto?</span>
            </h1>
            <p className={s.lead}>
              O depósito cai menor, o demonstrativo chega em XML e ninguém tem tempo de conferir guia por guia.
              Envie o arquivo: em segundos você vê <strong>quanto foi glosado, por qual motivo, o que ainda dá para
              recuperar e até quando</strong> — com o recurso já redigido.
            </p>
            <div className={s.actions}>
              <a className={`${s.btn} ${s.btnLime} ${s.btnBig}`} href={CADASTRO}>
                Descobrir quanto foi glosado <span aria-hidden>→</span>
              </a>
              <a className={`${s.btn} ${s.btnGhost}`} href="#como">Ver como funciona</a>
            </div>
            <ul className={s.micro}>
              <li>{LIMITE_GRATIS} análises grátis por mês</li>
              <li>Sem cartão</li>
              <li>Sem instalação</li>
            </ul>
          </div>

          <div className={s.heroVisual}>
            <div className={s.shell}>
              <div className={s.browserBar} aria-hidden><i /><i /><i /></div>
              <Image
                src="/marketing/saas-dashboard-real.png"
                alt="Painel do RecuperaGlosa com valor glosado por operadora e motivo (dados fictícios)"
                width={1265}
                height={712}
                sizes="(max-width: 980px) 100vw, 640px"
                className={s.screen}
                priority
              />
            </div>
            <div className={`${s.chip} ${s.chipA}`} aria-hidden>
              <span className={s.chipCode}>3209</span>
              <div><b>Cobrança em duplicidade</b><small>Cabe recurso · recurso pronto</small></div>
            </div>
            <div className={`${s.chip} ${s.chipB}`} aria-hidden>
              <small>Recuperável neste lote</small>
              <b className={s.chipMoney}>R$ 1.040,00</b>
              <small>5 guias · prazo em 12 dias</small>
            </div>
            <span className={s.demoLabel}>Dados fictícios</span>
          </div>
        </div>
      </header>

      {/* ── Dores ── */}
      <section className={s.section} id="dores">
        <div className={s.wrap}>
          <div className={s.head}>
            <span className={s.eyebrow}>Você reconhece isso?</span>
            <h2>Você atende o dia inteiro. A glosa trabalha em silêncio.</h2>
            <p>Se alguma destas frases já passou pela sua cabeça, a glosa está levando dinheiro do seu consultório.</p>
          </div>
          <div className={s.painLayout}>
            <div className={s.painGrid}>
              {DORES.map((d) => (
                <article key={d.frase} className={s.pain}>
                  <h3>{d.frase}</h3>
                  <p>{d.texto}</p>
                </article>
              ))}
            </div>
            <figure className={s.painPhoto}>
              <Image
                src="/marketing/foto-medica-operadora.jpg"
                alt="Médica ao telefone em frente ao notebook, no consultório"
                fill
                sizes="(max-width: 980px) 100vw, 380px"
              />
              <figcaption>
                Ligar para a operadora para entender uma glosa não deveria fazer parte da sua agenda.
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ── A glosa invisível ── */}
      <section className={`${s.section} ${s.sectionPaper}`}>
        <div className={`${s.wrap} ${s.splitGrid}`}>
          <div className={s.head}>
            <span className={s.eyebrow}>A glosa invisível</span>
            <h2>A glosa mais cara é a que parece paga.</h2>
            <p>
              O portal mostra a guia como <em>paga</em>. Só que pagou menos do que você cobrou. O RecuperaGlosa
              não confia no total da operadora: recalcula <strong>apresentado × pago</strong> em cada guia e mostra a
              diferença — e se vale contestar.
            </p>
            <a className={s.textLink} href={CADASTRO}>Encontrar as glosas parciais no meu XML →</a>
          </div>
          <div className={s.compareCards} aria-label="Exemplo com valores fictícios">
            <div className={s.guia}>
              <span className={s.guiaTag}>Como aparece no portal</span>
              <div className={s.guiaRow}><span>Guia 48213 · Consulta + exame</span><em className={s.okPill}>Paga</em></div>
              <div className={s.guiaVal}><span>Valor pago</span><b>R$ {brl(290)}</b></div>
            </div>
            <div className={`${s.guia} ${s.guiaDark}`}>
              <span className={s.guiaTag}>Como aparece no RecuperaGlosa</span>
              <div className={s.guiaRow}><span>Guia 48213 · Consulta + exame</span><em className={s.warnPill}>Glosa parcial</em></div>
              <div className={s.guiaVal}><span>Apresentado</span><b>R$ {brl(380)}</b></div>
              <div className={s.guiaVal}><span>Pago</span><b>R$ {brl(290)}</b></div>
              <div className={`${s.guiaVal} ${s.guiaDiff}`}><span>Ficou para trás</span><b>R$ {brl(90)}</b></div>
            </div>
            <small className={s.ficticio}>Exemplo com valores fictícios.</small>
          </div>
        </div>
      </section>

      {/* ── Calculadora ── */}
      <section className={s.section} id="calculadora">
        <div className={s.wrap}>
          <Calculadora cadastro={CADASTRO} />
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section className={`${s.section} ${s.dark}`} id="como">
        <div className={s.wrap}>
          <div className={s.head}>
            <span className={s.eyebrow}>Como funciona</span>
            <h2>Do XML ao recurso pronto em três passos.</h2>
            <p>Usa o arquivo que a operadora já te entrega. Sem integração, sem instalar nada.</p>
          </div>
          <ol className={s.steps}>
            <li>
              <span className={s.stepN}>01</span>
              <h3>Baixe o XML do demonstrativo</h3>
              <p>No portal do prestador do convênio, o mesmo arquivo de sempre.</p>
            </li>
            <li>
              <span className={s.stepN}>02</span>
              <h3>Envie e veja o que voltou menor</h3>
              <p>Cada guia é recalculada e cada código de glosa ganha uma decisão, ordenada por valor e prazo.</p>
            </li>
            <li>
              <span className={s.stepN}>03</span>
              <h3>Revise o recurso e envie</h3>
              <p>O recurso já sai redigido com o argumento do código. Você confere, ajusta e manda para a operadora.</p>
            </li>
          </ol>
        </div>
      </section>

      {/* ── Códigos ── */}
      <section className={s.section} id="codigos">
        <div className={`${s.wrap} ${s.splitGrid}`}>
          <div className={s.head}>
            <span className={s.eyebrow}>Uma decisão por código</span>
            <h2>Diz o que recorrer. E o que não vale o seu tempo.</h2>
            <p>
              Os 784 códigos da Tabela 38 da ANS (versão julho/2026) estão classificados: recorrer, enviar documento,
              corrigir e reapresentar ou deixar passar. Recurso de glosa contratual só queima tempo e credibilidade
              com a operadora.
            </p>
            <a className={s.textLink} href="/codigos-de-glosa">Consultar qualquer código de glosa →</a>
          </div>
          <div className={s.codeTable} role="table" aria-label="Exemplos de códigos de glosa e a ação recomendada">
            {CODIGOS.map((c) => (
              <div key={c.codigo} className={s.codeRow} role="row">
                <a href={`/codigos-de-glosa/${c.codigo}`} className={s.codeNum} role="cell">{c.codigo}</a>
                <span className={s.codeTerm} role="cell">{c.termo}</span>
                <em className={`${s.acao} ${s[`acao_${c.acao}`]}`} role="cell">{ROTULO_ACAO[c.acao]}</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Produto ── */}
      <section className={`${s.section} ${s.sectionPaper}`} id="produto">
        <div className={s.wrap}>
          <div className={`${s.head} ${s.center}`}>
            <span className={s.eyebrow}>O produto</span>
            <h2>O que entra é um XML. O que sai é uma lista do que fazer.</h2>
            <p>Telas reais do RecuperaGlosa, com clínicas, pacientes e valores fictícios.</p>
          </div>
          <div className={s.shots}>
            <figure className={`${s.shot} ${s.shotLarge}`}>
              <Image src="/marketing/saas-dashboard-real.png" alt="Visão geral: faturado, pago e glosado por competência" width={1265} height={712} sizes="(max-width: 980px) 100vw, 700px" />
              <figcaption><b>Para onde foi o faturamento</b><span>Apresentado, pago, glosado e recuperado no mesmo lugar.</span></figcaption>
            </figure>
            <figure className={s.shot}>
              <Image src="/marketing/saas-glosas-real.png" alt="Fila de glosas priorizada por valor e prazo" width={1265} height={712} sizes="(max-width: 980px) 100vw, 480px" />
              <figcaption><b>Fila por valor e prazo</b><span>Comece pelo que vale mais e vence antes.</span></figcaption>
            </figure>
            <figure className={s.shot}>
              <Image src="/marketing/saas-recurso-real.png" alt="Recurso de glosa gerado automaticamente a partir do XML" width={1265} height={712} sizes="(max-width: 980px) 100vw, 480px" />
              <figcaption><b>Recurso já redigido</b><span>Argumento por código, em PDF, para revisar e enviar.</span></figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ── Comparação ── */}
      <section className={s.section}>
        <div className={s.wrap}>
          <div className={`${s.head} ${s.center}`}>
            <span className={s.eyebrow}>Antes de decidir</span>
            <h2>Três jeitos de lidar com glosa.</h2>
          </div>
          <div className={s.tableWrap}>
            <table className={s.cmp}>
              <thead>
                <tr>
                  <th scope="col"><span className={s.srOnly}>Critério</span></th>
                  {COMPARACAO.colunas.map((c, i) => (
                    <th key={c} scope="col" className={i === 2 ? s.cmpUs : undefined}>{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARACAO.linhas.map(([criterio, ...vals]) => (
                  <tr key={criterio}>
                    <th scope="row">{criterio}</th>
                    {vals.map((v, i) => (
                      <td key={i} className={i === 2 ? s.cmpUs : undefined}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── Para quem ── */}
      <section className={`${s.section} ${s.sectionPaper}`}>
        <div className={`${s.wrap} ${s.whoGrid}`}>
          <figure className={s.whoPhoto}>
            <Image
              src="/marketing/foto-medico-tranquilo.jpg"
              alt="Médico sorrindo à mesa do consultório, com o notebook ao lado"
              fill
              sizes="(max-width: 980px) 100vw, 520px"
            />
          </figure>
          <div>
            <span className={s.eyebrow}>Para quem é</span>
            <h2 className={s.h2}>Feito para quem é o próprio faturamento.</h2>
            <ul className={s.checks}>
              {PARA_QUEM.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <p className={s.notFor}>
              <b>Não é para</b> hospitais com setor de faturamento estruturado. Lá já tem gente dedicada a isso;
              no seu consultório, quem cuida é você.
            </p>
          </div>
        </div>
      </section>

      {/* ── Planos ── */}
      <section className={s.section} id="planos">
        <div className={s.wrap}>
          <div className={`${s.head} ${s.center}`}>
            <span className={s.eyebrow}>Planos</span>
            <h2>Descubra o valor grátis. Assine quando ele aparecer.</h2>
          </div>
          <div className={s.pricing}>
            <article className={s.price}>
              <h3>Gratuito</h3>
              <p>Para descobrir onde a glosa pesa.</p>
              <div className={s.amount}>R$ 0</div>
              <ul>
                <li>{LIMITE_GRATIS} análises de XML por mês</li>
                <li>Valor glosado por guia e motivo</li>
                <li>Decisão por código de glosa</li>
                <li>Prévia do recurso</li>
                <li>Sem cartão de crédito</li>
              </ul>
              <a className={`${s.btn} ${s.btnGhost}`} href={CADASTRO}>Começar grátis</a>
            </article>
            <article className={`${s.price} ${s.priceFeat}`}>
              <span className={s.badge}>Para glosa recorrente</span>
              <h3>Profissional</h3>
              <p>Para quem recebe demonstrativo todo mês.</p>
              <div className={s.amount}>R$ {PRECO_PRO} <span>/mês</span></div>
              <ul>
                <li>Análises ilimitadas</li>
                <li>Recursos completos, prontos para enviar</li>
                <li>PDF do recurso e relatório mensal</li>
                <li>Fila por valor e prazo</li>
                <li>Histórico de todos os lotes</li>
                <li>Sem fidelidade: cancele quando quiser</li>
              </ul>
              <a className={`${s.btn} ${s.btnLime}`} href={CADASTRO}>Analisar meu XML grátis</a>
            </article>
          </div>
          <div className={s.roi}>
            <div>
              <strong>Um único recurso aceito de R$ {PRECO_PRO} já paga o mês.</strong>
              <small>A recuperação depende da documentação e da decisão da operadora; não há garantia de resultado.</small>
            </div>
            <a className={`${s.btn} ${s.btnDark}`} href={CADASTRO}>Começar agora</a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={`${s.section} ${s.sectionPaper}`} id="faq">
        <div className={s.wrap}>
          <div className={`${s.head} ${s.center}`}>
            <span className={s.eyebrow}>Perguntas frequentes</span>
            <h2>Sem letras miúdas.</h2>
          </div>
          <div className={s.faq}>
            {FAQ.map(({ q, a, link }) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>
                  {a}
                  {link && <> <a href={link.href}>{link.texto} →</a></>}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className={s.final}>
        <div className={s.wrap}>
          <div className={s.finalBox}>
            <h2>Cada demonstrativo na gaveta é dinheiro que não volta.</h2>
            <p>
              A janela para contestar começa quando o demonstrativo chega. Envie o último XML do seu convênio e veja,
              agora, quanto ainda dá para recuperar.
            </p>
            <div className={s.actions}>
              <a className={`${s.btn} ${s.btnLime} ${s.btnBig}`} href={CADASTRO}>Analisar meu XML grátis →</a>
              <a className={`${s.btn} ${s.btnOutlineLight}`} target="_blank" rel="noreferrer" href={WHATSAPP}>Tirar dúvida no WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      <footer className={s.footer}>
        <div className={`${s.wrap} ${s.footerGrid}`}>
          <div>
            <Image src="/marca/horizontal.png" alt="RecuperaGlosa" width={150} height={45} className={s.logo} />
            <p>
              Ferramenta independente para análise de demonstrativos TISS. As telas desta página usam dados fictícios.
              Os recursos são revisáveis e não há garantia de recuperação. Fotos: Vitaly Gariev / Unsplash.
            </p>
          </div>
          <div className={s.footerLinks}>
            <a href="/recurso-de-glosa">Como fazer recurso de glosa</a>
            <a href="/codigos-de-glosa">Tabela 38 — códigos de glosa</a>
            <a href="/blog">Blog</a>
            <a href="/privacidade">Privacidade</a>
            <a href="/termos">Termos</a>
            <a href="/ajuda">Ajuda</a>
            <a href="mailto:suporte@recuperaglosa.com.br">Contato</a>
          </div>
        </div>
      </footer>

      <div className={s.mobileBar}>
        <a className={`${s.btn} ${s.btnLime}`} href={CADASTRO}>Descobrir quanto foi glosado →</a>
      </div>
    </div>
  );
}
