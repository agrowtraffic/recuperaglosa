/* ============================================================
   Moldura das telas de aviso (404, erro). Fica fora do AppShell
   porque pode aparecer antes de o app carregar — inclusive sem
   sessão. Não depende de dado nenhum.
   ============================================================ */
import { Brand } from './Brand';

export function TelaAviso({ codigo, titulo, texto, acoes, tom = 'neutro' }) {
  const cor = tom === 'erro' ? 'var(--rg-perdido-h)' : 'var(--rg-ink-400)';

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        background: 'var(--rg-canvas)',
      }}
    >
      <div
        className="rg-card rg-card-pad"
        style={{ maxWidth: 480, width: '100%', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
          <Brand altura={32} />
        </div>

        {codigo && (
          <p
            className="rg-eyebrow"
            style={{ color: cor, marginBottom: 8 }}
          >
            {codigo}
          </p>
        )}

        <h1 className="rg-h1" style={{ marginBottom: 10, textWrap: 'balance' }}>
          {titulo}
        </h1>

        <p className="rg-sub" style={{ marginBottom: 24, textWrap: 'pretty' }}>
          {texto}
        </p>

        <div
          className="rg-row rg-row-wrap"
          style={{ justifyContent: 'center', gap: 10 }}
        >
          {acoes}
        </div>
      </div>
    </main>
  );
}

export default TelaAviso;
