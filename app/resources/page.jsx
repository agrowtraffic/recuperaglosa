'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';

export default function ResourcesPage() {
  const [isAssinante, setIsAssinante] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPlano() {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard data:', data);
          const isAtivo = data.clinica?.plano === 'ativo';
          console.log('isAtivo:', isAtivo, 'plano:', data.clinica?.plano);
          setIsAssinante(isAtivo);
        }
      } catch (error) {
        console.error('Erro ao buscar plano:', error);
      } finally {
        setLoading(false);
      }
    }

    checkPlano();
  }, []);

  const recursos = [
    {
      id: 1,
      lote: 'Lote #001',
      motivo: 'Glosa por ausência de autorização',
      valor: 'R$ 2.500,00',
      texto: 'Prezados Colegas,\n\nVenho por este meio contestar a glosa aplicada à prestação de serviço descrita acima, que foi recusada sob a alegação de ausência de autorização prévia.\n\nConforme documentação anexada, a autorização foi devidamente solicitada e obtida antes da execução do procedimento. A negativa de reembolso não encontra fundamentação nas normas vigentes.\n\nSolicito a reconsideração desta decisão e o reembolso do valor glosado.\n\nAteniosamente,\nClínica [Nome]',
    },
    {
      id: 2,
      lote: 'Lote #002',
      motivo: 'Glosa por falta de documentação',
      valor: 'R$ 1.800,00',
      texto: 'Prezados Colegas,\n\nVenho por este meio contestar a glosa aplicada pela falta de documentação, informando que toda a documentação necessária foi apresentada no momento da faturação.\n\nAnexo segue cópia digitalizada de todos os documentos, inclusive laudos e prescrições médicas.\n\nAgradeço a reconsideração desta decisão.\n\nAtenciosamente,\nClínica [Nome]',
    },
  ];

  return (
    <main style={{ minHeight: '100vh', padding: '40px 20px', background: '#f5f8fb' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#0f172a', marginTop: 0 }}>
          📋 Recursos de Contestação
        </h1>
        <p style={{ color: '#64748b', marginBottom: '32px' }}>
          Textos prontos para enviar ao convênio
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
            Carregando...
          </div>
        ) : !isAssinante ? (
          <div style={{
            padding: '16px',
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            marginBottom: '24px',
            color: '#92400e',
            fontSize: '13px',
          }}>
            🔒 <strong>Plano grátis</strong> — recursos com preview. Assine para desbloquear o texto completo.
          </div>
        ) : (
          <div style={{
            padding: '16px',
            background: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '8px',
            marginBottom: '24px',
            color: '#15803d',
            fontSize: '13px',
          }}>
            ✅ <strong>Assinatura Ativa!</strong> — Acesso completo a todos os recursos.
          </div>
        )}

        <div style={{ display: 'grid', gap: '16px' }}>
          {recursos.map((recurso) => (
            <ResourceCard key={recurso.id} recurso={recurso} isAssinante={isAssinante} />
          ))}
        </div>
      </div>
    </main>
  );
}

function ResourceCard({ recurso, isAssinante }) {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert('Erro ao abrir checkout. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao processar pagamento.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPDF() {
    setDownloading(true);
    try {
      // Se o recurso tiver um ID de recurso real do banco
      if (recurso.recursoId) {
        window.location.href = `/api/recurso/${recurso.recursoId}/pdf`;
      } else {
        // Fallback: baixar como TXT se não houver ID real
        const element = document.createElement('a');
        const file = new Blob([recurso.texto], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = `recurso-${recurso.id}.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      }
    } catch (error) {
      console.error('Erro ao baixar:', error);
      alert('Erro ao baixar o recurso.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div style={{
      background: '#fff',
      padding: '24px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '16px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ marginTop: 0, marginBottom: '4px', fontSize: '16px', fontWeight: '600', color: '#0f172a' }}>
            {recurso.lote}
          </h3>
          <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '13px' }}>
            {recurso.motivo}
          </p>
          <p style={{ margin: '0 0 16px', color: '#16a34a', fontWeight: '600', fontSize: '14px' }}>
            {recurso.valor}
          </p>

          <div
            style={{
              padding: '12px',
              background: '#f8fafc',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#334155',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              filter: isAssinante ? 'none' : 'blur(4px)',
              userSelect: isAssinante ? 'auto' : 'none',
              pointerEvents: isAssinante ? 'auto' : 'none',
            }}
          >
            {recurso.texto}
          </div>
        </div>
      </div>

      {!isAssinante && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.95)',
          padding: '20px',
          borderRadius: '12px',
          textAlign: 'center',
          backdropFilter: 'blur(2px)',
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔒</div>
          <p style={{ margin: '0 0 12px', fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>
            Recurso Bloqueado
          </p>
          <button
            onClick={handleCheckout}
            disabled={loading}
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              background: loading ? '#cbd5e1' : '#16a34a',
              color: '#fff',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '12px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? '⏳ Abrindo...' : '💳 Assinar Agora'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button
          disabled={!isAssinante}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: isAssinante ? '#16a34a' : '#cbd5e1',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: isAssinante ? 'pointer' : 'not-allowed',
          }}
        >
          📋 Copiar Texto
        </button>
        <button
          onClick={handleDownloadPDF}
          disabled={!isAssinante || downloading}
          style={{
            flex: 1,
            padding: '8px 12px',
            background: isAssinante ? '#0f172a' : '#cbd5e1',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: isAssinante && !downloading ? 'pointer' : 'not-allowed',
          }}
        >
          {downloading ? '⏳ Gerando...' : '📄 Baixar'}
        </button>
      </div>
    </div>
  );
}
