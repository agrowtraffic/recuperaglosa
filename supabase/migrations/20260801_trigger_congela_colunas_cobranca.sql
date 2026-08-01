-- ============================================================
-- plano e status_assinatura imutáveis pela sessão do cliente.
--
-- anon e authenticated têm GRANT ALL em clinica (padrão do Supabase; o
-- RLS gateia as LINHAS, não as COLUNAS). A política de clinica é ALL com
-- id = minha_clinica(), então o cliente podia dar um PATCH direto no
-- PostgREST e setar plano='ativo' — ativando o plano pago de graça, sem
-- passar pelo Stripe. Confirmado ao vivo, do navegador logado.
--
-- REVOKE de coluna não resolve: o Supabase concede UPDATE a nível de
-- tabela, e não dá para recortar uma coluna de um grant de tabela. Por
-- isso um trigger, que independe dessas sutilezas de privilégio.
--
-- service_role (webhook do Stripe) e postgres (migrações) passam livres.
-- Para o resto, as duas colunas voltam ao valor antigo em silêncio: o
-- PATCH retorna 200, mas o valor não muda. As edições legítimas (nome,
-- cnpj, responsável…) não tocam nestas colunas e seguem funcionando.
-- ============================================================
create or replace function public.impede_alteracao_de_cobranca()
returns trigger
language plpgsql
set search_path = ''
as $fn$
begin
  if current_user in ('service_role', 'postgres', 'supabase_admin') then
    return new;
  end if;
  new.plano := old.plano;
  new.status_assinatura := old.status_assinatura;
  return new;
end $fn$;

drop trigger if exists trg_impede_alteracao_de_cobranca on public.clinica;
create trigger trg_impede_alteracao_de_cobranca
  before update on public.clinica
  for each row execute function public.impede_alteracao_de_cobranca();
