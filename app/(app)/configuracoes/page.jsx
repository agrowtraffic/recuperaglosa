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

  // Busca usuario do usuário autenticado para pegar clinica_id
  const { data: usuarioData, error: usuarioError } = await supabase
    .from('usuario')
    .select('clinica_id')
    .eq('id', user.id)
    .single();

  if (usuarioError || !usuarioData) {
    console.error('Erro ao buscar usuário:', usuarioError);
    return <div>Erro ao buscar dados do usuário: {usuarioError?.message}</div>;
  }

  // Busca dados da clínica usando o clinica_id do usuario
  const { data: clinica, error: clinicaError } = await supabase
    .from('clinica')
    .select('id, nome, cnpj, plano, status_assinatura')
    .eq('id', usuarioData.clinica_id)
    .single();

  if (clinicaError) {
    console.error('Erro ao buscar clínica:', clinicaError);
    return <div>Erro ao buscar clínica: {clinicaError.message}</div>;
  }

  if (!clinica) {
    console.warn('Nenhuma clínica encontrada para usuario_id:', user.id);
    return <div>Clínica não encontrada para o usuário {user.email}</div>;
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
