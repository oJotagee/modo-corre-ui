# AGENTS.md — @modo-corre/ui

Guia para agentes de IA (Claude Code, Cursor, Codex, Copilot etc.) e para pessoas que vão alimentar esta biblioteca. Leia antes de mudar qualquer coisa.

## O que é este repositório

`@modo-corre/ui` é a biblioteca de componentes do Modo Corre. Ela tem **duas saídas** a partir do mesmo código:

1. **Pacote npm React** (`src/` → `dist/`): componentes shadcn/ui com a identidade visual Modo Corre, usados em apps React/Next.
2. **Plugin Bubble** (`bubble/` → `bubble/dist/mc-ui-bubble.js`): os **mesmos** componentes empacotados num único JS que o Bubble carrega. Cada componente vira um elemento "MC …" no editor do Bubble.

Stack: React 19, TypeScript, Tailwind CSS 4, Base UI (`@base-ui/react`, **não** Radix), `class-variance-authority`, Lucide, Sonner, tsup. Estilo shadcn: `base-vega`.

## Mapa de pastas

```
src/
  components/ui/*.tsx   componentes da biblioteca (um arquivo por componente)
  components/ui/index.ts  reexporta todos os componentes (o que não está aqui não é publicado)
  lib/utils.ts          cn() = clsx + tailwind-merge
  index.ts              entrada do pacote
tokens.css              cores, raio e fontes (fonte única da identidade visual)
styles.css              tema Tailwind 4 (@theme inline) que mapeia os tokens para classes
registry.json           registry shadcn (instalação individual via `npx shadcn add @modo-corre/<nome>`)
components.json         configuração shadcn (estilo base-vega, ícones lucide)
scripts/shadcn-add.mjs  traz um componente oficial do shadcn para src/components/ui
bubble/
  src/runtime.tsx       adaptadores Bubble ⇄ React (um MC<Nome> por elemento) + ponte com o Bubble
  plugin/elements.json  definição dos elementos (campos, estados, eventos) — espelho do editor de plugins
  plugin/element-code.js  código colado no editor de plugins (initialize/update/reset/preview)
  build.mjs             gera bubble/dist (Tailwind + esbuild)
  harness/              página local que emula o Bubble para testar sem publicar
```

`dist/`, `bubble/dist/`, `bubble/.build/` e `node_modules/` são gerados — nunca edite à mão.

## Regra nº 1: novos componentes vêm do shadcn

Ao precisar de um componente novo, siga **esta ordem** e só passe para o próximo passo se o anterior não resolver:

1. **Já existe na biblioteca?** Procure em `src/components/ui/`. Se precisar de uma variação, adicione uma variante/prop no componente existente (de forma aditiva, sem quebrar quem já usa).
2. **Existe no shadcn/ui?** Consulte https://ui.shadcn.com/docs/components (aba **Base UI**). Se existir, traga o oficial:
   ```bash
   npm run shadcn:add -- <nome>      # ex.: npm run shadcn:add -- tooltip
   ```
   Depois só ajuste o visual para a identidade Modo Corre usando os tokens (nunca cores fixas).
3. **Dá para compor com componentes shadcn existentes?** (ex.: `Sidebar` = `Button` + Base UI; `UserMenu` = `DropdownMenu` + `Avatar`). Componha antes de escrever do zero.
4. **Existe um primitivo no Base UI?** (https://base-ui.com/react/components) Use-o como base, seguindo o mesmo padrão dos arquivos do shadcn (`data-slot`, `cn`, `cva`).
5. **Último caso: criar do zero.** Só quando nada acima atende. Justifique no PR por que o shadcn/Base UI não serviu e siga exatamente as convenções de código abaixo.

Nunca use Radix, MUI, Chakra ou outra lib de componentes: o projeto é Base UI.

## Convenções de código dos componentes

- Um arquivo por componente em `src/components/ui/<nome-em-kebab>.tsx`, com `"use client"` quando usar estado/efeitos/eventos.
- Imports **relativos**: `import { cn } from "../../lib/utils"` e `import { Button } from "./button"`. Não existe alias `@/` neste repositório.
- Funções nomeadas (não `React.forwardRef`), props tipadas pelos primitivos do Base UI (`XPrimitive.Root.Props`) ou `React.ComponentProps<"tag">`.
- `data-slot="<nome>"` no elemento raiz de cada parte (padrão shadcn).
- Variantes com `cva` e export da função de variantes quando fizer sentido (`buttonVariants`).
- Cores só por tokens/classes do tema (`bg-primary`, `text-muted-foreground`, `border-border`, `bg-(--brand)`). **Nada de hex** dentro de componentes.
- Componentes com portal (Dialog, Select, Popover, Tooltip, DropdownMenu, Sheet…) **devem aceitar a prop `container`** e repassá-la ao `Portal`. Sem isso eles não funcionam no Bubble (Shadow DOM). Veja `dropdown-menu.tsx` e `sheet.tsx`.
- Textos de interface e comentários em **português**.
- Mudanças em componentes existentes devem ser **aditivas** (props novas opcionais). Remover/renomear prop ou variante é breaking change: só com versão nova e aviso no README.

## Checklist ao adicionar/alterar um componente

1. Arquivo em `src/components/ui/`.
2. Export em `src/components/ui/index.ts` (ordem alfabética).
3. Item em `registry.json` (`name`, `title`, `description` em português, `dependencies`, `registryDependencies`, `files`).
4. Dependência npm nova? Adicione em `package.json` e, se for runtime de terceiros, em `external` no `tsup.config.ts`.
5. Lista de componentes no `README.md`.
6. `npm run typecheck` e `npm run build`.
7. Se o componente for usado no Bubble, siga a seção abaixo.

## Tradução para o Bubble (resumo)

Detalhes completos em `bubble/README.md`. O essencial:

- O componente da biblioteca **não sabe** que o Bubble existe. Toda a adaptação fica em `bubble/src/runtime.tsx`, numa função `MC<Nome>`.
- O adaptador recebe os **campos** do elemento Bubble (chaves em `snake_case`), normaliza com `text()`, `bool()`, `pick()`, `asList()` e chama `emit(evento, estados)` para avisar o Bubble.
- Registre o adaptador no objeto `COMPONENTS` (a chave, ex. `UserMenu`, é o que substitui `COMPONENT` no `element-code.js`).
- Descreva o elemento em `bubble/plugin/elements.json` (campos, estados, eventos) com as **mesmas chaves** usadas no adaptador.
- Cada elemento roda dentro de um **Shadow DOM**; portais devem usar `container={portalContainer()}`.
- Ícones são um **conjunto fechado** (mapa `ICONS`); ícone novo = import do Lucide + entrada no mapa + valor no dropdown de `elements.json`.
- Classes Tailwind usadas no runtime precisam estar **escritas por extenso** (o Tailwind só compila o que encontra no código).
- O Bubble continua dono de dados, privacidade e regras de negócio. O elemento só exibe o que recebe e emite eventos.

## Comandos

```bash
npm install                       # dependências da biblioteca
npm run typecheck                 # checagem de tipos (há 1 erro conhecido em separator.tsx)
npm run build                     # gera dist/
npm run shadcn:add -- <nome>      # traz componente oficial do shadcn
npm run build:bubble              # instala bubble/ e gera bubble/dist (usa a versão do npm fixada em bubble/package.json)

# Bundle Bubble com o código local (antes de publicar uma versão nova):
npm run build && cd bubble && MC_UI_SOURCE=local npm run build
# PowerShell: npm run build; cd bubble; $env:MC_UI_SOURCE="local"; npm run build

cd bubble && node harness/serve.mjs   # http://localhost:4321/harness/index.html
```

## O que não fazer

- Não edite `dist/`, `bubble/dist/` ou `bubble/.build/`.
- Não coloque cores fixas em componentes; mude `tokens.css`.
- Não importe todos os ícones do Lucide no runtime Bubble (o bundle vai a megabytes).
- Não use `@latest` na URL do plugin Bubble; sempre versão exata.
- Não publique no npm, não altere o plugin no Bubble e não mexa em apps Bubble sem pedido explícito.
- Não faça breaking change silenciosa em props/variantes: o Bubble e outros apps dependem delas.
