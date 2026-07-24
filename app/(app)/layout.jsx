'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Icon } from './_components/Icon';

const WHATSAPP_NUMBER = '5511977315655';

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
 const router = useRouter();
 const [menuOpen,setMenuOpen] = useState(false);
 const [profileOpen,setProfileOpen] = useState(false);
 const [clinica,setClinica] = useState(null);
 const [signingOut,setSigningOut] = useState(false);
 const profileRef = useRef(null);

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
   function onKeyDown(event){
     if(event.key==='Escape') setMenuOpen(false);
   }
   window.addEventListener('keydown',onKeyDown);
   return ()=>{
     document.body.style.overflow='';
     window.removeEventListener('keydown',onKeyDown);
   };
 },[menuOpen]);

 useEffect(()=>{
   setMenuOpen(false);
   setProfileOpen(false);
 },[pathname]);

 useEffect(()=>{
   if(!profileOpen) return;
   function onClickOutside(event){
     if(profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
   }
   function onKeyDown(event){
     if(event.key==='Escape') setProfileOpen(false);
   }
   document.addEventListener('mousedown',onClickOutside);
   window.addEventListener('keydown',onKeyDown);
   return ()=>{
     document.removeEventListener('mousedown',onClickOutside);
     window.removeEventListener('keydown',onKeyDown);
   };
 },[profileOpen]);

 async function handleSignOut(){
   setSigningOut(true);
   try{
     await fetch('/auth/signout',{method:'POST'});
     router.replace('/login');
     router.refresh();
   }catch(e){
     console.error('Erro ao sair:',e);
     setSigningOut(false);
   }
 }

 const planoAtivo = clinica?.plano==='ativo';

 return <main className="app-shell full-app">
  <header className="topbar">
   <button className="menu-toggle" onClick={()=>setMenuOpen(!menuOpen)} aria-label="Menu"><Icon name="menu"/></button>
   <Logo/>
   <div className="top-actions">
    <button className="icon-button" aria-label="Notificações" disabled title="Notificações em breve"><Icon name="bell"/></button>
    <div className="clinic-menu-wrap" ref={profileRef}>
     <button className="clinic" onClick={()=>setProfileOpen(o=>!o)} aria-expanded={profileOpen} aria-haspopup="true">
      <span>{(clinica?.nome||'C').charAt(0).toUpperCase()}</span>{clinica?.nome||'Carregando...'}<Icon name="chevron" size={16}/>
     </button>
     {profileOpen && (
      <div className="clinic-menu" role="menu">
       <Link href="/configuracoes" role="menuitem" onClick={()=>setProfileOpen(false)}><Icon name="settings" size={16}/>Configurações</Link>
       <button role="menuitem" onClick={handleSignOut} disabled={signingOut}><Icon name="lock" size={16}/>{signingOut?'Saindo...':'Sair'}</button>
      </div>
     )}
    </div>
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
     <Link href="/configuracoes" onClick={()=>setMenuOpen(false)}>Gerenciar plano</Link>
    </div>
    <button className="whatsapp-mobile" onClick={()=>window.open(`https://wa.me/${WHATSAPP_NUMBER}`)}><Icon name="whatsapp"/>Falar no WhatsApp</button>
   </aside>
   {menuOpen&&<div className="drawer-backdrop" onClick={()=>setMenuOpen(false)}/>}
   <section className="content">{children}</section>
  </div>
 </main>;
}
