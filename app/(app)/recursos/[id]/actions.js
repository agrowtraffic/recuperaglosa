'use server';

/* ============================================================
   Transições de status do recurso.

   Fluxo:
     rascunho ──enviar──> enviado ──resultado──> ganho
                                              └─> perdido

   Toda transição é reversível: marcar errado é fácil, e um estado
   final irreversível a um clique de distância seria hostil.
   ============================================================ */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { ehPago } from '@/lib/plano';
import { parseValorBRL } from '@/lib/valor';

/* De onde se pode ir para onde. O banco tem constraint de domínio, mas
   ele não conhece a ordem — 'rascunho' direto para 'ganho' passaria no
   check e registraria uma vitória em recurso que nunca saiu daqui. */
const TRANSICOES = {
  rascunho: ['enviado'],
  enviado: ['ganho', 'perdido', 'rascunho'],
  ganho: ['enviado'],
  perdido: ['enviado'],
};

/* Colunas que cada destino carimba, além do próprio status. Voltar
   atrás precisa limpar o que a ida escreveu — senão fica data de
   resolução em recurso reaberto, ou valor recuperado em recurso que
   voltou a ser rascunho. */
const CAMPOS_POR_DESTINO = {
  // Entrar em 'enviado' carimba o envio e desfaz a resolução (é um
  // retorno, quando vem de ganho/perdido).
  enviado: () => ({
    enviado_em: new Date().toISOString(),
    resolvido_em: null,
    valor_recuperado: null,
  }),
  // 'ganho' recebe o valor à parte, em montarGanho() — depende do
  // pleiteado, que só conhecemos depois de ler o recurso.
  perdido: () => ({ resolvido_em: new Date().toISOString(), valor_recuperado: null }),
  // Voltar para rascunho desfaz tudo: o recurso nunca saiu daqui.
  rascunho: () => ({ enviado_em: null, resolvido_em: null, valor_recuperado: null }),
};

/**
 * Muda a situação do recurso.
 *
 * @param {string} recursoId
 * @param {'rascunho'|'enviado'|'ganho'|'perdido'} novoStatus
 * @param {string} [valorRecebido] Quanto a operadora pagou, como a
 *   pessoa digitou. Só usado ao marcar 'ganho'. Vazio significa aceite
 *   integral do que foi pleiteado.
 */
export async function mudarStatusRecurso(recursoId, novoStatus, valorRecebido) {
  if (!recursoId) return { error: 'Recurso não informado.' };

  if (!Object.keys(TRANSICOES).includes(novoStatus)) {
    return { error: 'Situação inválida.' };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: 'Sessão expirada. Entre novamente.' };

  const { data: usuario } = await supabase
    .from('usuario')
    .select('clinica_id')
    .eq('id', user.id)
    .single();

  if (!usuario?.clinica_id) return { error: 'Clínica não encontrada.' };

  /* Acompanhar recurso é parte do plano pago — quem não assinou nem vê
     o texto completo, então marcar "enviei à operadora" não faria
     sentido. O gate fica aqui, no servidor: esconder o botão na tela
     não impede ninguém de chamar a action direto. */
  const { data: clinica } = await supabase
    .from('clinica')
    .select('plano')
    .eq('id', usuario.clinica_id)
    .single();

  if (!ehPago(clinica)) {
    return { error: 'O acompanhamento do recurso faz parte do plano Profissional.' };
  }

  /* Estado atual. O RLS já impede ler recurso de outra clínica; sem
     linha, não existe (ou não é desta clínica — a resposta é a mesma de
     propósito, para não revelar a existência do id). */
  const { data: atual } = await supabase
    .from('recurso')
    .select('id, status, valor_pleiteado')
    .eq('id', recursoId)
    .maybeSingle();

  if (!atual) return { error: 'Recurso não encontrado.' };

  if (atual.status === novoStatus) {
    return { success: true, status: novoStatus, semMudanca: true };
  }

  const permitidas = TRANSICOES[atual.status] ?? [];
  if (!permitidas.includes(novoStatus)) {
    return {
      error:
        atual.status === 'rascunho' && (novoStatus === 'ganho' || novoStatus === 'perdido')
          ? 'Marque o recurso como enviado antes de registrar o resultado.'
          : 'Essa mudança de situação não é permitida.',
    };
  }

  const alteracoes = { status: novoStatus };

  if (novoStatus === 'ganho') {
    const pleiteado = Number(atual.valor_pleiteado ?? 0);

    /* Campo vazio = aceite integral. É o caso mais comum e não deve
       exigir digitação: a pessoa clica e confirma o que já está lá. */
    const informado = valorRecebido == null || String(valorRecebido).trim() === ''
      ? pleiteado
      : parseValorBRL(valorRecebido);

    if (informado == null) {
      return { error: 'Não entendi o valor. Use apenas números, como 1.234,50.' };
    }

    if (informado <= 0) {
      return {
        error: 'Se a operadora não pagou nada, registre como "Manteve a glosa".',
      };
    }

    /* Recuperar mais do que se pleiteou não existe neste fluxo — seria
       erro de digitação (vírgula no lugar errado) virando número
       inflado no card "Recuperado". */
    if (informado > pleiteado) {
      return {
        error: `O valor recebido não pode passar do pleiteado (R$ ${pleiteado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
      };
    }

    alteracoes.resolvido_em = new Date().toISOString();
    alteracoes.valor_recuperado = informado;
  } else {
    Object.assign(alteracoes, CAMPOS_POR_DESTINO[novoStatus]?.() ?? {});
  }

  /* `.select()` no fim é o que revela bloqueio de RLS: um UPDATE barrado
     por policy não devolve erro, só afeta zero linhas. Sem esta
     verificação o botão pareceria funcionar e nada teria mudado. */
  const { data: atualizado, error: erroUpdate } = await supabase
    .from('recurso')
    .update(alteracoes)
    .eq('id', recursoId)
    .select('id, status, enviado_em, resolvido_em, valor_recuperado');

  if (erroUpdate) {
    console.error('[recurso] Falha ao mudar status:', erroUpdate.message);
    return { error: 'Não foi possível salvar a mudança.' };
  }

  if (!atualizado?.length) {
    console.error(
      `[recurso] UPDATE afetou 0 linhas em ${recursoId} — provável policy de RLS ausente. ` +
      'Conferir supabase/migrations/20260730_recurso_acompanhamento.sql'
    );
    return { error: 'Não foi possível salvar a mudança. A permissão do banco recusou a alteração.' };
  }

  /* O status alimenta o funil (estágios "Em recurso" e "Recuperado") e a
     lista de glosas, que marca a glosa como contestada. Sem revalidar,
     esses números ficariam parados até o próximo carregamento. */
  revalidatePath('/recursos');
  revalidatePath(`/recursos/${recursoId}`);
  revalidatePath('/glosas');
  revalidatePath('/');

  return { success: true, status: atualizado[0].status };
}
