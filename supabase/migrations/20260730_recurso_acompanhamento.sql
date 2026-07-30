-- ============================================================
-- Acompanhamento do recurso: sair de 'rascunho'
--
-- Até aqui todo recurso nascia 'rascunho' e ficava assim para sempre —
-- não havia caminho no produto para marcá-lo como enviado à operadora
-- nem para registrar o resultado. Os valores 'enviado', 'ganho' e
-- 'perdido' existiam no schema como estados mortos.
-- ============================================================

-- 1. Quando cada transição aconteceu.
--    Sem data, "enviado" não serve para nada: o prazo de reanálise
--    (180 dias, código 2907 da Tabela 38) conta do envio.
alter table recurso
  add column if not exists enviado_em   timestamptz,
  add column if not exists resolvido_em timestamptz;

-- 2. Policy de UPDATE.
--
--    O schema.sql declara `p_recurso for all`, que em tese cobre UPDATE.
--    Mas o banco real divergiu do schema: a migration 20260728 precisou
--    criar policy de UPDATE explícita para `clinica` justamente porque a
--    policy `for all` não estava valendo lá. Como um UPDATE barrado por
--    RLS não gera erro — apenas afeta zero linhas —, a falha seria
--    silenciosa: o botão pareceria funcionar e nada mudaria.
--
--    Idempotente: dropa antes de criar, para poder rodar de novo.
drop policy if exists p_recurso_update on recurso;

create policy p_recurso_update on recurso for update
  using (
    guia_id in (
      select g.id from guia g
      join lote l on l.id = g.lote_id
      where l.clinica_id = (select clinica_id from public.usuario where id = auth.uid())
    )
  )
  with check (
    guia_id in (
      select g.id from guia g
      join lote l on l.id = g.lote_id
      where l.clinica_id = (select clinica_id from public.usuario where id = auth.uid())
    )
  );

-- 3. Domínio do status, agora que ele realmente transiciona.
--    Antes era comentário; vira constraint para o banco recusar valor
--    fora do fluxo. `not valid` não revalida as linhas existentes —
--    todas já são 'rascunho', mas evita travar a tabela.
alter table recurso drop constraint if exists recurso_status_valido;
alter table recurso add constraint recurso_status_valido
  check (status in ('rascunho', 'enviado', 'ganho', 'perdido')) not valid;
