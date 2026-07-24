'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from './_components/Icon';

const NAV = [
  { href: '/', label: 'Visão geral', icon: 'home' },
  { href: '/lotes', label: 'Lotes', icon: 'folder' },
  { href: '/guias', label: 'Guias', icon: 'file' },
  { href: '/glosas', label: 'Glosas', icon: 'alert' },
  { href: '/recursos', label: 'Recursos', icon: 'scale' },
  { href: '/relatorios', label: 'Relatórios', icon: 'chart' },
  { href: '/configuracoes', label: 'Configurações', icon: 'settings' },
];

function Logo(){return <div className="logo"><img src="/logo-icon.png" alt="Recupera Glosa" className="logo-mark" style={{width:38,height:38}}/><div className="logo-word"><span>Recupera</span><b>Glosa</b></div></div>}

function isActive(pathname, href){
  return href === '/' ? pathname === '/' : pathname.startsWith(href);
}

export default function AppLayout({ children }){
 const pathname = usePathname();
 const [menuOpen,setMenuOpen] = useState(false);
 const [clinica,setClinica] = useState(null);

 useEffect(()=>{
   let cancelled=false;
   fetch('/api/dashboard')
     .then(res=>res.ok?res.json():null)
     .then(json=>{ if(!cancelled && json) setClinica(json.clinica||null); })
     .catch(()=>{});
   return ()=>{cancelled=true;};
 },[]);

 useEffect(()=>{
   if(!menuOpen) return;
   document.body.style.overflow='hidden';
   return ()=>{document.body.style.overflow='';};
 },[menuOpen]);

 const planoAtivo = clinica?.plano==='ativo';

 return <main className="app-shell full-app">
  <header className="topbar">
   <button className="menu-toggle" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Menu"><Icon name="menu"/></button>
   <Logo/>
   <div className="top-actions">
    <button className="icon-button" aria-label="Notificações"><Icon name="bell"/></button>
    <button className="clinic"><span>{(clinica?.nome||'C').charAt(0).toUpperCase()}</span>{clinica?.nome||'Carregando...'}<Icon name="chevron" size={16}/></button>
   </div>
  </header>
  <div className="app-body">
   <aside className={`sidebar ${menuOpen?'mobile-open':''}`}>
    <nav>{NAV.map(({href,label,icon})=>
     <Link href={href} onClick={()=>setMenuOpen(false)} className={isActive(pathname,href)?'active':''} key={href}><Icon name={icon}/><span>{label}</span></Link>
    )}</nav>
    <div className="plan-card">
     <strong>{planoAtivo?'Plano Profissional':'Plano Gratuito'}</strong>
     <p>{planoAtivo?'Assinatura ativa':'Até 3 lotes por mês'}</p>
     <button>Gerenciar plano</button>
    </div>
    <button className="whatsapp-mobile" onClick={()=>window.open('https://wa.me/5511999999999')}><Icon name="whatsapp"/>Falar no WhatsApp</button>
   </aside>
   {menuOpen&&<div className="drawer-backdrop" onClick={()=>setMenuOpen(false)}/>}
   <section className="content">{children}</section>
  </div>
 </main>;
}
