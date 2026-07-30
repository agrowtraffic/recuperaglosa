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
    /* ── Autenticação e plano ──
       O RLS já impede ler recurso de outra clínica, mas não sabe nada de
       plano: sem esta checagem, qualquer conta gratuita baixa o PDF
       chamando a rota direto, e o paywall da tela vira enfeite. */
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'nao_autenticado' }, { status: 401 });
    }

    const { data: usuario } = await supabase
      .from('usuario')
      .select('clinica_id')
      .eq('id', user.id)
      .single();

    if (!usuario) {
      return NextResponse.json({ error: 'usuario_sem_clinica' }, { status: 403 });
    }

    const { data: clinicaPlano } = await supabase
      .from('clinica')
      .select('plano')
      .eq('id', usuario.clinica_id)
      .single();

    if (clinicaPlano?.plano !== 'ativo') {
      return NextResponse.json(
        {
          error: 'plano_insuficiente',
          message: 'O download do recurso faz parte do plano Profissional.',
        },
        { status: 402 }
      );
    }

    // Buscar o recurso com todas as informações relacionadas
    const { data: recurso, error } = await supabase
      .from('recurso')
      .select(`
        id,
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
              logo_url,
              responsavel_nome,
              responsavel_conselho,
              responsavel_registro,
              responsavel_uf,
              cnes
            )
          ),
          item (
            id,
            codigo_tuss,
            descricao,
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

    if (error || !recurso) {
      /* Sem detalhe do banco na resposta: o cliente não precisa saber se
         o recurso não existe ou se pertence a outra clínica. */
      console.error('[PDF] Recurso não encontrado:', params.id, error?.message ?? '');
      return NextResponse.json({ error: 'recurso_nao_encontrado' }, { status: 404 });
    }

    // Preparar dados para o PDF (com type assertion)
    const r = recurso as any;
    const guia = r.guia;
    const lote = Array.isArray(guia?.lote) ? guia.lote[0] : guia?.lote;
    const clinica = lote?.clinica;
    const itens = guia?.item || [];

    // Filtrar itens recorríveis
    const recorriveis = itens.filter((i: any) => i.recorrivel);

    if (recorriveis.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma glosa recorrível encontrada' },
        { status: 400 }
      );
    }

    const brl = (n: number) =>
      `R$ ${Number(n || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    /* ── Agrupar por motivo ──
       Uma guia pode ter itens glosados por motivos diferentes (ex: um
       item sem autorização, outro em duplicidade). Cada motivo tem sua
       própria fundamentação — misturar tudo sob o primeiro código da
       lista faz o recurso argumentar a coisa errada para metade dos
       itens. Mantém a ordem em que os motivos aparecem na guia. */
    const ordemMotivos: string[] = [];
    const porMotivo = new Map<string, any[]>();
    for (const item of recorriveis) {
      const codigo = item.codigo_glosa || 'SEM_CODIGO';
      if (!porMotivo.has(codigo)) {
        porMotivo.set(codigo, []);
        ordemMotivos.push(codigo);
      }
      porMotivo.get(codigo)!.push(item);
    }

    const grupos = ordemMotivos.map((codigoGlosa) => {
      const itensDoGrupo = porMotivo.get(codigoGlosa)!;
      const motivoConfig = MOTIVOS[codigoGlosa];
      const subtotal = itensDoGrupo.reduce((s, i) => s + Number(i.valor_glosado || 0), 0);

      return {
        codigoGlosa,
        /* Descrição oficial da Tabela 38, a mesma que a operadora usou —
           nunca o nosso argumento. */
        motivoDescricao: motivoConfig?.descricao || itensDoGrupo[0]?.motivo_glosa || 'Motivo não especificado',
        argumento:
          motivoConfig?.argumento ||
          'Solicita-se a reanálise e reprocessamento conforme fundamentação técnica em anexo.',
        itens: itensDoGrupo.map((item: any) => ({
          /* Procedimento de verdade — código TUSS + descrição — nunca o
             motivo da glosa, que é outra coisa. */
          procedimento: [item.codigo_tuss, item.descricao].filter(Boolean).join(' — ') || '—',
          apresentado: brl(item.valor_apresentado),
          pago: brl(item.valor_pago),
          glosado: brl(item.valor_glosado),
        })),
        subtotal: brl(subtotal),
      };
    });

    const dataEmissao = new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

    // Renderizar PDF
    const buffer = await renderToBuffer(
      RecursoPDF({
        clinicaNome: clinica?.nome || 'Clínica',
        clinicaCnpj: clinica?.cnpj || '—',
        clinicaLogoUrl: clinica?.logo_url,
        responsavelNome: clinica?.responsavel_nome,
        responsavelConselho: clinica?.responsavel_conselho,
        responsavelRegistro: clinica?.responsavel_registro,
        responsavelUf: clinica?.responsavel_uf,
        responsavelCnes: clinica?.cnes,
        operadora: lote?.operadora || '—',
        registroAns: lote?.registro_ans,
        competencia: lote?.competencia,
        numeroDemonstrativo: lote?.numero_demonstr,
        numeroGuia: guia?.numero_guia || '—',
        beneficiario: guia?.beneficiario,
        carteira: guia?.carteira,
        dataAtendimento: guia?.data_atendimento,
        grupos,
        valorTotal: brl((recurso as any).valor_pleiteado),
        dataEmissao,
        protocolo: r.id ? String(r.id).slice(0, 8).toUpperCase() : undefined,
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
