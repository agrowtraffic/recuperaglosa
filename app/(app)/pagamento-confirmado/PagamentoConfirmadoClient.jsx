'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PagamentoConfirmadoClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState('verificando'); // verificando | sucesso | erro | processando
  const [planoAtivo, setPlanoAtivo] = useState(false);
  const [tentativas, setTentativas] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      router.replace('/');
      return;
    }

    verificarPagamento();
  }, [sessionId, router]);

  async function verificarPagamento() {
    try {
      const supabase = createClient();

      // Buscar usuario para pegar clinica_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setStatus('erro');
        return;
      }

      const { data: usuarioData } = await supabase
        .from('usuario')
        .select('clinica_id')
        .eq('id', user.id)
        .single();

      if (!usuarioData) {
        setStatus('erro');
        return;
      }

      // Buscar plano atual da clinica
      const { data: clinica } = await supabase
        .from('clinica')
        .select('plano')
        .eq('id', usuarioData.clinica_id)
        .single();

      // Verificar sessão no Stripe
      const response = await fetch(`/api/pagamento-confirmado?session_id=${sessionId}`);
      const { paymentStatus, stripePlano } = await response.json();

      if (paymentStatus === 'paid') {
        if (clinica?.plano === 'profissional') {
          // Pagamento confirmado e plano atualizado no banco
          setStatus('sucesso');
          setPlanoAtivo(true);
        } else {
          // Pagamento confirmado mas plano ainda não atualizou (webhook pode estar atrasado)
          if (tentativas < 3) {
            setStatus('processando');
            setTentativas(tentativas + 1);
            // Retry após 2 segundos
            setTimeout(() => verificarPagamento(), 2000);
          } else {
            // Após 3 tentativas, mostra sucesso mesmo assim (stripe confirmou, webhook virá)
            setStatus('sucesso');
            setPlanoAtivo(true);
          }
        }
      } else {
        setStatus('erro');
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      setStatus('erro');
    }
  }

  if (status === 'verificando' || status === 'processando') {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f8fb',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: '480px',
          background: '#fff',
          padding: '40px 32px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '24px',
            animation: 'spin 2s linear infinite'
          }}>
            ⏳
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px' }}>
            Confirmando seu pagamento...
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Estamos sincronizando seus dados com nossos servidores. Isso levará apenas alguns segundos.
          </p>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </main>
    );
  }

  if (status === 'sucesso') {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f8fb',
        padding: '40px 20px'
      }}>
        <div style={{
          maxWidth: '480px',
          background: '#fff',
          padding: '40px 32px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '64px',
            marginBottom: '24px',
            color: '#16a34a'
          }}>
            ✓
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px' }}>
            Pagamento confirmado!
          </h1>
          <p style={{ fontSize: '16px', color: '#2d4a3e', margin: '0 0 24px', lineHeight: '1.5' }}>
            Seu plano Profissional está ativo. Agora você tem acesso a:
          </p>

          <ul style={{
            listStyle: 'none',
            padding: 0,
            margin: '0 0 32px',
            textAlign: 'left'
          }}>
            {['Recursos de contestação completos', 'Auditorias ilimitadas por mês', 'Suporte prioritário'].map((item) => (
              <li key={item} style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                padding: '8px 0',
                color: '#2d4a3e',
                fontSize: '14px'
              }}>
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}>✓</span>
                {item}
              </li>
            ))}
          </ul>

          <button
            onClick={() => {
              // Revalidar cache antes de ir pro dashboard
              fetch('/api/revalidate', { method: 'POST' }).then(() => {
                router.push('/');
              });
            }}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Ir para o dashboard →
          </button>

          <p style={{
            margin: '16px 0 0',
            fontSize: '12px',
            color: '#8aa89e'
          }}>
            Um e-mail de confirmação foi enviado para você.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f8fb',
      padding: '40px 20px'
    }}>
      <div style={{
        maxWidth: '480px',
        background: '#fff',
        padding: '40px 32px',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '48px',
          marginBottom: '24px'
        }}>
          ⚠️
        </div>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px' }}>
          Algo deu errado
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 24px' }}>
          Não conseguimos confirmar seu pagamento. Tente novamente ou entre em contato com suporte.
        </p>
        <button
          onClick={() => router.push('/configuracoes')}
          style={{
            width: '100%',
            padding: '12px 16px',
            background: '#64748b',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Voltar para Configurações
        </button>
      </div>
    </main>
  );
}
