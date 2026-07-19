'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
      });

      if (authError) throw new Error(`Erro ao enviar link: ${authError.message}`);

      setSuccess(true);
      setEmail('');
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
        <p style={{ color: '#64748b', marginBottom: '32px' }}>Acesse sua conta</p>

        {success ? (
          <div style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
            <strong>Link enviado!</strong>
            <p style={{ marginTop: '8px', fontSize: '14px' }}>Abra seu e-mail e clique no link para acessar.</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

            <button
              type="submit"
              disabled={loading || !email}
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
          Não tem conta?{' '}
          <Link href="/auth/signup" style={{ color: '#16a34a', textDecoration: 'none', fontWeight: '500' }}>
            Crie uma agora
          </Link>
        </p>
      </div>
    </div>
  );
}
