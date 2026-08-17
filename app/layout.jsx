import './globals.css';
import { Manrope } from 'next/font/google';
import Script from 'next/script';

/* Manrope é fonte variável — não se declara peso, o range vem inteiro.
   (A chave `weights` que estava aqui nem existe na API do next/font.) */
const manrope = Manrope({ subsets: ['latin'], display: 'swap' });

export const dynamic = 'force-dynamic';

export const metadata = {
  metadataBase: new URL('https://recuperaglosa.com.br'),
  title: {
    default: 'RecuperaGlosa — Auditoria e Recuperação de Glosas de Convênio',
    template: '%s · RecuperaGlosa',
  },
  description: 'Auditoria de glosas de convênio para clínicas. Recupere valores glosados com recursos prontos para enviar. Análise automática de demonstrativo TISS.',
  keywords: ['auditoria de glosas', 'recuperação de glosas', 'glosas de convênio', 'análise de glosas', 'recursos de glosa', 'clínicas'],
  authors: [{ name: 'RecuperaGlosa' }],
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://recuperaglosa.com.br',
    siteName: 'RecuperaGlosa',
    title: 'RecuperaGlosa — Auditoria de Glosas de Convênio',
    description: 'Recupere valores glosados com análise automática e recursos prontos para contestação.',
  },
  alternates: { canonical: '/' },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-FEN2YGL8QN"
        />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-FEN2YGL8QN');
          `}
        </Script>
      </head>
      <body className={`rg ${manrope.className}`}>{children}</body>
    </html>
  );
}
