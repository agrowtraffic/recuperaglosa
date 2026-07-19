'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './reset.module.css';

export default function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      return setError('Use 8 caracteres ou mais, com letras maiúsculas, minúsculas e números.');
    }
    if (password !== confirmation) return setError('As senhas não coincidem.');

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) return setError('Não foi possível atualizar a senha. Solicite um novo link.');
    router.replace('/');
    router.refresh();
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <label htmlFor="new-password">Nova senha</label>
      <div className={styles.input}><input id="new-password" type={show ? 'text' : 'password'} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo de 8 caracteres" /><button type="button" onClick={() => setShow(!show)}>{show ? 'Ocultar' : 'Mostrar'}</button></div>
      <label htmlFor="confirm-password">Confirmar nova senha</label>
      <div className={styles.input}><input id="confirm-password" type={show ? 'text' : 'password'} autoComplete="new-password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} placeholder="Repita a nova senha" /></div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <button className={styles.submit} type="submit" disabled={loading}>{loading ? 'Atualizando...' : 'Salvar nova senha'}</button>
    </form>
  );
}
