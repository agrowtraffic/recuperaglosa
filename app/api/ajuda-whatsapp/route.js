/* ============================================================
   POST /api/ajuda-whatsapp
   O upload falhou e o cliente pediu ajuda deixando o WhatsApp.

   Faz três coisas, nesta ordem:
   1. grava o número em `usuario.telefone` (a RLS deixa o usuário alterar
      a própria linha);
   2. registra o pedido em `pedido_ajuda`, a fila que o suporte consulta;
   3. avisa o suporte por e-mail, para ninguém depender de olhar o banco.

   O e-mail nunca derruba a resposta: o número já foi salvo, e dizer
   "deu erro" faria a pessoa achar que o pedido se perdeu.
   ============================================================ */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { enviarAlertaPedidoAjuda } from '@/lib/emails';

const texto = (v, max) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, max);

export async function POST(req) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'nao_autenticado' }, { status: 401 });

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'corpo_invalido', message: 'Requisição inválida.' }, { status: 400 });
  }

  /* DDD + número (10 ou 11 dígitos), com ou sem o 55 na frente. */
  const telefone = texto(body?.telefone, 30);
  const digitos = telefone.replace(/\D/g, '');
  if (digitos.length < 10 || digitos.length > 13) {
    return NextResponse.json(
      { error: 'telefone_invalido', message: 'Informe o WhatsApp com DDD, por exemplo (11) 99999-0000.' },
      { status: 400 },
    );
  }

  const { data: atualizado, error } = await supabase
    .from('usuario')
    .update({ telefone })
    .eq('id', user.id)
    .select('nome_completo, clinica_id');

  // RLS que bloqueia não devolve erro, devolve zero linhas.
  if (error || !atualizado?.length) {
    console.error('❌ [AJUDA] Não gravou o telefone:', error?.message ?? 'nenhuma linha alterada');
    return NextResponse.json(
      { error: 'nao_gravou', message: 'Não foi possível salvar seu número. Fale com a gente pelo WhatsApp.' },
      { status: 500 },
    );
  }

  const motivo = texto(body?.motivo, 60);
  const arquivo = texto(body?.arquivo, 120);

  /* Fila de pedidos (tabela pedido_ajuda). É o registro que não se perde:
     o telefone acima é sobrescrito no próximo pedido e o e-mail abaixo
     depende de a caixa do suporte existir e ser lida. Falha aqui é
     logada e não interrompe: o número já está salvo. */
  const { error: erroPedido } = await supabase.from('pedido_ajuda').insert({
    usuario_id: user.id,
    clinica_id: atualizado[0].clinica_id,
    telefone,
    motivo: motivo || null,
    arquivo: arquivo || null,
  });
  if (erroPedido) console.error('⚠️ [AJUDA] Não registrou em pedido_ajuda:', erroPedido.message);

  try {
    const { data: clinica } = await supabase
      .from('clinica')
      .select('nome')
      .eq('id', atualizado[0].clinica_id)
      .maybeSingle();

    const envio = await enviarAlertaPedidoAjuda({
      nome: atualizado[0].nome_completo,
      email: user.email,
      clinica: clinica?.nome,
      telefone,
      motivo,
      arquivo,
    });
    if (!envio.enviado) console.warn('⚠️ [AJUDA] Alerta não enviado:', envio.motivo);
  } catch (e) {
    console.error('⚠️ [AJUDA] Falha ao avisar o suporte (número já salvo):', e.message);
  }

  return NextResponse.json({ ok: true });
}
