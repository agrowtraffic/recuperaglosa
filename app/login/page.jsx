'use client';

import Link from 'next/link';
import { Brand } from '@/app/_components/kit/Brand';
import LoginForm from './LoginForm';

export default function LoginPage({ searchParams }) {
  const initialMode = (searchParams?.modo === 'cadastro') ? 'signup' : 'login';

  return (
    <div className="rg-auth">
      {/* ---------- PAINEL DE MARCA ---------- */}
      <aside className="rg-auth-brand">
        <Brand tom="claro" />

        <div className="rg-auth-brand-body">
          <p className="rg-eyebrow">Gestão do ciclo de glosas</p>
          <h1>
            O que foi glosado <em>ainda pode voltar.</em>
          </h1>
          <p className="rg-auth-lead">
            Transforme o demonstrativo da operadora em prioridade clara e recurso pronto — sem perder dinheiro por prazo.
          </p>

          <ol className="rg-auth-steps">
            <li><b>1</b><span><strong>Envie o XML</strong><span>O mesmo arquivo que a operadora manda.</span></span></li>
            <li><b>2</b><span><strong>Veja o que foi glosado</strong><span>Item a item, com motivo e prazo.</span></span></li>
            <li><b>3</b><span><strong>Gere o recurso</strong><span>Documento pronto para contestar.</span></span></li>
          </ol>
        </div>

        <div className="rg-auth-trust">
          <span aria-hidden="true">✓</span>
          <p><strong>Dados isolados por clínica.</strong> Nada é compartilhado entre contas.</p>
        </div>
      </aside>

      {/* ---------- FORMULÁRIO ---------- */}
      <main className="rg-auth-form">
        <div className="rg-auth-box">
          <Brand className="rg-only-mobile" />
          <LoginForm initialMode={initialMode} />
        </div>

        <footer className="rg-row" style={{ justifyContent: 'center', gap: 16, marginTop: 20 }}>
          <span className="rg-caption">© 2026 Recupera Glosa</span>
          <Link className="rg-caption" href="/privacidade">Privacidade</Link>
          <Link className="rg-caption" href="/termos">Termos</Link>
        </footer>
      </main>
    </div>
  );
}
