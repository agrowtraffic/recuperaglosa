-- RecuperaGlosa — cadastro transacional de clínica + proprietário
-- Compatível com as tabelas clinica e usuario já existentes no Projeto A.
-- Mantém RLS ativo e não utiliza service_role no navegador.

create or replace function public.criar_clinica_para_novo_usuario()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  nova_clinica_id uuid;
  nome_usuario text;
  nome_clinica text;
begin
  -- Evita duplicação caso o usuário já tenha sido vinculado por outro fluxo.
  if exists (select 1 from public.usuario where id = new.id) then
    return new;
  end if;

  nome_usuario := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'nome'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
    split_part(new.email, '@', 1)
  );

  nome_clinica := coalesce(
    nullif(trim(new.raw_user_meta_data ->> 'clinica_nome'), ''),
    'Clínica de ' || nome_usuario
  );

  insert into public.clinica (nome, plano, status_assinatura)
  values (nome_clinica, 'trial', 'trial')
  returning id into nova_clinica_id;

  insert into public.usuario (id, clinica_id, email, role)
  values (new.id, nova_clinica_id, new.email, 'owner');

  return new;
end;
$$;

revoke all on function public.criar_clinica_para_novo_usuario() from public;

drop trigger if exists depois_de_criar_usuario_auth on auth.users;

create trigger depois_de_criar_usuario_auth
  after insert on auth.users
  for each row execute function public.criar_clinica_para_novo_usuario();
