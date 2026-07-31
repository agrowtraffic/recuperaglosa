'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/app/_components/kit/AppShell';
import { nomeDoPlano } from '@/lib/plano';
import { Settings, LogOut, ChevronDown, HelpCircle } from 'lucide-react';
import TourGuiado from '@/app/_components/tour/TourGuiado';

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
export default function AppChrome({ children, clinica, contadores, clinicaId }){
 const router = useRouter();
 const [signingOut, setSigningOut] = useState(false);
 const [profileOpen, setProfileOpen] = useState(false);
 const [tourAberto, setTourAberto] = useState(false);
 const profileRef = useRef(null);

 /* Por clínica, e não uma chave global: em máquina compartilhada na
    recepção, quem entra depois com outra conta merece ver o tutorial. */
 const chaveTour = clinicaId ? `rg-tutorial-${clinicaId}` : null;

 /* Abre sozinho só na primeira visita. Roda depois da montagem porque
    localStorage não existe no servidor, e num timeout curto para o
    conteúdo da página já estar no DOM — o roteiro monta a partir dos
    alvos que encontra, e medir cedo demais descartaria passos que
    existem. */
 useEffect(() => {
   if (!chaveTour) return;
   let visto = null;
   try {
     visto = localStorage.getItem(chaveTour);
   } catch {
     return; /* sem storage, não insiste: melhor nunca abrir do que abrir toda vez */
   }
   if (visto) return;
   const t = setTimeout(() => setTourAberto(true), 700);
   return () => clearTimeout(t);
 }, [chaveTour]);

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
        ancestral posicionado se ancorava no viewport — o menu aparecia
        solto no meio da página, sobre o conteúdo. */
     <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} ref={profileRef}>
       <button
         onClick={() => setProfileOpen(o => !o)}
         aria-expanded={profileOpen}
         aria-haspopup="menu"
         title="Sua conta"
         className="rg-clinic rg-clinic-btn"
       >
         <span aria-hidden="true">RG</span>
         <div>
           <small>Clínica ativa</small>
           <strong>{clinica?.nome || 'Sua clínica'}</strong>
         </div>
         {/* O ícone vai dentro de um span porque o transform do CSS não
             pega no <svg> deste contexto — nem inline. No span pega. */}
         <span className="rg-clinic-seta" aria-hidden="true">
           <ChevronDown size={15} />
         </span>
       </button>
       {profileOpen && (
         <div
           role="menu"
           style={{
             position: 'absolute',
             top: '100%',
             /* Ancorado à esquerda: o gatilho passou a ser o bloco da
                clínica, que fica no começo da topbar. Ancorar à direita
                jogaria o menu para fora da tela no celular. */
             left: 0,
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
           {/* O cabeçalho com o nome da clínica saiu: o gatilho do menu
               agora é o próprio bloco que mostra esse nome, logo acima. */}
           {/* Fica no menu da clínica porque é onde a pessoa procura
               quando trava — e é o lugar que o último passo do tutorial
               indica para revê-lo. */}
           <button
             role="menuitem"
             onClick={() => { setProfileOpen(false); setTourAberto(true); }}
             style={{
               ...itemMenu,
               border: 'none',
               background: 'none',
               width: '100%',
               textAlign: 'left',
               cursor: 'pointer',
               borderBottom: '1px solid var(--rg-line-soft)',
             }}
           >
             <HelpCircle size={16} /> Ver tutorial
           </button>
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
     <TourGuiado
       aberto={tourAberto}
       aoFechar={() => setTourAberto(false)}
       chaveConclusao={chaveTour}
     />
   </AppShell>
 );
}
