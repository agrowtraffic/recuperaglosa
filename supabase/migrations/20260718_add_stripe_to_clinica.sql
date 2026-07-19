-- Adicionar coluna stripe_customer_id à tabela clinica
ALTER TABLE clinica
ADD COLUMN stripe_customer_id TEXT UNIQUE DEFAULT NULL;

-- Criar índice para buscar clínica por stripe_customer_id
CREATE INDEX idx_clinica_stripe_customer_id ON clinica(stripe_customer_id);

-- Comentário da coluna
COMMENT ON COLUMN clinica.stripe_customer_id IS 'ID do customer no Stripe (usado para webhooks de pagamento)';
