---
paths:
  - "src/**"
  - "registry.json"
  - "components.json"
  - "scripts/**"
---

# Regras: componentes da biblioteca

## Origem de um componente novo (obrigatório seguir a ordem)

1. **Reaproveitar**: o componente já existe em `src/components/ui/`? Estenda com variante/prop opcional.
2. **shadcn/ui oficial**: existe em https://ui.shadcn.com/docs/components (versão Base UI)? Traga com:
   ```bash
   npm run shadcn:add -- <nome>
   ```
   O script usa `shadcn view` (estilo `base-vega`), grava em `src/components/ui/<nome>.tsx` e troca os imports `cn`/`@/…` pelos relativos. Não use `npx shadcn add` direto: sem alias `@/` no tsconfig ele grava numa pasta `@/` errada.
3. **Compor** componentes shadcn que já temos (ex.: `UserMenu` no Bubble = `DropdownMenu` + `Avatar`).
4. **Primitivo do Base UI** (https://base-ui.com/react/components) seguindo o padrão shadcn.
5. **Do zero**, só em último caso, com justificativa no PR.

Proibido: Radix, MUI, Chakra, Headless UI ou qualquer outra lib de componentes.

## Depois de trazer do shadcn

- Mantenha o código o mais próximo possível do original (facilita atualizar depois). Ajuste só o necessário para a identidade Modo Corre.
- Se tiver portal (`*.Portal`), adicione a prop `container` no conteúdo (ex.: `DialogContent`, `SelectContent`, `TooltipContent`) e repasse ao `Portal`:
  ```tsx
  function TooltipContent({ container, ...props }: TooltipPrimitive.Popup.Props & {
    container?: TooltipPrimitive.Portal.Props["container"];
  }) {
    return <TooltipPrimitive.Portal container={container}>…</TooltipPrimitive.Portal>;
  }
  ```
  Sem isso o componente não funciona no Bubble.
- Se o shadcn trouxer dependência de outro componente (`registryDependencies`), confira se ele já existe aqui; se não, traga também.

## Convenções

- `src/components/ui/<kebab-case>.tsx`, `"use client"` quando houver interação.
- Imports relativos: `../../lib/utils`, `./button`. Nunca `@/`.
- Funções nomeadas, sem `forwardRef`; `data-slot` em cada parte; variantes com `cva`.
- Só tokens do tema para cores (`bg-primary`, `text-muted-foreground`, `bg-(--brand)`). Nada de hex.
- Comentários e textos em português.
- Alterações aditivas. Renomear/remover prop ou variante = breaking change (versão nova + aviso).

## Checklist

- [ ] Export em `src/components/ui/index.ts` (ordem alfabética)
- [ ] Item em `registry.json` (descrição em português, `dependencies`, `registryDependencies`)
- [ ] Dependência npm nova em `package.json` (e em `external` do `tsup.config.ts` se for runtime de terceiros)
- [ ] Nome na lista de componentes do `README.md`
- [ ] `npm run typecheck` e `npm run build` sem erros novos (o erro de `separator.tsx` é conhecido)
