# RecuperaGlosa — Integração Stripe (Day 12)

## ✅ Já Implementado

- ✅ `/api/checkout` — cria Checkout Session
- ✅ `/api/webhooks/stripe` — atualiza `clinica.plano = 'ativo'` quando pago
- ✅ `CheckoutButton` component
- ✅ Variáveis de ambiente: `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ Migração SQL: coluna `stripe_customer_id`

---

## 🔧 Setup Final (5 passos)

### 1️⃣ Executar migração SQL
No Supabase SQL Editor, execute:
```sql
-- Copie e execute o conteúdo de:
-- supabase/migrations/20260718_add_stripe_to_clinica.sql
```

### 2️⃣ Adicionar Webhook Secret ao `.env`
No Stripe Dashboard → Developers → Webhooks → selecione seu endpoint:
- Clique em **Reveal** ao lado de "Signing secret"
- Copie o valor `whsec_...`

Adicione ao `.env`:
```
STRIPE_WEBHOOK_SECRET=whsec_...seu-secret...
```

### 3️⃣ Configurar Webhook URL no Stripe
No Stripe Dashboard → Developers → Webhooks → Add endpoint:
- **Endpoint URL**: `https://seu-dominio.com/api/webhooks/stripe`
- **Events to send**: Selecione:
  - `checkout.session.completed`
  - `customer.subscription.deleted`
- Clique em **Add endpoint**

Em desenvolvimento local (Stripe CLI):
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 4️⃣ Testar Checkout
1. Ir a `/resources` com usuário `plano = 'trial'`
2. Clicar em "Assinar Agora" ou "Assinar para desbloquear"
3. Usar cartão de teste do Stripe: `4242 4242 4242 4242`
4. Qualquer data futura + qualquer CVC
5. Preencher email
6. Clicar em "Pay"
7. Deve redirecionar para `/dashboard?session_id=...`

### 5️⃣ Verificar Desbloqueio
1. No Supabase, verificar que `clinica.plano` mudou para `'ativo'`
2. Recarregar `/resources`
3. Recurso deve estar desbloqueado (sem blur)

---

## 🧪 Testes Completos

### Teste 1: Carrinho de Teste
```
Cartão: 4242 4242 4242 4242
Vencimento: 12/25 (ou qualquer data futura)
CVC: 123 (qualquer 3 dígitos)
```

### Teste 2: Falha de Pagamento
```
Cartão: 4000 0000 0000 0002 (deve falhar)
```

### Teste 3: Cancelamento (Manual)
```sql
-- No Supabase, simular cancelamento:
UPDATE clinica 
SET plano = 'trial', status_assinatura = 'cancelado'
WHERE id = 'seu-clinica-uuid';
```

Recarregar `/resources` — deve voltar a mostrar blur

---

## 🚨 Troubleshooting

### Erro: "Invalid Stripe API Key"
- Verificar se `STRIPE_SECRET_KEY` começa com `sk_test_` ou `sk_live_`
- Verificar se a chave está correta no `.env` (não em `.env.local`)

### Webhook não funciona localmente
- Instalar Stripe CLI: https://stripe.com/docs/stripe-cli
- Rodar: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- Copiar signing secret e adicionar ao `.env`

### Checkout redireciona errado
- Verificar `NEXT_PUBLIC_SITE_URL` no `.env`
- Deve ser exato (sem trailing slash)

---

## 📊 Fluxo Completo

```
Usuário com plano='trial'
    ↓
Clica em "Assinar para desbloquear" em /resources
    ↓
POST /api/checkout
    → Cria Customer no Stripe
    → Cria Checkout Session
    → Retorna checkout URL
    ↓
Redireciona para Stripe Checkout
    ↓
Usuário paga com cartão
    ↓
Stripe envia evento: checkout.session.completed
    ↓
POST /api/webhooks/stripe
    → Valida assinatura
    → Atualiza clinica.plano = 'ativo'
    ↓
Redireciona para /dashboard?session_id=...
    ↓
Usuário vê "Assinatura ativa!"
    ↓
/resources agora mostra recurso desbloqueado
```

---

## 🔐 Variáveis de Ambiente Finais

```
# .env (não public)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# .env.local (public, seguro compartilhar)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRICE_ID=price_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 📝 Roadmap Pós-Setup

- [ ] Testar com múltiplos cartões
- [ ] Adicionar página de sucesso `/checkout/success`
- [ ] Adicionar página de erro `/checkout/error`
- [ ] Enviar email de confirmação após pagamento (SES ou SendGrid)
- [ ] Portal do cliente (manage subscription via Stripe)
- [ ] Mudar para `sk_live_` e `pk_live_` em produção

---

**Status: Pronto para produção após testar os 3 testes acima.** ✅
