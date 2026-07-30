-- ============================================================
-- Aceite parcial: quanto a operadora realmente pagou
--
-- Até aqui "ganho" era binário e o funil somava o valor pleiteado
-- inteiro. Mas a operadora frequentemente reverte só parte da glosa —
-- pleiteou R$ 300, pagou R$ 200. Sem esta coluna, o card "Recuperado"
-- informaria R$ 300 que nunca entraram no caixa da clínica.
--
-- Fica nulo em recurso que não chegou a 'ganho'. Nulo em recurso
-- 'ganho' antigo (anterior a esta coluna) significa aceite integral —
-- é como o app se comportava antes, então o fallback preserva o
-- histórico em vez de zerá-lo.
-- ============================================================

alter table recurso
  add column if not exists valor_recuperado numeric(12,2);

-- Não faz sentido registrar recuperação negativa.
alter table recurso drop constraint if exists recurso_valor_recuperado_valido;
alter table recurso add constraint recurso_valor_recuperado_valido
  check (valor_recuperado is null or valor_recuperado >= 0) not valid;
