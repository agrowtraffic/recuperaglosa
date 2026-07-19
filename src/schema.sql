-- ============================================================
-- GLOSA CHECK — schema Supabase (Postgres)
-- Rode no SQL Editor do Supabase.
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- 1. CLINICA ----------
create table clinica (
  id                 uuid primary key default gen_random_uuid(),
  nome               text not null,
  cnpj               text,
  plano              text not null default 'trial',      -- trial | ativo | cancelado
  status_assinatura  text not null default 'trial',
  criado_em          timestamptz not null default now()
);

-- ---------- 2. USUARIO ----------
-- espelha auth.users do Supabase
create table usuario (
  id          uuid primary key references auth.users(id) on delete cascade,
  clinica_id  uuid not null references clinica(id) on delete cascade,
  email       text not null,
  role        text not null default 'owner',             -- owner | membro
  criado_em   timestamptz not null default now()
);
create index on usuario(clinica_id);

-- ---------- 3. LOTE (um demonstrativo enviado) ----------
create table lote (
  id                uuid primary key default gen_random_uuid(),
  clinica_id        uuid not null references clinica(id) on delete cascade,
  operadora         text,
  registro_ans      text,
  competencia       text,                                -- 'AAAA-MM'
  numero_demonstr   text,
  arquivo_url       text,                                -- Supabase Storage
  status            text not null default 'processando', -- processando | ok | erro
  erro_msg          text,
  total_apresentado numeric(12,2) default 0,
  total_pago        numeric(12,2) default 0,
  total_glosado     numeric(12,2) default 0,
  criado_em         timestamptz not null default now()
);
create index on lote(clinica_id, criado_em desc);

-- ---------- 4. GUIA ----------
create table guia (
  id                 uuid primary key default gen_random_uuid(),
  lote_id            uuid not null references lote(id) on delete cascade,
  numero_guia        text not null,
  numero_guia_oper   text,
  beneficiario       text,
  carteira           text,
  data_atendimento   date,
  valor_apresentado  numeric(12,2) default 0,
  valor_pago         numeric(12,2) default 0,
  valor_glosado      numeric(12,2) default 0
);
create index on guia(lote_id);

-- ---------- 5. ITEM (a linha que sangra) ----------
create table item (
  id                 uuid primary key default gen_random_uuid(),
  guia_id            uuid not null references guia(id) on delete cascade,
  codigo_tuss        text,
  descricao          text,
  quantidade         numeric(10,2) default 1,
  valor_apresentado  numeric(12,2) default 0,
  valor_pago         numeric(12,2) default 0,
  valor_glosado      numeric(12,2) default 0,
  codigo_glosa       text,
  motivo_glosa       text,
  recorrivel         boolean default true
);
create index on item(guia_id);
create index on item(codigo_glosa);

-- ---------- 6. RECURSO ----------
create table recurso (
  id            uuid primary key default gen_random_uuid(),
  guia_id       uuid not null references guia(id) on delete cascade,
  texto_gerado  text not null,
  valor_pleiteado numeric(12,2) default 0,
  status        text not null default 'rascunho',        -- rascunho | enviado | ganho | perdido
  criado_em     timestamptz not null default now()
);
create index on recurso(guia_id);

-- ============================================================
-- RLS — cada clínica só enxerga o que é dela
-- ============================================================
alter table clinica enable row level security;
alter table usuario enable row level security;
alter table lote    enable row level security;
alter table guia    enable row level security;
alter table item    enable row level security;
alter table recurso enable row level security;

create or replace function minha_clinica() returns uuid
language sql stable security definer as $$
  select clinica_id from usuario where id = auth.uid()
$$;

create policy p_clinica on clinica for all
  using (id = minha_clinica());

create policy p_usuario on usuario for all
  using (clinica_id = minha_clinica());

create policy p_lote on lote for all
  using (clinica_id = minha_clinica());

create policy p_guia on guia for all
  using (lote_id in (select id from lote where clinica_id = minha_clinica()));

create policy p_item on item for all
  using (guia_id in (select g.id from guia g join lote l on l.id = g.lote_id
                     where l.clinica_id = minha_clinica()));

create policy p_recurso on recurso for all
  using (guia_id in (select g.id from guia g join lote l on l.id = g.lote_id
                     where l.clinica_id = minha_clinica()));

-- ============================================================
-- VIEW: o número que vende o produto
-- ============================================================
create view v_glosa_por_motivo as
select l.clinica_id,
       l.id                as lote_id,
       i.codigo_glosa,
       i.motivo_glosa,
       count(*)            as qtd_itens,
       sum(i.valor_glosado) as total_glosado
from item i
join guia g on g.id = i.guia_id
join lote l on l.id = g.lote_id
group by 1,2,3,4
order by total_glosado desc;
