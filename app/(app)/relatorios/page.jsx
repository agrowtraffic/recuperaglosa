import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Icon } from '../_components/Icon';
import RelatóriosClient from './RelatóriosClient';

export const dynamic = 'force-dynamic';

export default async function RelatóriosPage({ searchParams }) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) redirect('/login');

  // Buscar clínica do usuário
  const { data: usuario } = await supabase
    .from('usuario')
    .select('clinica_id')
    .eq('id', user.id)
    .single();

  if (!usuario) redirect('/completar-cadastro');

  // Período do filtro (30/90/365, default 90)
  const periodoParam = await searchParams;
  const periodo = periodoParam?.periodo || '90';
  const diasMap = { '30': 30, '90': 90, '365': 365 };
  const dias = diasMap[periodo] || 90;
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - dias);

  // Query 1: KPIs
  const { data: kpisData } = await supabase
    .from('guia')
    .select('valor_apresentado, valor_pago, valor_glosado, lote:lote_id(clinica_id)')
    .gte('data_atendimento', dataLimite.toISOString());

  const kpis = (kpisData ?? [])
    .filter(g => g.lote?.clinica_id === usuario.clinica_id)
    .reduce(
      (acc, g) => ({
        totalApresentado: acc.totalApresentado + (g.valor_apresentado || 0),
        totalPago: acc.totalPago + (g.valor_pago || 0),
        totalGlosado: acc.totalGlosado + (g.valor_glosado || 0),
      }),
      { totalApresentado: 0, totalPago: 0, totalGlosado: 0 }
    );

  // Query 2: Evolução mensal
  const { data: guiasRaw } = await supabase
    .from('guia')
    .select('data_atendimento, valor_apresentado, valor_pago, valor_glosado, lote:lote_id(clinica_id)')
    .gte('data_atendimento', dataLimite.toISOString());

  const evolucaoMap = {};
  (guiasRaw ?? [])
    .filter(g => g.lote?.clinica_id === usuario.clinica_id)
    .forEach(g => {
      const mes = new Date(g.data_atendimento).toISOString().slice(0, 7);
      if (!evolucaoMap[mes]) {
        evolucaoMap[mes] = { mes, apresentado: 0, pago: 0, glosado: 0 };
      }
      evolucaoMap[mes].apresentado += g.valor_apresentado || 0;
      evolucaoMap[mes].pago += g.valor_pago || 0;
      evolucaoMap[mes].glosado += g.valor_glosado || 0;
    });

  const evolucao = Object.values(evolucaoMap)
    .sort((a, b) => b.mes.localeCompare(a.mes));

  // Query 3: Motivos
  const { data: motivos } = await supabase
    .from('v_glosa_por_motivo')
    .select('*')
    .eq('clinica_id', usuario.clinica_id)
    .order('total_glosado', { ascending: false });

  const temDados = kpis.totalGlosado > 0 || (motivos ?? []).length > 0 || evolucao.length > 0;

  return (
    <>
      <div className="content-head">
        <div>
          <h1>Relatórios</h1>
          <p>Análise detalhada de glosas e tendências de recuperação</p>
        </div>
        <Link href="/upload" className="primary"><Icon name="plus" />Novo upload</Link>
      </div>

      {!temDados ? (
        <div className="page-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <p style={{ color: '#666', marginBottom: '1rem' }}>Nenhum dado disponível para o período selecionado.</p>
          <Link href="/upload" className="primary">Enviar demonstrativo</Link>
        </div>
      ) : (
        <RelatóriosClient
          periodo={periodo}
          kpis={kpis}
          evolucao={evolucao}
          motivos={motivos ?? []}
        />
      )}
    </>
  );
}
