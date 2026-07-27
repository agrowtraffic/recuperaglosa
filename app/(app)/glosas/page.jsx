import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Icon } from '../_components/Icon';
import GlosasClient from './GlosasClient';

export const dynamic = 'force-dynamic';

export default async function GlosasPage() {
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

  // Subquery 1: lote_ids
  const { data: lotes } = await supabase
    .from('lote')
    .select('id')
    .eq('clinica_id', usuario.clinica_id);

  const loteIds = (lotes ?? []).map(l => l.id);

  if (loteIds.length === 0) {
    return <GlosasClient glosas={[]} totalGlosado={0} recorrivel={0} maiorOportunidade={null}/>;
  }

  // Subquery 2: guia_ids
  const { data: guiasData } = await supabase
    .from('guia')
    .select('id')
    .in('lote_id', loteIds);

  const guiaIds = (guiasData ?? []).map(g => g.id);

  if (guiaIds.length === 0) {
    return <GlosasClient glosas={[]} totalGlosado={0} recorrivel={0} maiorOportunidade={null}/>;
  }

  // Busca FINAL: itens com glosa
  const { data: glosas } = await supabase
    .from('item')
    .select(`
      id,
      codigo_glosa,
      motivo_glosa,
      valor_glosado,
      recorrivel,
      quantidade,
      guia:guia_id(numero_guia, beneficiario, lote:lote_id(operadora))
    `)
    .in('guia_id', guiaIds)
    .gt('valor_glosado', 0)
    .order('valor_glosado', { ascending: false });

  // Formatar dados
  const glosasData = (glosas ?? []).map(g => ({
    id: g.id,
    numeroGuia: g.guia?.numero_guia || '—',
    beneficiario: g.guia?.beneficiario || '—',
    operadora: g.guia?.lote?.operadora || '—',
    codigoGlosa: g.codigo_glosa || '—',
    motivoGlosa: g.motivo_glosa || '—',
    valorGlosado: g.valor_glosado,
    qtd: g.quantidade,
    recorrivel: g.recorrivel,
  }));

  // Agregados
  const totalGlosado = glosasData.reduce((s, g) => s + g.valorGlosado, 0);
  const recurrivelTotal = glosasData.filter(g => g.recorrivel).reduce((s, g) => s + g.valorGlosado, 0);
  const maiorOportunidade = glosasData.length > 0 ? glosasData[0] : null;

  return (
    <>
      <div className="content-head"><div><h1>Glosas</h1><p>Priorize valores glosados e oportunidades de recuperação</p></div><Link href="/upload" className="primary"><Icon name="plus"/>Novo upload</Link></div>
      <GlosasClient glosas={glosasData} totalGlosado={totalGlosado} recorrivel={recurrivelTotal} maiorOportunidade={maiorOportunidade}/>
    </>
  );
}
