'use client';

import { useState } from 'react';

export default function CheckoutButton({ clinicaId, className = '' }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      // TODO: Integrar com Asaas/Stripe
      // Por enquanto, abrir modal simulado
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicaId }),
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

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className={className}
      style={{
        padding: '12px 24px',
        background: loading ? '#cbd5e1' : '#16a34a',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: '600',
        fontSize: '14px',
        cursor: loading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {loading ? '⏳ Abrindo...' : '💳 Assinar Agora'}
    </button>
  );
}
