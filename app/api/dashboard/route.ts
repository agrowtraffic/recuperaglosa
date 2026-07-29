import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/* Rota consumida só pelo shell do app (app/(app)/layout.jsx), que precisa
   do nome/plano da clínica para a topbar e do contador de glosas para o
   badge da sidebar. As telas leem o banco direto via lib/dados-clinica.

   Antes esta rota também devolvia `lotes` e `kpis`, mas com dados errados:
   `guias: 0` e `glosas: 0` fixos, e o valor total repetido em cada linha.
   Nada consumia isso — foi removido em vez de corrigido. */
export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return NextResponse.json(
        { error: 'Configuração faltando', details: 'Variáveis de ambiente Supabase não configuradas' },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(url, key, {
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
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 });
    }

    const { data: usuario } = await supabase
      .from('usuario')
      .select('clinica_id')
      .eq('id', user.id)
      .single();

    if (!usuario) {
      return NextResponse.json({ error: 'Usuário sem clínica' }, { status: 404 });
    }

    const clinicaId = usuario.clinica_id;

    const { data: clinica } = await supabase
      .from('clinica')
      .select('nome, cnpj, plano, status_assinatura')
      .eq('id', clinicaId)
      .single();

    /* Contagem de itens glosados. O badge da sidebar já lia `glosas_count`,
       mas a rota nunca devolvia esse campo — ficava sempre em 0.
       guia e item não têm clinica_id; o vínculo é lote → guia → item. */
    let glosasCount = 0;

    const { data: lotes } = await supabase
      .from('lote')
      .select('id')
      .eq('clinica_id', clinicaId);

    const loteIds = (lotes ?? []).map((l) => l.id);

    if (loteIds.length > 0) {
      const { data: guias } = await supabase
        .from('guia')
        .select('id')
        .in('lote_id', loteIds);

      const guiaIds = (guias ?? []).map((g) => g.id);

      if (guiaIds.length > 0) {
        const { count } = await supabase
          .from('item')
          .select('id', { count: 'exact', head: true })
          .in('guia_id', guiaIds)
          .gt('valor_glosado', 0);
        glosasCount = count ?? 0;
      }
    }

    return NextResponse.json({
      clinica: clinica
        ? {
            nome: clinica.nome,
            cnpj: clinica.cnpj,
            plano: clinica.plano,
            status_assinatura: clinica.status_assinatura,
          }
        : null,
      glosas_count: glosasCount,
    });
  } catch (error) {
    console.error('Erro na rota /api/dashboard:', error);
    return NextResponse.json({ error: 'interno' }, { status: 500 });
  }
}
