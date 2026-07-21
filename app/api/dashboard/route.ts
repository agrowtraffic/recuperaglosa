import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    // Verificar usuário autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado', details: authError?.message }, { status: 401 });
    }

    console.log('✅ Usuário autenticado:', user.id);

    // Buscar dados do usuário
    const { data: usuario } = await supabase
      .from('usuario')
      .select('clinica_id')
      .eq('id', user.id)
      .single();

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário não encontrado na tabela usuario' }, { status: 404 });
    }

    const clinicaId = usuario.clinica_id;
    console.log('✅ Clínica encontrada:', clinicaId);

    // Buscar dados da clínica
    const { data: clinica } = await supabase
      .from('clinica')
      .select('nome, plano, status_assinatura')
      .eq('id', clinicaId)
      .single();

    // KPIs - Lotes
    const { data: lotes } = await supabase
      .from('lote')
      .select('id, operadora, numero_demonstr, criado_em, total_glosado, status')
      .eq('clinica_id', clinicaId)
      .order('criado_em', { ascending: false });

    console.log('✅ Lotes retornados:', lotes?.length ?? 0);

    // Contar guias
    const { count: guiasCount } = await supabase
      .from('guia')
      .select('id', { count: 'exact', head: true })
      .in('lote_id', (lotes ?? []).map(l => l.id));

    const valorRecuperavel = (lotes ?? []).reduce((s, l) => s + Number(l.total_glosado ?? 0), 0);
    const lotesProcessados = (lotes ?? []).filter(l => l.status === 'ok').length;

    // Motivos de glosa
    const { data: motivos } = await supabase
      .from('v_glosa_por_motivo')
      .select('*')
      .eq('clinica_id', clinicaId)
      .order('total_glosado', { ascending: false });

    console.log('✅ Motivos de glosa:', motivos?.length ?? 0);

    const lotesFormatados = (lotes ?? []).map(l => ({
      arquivo: l.numero_demonstr ?? `Lote ${l.id.slice(0, 8)}`,
      operadora: l.operadora ?? '—',
      data: new Date(l.criado_em).toLocaleString('pt-BR'),
      guias: 0,
      glosas: 0,
      valor: valorRecuperavel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
      status: l.status === 'ok' ? 'Processado' : l.status === 'erro' ? 'Erro' : 'Processando',
    }));

    return NextResponse.json({
      authenticated_user: user.email,
      clinica_id: clinicaId,
      clinica: clinica ? { nome: clinica.nome, plano: clinica.plano, status_assinatura: clinica.status_assinatura } : null,
      kpis: {
        valorRecuperavel: valorRecuperavel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
        lotesProcessados,
        guiasAuditadas: guiasCount ?? 0,
      },
      motivos: motivos ?? [],
      lotes: lotesFormatados,
      debug: {
        total_lotes: lotes?.length ?? 0,
        total_motivos: motivos?.length ?? 0,
      }
    });
  } catch (error) {
    console.error('Test Dashboard API error:', error);
    return NextResponse.json({ error: 'interno', details: String(error) }, { status: 500 });
  }
}
