-- Campos de identificação profissional exigidos num recurso de glosa formal:
-- nome de quem assina, registro no conselho (CRO/CRM) e UF, CNES, e o
-- código do prestador cadastrado na operadora (varia por operadora, mas
-- guardamos um "principal" para o rodapé do documento).
-- Sem eles o PDF sai com linhas em branco para preencher à mão.
alter table clinica
  add column if not exists responsavel_nome text,
  add column if not exists responsavel_conselho text,   -- ex: CRO, CRM
  add column if not exists responsavel_registro text,   -- número do registro
  add column if not exists responsavel_uf text,          -- UF do conselho
  add column if not exists cnes text,
  add column if not exists codigo_prestador text;
