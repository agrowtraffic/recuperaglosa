# Day 10: Setup Magic Link + Autenticação

## ✅ O que foi criado

1. **Tela de Signup**: `/app/auth/signup/page.jsx` — cadastro com email + nome da clínica
2. **Tela de Login**: `/app/auth/login/page.jsx` — apenas email, magic link
3. **Route Callback**: `/app/auth/callback/route.ts` — processa magic link
4. **Middleware**: `/app/middleware.ts` — protege `/dashboard` e `/api/dashboard`
5. **Página raiz**: `/app/redirect.jsx` — redireciona com base na sessão
6. **SQL Trigger**: `src/trigger-create-usuario.sql` — cria `usuario` automaticamente

## 🔧 Setup Supabase (1 vez)

### 1. Executar o trigger SQL
Abra [Supabase Dashboard → SQL Editor](https://app.supabase.com/project/_/sql/new) e execute:
```sql
-- Copie e execute o conteúdo de src/trigger-create-usuario.sql
```

Isso cria automaticamente registro em `usuario` quando alguém se cadastra.

### 2. Configurar Magic Link Redirect URL
Acesse [Supabase Dashboard → Authentication → URL Configuration](https://app.supabase.com/project/_/auth/url-configuration):
- **Redirect URLs**: Adicione `http://localhost:3000/auth/callback` (dev) ou `https://seu-dominio.com/auth/callback` (prod)

### 3. Configurar Email (OTP)
Em [Authentication → Email](https://app.supabase.com/project/_/auth/email):
- Certifique-se de que "OTP" está habilitado (deve estar por padrão)

## 🧪 Testes

### Teste 1: Cadastro novo
- [ ] Ir para http://localhost:3000/auth/signup
- [ ] Preencher email novo + nome da clínica
- [ ] Deve enviar link
- [ ] Verificar BD: `clinica` deve ter novo registro com `plano='gratis'`
- [ ] Abrir link do email
- [ ] Deve redirecionar para /dashboard
- [ ] Verificar BD: `usuario` deve ter novo registro linked à clinica

### Teste 2: Magic link autentica
- [ ] Depois de clicar no link, `/api/dashboard` deve retornar dados
- [ ] Os dados devem ser da **nova clínica vazia**, não da de teste

### Teste 3: Proteção de rota
- [ ] Abrir aba privada, limpar cookies
- [ ] Tentar acessar http://localhost:3000/dashboard
- [ ] Deve redirecionar para `/auth/login`

### Teste 4: Login com conta existente
- [ ] Ir para `/auth/login`
- [ ] Usar o email que você acabou de criar
- [ ] Não deve criar clínica duplicada
- [ ] Magic link deve funcionar normalmente

### Teste 5: Data integrity
- [ ] Verificar que cada clínica só vê seus próprios lotes via RLS
- [ ] Testar com 2 usuários/clínicas diferentes

## 🚀 Depois disso

Está pronto para freemium! Clientes reais conseguem:
1. Se cadastrar sozinhos (Signup)
2. Fazer login (Login + Magic Link)
3. Acessar dashboard protegido
4. Trigger SQL garante integridade clinica↔usuario

## 📝 Notas

- Magic link é enviado via Supabase (precisa de SMTP configurado em produção)
- Em dev, Supabase usa email preview (console)
- Não há senha — sempre magic link
- Sem social login (fora de escopo)
- Sem "esqueci minha senha" (não há senha)
