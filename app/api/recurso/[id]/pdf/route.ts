import { renderToBuffer } from '@react-pdf/renderer';
import { RecursoPDF } from '@/components/pdf/RecursoPDF';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { MOTIVOS } from '@/src/tiss/motivos';

export async function GET(req: Request, { params }: { params: { id: string } }) {
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

  try {
    // Debug: verificar autenticação
    const { data: user } = await supabase.auth.getUser();
    console.log('🔐 [PDF] Usuário autenticado na rota:', user?.user?.id ?? 'NENHUM');
    console.log('📋 [PDF] Buscando recurso com ID:', params.id);

    // Buscar o recurso com todas as informações relacionadas
    const { data: recurso, error } = await supabase
      .from('recurso')
      .select(`
        valor_pleiteado,
        guia:guia_id (
          numero_guia,
          beneficiario,
          carteira,
          data_atendimento,
          lote:lote_id (
            operadora,
            registro_ans,
            competencia,
            numero_demonstr,
            clinica:clinica_id (
              nome,
              cnpj,
              logo_url
            )
          ),
          item (
            id,
            codigo_glosa,
            motivo_glosa,
            valor_apresentado,
            valor_pago,
            valor_glosado,
            recorrivel
          )
        )
      `)
      .eq('id', params.id)
      .single();

    console.log('❌ [PDF] Erro da query (se houver):', error?.message ?? 'nenhum');
    console.log('✅ [PDF] Recurso retornado:', recurso ? 'SIM' : 'NÃO');

    if (error || !recurso) {
      console.error('❌ [PDF] Erro ao buscar recurso:', error?.message || 'Recurso nulo');
      return NextResponse.json(
        {
          error: 'Recurso não encontrado',
          debug: {
            errorMessage: error?.message,
            recursoNull: !recurso,
            userId: user?.user?.id,
            recursoId: params.id,
          }
        },
        { status: 404 }
      );
    }

    // Preparar dados para o PDF (com type assertion)
    const r = recurso as any;
    const guia = r.guia;
    const lote = Array.isArray(guia?.lote) ? guia.lote[0] : guia?.lote;
    const clinica = lote?.clinica;
    const itens = guia?.item || [];

    if (guia) {
      console.log('   - Tem guia?', !!guia);
      console.log('   - Tem lote?', !!lote);
      console.log('   - Tem clínica?', !!clinica);
      console.log('   - Tem itens?', (itens?.length ?? 0) + ' itens');
    }

    // Filtrar itens recorríveis
    const recorriveis = itens.filter((i: any) => i.recorrivel);

    if (recorriveis.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma glosa recorrível encontrada' },
        { status: 400 }
      );
    }

    // Preparar itens da tabela para o PDF
    const itensPDF = recorriveis.map((item: any) => ({
      descricao: item.motivo_glosa || '—',
      apresentado: `R$ ${Number(item.valor_apresentado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      pago: `R$ ${Number(item.valor_pago || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      glosado: `R$ ${Number(item.valor_glosado || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    }));

    // Buscar argumento dinâmico do motivo
    const codigoGlosa = recorriveis[0]?.codigo_glosa || '—';
    const motivoConfig = MOTIVOS[codigoGlosa];
    const argumentoFinal = motivoConfig?.argumento || 'Solicita-se a reanálise e reprocessamento conforme fundamentação técnica em anexo.';

    // Renderizar PDF
    const buffer = await renderToBuffer(
      RecursoPDF({
        clinicaNome: clinica?.nome || 'Clínica',
        clinicaCnpj: clinica?.cnpj || '—',
        clinicaLogoUrl: clinica?.logo_url,
        operadora: lote?.operadora || '—',
        registroAns: lote?.registro_ans,
        competencia: lote?.competencia,
        numeroDemonstrativo: lote?.numero_demonstr,
        numeroGuia: guia?.numero_guia || '—',
        beneficiario: guia?.beneficiario,
        carteira: guia?.carteira,
        dataAtendimento: guia?.data_atendimento,
        itens: itensPDF,
        motivoCodigo: codigoGlosa,
        motivoDescricao: recorriveis[0]?.motivo_glosa || '—',
        motivoArgumento: argumentoFinal,
        valorTotal: `R$ ${Number((recurso as any).valor_pleiteado || 0).toLocaleString('pt-BR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      })
    );

    return new NextResponse(buffer as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="recurso-glosa-${guia?.numero_guia || params.id}.pdf"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (err) {
    console.error('❌ Erro ao gerar PDF:', err);
    return NextResponse.json(
      { error: 'Erro ao gerar PDF', details: String(err) },
      { status: 500 }
    );
  }
}
