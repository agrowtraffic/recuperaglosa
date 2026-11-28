-- ============================================================
-- Medição própria do funil, sem cookie e sem dado pessoal.
--
-- Aditiva: cria duas tabelas e uma view; não altera nem apaga nada.
--
-- funil_evento aceita só INSERT de anon/authenticated. Ninguém lê pelo
-- site: a consulta é feita no painel do Supabase (service role).
-- clinica_id só pode ser a própria clínica de quem está logado.
-- ============================================================
create table if not exists public.funil_evento (
  id           bigint generated always as identity primary key,
  criado_em    timestamptz not null default now(),
  evento       text not null check (evento in (
                 'cta_clique', 'cadastro_aberto', 'conta_criada', 'cadastro_concluido',
                 'demo_vista', 'upload_sucesso', 'upload_erro', 'upload_exemplo')),
  pagina       text check (char_length(pagina) <= 120),
  detalhe      text check (char_length(detalhe) <= 60),
  utm_source   text check (char_length(utm_source) <= 60),
  utm_medium   text check (char_length(utm_medium) <= 60),
  utm_campaign text check (char_length(utm_campaign) <= 60),
  referrer     text check (char_length(referrer) <= 100),
  clinica_id   uuid references public.clinica(id) on delete set null,
  interno      boolean not null default false
);

create index if not exists idx_funil_evento_data on public.funil_evento (criado_em);
create index if not exists idx_funil_evento_clinica on public.funil_evento (clinica_id);

alter table public.funil_evento enable row level security;
revoke all on public.funil_evento from anon, authenticated;
grant insert (evento, pagina, detalhe, utm_source, utm_medium, utm_campaign, referrer, clinica_id, interno)
  on public.funil_evento to anon, authenticated;

drop policy if exists p_funil_insert_anon on public.funil_evento;
create policy p_funil_insert_anon on public.funil_evento for insert to anon
  with check (clinica_id is null);

drop policy if exists p_funil_insert_auth on public.funil_evento;
create policy p_funil_insert_auth on public.funil_evento for insert to authenticated
  with check (clinica_id is null or clinica_id = public.minha_clinica());

-- Contas internas ou de teste: ficam fora das métricas sem apagar nada.
create table if not exists public.funil_conta_interna (
  clinica_id uuid primary key references public.clinica(id) on delete cascade,
  motivo     text,
  marcado_em timestamptz not null default now()
);
alter table public.funil_conta_interna enable row level security;
revoke all on public.funil_conta_interna from anon, authenticated;

create or replace view public.v_funil_semanal with (security_invoker = true) as
select date_trunc('week', e.criado_em at time zone 'America/Sao_Paulo')::date as semana,
       e.evento,
       e.detalhe,
       e.utm_source,
       e.utm_campaign,
       e.referrer,
       count(*) as total,
       count(distinct e.clinica_id) as clinicas
from public.funil_evento e
where not e.interno
  and not exists (select 1 from public.funil_conta_interna i where i.clinica_id = e.clinica_id)
group by 1, 2, 3, 4, 5, 6;

revoke all on public.v_funil_semanal from anon, authenticated;
