import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ResetPasswordForm from './ResetPasswordForm';
import { Brand } from '@/app/_components/kit/Brand';
import styles from './reset.module.css';

export const metadata = { title: 'Redefinir senha' };
export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Brand altura={40} />
        <div className={styles.icon}>✓</div>
        <h1>Crie uma nova senha</h1>
        <p>Escolha uma senha forte e diferente das utilizadas anteriormente.</p>
        <ResetPasswordForm />
      </section>
    </main>
  );
}
