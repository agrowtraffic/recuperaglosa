import './globals.css';
import { Manrope } from 'next/font/google';

/* Manrope é fonte variável — não se declara peso, o range vem inteiro.
   (A chave `weights` que estava aqui nem existe na API do next/font.) */
const manrope = Manrope({ subsets: ['latin'], display: 'swap' });

export const dynamic = 'force-dynamic';

export const metadata = {
  title: {
    default: 'RecuperaGlosa',
    template: '%s · RecuperaGlosa',
  },
  description: 'Auditoria de glosas de convênio para clínicas e consultórios.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`rg ${manrope.className}`}>{children}</body>
    </html>
  );
}
