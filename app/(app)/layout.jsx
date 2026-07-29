'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/app/_components/kit/AppShell';
import { nomeDoPlano } from '@/lib/plano';
import { Settings, Lock } from 'lucide-react';

export default function AppLayout({ children }){
 const router = useRouter();
 const [clinica, setClinica] = useState(null);
 const [contadores, setContadores] = useState({});
 const [signingOut, setSigningOut] = useState(false);
 const [profileOpen, setProfileOpen] = useState(false);
 const profileRef = useRef(null);

 useEffect(() => {
   let cancelled = false;
   fetch('/api/dashboard')
     .then(res => res.ok ? res.json() : null)
     .then(json => {
       if (!cancelled && json) {
         setClinica(json.clinica || null);
         setContadores({ glosas: json.glosas_count || 0 });
       }
     })
     .catch(() => {});
   return () => { cancelled = true; };
 }, []);

 useEffect(() => {
   if (!profileOpen) return;
   function onClickOutside(event) {
     if (profileRef.current && !profileRef.current.contains(event.target)) setProfileOpen(false);
   }
   function onKeyDown(event) {
     if (event.key === 'Escape') setProfileOpen(false);
   }
   document.addEventListener('mousedown', onClickOutside);
   window.addEventListener('keydown', onKeyDown);
   return () => {
     document.removeEventListener('mousedown', onClickOutside);
     window.removeEventListener('keydown', onKeyDown);
   };
 }, [profileOpen]);

 async function handleSignOut() {
   setSigningOut(true);
   try {
     await fetch('/auth/signout', { method: 'POST' });
     router.replace('/login');
     router.refresh();
   } catch (e) {
     console.error('Erro ao sair:', e);
     setSigningOut(false);
   }
 }

 function handleNovoLote() {
   router.push('/lotes');
 }

 return (
   <AppShell
     nomeClinica={clinica?.nome || 'Sua clínica'}
     plano={nomeDoPlano(clinica)}
     contadores={contadores}
     onNovoLote={handleNovoLote}
   >
     {/* Menu de perfil — encaixado na topbar */}
     <div style={{ position: 'absolute', right: 16, top: 0, height: '100%', display: 'flex', alignItems: 'center' }} ref={profileRef}>
       <button
         onClick={() => setProfileOpen(o => !o)}
         aria-expanded={profileOpen}
         aria-haspopup="true"
         className="rg-btn rg-btn-icon rg-btn-ghost"
         style={{ position: 'relative' }}
       >
         <span style={{ fontSize: 14, fontWeight: 700 }}>{(clinica?.nome || 'C').charAt(0).toUpperCase()}</span>
       </button>
       {profileOpen && (
         <div
           role="menu"
           style={{
             position: 'absolute',
             top: '100%',
             right: 0,
             background: '#FFFEFB',
             border: '1px solid #DCE5DF',
             borderRadius: 10,
             minWidth: 160,
             zIndex: 1000,
             boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
             marginTop: 8
           }}
         >
           <Link
             href="/configuracoes"
             role="menuitem"
             onClick={() => setProfileOpen(false)}
             style={{
               display: 'flex',
               alignItems: 'center',
               gap: 8,
               padding: '10px 12px',
               fontSize: 13,
               color: '#334155',
               textDecoration: 'none',
               borderBottom: '1px solid #DCE5DF'
             }}
           >
             <Settings size={16} /> Configurações
           </Link>
           <button
             role="menuitem"
             onClick={handleSignOut}
             disabled={signingOut}
             style={{
               display: 'flex',
               alignItems: 'center',
               gap: 8,
               padding: '10px 12px',
               fontSize: 13,
               color: '#334155',
               border: 'none',
               background: 'none',
               cursor: signingOut ? 'not-allowed' : 'pointer',
               width: '100%',
               textAlign: 'left',
               opacity: signingOut ? 0.6 : 1
             }}
           >
             <Lock size={16} /> {signingOut ? 'Saindo...' : 'Sair'}
           </button>
         </div>
       )}
     </div>
     {children}
   </AppShell>
 );
}
