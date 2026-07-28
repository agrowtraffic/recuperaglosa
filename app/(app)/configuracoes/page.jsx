/* ============================================================
   CONFIGURAÇÕES  →  app/(app)/configuracoes/page.jsx
   Server Component: busca dados reais do Supabase
   ============================================================ */
import { createClient } from '@/lib/supabase/server';
import ConfiguracoesView from './View';

export default async function Configuracoes() {
  const supabase = await createClient();

  // Busca sessão e clínica do usuário autenticado
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return <div>Não autorizado</div>;
  }

  // Busca dados da clínica
  const { data: clinica, error: clinicaError } = await supabase
    .from('clinica')
    .select('id, nome, cnpj, plano, email_financeiro, telefone, cnes, cidade')
    .eq('usuario_id', user.id)
    .single();

  if (clinicaError || !clinica) {
    return <div>Clínica não encontrada</div>;
  }

  // Busca valor glosado total (recuperável) da clínica
  const { data: glosasData, error: glosasError } = await supabase
    .from('guia')
    .select('valor_glosado')
    .eq('clinica_id', clinica.id);

  const valorRecuperavel = glosasError || !glosasData
    ? 0
    : glosasData.reduce((sum, g) => sum + (g.valor_glosado || 0), 0);

  return (
    <ConfiguracoesView
      clinica={clinica}
      valorRecuperavel={valorRecuperavel}
    />
  );
}
