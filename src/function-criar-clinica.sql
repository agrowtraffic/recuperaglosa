-- Função para criar clínica durante signup (bypass RLS)
-- Execute no Supabase SQL Editor

create or replace function criar_clinica_signup(p_nome text)
returns uuid language plpgsql security definer as $$
declare
  v_clinica_id uuid;
begin
  insert into clinica (nome, plano)
  values (p_nome, 'gratis')
  returning id into v_clinica_id;

  return v_clinica_id;
end;
$$;
