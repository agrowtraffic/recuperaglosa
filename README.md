# Glosa Check — Dias 1–3

Auditoria de glosas de convênio para clínicas e consultórios pequenos.

**Promessa:** suba o demonstrativo do convênio → veja em 30s tudo que foi glosado,
o motivo, e saia com o recurso pronto para reenviar.

---

## O que já está funcionando

| Arquivo | O que faz |
|---|---|
| `schema.sql` | 6 tabelas + RLS por clínica + view `v_glosa_por_motivo`. Cole no SQL Editor do Supabase. |
| `src/tiss/parser.ts` | Lê o demonstrativo XML, recalcula a glosa e classifica por motivo. |
| `src/tiss/motivos.ts` | Tabela de motivos de glosa + se vale a pena recorrer + argumento base. |
| `src/tiss/recurso.ts` | Gera o texto do recurso, só com os itens recorríveis. |
| `src/fixtures.ts` | Cria 3 demonstrativos sintéticos com glosas plantadas. |
| `src/testar.ts` | Roda tudo e imprime o resultado. |

```bash
npm i
npx tsx src/fixtures.ts   # gera os 3 XMLs de teste
npx tsx src/testar.ts     # parseia, agrega e gera um recurso
```

## Duas decisões de engenharia que importam

**1. O parser não confia no campo de glosa da operadora.**
Ele recalcula `glosado = apresentado − pago`. Se divergir do que a operadora
informou, ele **avisa**. Essa divergência sozinha já é argumento de venda.

**2. O parser não amarra em caminho fixo do XML.**
Ele remove prefixos de namespace (`ans:`, `tiss:`) e procura os nós por
*aliases*. Por isso os 3 fixtures usam layouts diferentes de propósito — e os
3 passam. Operadora nova = adicionar alias em `parser.ts`, não reescrever.

## O que falta (Dias 4–14)

- [ ] Persistir o parse no Supabase (lote → guia → item)
- [ ] Upload no Supabase Storage
- [ ] Telas: upload → resultado → recurso → assinatura
- [ ] Recurso em PDF
- [ ] Assinatura (Asaas/Stripe)
- [ ] Landing + vídeo de 60s

## Riscos que você precisa saber (sem enfeite)

1. **Os códigos de glosa em `motivos.ts` são uma base inicial e precisam ser
   conferidos contra a tabela oficial vigente da ANS.** Estão isolados de
   propósito num arquivo só — trocar a tabela não toca no motor.
2. **O layout exato do demonstrativo varia por operadora.** O parser foi feito
   tolerante justamente por isso, mas **o primeiro arquivo real vai exigir
   ajuste de alias.** Isso é esperado, não é falha.
3. **Muita clínica recebe o demonstrativo em PDF, não em XML.** A v1 é só XML —
   de propósito. O PDF é o que vai justificar a v2, e é onde o esforço explode.
   Não antecipe.
