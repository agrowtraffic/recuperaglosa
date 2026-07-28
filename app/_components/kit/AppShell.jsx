"use client";

/* ============================================================
   APP SHELL — casca visual do app (sidebar + gaveta + barra inferior)
   Só visual. Não busca dado, não sabe de Supabase.
   Uso em app/(app)/layout.jsx:

     <AppShell nomeClinica={...} plano={...} contadores={{ glosas: 12 }}>
       {children}
     </AppShell>
   ============================================================ */

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommandPalette, CommandTrigger } from "./Signature";
import { Brand } from "./Brand";
import {
  LayoutDashboard, Boxes, FileText, AlertTriangle, FileCheck2,
  BarChart3, Settings, Menu, X, Bell, MoreHorizontal, Plus,
} from "lucide-react";

export const NAV = [
  { href: "/",              label: "Visão geral",   icon: LayoutDashboard, mobile: true },
  { href: "/lotes",         label: "Lotes",         icon: Boxes,           mobile: true },
  { href: "/guias",         label: "Guias",         icon: FileText },
  { href: "/glosas",        label: "Glosas",        icon: AlertTriangle,   mobile: true, contador: "glosas" },
  { href: "/recursos",      label: "Recursos",      icon: FileCheck2,      mobile: true },
  { href: "/relatorios",    label: "Relatórios",    icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
];

export default function AppShell({
  children,
  nomeClinica = "Sua clínica",   /* ⬛ PREENCHER: nome real da clínica */
  plano = "Gratuito",            /* ⬛ PREENCHER: "Gratuito" | "Ativo" */
  contadores = {},               /* ⬛ PREENCHER: { glosas: 12 } */
  onNovoLote,                    /* ⬛ PREENCHER: abre upload de XML */
}) {
  const [drawer, setDrawer] = useState(false);
  const [mais, setMais] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setDrawer(false); setMais(false); }, [pathname]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && (setDrawer(false), setMais(false));
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawer || mais ? "hidden" : "";
  }, [drawer, mais]);

  const atual = (href) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const principais = NAV.filter((i) => i.mobile);

  return (
    <div className="rg-shell" data-drawer={drawer ? "open" : "closed"}>
      {/* -------- SIDEBAR / GAVETA -------- */}
      <aside className="rg-sidebar" aria-label="Navegação principal">
        <div className="rg-sidebar-brand">
          <Brand tom="claro" />
          <button
            className="rg-btn rg-btn-icon rg-btn-ghost rg-only-mobile"
            style={{ marginLeft: "auto", color: "#fff" }}
            onClick={() => setDrawer(false)}
            aria-label="Fechar menu"
          ><X size={20} /></button>
        </div>

        <nav className="rg-nav">
          {NAV.map(({ href, label, icon: Icon, contador }) => (
            <Link key={href} href={href} className="rg-nav-item" aria-current={atual(href) ? "page" : undefined}>
              <Icon size={19} strokeWidth={2.1} />
              <span>{label}</span>
              {contador && contadores[contador] > 0 && (
                <em className="rg-nav-count" style={{ fontStyle: "normal" }}>{contadores[contador]}</em>
              )}
            </Link>
          ))}
        </nav>

        <div className="rg-sidebar-foot">
          <div className="rg-plan-card">
            <p className="rg-eyebrow">Plano {plano}</p>
            <p>
              {plano === "Ativo"
                ? "Recursos de contestação liberados."
                : "Libere os recursos de contestação."}
            </p>
            {plano !== "Ativo" && (
              <button
                type="button"
                className="rg-btn rg-btn-primary rg-btn-sm rg-btn-block"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/checkout', { method: 'POST' });
                    const { checkoutUrl } = await response.json();
                    if (checkoutUrl) window.location.href = checkoutUrl;
                  } catch (error) {
                    console.error('Erro ao criar checkout:', error);
                  }
                }}
              >
                Assinar
              </button>
            )}
          </div>
        </div>
      </aside>

      <div className="rg-overlay" onClick={() => setDrawer(false)} aria-hidden="true" />

      {/* -------- CONTEÚDO -------- */}
      <div className="rg-main">
        <header className="rg-topbar">
          <button
            className="rg-btn rg-btn-icon rg-btn-ghost rg-menu-btn"
            onClick={() => setDrawer(true)}
            aria-label="Abrir menu"
            aria-expanded={drawer}
          ><Menu size={20} /></button>

          <div className="rg-clinic">
            <span aria-hidden="true">RG</span>
            <div>
              <small>Clínica ativa</small>
              <strong>{nomeClinica}</strong>
            </div>
          </div>

          <div className="rg-spacer" />

          <CommandTrigger />

          <button className="rg-btn rg-btn-icon rg-btn-ghost" aria-label="Notificações" disabled title="Em breve">
            <Bell size={19} />
          </button>
          <button className="rg-btn rg-btn-primary rg-btn-sm rg-hide-mobile" onClick={onNovoLote}>
            <Plus size={16} /> Enviar XML
          </button>
          {/* ⬛ PREENCHER: menu de perfil já existente do projeto */}
        </header>

        {children}
      </div>

      <CommandPalette />

      {/* -------- BARRA INFERIOR (celular) -------- */}
      <nav className="rg-bottomnav" aria-label="Navegação rápida">
        {principais.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-current={atual(href) ? "page" : undefined}>
            <Icon size={20} strokeWidth={2.1} />
            {label.split(" ")[0]}
          </Link>
        ))}
        <button onClick={() => setDrawer(true)} aria-label="Mais opções">
          <MoreHorizontal size={20} /> Mais
        </button>
      </nav>
    </div>
  );
}
