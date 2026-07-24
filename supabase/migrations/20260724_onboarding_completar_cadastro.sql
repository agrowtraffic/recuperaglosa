-- RecuperaGlosa — onboarding explícito pós-login (Google ou e-mail)
-- Substitui o provisionamento automático via trigger em auth.users, que
-- dependia de metadata (clinica_id / clinica_nome) que o login com Google
-- nunca preenche e por isso deixava contas sem linha em usuario/clinica.

-- 1) Remove os dois triggers antigos de auto-provisionamento — a partir de
--    agora, clinica + usuario só são criados quando o usuário preenche o
--    formulário de /completar-cadastro, via completar_cadastro() abaixo.
drop trigger if exists trg_criar_usuario on auth.users;
drop function if exists criar_usuario_apos_signup();

drop trigger if exists depois_de_criar_usuario_auth on auth.users;
drop function if exists public.criar_clinica_para_novo_usuario();

-- 2) Colunas novas para os dados coletados no onboarding
alter table usuario
  add column if not exists nome_completo text,
  add column if not exists telefone text;

-- 3) RPC chamada pelo formulário de onboarding (security definer: o usuário
--    ainda não tem linha em usuario, então as policies de RLS o bloqueariam
--    de inserir clinica/usuario diretamente).
create or replace function public.completar_cadastro(
  p_nome_clinica text,
  p_cnpj text,
  p_nome_completo text,
  p_telefone text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_email text;
  v_clinica_id uuid;
begin
  if v_uid is null then
    raise exception 'Usuário não autenticado';
  end if;

  if exists (select 1 from public.usuario where id = v_uid) then
    raise exception 'Cadastro já foi concluído para este usuário';
  end if;

  select email into v_email from auth.users where id = v_uid;

  insert into public.clinica (nome, cnpj, plano, status_assinatura)
  values (trim(p_nome_clinica), nullif(trim(p_cnpj), ''), 'trial', 'trial')
  returning id into v_clinica_id;

  insert into public.usuario (id, clinica_id, email, role, nome_completo, telefone)
  values (v_uid, v_clinica_id, v_email, 'owner', nullif(trim(p_nome_completo), ''), nullif(trim(p_telefone), ''));

  return v_clinica_id;
end;
$$;

revoke all on function public.completar_cadastro(text, text, text, text) from public;
grant execute on function public.completar_cadastro(text, text, text, text) to authenticated;
