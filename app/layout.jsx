import './globals.css';
import { Manrope } from 'next/font/google';
import Script from 'next/script';

/* Manrope é fonte variável — não se declara peso, o range vem inteiro.
   (A chave `weights` que estava aqui nem existe na API do next/font.) */
const manrope = Manrope({ subsets: ['latin'], display: 'swap' });

export const dynamic = 'force-dynamic';

export const metadata = {
  /* Sem metadataBase o Next monta URL relativa em canonical e Open Graph,
     e cada domínio que servisse o app se anunciava como original. Fixar
     aqui faz todo link absoluto apontar para o domínio oficial, venha a
     requisição de onde vier. */
  metadataBase: new URL('https://recuperaglosa.com.br'),
  title: {
    default: 'RecuperaGlosa',
    template: '%s · RecuperaGlosa',
  },
  description: 'Auditoria de glosas de convênio para clínicas e consultórios.',
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
