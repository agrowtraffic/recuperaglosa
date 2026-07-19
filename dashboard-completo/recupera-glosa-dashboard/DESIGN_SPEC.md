# DESIGN SPEC — não reinterpretar

Use `public/reference-dashboard.png` como fonte visual principal.

## Geometria da referência

- Canvas original: 1536 × 1024.
- Brand board: 456 px de largura.
- Aplicação: 1080 px restantes.
- Header da aplicação: 80 px.
- Sidebar interna: 250 px.
- Fundo geral: branco / cinza quase branco.

## Tokens

- Verde principal: `#16A34A`
- Verde escuro: `#0E8A3D`
- Azul-marinho: `#0F172A`
- Laranja: `#F97316`
- Cinza de fundo: `#F7F9FC`
- Bordas: `#E4E9EF`
- Texto secundário: `#64748B`
- Fonte: Manrope
- Radius dos cards: 14 px
- Radius de botões: 9–14 px
- Sombra: `0 10px 32px rgba(15,23,42,.055)`

## Regras de fidelidade

1. Não trocar a composição por um template genérico.
2. Não aumentar bordas ou sombras.
3. Não reduzir o espaço em branco.
4. Não substituir o logo por ícone de cruz, coração ou estetoscópio.
5. O valor recuperável é o elemento visual mais importante.
6. A navegação ativa usa fundo verde muito claro e texto verde.
7. Preservar a distribuição: 3 KPIs no topo, motivos à direita, tabela abaixo e ajuda à direita.
8. O arquivo `app/page.jsx` já contém os textos e dados exatos da referência.
