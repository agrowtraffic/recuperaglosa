-- ============================================================
-- pedido_ajuda: o upload falhou e o cliente deixou o WhatsApp.
--
-- O número também vai para usuario.telefone e o suporte recebe um
-- e-mail, mas nenhum dos dois é registro: o telefone é sobrescrito no
-- pedido seguinte e o e-mail depende de a caixa existir e ser lida.
-- Esta tabela é a fila que não se perde: um pedido por linha, com o
-- motivo do erro, e `atendido_em` para marcar quem já foi chamado.
-- ============================================================
create table if not exists public.pedido_ajuda (
  id          uuid primary key default gen_random_uuid(),
  usuario_id  uuid not null references public.usuario(id) on delete cascade,
  clinica_id  uuid not null references public.clinica(id) on delete cascade,
  telefone    text not null,
  motivo      text,
  arquivo     text,
  criado_em   timestamptz not null default now(),
  atendido_em timestamptz
);

create index if not exists idx_pedido_ajuda_usuario on public.pedido_ajuda (usuario_id);
create index if not exists idx_pedido_ajuda_clinica on public.pedido_ajuda (clinica_id);

alter table public.pedido_ajuda enable row level security;

-- O cliente só CRIA o próprio pedido, na própria clínica. Não lê, não
-- altera e não apaga: quem consulta a fila e marca como atendido é o
-- suporte, pelo painel do Supabase (service role ignora RLS).
--
-- Os privilégios padrão do Supabase dão tudo a anon e authenticated em
-- tabela nova; aqui ficam reduzidos ao INSERT de quem está logado, para a
-- RLS não ser a única barreira.
revoke all on public.pedido_ajuda from anon, authenticated;
grant insert on public.pedido_ajuda to authenticated;

drop policy if exists p_pedido_ajuda_insert on public.pedido_ajuda;

create policy p_pedido_ajuda_insert on public.pedido_ajuda for insert to authenticated
  with check (
    usuario_id = (select auth.uid())
    and clinica_id = public.minha_clinica()
  );
