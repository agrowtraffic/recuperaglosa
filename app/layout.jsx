import './globals.css';
import '@/styles/tokens.css';
import { Manrope } from 'next/font/google';

const manrope = Manrope({ subsets: ['latin'], weights: [500, 700, 800] });

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'RecuperaGlosa — Visão geral',
  description: 'Dashboard visual do SaaS RecuperaGlosa'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className={`rg ${manrope.className}`}>{children}</body>
    </html>
  );
}
