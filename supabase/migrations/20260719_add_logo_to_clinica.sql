-- Adicionar coluna logo_url à tabela clinica
alter table clinica
  add column if not exists logo_url text;

-- Criar índice para performance (opcional)
create index if not exists idx_clinica_logo_url on clinica(logo_url);
