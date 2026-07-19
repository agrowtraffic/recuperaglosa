# RecuperaGlosa — Modelo Freemium (Days 10-12)

## ✅ Implementado

### Estrutura
- ✅ `clinica.plano` = 'trial' | 'ativo' | 'cancelado'
- ✅ Trigger Day 10 cria todas clínicas novas com `plano = 'trial'`
- ✅ Query de contagem de lotes por mês

### Validação de Limite (3 lotes/mês)
- ✅ `/api/upload` — valida limite antes de aceitar novo upload
- ✅ Se `plano !== 'ativo'` e `count >= 3`, retorna **402** com `error: 'limite_atingido'`
- ✅ Informativo na UI: "X análises restantes"

### Bloqueio de Recurso
- ✅ `/app/resources/page.jsx` — mostra recursos
- ✅ Se `plano !== 'ativo'`: aplicar blur(4px) + overlay "🔒 Recurso Bloqueado"
- ✅ Botões "Copiar" e "Baixar" desabilitados

### Checkout (Placeholder)
- ✅ `CheckoutButton` componente pronto
- ✅ `/api/checkout` route handler
- ✅ TODO: Integrar com Asaas/Stripe

---

## 🧪 Testes

### Teste 1: Limite de 3 lotes/mês
```sql
-- Limpar lotes do mês atual (só em DEV)
DELETE FROM lote 
WHERE clinica_id = 'seu-clinica-uuid' 
  AND criado_em >= date_trunc('month', now());
```

1. Ir a `/upload` com usuário gratuito
2. Upload 1, 2, 3 lotes — deve funcionar
3. Upload 4 — deve mostrar: "Você atingiu o limite de 3 análises gratuitas este mês"

### Teste 2: Bloqueio de Recurso
1. Ir a `/resources` com usuário `plano = 'trial'`
2. Verificar: texto com blur(4px) + overlay "Assinar Agora"
3. Botões "Copiar" e "Baixar" desabilitados

### Teste 3: Desbloqueio (Teste Manual)
```sql
-- Atualizar manualmente no Supabase
UPDATE clinica SET plano = 'ativo' WHERE id = 'seu-clinica-uuid';
```

1. No mesmo usuário, recarregar `/resources` (Cmd+R ou Cmd+Shift+R para hard refresh)
2. Verificar: texto SEM blur, overlay desapareceu
3. Botões "Copiar" e "Baixar" habilitados

---

## 🚀 Próximos Passos (Day 12)

### Integrar Asaas
1. Obter API key do Asaas (`ASAAS_API_KEY`)
2. Em `/api/checkout`, descomentear código Asaas
3. Criar webhook em `/api/webhooks/asaas` pra atualizar `clinica.plano = 'ativo'` quando pagamento confirmar

### Ou Integrar Stripe
1. Obter chaves do Stripe (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`)
2. Em `/api/checkout`, usar `@stripe/stripe-js`
3. Criar webhook em `/api/webhooks/stripe` pra atualizar plano

### Exemplo Asaas (em `/api/checkout`):
```js
const response = await fetch('https://www.asaas.com/api/v3/subscriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.ASAAS_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    customerId: clinicaId, // ou fazer mapping
    billingType: 'MONTHLY',
    value: 29.90, // R$ 29,90/mês
    description: 'RecuperaGlosa - Plano Profissional',
    cycle: 'MONTHLY',
  }),
});

const { id, invoiceUrl } = await response.json();
return NextResponse.json({ checkoutUrl: invoiceUrl });
```

### Exemplo Webhook Asaas (em `/api/webhooks/asaas`):
```js
export async function POST(request) {
  const event = await request.json();

  if (event.event === 'subscription_confirmed') {
    const clinicaId = event.subscription.customerId;
    const supabase = await createClient();
    
    await supabase
      .from('clinica')
      .update({ plano: 'ativo', status_assinatura: 'ativo' })
      .eq('id', clinicaId);
  }

  return NextResponse.json({ received: true });
}
```

---

## 📝 Notas

- Limite de 3 lotes/mês é **por calendário**: reseta no 1º de cada mês
- Status `'cancelado'` é tratado igual a `'trial'` (limitado)
- Usuários podem testar pagamento atualizando `plano` manualmente via Supabase para ver desbloqueios

---

## 📊 Estrutura de Banco

Já existem as colunas necessárias:
```sql
ALTER TABLE clinica ADD COLUMN plano TEXT DEFAULT 'trial';
ALTER TABLE clinica ADD COLUMN status_assinatura TEXT DEFAULT 'trial';

-- Trigger cria: plano = 'trial', status_assinatura = 'trial'
```

Não precisa de coluna nova pra contar lotes — use query com `date_trunc('month', now())`.
