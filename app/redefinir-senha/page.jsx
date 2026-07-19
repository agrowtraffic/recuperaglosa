import Image from 'next/image';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ResetPasswordForm from './ResetPasswordForm';
import styles from './reset.module.css';

export const metadata = { title: 'Redefinir senha | RecuperaGlosa' };
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Image src="/logos/recupera-glosa-horizontal.svg" width={205} height={48} alt="RecuperaGlosa" priority />
        <div className={styles.icon}>✓</div>
        <h1>Crie uma nova senha</h1>
        <p>Escolha uma senha forte e diferente das utilizadas anteriormente.</p>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
