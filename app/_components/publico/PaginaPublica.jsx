/* Casca das páginas públicas de conteúdo: topo com CTA, rodapé com os
   links que amarram o conteúdo entre si (link interno é o que faz o
   Google descobrir e dar peso às 600 páginas de código) e barra fixa de
   conversão no celular. */
import Link from 'next/link';
import s from './publico.module.css';

export const CADASTRO = '/login?modo=cadastro';

export default function PaginaPublica({ children }) {
  return (
    <div className={s.pagina}>
      <nav className={s.nav} aria-label="Navegação principal">
        <div className={`${s.wrap} ${s.navInner}`}>
          <Link href="/" aria-label="RecuperaGlosa — início">
            <img className={s.logo} src="/_next/image?url=%2Fmarca%2Fhorizontal.png&w=384&q=80" alt="RecuperaGlosa" width="150" height="44" />
          </Link>
          <div className={s.navLinks}>
            <Link href="/recurso-de-glosa">Recurso de glosa</Link>
            <Link href="/motivos-de-glosa">Códigos de glosa</Link>
            <Link href="/#planos">Planos</Link>
            <Link className={s.button} href={CADASTRO}>Analisar meu XML grátis</Link>
          </div>
        </div>
      </nav>

      <main className={s.main}>
        <div className={s.wrap}>{children}</div>
      </main>

      <footer className={s.footer}>
        <div className={`${s.wrap} ${s.footerGrid}`}>
          <p style={{ margin: 0, maxWidth: 420 }}>
            RecuperaGlosa — auditoria de glosas de convênio para clínicas e consultórios.
            Ferramenta independente, sem vínculo com a ANS ou com operadoras.
          </p>
          <div className={s.footerLinks}>
            <Link href="/">Início</Link>
            <Link href="/recurso-de-glosa">Como fazer recurso de glosa</Link>
            <Link href="/motivos-de-glosa">Tabela 38 — códigos de glosa</Link>
            <Link href="/ajuda">Ajuda</Link>
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos</Link>
          </div>
        </div>
      </footer>

      <div className={s.mobileBar}>
        <Link className={s.button} href={CADASTRO}>Analisar meu XML grátis →</Link>
      </div>
    </div>
  );
}

export function Cta({ titulo, texto }) {
  return (
    <section className={s.cta}>
      <h2>{titulo}</h2>
      <p>{texto}</p>
      <div className={s.ctaAcoes}>
        <Link className={s.button} href={CADASTRO}>Analisar meu XML grátis →</Link>
        <a className={s.buttonGhost} href="https://wa.me/5511977315655" target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
      </div>
      <p className={s.ctaNota}>3 análises por mês no plano grátis · sem cartão de crédito</p>
    </section>
  );
}
