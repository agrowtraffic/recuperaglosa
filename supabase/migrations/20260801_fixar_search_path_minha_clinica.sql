-- ============================================================
-- minha_clinica() com search_path fixo.
--
-- É SECURITY DEFINER e resolvia `usuario` e `auth.uid()` pelo search_path
-- de quem chama. Função SECURITY DEFINER sem search_path fixo é o padrão
-- clássico de escalada: quem conseguisse criar um objeto num schema à
-- frente no caminho de busca faria a função ler a tabela errada — e ela
-- é a base de TODAS as políticas de RLS do banco.
--
-- Não era explorável hoje (authenticated e anon não têm CREATE em public),
-- mas é a função de que todo o isolamento entre clínicas depende, então
-- não vale deixar apoiada em um privilégio que pode mudar.
--
-- Mesmo tratamento que completar_cadastro() já tinha.
-- ============================================================
create or replace function public.minha_clinica()
returns uuid
language sql
stable
security definer
set search_path = ''
as $fn$
  select clinica_id from public.usuario where id = (select auth.uid())
$fn$;
