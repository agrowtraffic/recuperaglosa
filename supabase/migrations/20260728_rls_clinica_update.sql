-- RecuperaGlosa — RLS policy para UPDATE na tabela clinica
-- Permite que usuários autenticados atualizem apenas a clínica associada à sua conta

alter table clinica enable row level security;

-- Policy SELECT: usuários podem ver apenas a clínica associada (via tabela usuario)
create policy "Usuários podem ler sua própria clínica"
on clinica for select
using (
  id in (
    select clinica_id from public.usuario where id = auth.uid()
  )
);

-- Policy UPDATE: usuários podem atualizar apenas a clínica associada
create policy "Usuários podem atualizar sua própria clínica"
on clinica for update
using (
  id in (
    select clinica_id from public.usuario where id = auth.uid()
  )
)
with check (
  id in (
    select clinica_id from public.usuario where id = auth.uid()
  )
);

-- Policy INSERT: servidor (via function) pode criar clínicas
-- Comentado pois as inserts já são feitas via functions com security definer
-- que contornam RLS automaticamente

-- Policy DELETE: desabilitado por padrão — usuários não devem deletar clínicas
-- (administrativamente, isso seria feito via admin API ou função especial)
