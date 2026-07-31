'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/app/_components/kit/AppShell';
import { nomeDoPlano } from '@/lib/plano';
import { Settings, LogOut } from 'lucide-react';

/* Item do menu de perfil. Usa os tokens do sistema em vez de hex solto,
   para não divergir do resto do app quando a paleta mudar. */
const itemMenu = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: '11px 14px',
  fontSize: 14,
  color: 'var(--rg-ink-800)',
  textDecoration: 'none',
};

/* Recebe `clinica` e `contadores` do layout (Server Component) em vez de
   buscá-los aqui.

   Antes este shell disparava fetch('/api/dashboard') num useEffect. Como
   era uma requisição separada da navegação, as duas chegavam ao Supabase
   em paralelo e cada uma tentava renovar a sessão com o mesmo refresh
   token. O Supabase rotaciona o token: a primeira ganhava e invalidava a
   outra ("refresh_token_not_found"), e quem gravasse o cookie por último
   deixava no navegador um token já queimado — daí o middleware não achava
   sessão na navegação seguinte e devolvia a pessoa para o /login. */
export default function AppChrome({ children, clinica, contadores }){
 const router = useRouter();
 const [signingOut, setSigningOut] = useState(false);
 const [profileOpen, setProfileOpen] = useState(false);
 const profileRef = useRef(null);

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
     perfil={
     /* Vai como prop, não como children: passado por children ele caía
        dentro da área de conteúdo, e como `position:absolute` sem nenhum
        ancestral posicionado se ancorava no viewport — o avatar aparecia
        solto no meio da página, sobre o conteúdo. */
     <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={profileRef}>
       <button
         onClick={() => setProfileOpen(o => !o)}
         aria-expanded={profileOpen}
         aria-haspopup="menu"
         aria-label={`Conta de ${clinica?.nome || 'sua clínica'}`}
         title="Sua conta"
         className="rg-avatar"
       >
         {(clinica?.nome || 'C').charAt(0).toUpperCase()}
       </button>
       {profileOpen && (
         <div
           role="menu"
           style={{
             position: 'absolute',
             top: '100%',
             right: 0,
             background: 'var(--rg-surface)',
             border: '1px solid var(--rg-line)',
             borderRadius: 'var(--rg-r-sm)',
             minWidth: 190,
             zIndex: 1000,
             boxShadow: 'var(--rg-shadow-up)',
             marginTop: 8,
             overflow: 'hidden',
           }}
         >
           <p
             style={{
               margin: 0,
               padding: '10px 14px',
               fontSize: 12,
               color: 'var(--rg-ink-400)',
               borderBottom: '1px solid var(--rg-line-soft)',
               whiteSpace: 'nowrap',
               overflow: 'hidden',
               textOverflow: 'ellipsis',
             }}
           >
             {clinica?.nome || 'Sua clínica'}
           </p>
           <Link
             href="/configuracoes"
             role="menuitem"
             onClick={() => setProfileOpen(false)}
             style={{ ...itemMenu, borderBottom: '1px solid var(--rg-line-soft)' }}
           >
             <Settings size={16} /> Configurações
           </Link>
           <button
             role="menuitem"
             onClick={handleSignOut}
             disabled={signingOut}
             style={{
               ...itemMenu,
               border: 'none',
               background: 'none',
               width: '100%',
               textAlign: 'left',
               cursor: signingOut ? 'not-allowed' : 'pointer',
               opacity: signingOut ? 0.6 : 1,
             }}
           >
             <LogOut size={16} /> {signingOut ? 'Saindo…' : 'Sair'}
           </button>
         </div>
       )}
     </div>
     }
   >
     {children}
   </AppShell>
 );
}
