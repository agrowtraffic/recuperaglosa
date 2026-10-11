/* ============================================================
   POST /api/ajuda-whatsapp
   O upload falhou e o cliente pediu ajuda deixando o WhatsApp.

   Grava o número em `usuario.telefone` (a RLS deixa o usuário alterar
   a própria linha) e avisa o suporte por e-mail. O aviso é a parte que
   importa: sem ele o número ficaria no banco sem ninguém saber.

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
      motivo: texto(body?.motivo, 60),
      arquivo: texto(body?.arquivo, 120),
    });
    if (!envio.enviado) console.warn('⚠️ [AJUDA] Alerta não enviado:', envio.motivo);
  } catch (e) {
    console.error('⚠️ [AJUDA] Falha ao avisar o suporte (número já salvo):', e.message);
  }

  return NextResponse.json({ ok: true });
}
