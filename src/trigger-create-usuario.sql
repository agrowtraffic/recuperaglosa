-- Trigger para criar registro de usuario automaticamente ao signup
-- Armazena clinica_id em metadata e o trigger liga usuario↔clinica

create or replace function criar_usuario_apos_signup()
returns trigger language plpgsql security definer as $$
declare
  v_clinica_id uuid;
begin
  v_clinica_id := (new.raw_user_meta_data->>'clinica_id')::uuid;
  if v_clinica_id is not null then
    insert into usuario (id, clinica_id, email, role)
    values (new.id, v_clinica_id, new.email, 'owner')
    on conflict (id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_criar_usuario on auth.users;
create trigger trg_criar_usuario
  after insert on auth.users
  for each row execute function criar_usuario_apos_signup();
