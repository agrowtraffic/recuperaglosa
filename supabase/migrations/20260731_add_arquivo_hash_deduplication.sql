-- ============================================================
-- Add arquivo_hash for deduplication
--
-- Stores SHA256 hash of XML content to detect duplicate uploads.
-- Unique constraint on (clinica_id, arquivo_hash) prevents the
-- same file from being uploaded twice by the same clinic.
-- ============================================================

alter table lote
  add column if not exists arquivo_hash text;

-- Create unique index to prevent exact duplicates per clinic
create unique index if not exists idx_lote_clinica_hash
  on lote(clinica_id, arquivo_hash)
  where arquivo_hash is not null;
