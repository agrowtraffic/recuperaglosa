import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';
import styles from './login.module.css';

export const metadata = {
  title: 'Entrar | RecuperaGlosa',
  description: 'Acesse sua conta e acompanhe os valores recuperáveis da sua clínica.',
};

export const dynamic = 'force-dynamic';

export default async function LoginPage({ searchParams }) {
  let user = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    user = data?.user;
  } catch (error) {
    console.error('Auth check error in login:', error);
  }

  const params = await searchParams;
  const initialMode = params?.modo === 'cadastro' ? 'signup' : 'login';

  if (user) redirect('/');

  return (
    <main className={styles.page}>
      <section className={styles.brandPanel} aria-label="Benefícios do RecuperaGlosa">
        <div className={styles.brandTop}>
          <Image
            src="/logos/recupera-glosa-monocromatico-branco.svg"
            width={248}
            height={56}
            alt="RecuperaGlosa"
            priority
          />
          <span className={styles.brandTag}>Auditoria inteligente de glosas</span>
        </div>

        <div className={styles.brandContent}>
          <span className={styles.eyebrow}>RECEITA QUE MERECE VOLTAR</span>
          <h1>Recupere o dinheiro que sua clínica já faturou.</h1>
          <p>
            Transforme demonstrativos difíceis de entender em valores claros,
            oportunidades priorizadas e recursos prontos para contestação.
          </p>

          <ul className={styles.benefits}>
            <li><span>✓</span><div><strong>Descubra quanto pode voltar</strong><small>Auditoria objetiva, sem planilhas complexas.</small></div></li>
            <li><span>✓</span><div><strong>Priorize as melhores oportunidades</strong><small>Veja primeiro as glosas com maior potencial.</small></div></li>
            <li><span>✓</span><div><strong>Conteste com mais agilidade</strong><small>Recursos organizados para sua equipe avançar.</small></div></li>
          </ul>
        </div>

        <div className={styles.resultCard}>
          <div className={styles.resultHead}>
            <span>Valor recuperável identificado</span>
            <span className={styles.liveBadge}><i /> Auditoria concluída</span>
          </div>
          <strong>R$ 18.430,75</strong>
          <div className={styles.resultMeta}>
            <span>42 glosas recorríveis</span>
            <b>+18,4% no período</b>
          </div>
          <div className={styles.miniChart} aria-hidden="true">
            {[34, 48, 43, 61, 56, 73, 68, 86, 80, 94].map((height, index) => (
              <i key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>

        <p className={styles.brandFoot}>Dados separados por clínica com as regras de segurança do Supabase.</p>
      </section>

      <section className={styles.accessPanel}>
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
          <div className={styles.formIntro}>
            <span className={styles.secureLabel}><i /> Acesso seguro</span>
            <h2>Bem-vindo de volta</h2>
            <p>Informe seu e-mail para receber um link de acesso seguro.</p>
          </div>

          <LoginForm initialMode={initialMode} />

          <div className={styles.trustRow} aria-label="Características de segurança">
            <span>Sem senha para esquecer</span>
            <i />
            <span>Link de uso único</span>
          </div>

          <div className={styles.signupBox}>
            <div>
              <strong>Ainda não é cliente?</strong>
              <span>Descubra gratuitamente quanto sua clínica pode recuperar.</span>
            </div>
            <Link href="/login?modo=cadastro">Começar grátis <span aria-hidden="true">→</span></Link>
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
