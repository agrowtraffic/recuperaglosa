'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './login.module.css';

const messages = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
  user_already_exists: 'Já existe uma conta com este e-mail.',
  weak_password: 'Escolha uma senha mais forte.',
  over_email_send_rate_limit: 'Aguarde alguns instantes antes de solicitar outro e-mail.',
  provider_disabled: 'O acesso com Google ainda não foi ativado no Supabase.',
};

function friendlyError(error) {
  return messages[error?.code]
    || 'Não foi possível concluir agora. Confira os dados e tente novamente.';
}

function passwordScore(password) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  return score;
}

export default function LoginForm({ initialMode = 'login' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState(initialMode);

  useEffect(() => {
    const urlMode = searchParams.get('modo') === 'cadastro' ? 'signup' : 'login';
    setMode(urlMode);
  }, [searchParams]);
  const [name, setName] = useState('');
  const [clinic, setClinic] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');

  const score = passwordScore(password);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
    setSuccess(null);
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Informe um e-mail válido para continuar.');
      return;
    }

    if (mode === 'signup') {
      if (name.trim().length < 3) return setError('Informe seu nome completo.');
      if (clinic.trim().length < 2) return setError('Informe o nome da clínica.');
      if (score < 3) return setError('Use pelo menos 8 caracteres, letras maiúsculas, minúsculas e números.');
      if (password !== confirmPassword) return setError('As senhas não coincidem.');
      if (!acceptedTerms) return setError('Aceite os Termos de Uso e a Política de Privacidade.');
    }

    if (mode === 'login' && !password) {
      setError('Informe sua senha para entrar.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      if (mode === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (authError) throw authError;
        router.replace('/');
        router.refresh();
        return;
      }

      if (mode === 'signup') {
        const { data, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=/completar-cadastro`,
            data: {
              nome: name.trim(),
              clinica_nome: clinic.trim(),
            },
          },
        });
        if (authError) throw authError;
        if (data.session) {
          router.replace('/');
          router.refresh();
          return;
        }
        if (data.user?.identities?.length === 0) {
          setError('Esse e-mail já tem uma conta. Tente fazer login ou recuperar sua senha.');
          return;
        }
        setSuccess({
          title: 'Confirme seu cadastro',
          message: `Enviamos a confirmação para ${normalizedEmail}.`,
          detail: 'Depois de confirmar, você será direcionado ao RecuperaGlosa.',
        });
        return;
      }

      if (mode === 'magic') {
        const { error: authError } = await supabase.auth.signInWithOtp({
          email: normalizedEmail,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=/`,
            shouldCreateUser: false,
          },
        });
        if (authError) throw authError;
        setSuccess({
          title: 'Confira seu e-mail',
          message: `Enviamos um link de acesso para ${normalizedEmail}.`,
          detail: 'O link expira por segurança. Verifique também a pasta de spam.',
        });
        return;
      }

      if (mode === 'forgot') {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          { redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha` },
        );
        if (authError) throw authError;
        setSuccess({
          title: 'Instruções enviadas',
          message: `Enviamos a recuperação de senha para ${normalizedEmail}.`,
          detail: 'Abra o link recebido para cadastrar uma nova senha.',
        });
      }
    } catch (authError) {
      console.error('Falha na autenticação:', authError);
      setError(friendlyError(authError));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (authError) throw authError;
    } catch (authError) {
      console.error('Falha no login Google:', authError);
      setError(friendlyError(authError));
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.successCard} role="status">
        <span className={styles.successIcon}>✓</span>
        <h3>{success.title}</h3>
        <p>{success.message}</p>
        <small>{success.detail}</small>
        <button type="button" onClick={() => changeMode('login')}>Voltar para o login</button>
      </div>
    );
  }

  const isSignup = mode === 'signup';
  const isRecovery = mode === 'forgot';
  const isMagic = mode === 'magic';

  return (
    <div>
      {(mode === 'login' || isSignup) && (
        <div className={styles.authTabs} role="tablist" aria-label="Tipo de acesso">
          <Link href="/login" className={`${styles.tabButton} ${mode === 'login' ? styles.active : ''}`} role="tab" aria-selected={mode === 'login'}>Entrar</Link>
          <Link href="/login?modo=cadastro" className={`${styles.tabButton} ${isSignup ? styles.active : ''}`} role="tab" aria-selected={isSignup}>Criar conta</Link>
        </div>
      )}

      {(mode === 'login' || isSignup) && (
        <>
          <button type="button" className={styles.googleButton} onClick={handleGoogle} disabled={loading}>
            <span className={styles.googleMark}>G</span>
            {isSignup ? 'Cadastrar com Google' : 'Continuar com Google'}
          </button>
          <div className={styles.divider}><span>ou continue com e-mail</span></div>
        </>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate method="POST">
        {isRecovery && <div className={styles.modeHeading}><h3>Recuperar senha</h3><p>Enviaremos um link seguro para você criar uma nova senha.</p></div>}
        {isMagic && <div className={styles.modeHeading}><h3>Entrar sem senha</h3><p>Receba um link de uso único no seu e-mail.</p></div>}

        {isSignup && (
          <div className={styles.twoFields}>
            <Field label="Seu nome" value={name} onChange={setName} name="name" placeholder="Nome completo" autoComplete="name" />
            <Field label="Nome da clínica" value={clinic} onChange={setClinic} name="clinic" placeholder="Clínica Sorriso" autoComplete="organization" />
          </div>
        )}

        <label htmlFor="email">E-mail profissional</label>
        <div className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
          <span aria-hidden="true">@</span>
          <input id="email" name="email" type="email" inputMode="email" autoComplete="email" placeholder="voce@sua-clinica.com.br" value={email} onChange={(event) => setEmail(event.target.value)} aria-invalid={Boolean(error)} required autoFocus />
        </div>

        {(mode === 'login' || isSignup) && (
          <>
            <div className={styles.passwordLabel}>
              <label htmlFor="password">Senha</label>
              {mode === 'login' && <button type="button" onClick={() => changeMode('forgot')}>Esqueci minha senha</button>}
            </div>
            <div className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
              <span aria-hidden="true">●</span>
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'} placeholder={isSignup ? 'Mínimo de 8 caracteres' : 'Digite sua senha'} value={password} onChange={(event) => setPassword(event.target.value)} required />
              <button type="button" className={styles.showPassword} onClick={() => setShowPassword((current) => !current)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button>
            </div>
          </>
        )}

        {isSignup && (
          <>
            <div className={styles.strength} aria-label={`Força da senha: ${score} de 4`}>
              {[1,2,3,4].map((step) => <i key={step} className={score >= step ? styles.filled : ''} />)}
              <span>{score < 2 ? 'Senha fraca' : score < 4 ? 'Senha boa' : 'Senha forte'}</span>
            </div>
            <label htmlFor="confirmPassword">Confirmar senha</label>
            <div className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
              <span aria-hidden="true">●</span>
              <input id="confirmPassword" name="confirmPassword" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="Repita sua senha" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required />
            </div>
            <label className={styles.termsCheck}>
              <input type="checkbox" checked={acceptedTerms} onChange={(event) => setAcceptedTerms(event.target.checked)} />
              <span>Li e aceito os <Link href="/termos">Termos de Uso</Link> e a <Link href="/privacidade">Política de Privacidade</Link>.</span>
            </label>
          </>
        )}

        {error ? <p className={styles.errorMessage} role="alert">{error}</p> : <p className={styles.inputHelp}>{isSignup ? 'Sua conta ficará vinculada à clínica informada.' : 'Use o mesmo e-mail cadastrado na sua clínica.'}</p>}

        <button className={styles.submitButton} type="submit" disabled={loading}>
          {loading ? <><i className={styles.spinner} /> Aguarde...</> : <>{isSignup ? 'Criar minha conta' : isRecovery ? 'Enviar recuperação' : isMagic ? 'Enviar link de acesso' : 'Entrar na minha conta'} <span aria-hidden="true">→</span></>}
        </button>

        {mode === 'login' && <button type="button" className={styles.magicLinkButton} onClick={() => changeMode('magic')}>Prefiro entrar com um link mágico</button>}
        {(isRecovery || isMagic) && <button type="button" className={styles.backButton} onClick={() => changeMode('login')}>← Voltar para o login</button>}
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, autoComplete }) {
  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={name}>{label}</label>
      <div className={styles.inputWrap}>
        <input id={name} name={name} type="text" autoComplete={autoComplete} placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} required />
      </div>
    </div>
  );
}
