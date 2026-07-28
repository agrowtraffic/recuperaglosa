/* ============================================================
   app/login/page.jsx  — Server Component
   Renderiza o painel de marca (esquerdo) + LoginForm (direito).
   ============================================================ */
import Image from 'next/image';
import Link from 'next/link';
import LoginForm from './LoginForm';
import styles from './login.module.css';

/* Alturas das barras do gráfico decorativo (0–100) */
const BARS = [22, 35, 28, 48, 38, 55, 45, 66, 58, 72, 68, 84];

export default function LoginPage({ searchParams }) {
  const initialMode = searchParams?.modo === 'cadastro' ? 'signup' : 'login';

  return (
    <main className={styles.page}>

      {/* ══════════════════════════════════════════
          PAINEL DE MARCA — esquerdo, escuro
          ══════════════════════════════════════════ */}
      <aside className={styles.brandPanel}>
        <div className={styles.brandContent}>

          {/* Logo branco */}
          <Image
            src="/logos/recupera-glosa-monocromatico-branco.svg"
            width={176}
            height={40}
            alt="RecuperaGlosa"
            priority
            className={styles.brandLogo}
          />

          {/* Badge */}
          <span className={styles.eyebrow}>
            <i />
            Auditoria inteligente de glosas
          </span>

          {/* Headline */}
          <h1>Recupere o dinheiro que sua clínica já faturou.</h1>

          <p>
            Transforme demonstrativos difíceis de entender em valores claros,
            oportunidades priorizadas e recursos prontos para contestação.
          </p>

          {/* 3 benefícios em grid */}
          <ul className={styles.benefits} role="list">
            {[
              { titulo: 'Descubra quanto pode voltar',        desc: 'Auditoria objetiva, sem planilhas complexas.' },
              { titulo: 'Priorize as melhores oportunidades', desc: 'Veja primeiro as glosas com maior potencial.' },
              { titulo: 'Conteste com mais agilidade',        desc: 'Recursos organizados para sua equipe avançar.' },
            ].map((b) => (
              <li key={b.titulo} className={styles.benefit}>
                <span className={styles.checkIcon} aria-hidden="true">✓</span>
                <strong>{b.titulo}</strong>
                <small>{b.desc}</small>
              </li>
            ))}
          </ul>

          {/* Card de social proof */}
          <div className={styles.proofCard}>
            <header>
              <span className={styles.proofLabel}>Valor recuperável identificado</span>
              <span className={styles.proofDot}>Auditoria concluída</span>
            </header>

            <p className={styles.proofValue}>R$ 18.430,75</p>

            <div className={styles.proofMeta}>
              <span>42 glosas recorríveis</span>
              <span>+18,4% no período</span>
            </div>

            {/* Gráfico de barras decorativo */}
            <div className={styles.barChart} aria-hidden="true">
              {BARS.map((h, i) => (
                <span
                  key={i}
                  className={i === BARS.length - 1 ? styles.barLast : ''}
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          <p className={styles.securityNote}>
            Dados separados por clínica com as regras de segurança do Supabase.
          </p>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          PAINEL DE ACESSO — direito, branco
          ══════════════════════════════════════════ */}
      <section className={styles.accessPanel}>

        {/* Logo horizontal — só aparece no mobile (brandPanel está hidden) */}
        <div className={styles.mobileLogo}>
          <Image
            src="/logos/recupera-glosa-horizontal.svg"
            width={205}
            height={48}
            alt="RecuperaGlosa"
            priority
          />
        </div>

        <div className={styles.accessContent}>

          {/* Intro */}
          <div className={styles.formIntro}>
            <span className={styles.secureLabel}><i /> Acesso seguro</span>
            <h2>Bem-vindo de volta</h2>
            <p>Informe seu e-mail para receber um link de acesso seguro.</p>
          </div>

          {/* Formulário (Client Component) */}
          <LoginForm initialMode={initialMode} />

          {/* Trust row */}
          <div className={styles.trustRow} aria-label="Características de segurança">
            <span>Sem senha para esquecer</span>
            <i aria-hidden="true" />
            <span>Link de uso único</span>
          </div>

          {/* CTA cadastro */}
          <div className={styles.signupBox}>
            <div>
              <strong>Ainda não é cliente?</strong>
              <span>Descubra gratuitamente quanto sua clínica pode recuperar.</span>
            </div>
            <Link href="/login?modo=cadastro">
              Começar grátis <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <footer className={styles.accessFooter}>
          <span>© {new Date().getFullYear()} RecuperaGlosa</span>
          <nav aria-label="Links legais">
            <Link href="/privacidade">Privacidade</Link>
            <Link href="/termos">Termos</Link>
            <Link href="/ajuda">Ajuda</Link>
          </nav>
        </footer>
      </section>
    </main>
  );
}
