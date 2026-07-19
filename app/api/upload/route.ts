import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { parseDemonstrativo } from '@/src/tiss/parser';
import { salvarLote } from '@/src/db/persistir';

export async function POST(req: Request) {
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

  // Autenticação
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'nao_autenticado' }, { status: 401 });
  }

  // Buscar clínica do usuário
  const { data: usuario } = await supabase
    .from('usuario')
    .select('clinica_id')
    .eq('id', user.id)
    .single();

  if (!usuario) {
    return NextResponse.json({ error: 'clinica_nao_encontrada' }, { status: 404 });
  }

  // Buscar dados da clínica
  const { data: clinica } = await supabase
    .from('clinica')
    .select('plano, nome, cnpj')
    .eq('id', usuario.clinica_id)
    .single();

  // ✅ Checar limite freemium (3 lotes/mês para trial)
  if (clinica?.plano !== 'ativo') {
    const primeiroDiaDoMes = new Date();
    primeiroDiaDoMes.setDate(1);
    primeiroDiaDoMes.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from('lote')
      .select('*', { count: 'exact', head: true })
      .eq('clinica_id', usuario.clinica_id)
      .gte('criado_em', primeiroDiaDoMes.toISOString());

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        {
          error: 'limite_atingido',
          message: 'Você atingiu o limite de 3 análises gratuitas este mês. Assine para continuar.',
        },
        { status: 402 }
      );
    }
  }

  // ✅ Receber arquivo
  const formData = await req.formData();
  const file = formData.get('arquivo') as File;

  if (!file) {
    return NextResponse.json({ error: 'arquivo_ausente', message: 'Nenhum arquivo foi enviado.' }, { status: 400 });
  }

  if (!file.name.endsWith('.xml')) {
    return NextResponse.json({ error: 'tipo_invalido', message: 'Apenas arquivos XML são aceitos.' }, { status: 400 });
  }

  // ✅ Ler e fazer parse do XML
  let xmlText: string;
  try {
    xmlText = await file.text();
  } catch (e: any) {
    return NextResponse.json({ error: 'leitura_falhou', message: 'Não foi possível ler o arquivo.' }, { status: 400 });
  }

  let lote;
  try {
    console.log('📄 [UPLOAD] Iniciando parse do XML...');
    lote = parseDemonstrativo(xmlText);
    const totalItens = lote.guias.reduce((acc, g) => acc + g.itens.length, 0);
    console.log('✅ [UPLOAD] Parse bem-sucedido:', { guias: lote.guias.length, itens: totalItens });
  } catch (e: any) {
    console.error('❌ [UPLOAD] Erro no parse:', e.message);
    return NextResponse.json(
      { error: 'xml_invalido', message: `Erro ao processar XML: ${e.message}` },
      { status: 422 }
    );
  }

  // ✅ Fazer upload do arquivo original pro Storage (auditoria)
  const path = `${usuario.clinica_id}/${Date.now()}-${file.name}`;
  console.log('📤 [UPLOAD] Fazendo upload do arquivo original:', path);

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('demonstrativos')
    .upload(path, file);

  if (uploadError) {
    console.error('⚠️ [UPLOAD] Erro ao fazer upload para storage:', uploadError.message);
  }

  const publicUrl = supabase.storage.from('demonstrativos').getPublicUrl(path).data.publicUrl;

  // ✅ Salvar lote + guias + itens + glosas + recursos no banco
  // ⚠️ Passando cliente autenticado do usuário para respeitar RLS
  console.log('💾 [UPLOAD] Salvando no banco de dados...');
  let resultado;
  try {
    resultado = await salvarLote(usuario.clinica_id, publicUrl, lote, {
      nome: clinica?.nome ?? 'Clínica',
      cnpj: clinica?.cnpj ?? undefined,
    }, supabase); // ← Passando cliente autenticado
    console.log('✅ [UPLOAD] Lote salvo com sucesso:', resultado.loteId);
  } catch (e: any) {
    console.error('❌ [UPLOAD] Erro ao salvar lote:', e.message);
    return NextResponse.json(
      { error: 'banco_falhou', message: `Erro ao salvar no banco: ${e.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    loteId: resultado.loteId,
    guias: resultado.guias,
    message: `${resultado.guias} guias processadas com sucesso!`,
  });
}
