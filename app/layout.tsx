import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'RecuperaGlosa — Visão geral',
  description: 'Dashboard visual do SaaS RecuperaGlosa'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
