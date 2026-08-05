'use client';
/* ============================================================
   app/login/LoginForm.jsx
   Reprodução fiel do código original.
   Lógica de auth: ⬛ = onde plugar os handlers Supabase existentes.
   ============================================================ */
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from './login.module.css';

/* Força da senha — 0..4 */
function passwordScore(pwd) {
  if (!pwd) return 0;
  let s = 0;
  if (pwd.length >= 8)          s++;
  if (/[A-Z]/.test(pwd))        s++;
  if (/[0-9]/.test(pwd))        s++;
  if (/[^A-Za-z0-9]/.test(pwd)) s++;
  return s;
}

/* O modo 'magic' (link de uso único) foi removido: dependia de
   /auth/confirm tratar o `code` do PKCE, coisa que aquela rota nunca fez
   — ela só lê `token_hash` — então o link do e-mail caía em
   /login?erro=link-invalido. Entrar com senha e entrar com Google já
   cobrem o caso, e ambos funcionam. */
const MODES = ['login', 'signup', 'recovery'];

export default function LoginForm({ initialMode = 'login' }) {
  const router = useRouter();
  const [mode,            setMode           ] = useState(initialMode);
  const [email,           setEmail          ] = useState('');
  const [password,        setPassword       ] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName,       setFirstName      ] = useState('');
  const [lastName,        setLastName        ] = useState('');
  const [showPassword,    setShowPassword   ] = useState(false);
  const [acceptedTerms,   setAcceptedTerms  ] = useState(false);
  const [loading,         setLoading        ] = useState(false);
  const [error,           setError          ] = useState('');
  const [success,         setSuccess        ] = useState(false);

  const isSignup   = mode === 'signup';
  const isRecovery = mode === 'recovery';
  const score      = passwordScore(password);

  const changeMode = useCallback((next) => {
    setMode(next); setError(''); setSuccess(false);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const supabase = createClient();

      if (isSignup) {
        if (!firstName.trim()) { setError('Informe seu nome.'); setLoading(false); return; }
        if (!lastName.trim()) { setError('Informe seu sobrenome.'); setLoading(false); return; }
        if (!email.trim()) { setError('Informe seu e-mail.'); setLoading(false); return; }
        if (password.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); setLoading(false); return; }
        if (!/[A-Z]/.test(password)) { setError('A senha deve conter letras maiúsculas.'); setLoading(false); return; }
        if (!/[0-9]/.test(password)) { setError('A senha deve conter números.'); setLoading(false); return; }
        if (password !== confirmPassword) { setError('As senhas não coincidem.'); setLoading(false); return; }
        if (!acceptedTerms) { setError('Aceite os termos para continuar.'); setLoading(false); return; }
        const signupResponse = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          }),
        });
        const signupResult = await signupResponse.json().catch(() => ({}));
        if (!signupResponse.ok) {
          const messages = {
            email_ja_cadastrado: 'Este e-mail já possui uma conta.',
            email_nao_enviado: 'Não foi possível enviar a confirmação. Tente novamente.',
            senha_invalida: 'A senha informada não atende aos requisitos.',
          };
          throw new Error(messages[signupResult.error] || 'Não foi possível criar sua conta. Tente novamente.');
        }
        setSuccess(true);
      } else if (isRecovery) {
        const recoveryResponse = await fetch('/api/auth/recovery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });
        if (!recoveryResponse.ok) {
          const recoveryResult = await recoveryResponse.json().catch(() => ({}));
          throw new Error(
            recoveryResult.error === 'recuperacao_indisponivel'
              ? 'A recuperação está temporariamente indisponível. Tente novamente.'
              : 'Não foi possível solicitar a recuperação. Tente novamente.'
          );
        }
        setSuccess(true);
      } else {
        // Login com e-mail e senha
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (loginError) throw loginError;
        router.replace('/');
        router.refresh();
      }
    } catch (err) {
      setError(err?.message ?? 'Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err?.message ?? 'Erro ao entrar com Google.');
      setLoading(false);
    }
  }

  /* ── Estado de sucesso (signup / recovery) ──
     Cada caminho manda um e-mail diferente. Antes o signup caía no texto
     de recuperação de senha: quem acabava de criar conta lia "enviamos as
     instruções de recuperação". */
  if (success) {
    const conteudo = isSignup
      ? {
          titulo: 'Confirme seu e-mail',
          corpo: <>Enviamos um link de confirmação para <strong>{email}</strong>.<br />Clique nele para ativar sua conta.</>,
        }
      : {
          titulo: 'E-mail enviado!',
          corpo: <>Enviamos as instruções de recuperação para <strong>{email}</strong>.</>,
        };

    return (
      <div className={styles.successCard}>
        <div className={styles.successIcon}>✓</div>
        <h3>{conteudo.titulo}</h3>
        <p>{conteudo.corpo}</p>
        <small>Verifique também a pasta de spam.</small>
        <button type="button" onClick={() => { setSuccess(false); changeMode('login'); }}>
          ← Voltar para o login
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Cabeçalho do modo ──
          Fica aqui, e não na página, porque só este componente sabe em
          que modo está: as abas trocam o modo no cliente, e um título
          renderizado no servidor ficaria descrevendo a tela errada.
          Antes havia um título fixo em page.jsx além deste, então em
          "Recuperar senha" apareciam os dois empilhados — e o de cima
          falava de link de acesso, que nem existe mais. */}
      <div className={styles.modeHeading}>
        <h3>
          {isRecovery ? 'Recuperar senha' : isSignup ? 'Criar sua conta' : 'Bem-vindo de volta'}
        </h3>
        <p>
          {isRecovery
            ? 'Informe seu e-mail e enviaremos as instruções de recuperação.'
            : isSignup
              ? 'Descubra gratuitamente quanto sua clínica pode recuperar.'
              : 'Entre com seu e-mail e senha.'}
        </p>
      </div>

      {/* ── Tabs Entrar / Criar conta ── */}
      {!isRecovery && (
        <div className={styles.modeTabs} role="tablist" aria-label="Modo de acesso">
          <button
            type="button"
            role="tab"
            aria-selected={!isSignup}
            className={`${styles.tabButton} ${!isSignup ? styles.active : ''}`}
            onClick={() => changeMode('login')}
          >
            Entrar
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isSignup}
            className={`${styles.tabButton} ${isSignup ? styles.active : ''}`}
            onClick={() => changeMode('signup')}
          >
            Criar conta
          </button>
        </div>
      )}

      {/* ── Botão Google (só login/signup) ── */}
      {!isRecovery && (
        <button
          type="button"
          className={styles.googleButton}
          onClick={handleGoogle}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continuar com Google
        </button>
      )}

      {/* ── Separador ── */}
      {!isRecovery && (
        <div className={styles.orDivider} aria-hidden="true">
          <span>ou continue com e-mail</span>
        </div>
      )}

      {/* ── Formulário ── */}
      <form onSubmit={handleSubmit} noValidate>

        {/* Campos de cadastro extras */}
        {isSignup && (
          <div className={styles.twoFields}>
            <div className={styles.fieldGroup}>
              <label htmlFor="firstName">Nome</label>
              <div className={styles.inputWrap}>
                <input
                  id="firstName" name="firstName" type="text"
                  autoComplete="given-name" placeholder="Seu nome"
                  value={firstName} onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label htmlFor="lastName">Sobrenome</label>
              <div className={styles.inputWrap}>
                <input
                  id="lastName" name="lastName" type="text"
                  autoComplete="family-name" placeholder="Seu sobrenome"
                  value={lastName} onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* E-mail */}
        <div className={styles.fieldGroup}>
          <label htmlFor="email">E-mail profissional</label>
          <div className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
            <span aria-hidden="true">@</span>
            <input
              id="email" name="email" type="email"
              autoComplete="email" inputMode="email"
              placeholder="voce@sua-clinica.com.br"
              value={email} onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Senha — não aparece em "recuperar senha", onde a pessoa
            justamente não tem a senha. A condição aqui era `!isMagic`,
            então o campo continuava visível na recuperação, pedindo
            exatamente o que ela veio recuperar. */}
        {!isRecovery && (
          <div className={styles.fieldGroup}>
            <div className={styles.labelRow}>
              <label htmlFor="password">Senha</label>
              {!isSignup && !isRecovery && (
                <button type="button" className={styles.forgotLink}
                  onClick={() => changeMode('recovery')}>
                  Esqueci minha senha
                </button>
              )}
            </div>
            <div className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
              <span aria-hidden="true">●</span>
              <input
                id="password" name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder="Digite sua senha"
                value={password} onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className={styles.showPasswordBtn}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
          </div>
        )}

        {/* Força da senha + confirmação (só signup) */}
        {isSignup && (
          <>
            <div className={styles.strength}
              aria-label={`Força da senha: ${score} de 4`}>
              {[1,2,3,4].map((step) => (
                <i key={step} className={score >= step ? styles.filled : ''} />
              ))}
              <span>
                {score < 2 ? 'Senha fraca' : score < 4 ? 'Senha boa' : 'Senha forte'}
              </span>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="confirmPassword">Confirmar senha</label>
              <div className={`${styles.inputWrap} ${error ? styles.inputError : ''}`}>
                <span aria-hidden="true">●</span>
                <input
                  id="confirmPassword" name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Repita sua senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <label className={styles.termsCheck}>
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
              />
              <span>
                Li e aceito os{' '}
                <Link href="/termos">Termos de Uso</Link> e a{' '}
                <Link href="/privacidade">Política de Privacidade</Link>.
              </span>
            </label>
          </>
        )}

        {/* Erro / ajuda */}
        {error
          ? <p className={styles.errorMessage} role="alert">{error}</p>
          : <p className={styles.inputHelp}>
              {isSignup
                ? 'Sua conta ficará vinculada à clínica informada.'
                : 'Use o mesmo e-mail cadastrado na sua clínica.'}
            </p>}

        {/* Submit */}
        <button className={styles.submitButton} type="submit" disabled={loading}>
          {loading
            ? <><i className={styles.spinner} /> Aguarde...</>
            : <>
                {isSignup    ? 'Criar minha conta'      :
                 isRecovery  ? 'Enviar recuperação'     :
                               'Entrar na minha conta'}
                {' '}<span aria-hidden="true">→</span>
              </>}
        </button>

        {isRecovery && (
          <button type="button" className={styles.backButton}
            onClick={() => changeMode('login')}>
            ← Voltar para o login
          </button>
        )}
      </form>
    </div>
  );
}
