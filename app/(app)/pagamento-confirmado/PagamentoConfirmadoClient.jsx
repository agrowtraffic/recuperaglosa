'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/* O webhook do Stripe grava plano='ativo' na clinica. Aceita 'profissional'
   também para tolerar renomeação futura do valor. */
const PLANOS_PAGOS = new Set(['ativo', 'profissional']);
const MAX_TENTATIVAS = 3;
const INTERVALO_MS = 2000;

export default function PagamentoConfirmadoClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState('verificando'); // verificando | sucesso | erro | processando
  /* Refs em vez de state: o retry roda dentro de um setTimeout e precisa
     enxergar o valor atual, não o capturado no render que agendou. */
  const vivoRef = useRef(true);
  const timerRef = useRef(null);

  useEffect(() => {
    vivoRef.current = true;

    if (!sessionId) {
      router.replace('/');
      return;
    }

    verificarPagamento(0);

    return () => {
      vivoRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, router]);

  async function verificarPagamento(tentativa) {
    if (!vivoRef.current) return;

    try {
      const supabase = createClient();

      // Buscar usuario para pegar clinica_id
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        if (vivoRef.current) setStatus('erro');
        return;
      }

      const { data: usuarioData } = await supabase
        .from('usuario')
        .select('clinica_id')
        .eq('id', user.id)
        .single();

      if (!usuarioData) {
        if (vivoRef.current) setStatus('erro');
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
      const { paymentStatus } = await response.json();

      if (!vivoRef.current) return;

      if (paymentStatus !== 'paid') {
        setStatus('erro');
        return;
      }

      if (PLANOS_PAGOS.has(clinica?.plano)) {
        // Pagamento confirmado e plano já atualizado no banco
        setStatus('sucesso');
        return;
      }

      if (tentativa < MAX_TENTATIVAS) {
        // Webhook ainda não chegou — tenta de novo com o contador correto
        setStatus('processando');
        timerRef.current = setTimeout(() => verificarPagamento(tentativa + 1), INTERVALO_MS);
        return;
      }

      // Stripe confirmou o pagamento; o webhook atualiza o banco em seguida
      setStatus('sucesso');
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      if (vivoRef.current) setStatus('erro');
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

          {/* Pedido do responsável técnico fica aqui, e não no cadastro:
              no cadastro é burocracia antes de a pessoa ver valor, e trava
              a entrada. Aqui ela acabou de pagar para ter os recursos
              completos e está pronta para configurar — e é o último
              momento antes de gerar o primeiro PDF, que sem esses dados
              sai com a linha de assinatura em branco. */}
          <div style={{
            textAlign: 'left',
            padding: '14px 16px',
            marginBottom: '16px',
            borderRadius: '10px',
            border: '1px solid #d9e5dd',
            background: '#f4f8f5'
          }}>
            <p style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              Falta 1 minuto para o recurso sair assinado
            </p>
            <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#5c706a', lineHeight: 1.5 }}>
              Cadastre o responsável técnico da clínica — nome, conselho e registro.
              Sem isso, todo PDF sai com a linha de assinatura em branco para
              preencher à mão.
            </p>
            <button
              onClick={() => {
                fetch('/api/revalidate', { method: 'POST' }).then(() => {
                  router.push('/configuracoes#responsavel');
                });
              }}
              style={{
                padding: '9px 14px',
                background: '#fff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Cadastrar responsável
            </button>
          </div>

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
