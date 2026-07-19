# Recupera Glosa — Context para Claude Code

## O que é

SaaS de auditoria de glosas de convênio para clínicas e consultórios pequenos (1–5 profissionais, sem faturista dedicado).

**Promessa:** o dono sobe o demonstrativo de pagamento do convênio (XML padrão TISS/ANS) e em segundos vê quanto foi glosado, por qual motivo, e sai com o recurso (contestação) já redigido, pronto para reenviar.

## Stack

- **Next.js** (App Router) — frontend + rotas de API
- **Supabase** (Postgres + Auth + Storage) — banco, login, upload de arquivo
- **Vercel** — deploy

## Status atual — Days 1–12 COMPLETOS ✅

| Fase | Status | Detalhes |
|---|---|---|
| **Day 5** | ✅ | Validação de ambiente + setup inicial |
| **Day 6** | ✅ | Scaffold Next.js + Auth (magic link via Supabase) |
| **Days 7–9** | ✅ | Telas: Upload (XML), Resultado (análise), Recurso (contestação) |
| **Days 10–12** | ✅ | Freemium + Stripe: checkout, webhooks, database updates |

### Funcionalidades Implementadas
- ✅ Parser TISS/XML (recalcula glosas)
- ✅ Auth com magic link (Supabase)
- ✅ Upload de arquivo XML
- ✅ Análise e exibição de glosas por motivo
- ✅ Geração de recursos (contestações) prontos para enviar
- ✅ Plano grátis: 3 lotes/mês, recursos com blur
- ✅ Stripe checkout, webhooks, atualização de plano no banco
- ✅ Dashboard com KPIs e histórico de lotes

## Próximos passos — Days 13–14

### Prioridades
1. **Landing page** — pitch, pricing, CTA
2. **Polimentos UI/UX** — responsivo, acessibilidade, performance
3. **Documentação** — README, guia de uso
4. **Deploy** — Vercel (já configurado)
5. **Melhorias futuras (v2)** — PDF, mais operadoras, API pública

## Decisões arquiteturais (não reverter)

- Parser recalcula glosa (não confia na operadora)
- Parser usa aliases para tolerar layouts diferentes de XML
- RLS ativo — todo código de app deve autenticar via Supabase Auth
- v1 é só XML de uma operadora — PDF fica para v2
