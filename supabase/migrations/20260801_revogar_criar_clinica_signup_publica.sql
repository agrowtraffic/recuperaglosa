-- ============================================================
-- Fecha criar_clinica_signup() para o público.
--
-- Era SECURITY DEFINER (contorna RLS por definição), sem search_path
-- fixo, e com EXECUTE liberado para `anon` — ou seja, chamável por
-- qualquer pessoa da internet portando só a chave publicável, que está
-- no bundle de todo visitante. Confirmado ao vivo: um POST em
-- /rest/v1/rpc/criar_clinica_signup sem nenhum login criou uma clínica.
-- Em laço, isso enche a tabela `clinica` indefinidamente.
--
-- Sobrou da página legada /auth/signup, que nada no app referenciava — o
-- cadastro real passa por /api/auth/signup, que não usa esta função.
-- Revogar não afeta nenhum fluxo vivo. A página foi removida no mesmo
-- commit.
--
-- A função em si não foi removida: derrubar objeto de banco em semana de
-- lançamento é risco desnecessário, e sem EXECUTE ela já está inerte.
-- ============================================================
revoke execute on function public.criar_clinica_signup(text)
  from anon, authenticated, public;
