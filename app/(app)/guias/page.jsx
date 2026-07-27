import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Icon } from '../_components/Icon';
import GuiasClient from './GuiasClient';

export const dynamic = 'force-dynamic';

export default async function GuiasPage() {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) redirect('/login');

    // Buscar clínica do usuário
    const { data: usuario } = await supabase
      .from('usuario')
      .select('clinica_id')
      .eq('id', user.id)
      .single();

    if (!usuario) redirect('/completar-cadastro');

    // Buscar lotes da clínica
    const { data: lotes, error: lotesError } = await supabase
      .from('lote')
      .select('id')
      .eq('clinica_id', usuario.clinica_id);

    if (lotesError) throw new Error(`Erro ao buscar lotes: ${lotesError.message}`);

    const loteIds = (lotes ?? []).map(l => l.id);

    // Buscar guias
    const { data: guias, error: guiasError } = await supabase
      .from('guia')
      .select('id, numero_guia, beneficiario, carteira, data_atendimento, valor_apresentado, valor_pago, valor_glosado, lote:lote_id(operadora)')
      .in('lote_id', loteIds.length > 0 ? loteIds : ['00000000-0000-0000-0000-000000000000'])
      .order('data_atendimento', { ascending: false });

    if (guiasError) throw new Error(`Erro ao buscar guias: ${guiasError.message}`);

  const guiasData = (guias ?? []).map(g => ({
    id: g.id,
    numeroGuia: g.numero_guia,
    beneficiario: g.beneficiario || '—',
    operadora: g.lote?.operadora || '—',
    dataAtendimento: g.data_atendimento ? new Date(g.data_atendimento).toLocaleDateString('pt-BR') : '—',
    valorApresentado: g.valor_apresentado,
    valorPago: g.valor_pago,
    valorGlosado: g.valor_glosado,
  }));

    const totalGuias = guiasData.length;
    const comGlosa = guiasData.filter(g => g.valorGlosado > 0).length;
    const semGlosa = totalGuias - comGlosa;
    const taxaAprovacao = totalGuias > 0 ? Math.round(((totalGuias - comGlosa) / totalGuias) * 100) : 0;

    return (
      <>
        <div className="content-head"><div><h1>Guias</h1><p>Consulte todas as guias identificadas nos demonstrativos</p></div><Link href="/upload" className="primary"><Icon name="plus"/>Novo upload</Link></div>
        <GuiasClient guias={guiasData} totalGuias={totalGuias} comGlosa={comGlosa} semGlosa={semGlosa} taxaAprovacao={taxaAprovacao}/>
      </>
    );
  } catch (error) {
    console.error('❌ ERRO em /guias:', error);
    console.error('Stack:', error.stack);
    throw error;
  }
}
