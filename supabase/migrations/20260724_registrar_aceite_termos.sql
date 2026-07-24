-- RecuperaGlosa — registro de aceite de Termos/Privacidade no onboarding
-- O checkbox no formulário de cadastro por e-mail não é suficiente sozinho:
-- login com Google nunca passa por ele. completar_cadastro() é o único
-- ponto por onde todo usuário passa (e-mail ou Google), então é ali que
-- o aceite passa a ser exigido e registrado.

alter table usuario
  add column if not exists termos_versao text,
  add column if not exists termos_aceito_em timestamptz;

create or replace function public.completar_cadastro(
  p_nome_clinica text,
  p_cnpj text,
  p_nome_completo text,
  p_telefone text,
  p_termos_aceitos boolean,
  p_termos_versao text
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

  if not coalesce(p_termos_aceitos, false) then
    raise exception 'É necessário aceitar os Termos de Uso e a Política de Privacidade';
  end if;

  select email into v_email from auth.users where id = v_uid;

  insert into public.clinica (nome, cnpj, plano, status_assinatura)
  values (trim(p_nome_clinica), nullif(trim(p_cnpj), ''), 'trial', 'trial')
  returning id into v_clinica_id;

  insert into public.usuario (id, clinica_id, email, role, nome_completo, telefone, termos_versao, termos_aceito_em)
  values (v_uid, v_clinica_id, v_email, 'owner', nullif(trim(p_nome_completo), ''), nullif(trim(p_telefone), ''), p_termos_versao, now());

  return v_clinica_id;
end;
$$;

revoke all on function public.completar_cadastro(text, text, text, text, boolean, text) from public;
grant execute on function public.completar_cadastro(text, text, text, text, boolean, text) to authenticated;

-- A assinatura anterior (sem os parâmetros de termos) deixa de existir —
-- remove para não haver duas versões ambíguas da função.
drop function if exists public.completar_cadastro(text, text, text, text);
