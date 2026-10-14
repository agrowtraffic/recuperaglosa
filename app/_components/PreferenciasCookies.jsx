'use client';

import { abrirPreferenciasCookies } from '@/lib/consentimento';

/* Botão que reabre o banner de consentimento. Revogar tem de ser tão
   fácil quanto aceitar: este botão fica no rodapé e na /privacidade. */
export default function PreferenciasCookies({ children = 'Preferências de cookies', className, style }) {
  return (
    <button
      type="button"
      className={className}
      onClick={abrirPreferenciasCookies}
      style={{
        background: 'none',
        border: 0,
        padding: 0,
        font: 'inherit',
        color: 'inherit',
        cursor: 'pointer',
        textAlign: 'left',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
