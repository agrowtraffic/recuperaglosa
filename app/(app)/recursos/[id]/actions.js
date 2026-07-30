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

/* De onde se pode ir para onde. O banco tem constraint de domínio, mas
   ele não conhece a ordem — 'rascunho' direto para 'ganho' passaria no
   check e registraria uma vitória em recurso que nunca saiu daqui. */
const TRANSICOES = {
  rascunho: ['enviado'],
  enviado: ['ganho', 'perdido', 'rascunho'],
  ganho: ['enviado'],
  perdido: ['enviado'],
};

const DATAS_POR_DESTINO = {
  // Entrar em 'enviado' carimba o envio e limpa a resolução (é um
  // retorno, se veio de ganho/perdido).
  enviado: { enviado_em: () => new Date().toISOString(), resolvido_em: () => null },
  ganho: { resolvido_em: () => new Date().toISOString() },
  perdido: { resolvido_em: () => new Date().toISOString() },
  // Voltar para rascunho desfaz tudo: o recurso nunca saiu.
  rascunho: { enviado_em: () => null, resolvido_em: () => null },
};

export async function mudarStatusRecurso(recursoId, novoStatus) {
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
    .select('id, status')
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

  const carimbos = DATAS_POR_DESTINO[novoStatus] ?? {};
  const alteracoes = { status: novoStatus };
  for (const [coluna, valor] of Object.entries(carimbos)) {
    alteracoes[coluna] = valor();
  }

  /* `.select()` no fim é o que revela bloqueio de RLS: um UPDATE barrado
     por policy não devolve erro, só afeta zero linhas. Sem esta
     verificação o botão pareceria funcionar e nada teria mudado. */
  const { data: atualizado, error: erroUpdate } = await supabase
    .from('recurso')
    .update(alteracoes)
    .eq('id', recursoId)
    .select('id, status, enviado_em, resolvido_em');

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
