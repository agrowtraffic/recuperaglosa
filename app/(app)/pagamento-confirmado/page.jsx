import { Suspense } from 'react';
import PagamentoConfirmadoClient from './PagamentoConfirmadoClient';

function LoadingState() {
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

export default function PagamentoConfirmado() {
  return (
    <Suspense fallback={<LoadingState />}>
      <PagamentoConfirmadoClient />
    </Suspense>
  );
}
