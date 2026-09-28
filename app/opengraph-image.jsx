/* Imagem de compartilhamento (og:image / twitter:image).

   É o que aparece quando o link vai para o WhatsApp, LinkedIn ou e-mail
   — e o WhatsApp é o canal da prospecção. Sem ela, o link chegava como
   texto puro, sem prévia. Herdada por toda página que não tiver a sua.

   Runtime edge: no Node, o @vercel/og quebra o build no Windows
   (fileURLToPath com caminho de drive). */
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'RecuperaGlosa — auditoria de glosas de convênio para clínicas';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#052b25',
          color: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 34, fontWeight: 700 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: '#c9f66b' }} />
          RecuperaGlosa
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>
            Descubra quanto o convênio deixou de pagar.
          </div>
          <div style={{ fontSize: 32, color: '#c9f66b', lineHeight: 1.3 }}>
            Envie o XML TISS e saia com o recurso de glosa pronto.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 28, fontSize: 24, color: 'rgba(255,255,255,.72)' }}>
          {['Grátis para começar', '603 códigos da Tabela 38', 'recuperaglosa.com.br'].map((t) => (
            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: '#c9f66b' }} />
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
