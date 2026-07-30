'use client';

/* Último recurso: usado quando a falha acontece no próprio root layout.
   Este arquivo SUBSTITUI o layout raiz, então precisa trazer <html> e
   <body> e não pode depender do CSS do app — que pode nem ter carregado.
   Por isso o estilo aqui é inline e propositalmente autossuficiente. */
export default function ErroGlobal({ error, reset }) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
          background: '#f4f6ef',
          color: '#17302b',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: 460,
            width: '100%',
            background: '#fffefb',
            border: '1px solid #dce5df',
            borderRadius: 16,
            padding: '32px 28px',
            textAlign: 'center',
          }}
        >
          <p style={{ margin: '0 0 8px', fontSize: 11, fontWeight: 700, letterSpacing: '.09em', textTransform: 'uppercase', color: '#b9474e' }}>
            Falha inesperada
          </p>
          <h1 style={{ margin: '0 0 10px', fontSize: 22, fontWeight: 700, letterSpacing: '-.015em' }}>
            O RecuperaGlosa não conseguiu iniciar
          </h1>
          <p style={{ margin: '0 0 24px', fontSize: 14, lineHeight: 1.55, color: '#61706c' }}>
            A falha foi registrada e seus dados estão intactos. Recarregar
            costuma resolver. Se persistir, escreva para
            suporte@recuperaglosa.com.br
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 44,
              padding: '0 24px',
              border: 'none',
              borderRadius: 10,
              background: '#0b9a73',
              color: '#fff',
              font: 'inherit',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Recarregar
          </button>
        </div>
      </body>
    </html>
  );
}
