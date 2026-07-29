/* ============================================================
   CONFIGURAÇÕES  →  app/(app)/configuracoes/page.jsx
   Server Component: busca dados reais do Supabase
   ============================================================ */
import { getContexto, getLotes, getGlosas, getRecursos, calcularResumo } from '@/lib/dados-clinica';
import ConfiguracoesView from './View';

export const revalidate = 0; // Sempre buscar dados frescos do banco

export default async function Configuracoes() {
  const { supabase, user, clinicaId, clinica } = await getContexto();

  if (!user) {
    return <div>Não autorizado</div>;
  }

  if (!clinicaId || !clinica) {
    return <div>Clínica não encontrada para o usuário {user.email}</div>;
  }

  /* O valor que aparece no card de assinatura é o RECUPERÁVEL — glosas
     que ainda dá para contestar —, não o glosado total. Antes isto
     consultava guia.clinica_id, coluna que não existe no schema (a guia
     se liga à clínica via lote), então o valor era sempre zero. */
  const [lotes, glosas, recursos] = await Promise.all([
    getLotes(supabase, clinicaId),
    getGlosas(supabase, clinicaId),
    getRecursos(supabase, clinicaId),
  ]);

  const resumo = calcularResumo({ lotes, glosas, recursos });

  return (
    <ConfiguracoesView
      clinica={clinica}
      valorRecuperavel={resumo.recuperavel}
    />
  );
}
