'use client';

import { useState, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [nomeClinica, setNomeClinica] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const supabase = useMemo(
    () => createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ),
    []
  );

  async function handleSignup(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Criar clínica via função Postgres (bypass RLS)
      const { data: result, error: cliError } = await supabase
        .rpc('criar_clinica_signup', { p_nome: nomeClinica });

      if (cliError) throw new Error(`Erro ao criar clínica: ${cliError.message}`);
      const clinicaId = result;

      // 2. Enviar magic link, passando clinica_id em metadata
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          data: { clinica_id: clinicaId },
        },
      });

      if (authError) throw new Error(`Erro ao enviar link: ${authError.message}`);

      setSuccess(true);
      setEmail('');
      setNomeClinica('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '24px', background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a' }}>Recupera Glosa</h1>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>Crie sua conta para começar</p>

        {success ? (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <strong>Link enviado!</strong>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>Abra seu e-mail e clique no link para confirmar a conta.</p>
          </div>
        ) : (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
                {error}
              </div>
            )}

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: '500', color: '#334155' }}>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontWeight: '500', color: '#334155' }}>Nome da clínica</span>
              <input
                type="text"
                value={nomeClinica}
                onChange={(e) => setNomeClinica(e.target.value)}
                placeholder="Clínica ABC"
                required
                style={{ padding: '8px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '14px', fontFamily: 'inherit' }}
              />
            </label>

            <button
              type="submit"
              disabled={loading || !email || !nomeClinica}
              style={{
                padding: '10px 16px',
                background: loading ? '#cbd5e1' : '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
              }}
            >
              {loading ? 'Enviando...' : 'Enviar link de acesso'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b' }}>
          Já tem conta?{' '}
          <Link href="/auth/login" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: '500' }}>
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
}
