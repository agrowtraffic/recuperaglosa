import './globals.css';

export const metadata = {
  title: 'RecuperaGlosa — Visão geral',
  description: 'Dashboard visual do SaaS RecuperaGlosa'
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
