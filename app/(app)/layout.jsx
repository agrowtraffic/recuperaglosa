/* ============================================================
   Shell das telas autenticadas.

   É Server Component de propósito: os dados da topbar (nome e plano da
   clínica) e o badge da sidebar vêm daqui, na mesma requisição que o
   middleware já autenticou. A versão anterior era client e buscava isso
   em /api/dashboard, uma segunda requisição que corria com a navegação e
   disputava a renovação do refresh token — ver o comentário em
   AppChrome.jsx.
   ============================================================ */
import AppChrome from './AppChrome';
import { getContexto, getGlosasCount } from '@/lib/dados-clinica';

export const dynamic = 'force-dynamic';

export default async function AppLayout({ children }) {
  const { supabase, clinicaId, clinica } = await getContexto();

  /* Sem clínica o middleware já teria redirecionado para /login ou para o
     onboarding. Se ainda assim chegou aqui, o shell renderiza com os
     rótulos neutros do AppChrome em vez de quebrar. */
  const glosas = clinicaId ? await getGlosasCount(supabase, clinicaId) : 0;

  return (
    /* clinicaId vai junto só para o tutorial saber de quem é a marca de
       "já vi": em recepção com máquina compartilhada, a próxima conta
       precisa ver o tutorial de novo. */
    <AppChrome clinica={clinica} contadores={{ glosas }} clinicaId={clinicaId}>
      {children}
    </AppChrome>
  );
}
