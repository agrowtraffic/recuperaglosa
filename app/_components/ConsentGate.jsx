'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import MetaPixel from './MetaPixel';
import {
  EVENTO_ABRIR,
  gravarConsentimento,
  lerConsentimento,
} from '@/lib/consentimento';

const GA_ID = 'G-FEN2YGL8QN';

/* Porteiro da medição. Nada de GA4 nem de pixel é carregado antes do
   aceite: sem o <Script>, não existe request para googletagmanager.com
   nem para connect.facebook.net. Fica aqui, e não em app/layout.jsx, para
   o aceite valer na hora, sem recarregar a página.

   Recusar depois de ter aceitado recarrega a página uma vez: um script
   que já rodou não se descarrega, e a única forma de garantir que parou
   é começar a página sem ele. */
export default function ConsentGate() {
  // undefined = ainda não leu o navegador (servidor e primeira renderização)
  const [consentimento, setConsentimento] = useState(undefined);
  const [bannerAberto, setBannerAberto] = useState(false);

  useEffect(() => {
    const atual = lerConsentimento();
    setConsentimento(atual);
    setBannerAberto(atual === null);

    const reabrir = () => {
      setConsentimento(lerConsentimento());
      setBannerAberto(true);
    };
    window.addEventListener(EVENTO_ABRIR, reabrir);
    return () => window.removeEventListener(EVENTO_ABRIR, reabrir);
  }, []);

  function escolher(valor) {
    const eraAceito = consentimento === 'granted';
    gravarConsentimento(valor);
    setConsentimento(valor);
    setBannerAberto(false);
    if (eraAceito && valor === 'denied') window.location.reload();
  }

  return (
    <>
      {consentimento === 'granted' && (
        <>
          <Script async src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}
          </Script>
          <MetaPixel />
        </>
      )}

      {bannerAberto && (
        <section
          role="dialog"
          aria-label="Preferências de cookies"
          aria-describedby="rg-consent-texto"
          style={{
            position: 'fixed',
            left: 16,
            right: 16,
            bottom: 16,
            zIndex: 2000,
            maxWidth: 560,
            background: '#fff',
            border: '1px solid #cbd5e1',
            borderRadius: 14,
            boxShadow: '0 8px 30px rgba(15,23,42,.18)',
            padding: '16px 18px',
            fontSize: 14,
            lineHeight: 1.5,
            color: '#1e293b',
          }}
        >
          <p id="rg-consent-texto" style={{ margin: 0 }}>
            Usamos ferramentas de medição do <strong>Google Analytics</strong> e da <strong>Meta</strong> para entender o
            uso do site e a eficácia dos anúncios. Elas só são ativadas se você aceitar. Os cookies essenciais, de login e
            segurança, funcionam sempre.{' '}
            <Link href="/privacidade" style={{ color: '#128437', fontWeight: 600 }}>Política de Privacidade</Link>
          </p>

          {consentimento && (
            <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>
              Sua escolha atual: {consentimento === 'granted' ? 'aceitou' : 'recusou'}.
            </p>
          )}

          {/* Mesmo estilo, mesmo tamanho: recusar não pode ser mais difícil que aceitar. */}
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            <button type="button" className="rg-btn rg-btn-secondary" style={{ flex: '1 1 140px' }} onClick={() => escolher('denied')}>
              Recusar
            </button>
            <button type="button" className="rg-btn rg-btn-secondary" style={{ flex: '1 1 140px' }} onClick={() => escolher('granted')}>
              Aceitar
            </button>
          </div>

          {consentimento && (
            <button
              type="button"
              onClick={() => setBannerAberto(false)}
              style={{ background: 'none', border: 0, padding: 0, marginTop: 10, color: '#64748b', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}
            >
              Fechar sem alterar
            </button>
          )}
        </section>
      )}
    </>
  );
}
