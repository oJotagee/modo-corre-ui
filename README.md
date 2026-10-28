# @modo-corre/ui

Biblioteca de componentes do Modo Corre: componentes [shadcn/ui](https://ui.shadcn.com) com a identidade visual da marca, feitos em React, Tailwind CSS 4, [Base UI](https://base-ui.com) e ícones [Lucide](https://lucide.dev).

O mesmo código atende **dois mundos**:

| Onde | Como usa | Saída |
| --- | --- | --- |
| Apps React / Next.js | `npm install @modo-corre/ui` | `dist/` |
| Apps **Bubble** | Plugin "Modo Corre UI" (elementos `MC Button`, `MC Input`…) | `bubble/dist/mc-ui-bubble.js` |

Corrigiu ou melhorou um componente aqui? Os dois mundos recebem a mudança na próxima versão. Não existe uma cópia separada para o Bubble.

> Vai contribuir? Leia também o [`AGENTS.md`](./AGENTS.md) (regras do projeto) e o [`bubble/README.md`](./bubble/README.md) (como os componentes viram elementos do Bubble).

---

## Sumário

- [Usar em um app React](#usar-em-um-app-react)
- [Componentes disponíveis](#componentes-disponíveis)
- [Como o projeto está organizado](#como-o-projeto-está-organizado)
- [Adicionar um componente novo](#adicionar-um-componente-novo)
- [Levar um componente para o Bubble](#levar-um-componente-para-o-bubble)
- [Tema e cores](#tema-e-cores)
- [Comandos](#comandos)
- [Publicar uma versão](#publicar-uma-versão)

---

## Usar em um app React

```bash
npm install @modo-corre/ui
npm install tailwindcss @tailwindcss/vite @base-ui/react lucide-react sonner
```

No CSS global do projeto:

```css
@import "tailwindcss";
@import "shadcn/tailwind.css";
@import "@modo-corre/ui/styles.css";
```

> Tailwind CSS 4: use `@tailwindcss/vite` ou `@tailwindcss/postcss`, conforme o bundler.

```tsx
import { Button, Card, CardContent } from "@modo-corre/ui";

export function Exemplo() {
  return (
    <Card>
      <CardContent>
        <Button variant="outline">Salvar</Button>
      </CardContent>
    </Card>
  );
}
```

Também dá para instalar um componente só, como código-fonte no seu projeto, pelo registry shadcn (depois que o registry estiver publicado em `https://modo-corre.github.io/ui/`):

```bash
npx shadcn@latest add @modo-corre/button
```

## Componentes disponíveis

`Avatar`, `Badge`, `Breadcrumb`, `Button`, `Card`, `Checkbox`, `Dialog`, `DropdownMenu`, `Field`, `Input`, `Item`, `Label`, `Pagination`, `Select`, `Sheet`, `Sidebar`, `Skeleton`, `Switch`, `Textarea` e `Toaster` (Sonner).

Já disponíveis como elementos no Bubble: **MC Button**, **MC Badge**, **MC Input**, **MC Pagination**, **MC Sidebar** e **MC User Menu**. Detalhes em [`bubble/README.md`](./bubble/README.md#elementos).

## Como o projeto está organizado

```
modo-corre-ui/
├── src/
│   ├── components/ui/      ← os componentes (um arquivo .tsx por componente)
│   │   └── index.ts        ← lista o que é exportado pelo pacote
│   ├── lib/utils.ts        ← cn(): junta classes Tailwind sem conflito
│   └── index.ts
├── tokens.css              ← cores, raio e fontes da marca (fonte única)
├── styles.css              ← tema Tailwind que transforma tokens em classes (bg-primary…)
├── registry.json           ← catálogo shadcn (instalação individual)
├── components.json         ← configuração shadcn (estilo base-vega, Base UI)
├── scripts/shadcn-add.mjs  ← traz um componente oficial do shadcn para cá
├── bubble/                 ← empacotamento para o Bubble (ver bubble/README.md)
├── AGENTS.md / CLAUDE.md   ← regras para IA e para o time
└── .claude/rules/          ← regras detalhadas por área (componentes, bubble, tema, publicação)
```

Pastas geradas (não edite): `dist/`, `bubble/dist/`, `bubble/.build/`.

## Adicionar um componente novo

**Regra do time: o componente vem do shadcn. Criar do zero é o último caso.** Siga a ordem:

| # | Pergunta | O que fazer |
| --- | --- | --- |
| 1 | Já existe em `src/components/ui/`? | Reaproveite. Precisa de outra aparência? Adicione uma variante ou prop **opcional**. |
| 2 | Existe no [shadcn/ui](https://ui.shadcn.com/docs/components) (aba Base UI)? | `npm run shadcn:add -- <nome>` e ajuste só o visual. |
| 3 | Dá para montar juntando componentes que já temos? | Componha (ex.: o menu do usuário = `DropdownMenu` + `Avatar`). |
| 4 | Existe um primitivo no [Base UI](https://base-ui.com/react/components)? | Use-o como base, no mesmo padrão dos arquivos shadcn. |
| 5 | Nada acima serve? | Crie do zero e explique no PR por que os passos 1–4 não resolveram. |

Não usamos Radix, MUI, Chakra ou outra biblioteca de componentes.

### Passo a passo (exemplo: Tooltip)

```bash
npm run shadcn:add -- tooltip
```

O script baixa o código oficial do shadcn (estilo `base-vega`), grava em `src/components/ui/tooltip.tsx` e já corrige os imports para o padrão daqui (`../../lib/utils`). Ele também mostra as dependências e o link da documentação.

> Por que não `npx shadcn add`? Este repositório é uma biblioteca, não um app: não há o alias `@/` que a CLI espera, e ela gravaria os arquivos numa pasta `@/` errada.

Depois:

1. **Ajuste o visual** usando só tokens (`bg-primary`, `text-muted-foreground`, `border-border`, `bg-(--brand)`). Nada de cor em hex dentro do componente.
2. **Se tiver portal** (Tooltip, Popover, Dialog, Select, Dropdown…), aceite a prop `container` e repasse ao `Portal`. Sem isso o componente não funciona no Bubble. Modelos: `dropdown-menu.tsx` e `sheet.tsx`.
3. **Exporte** em `src/components/ui/index.ts`.
4. **Registre** em `registry.json`.
5. **Atualize** a lista de componentes deste README.
6. Rode `npm run typecheck` e `npm run build`.

### Convenções

- Arquivo `kebab-case.tsx`; `"use client"` quando houver interação.
- Imports relativos (`../../lib/utils`, `./button`), nunca `@/`.
- `data-slot` em cada parte, variantes com `cva`, funções nomeadas.
- Comentários e textos de interface em português.
- Mudanças **aditivas**: remover ou renomear prop/variante quebra os apps e o Bubble.

## Levar um componente para o Bubble

Resumo (o guia completo, com exemplo, está em [`bubble/README.md`](./bubble/README.md#como-funciona-a-tradução-react--bubble)):

1. O componente precisa existir na biblioteca e estar exportado.
2. Em `bubble/src/runtime.tsx`, crie um **adaptador** `MC<Nome>`: ele recebe os campos do Bubble, converte em props e avisa o Bubble quando algo acontece (clique, valor digitado…).
3. Em `bubble/plugin/elements.json`, descreva o elemento: campos, estados e eventos.
4. Teste no **harness** local (uma página que imita o Bubble).
5. Publique a versão e crie o elemento no editor de plugins do Bubble.

O componente React **não sabe** que o Bubble existe; toda a tradução fica no adaptador.

## Tema e cores

As cores ficam em `tokens.css` (`:root` e `.dark`). Paleta atual:

| Token | Valor | Uso |
| --- | --- | --- |
| `--ink` | `#09123c` | texto principal (azul-marinho) |
| `--brand` | `#4eb648` | verde da marca |
| `--primary` | `#317d2d` | botões e ações principais |
| `--background` | `#f6f7fb` | fundo das páginas |
| `--destructive` | `#c53030` | erros e ações destrutivas |

Fontes: **Public Sans** (texto) e **Archivo** (títulos). Mudar um token muda todos os componentes, nos apps React e no Bubble. Para usar as mesmas cores em elementos nativos do Bubble, veja `bubble/dist/bubble-color-tokens.json`.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm install` | instala as dependências |
| `npm run typecheck` | checa os tipos (há 1 erro conhecido em `separator.tsx`) |
| `npm run build` | gera `dist/` (o pacote npm) |
| `npm run shadcn:add -- <nome>` | traz um componente oficial do shadcn |
| `npm run build:bubble` | gera o bundle do Bubble a partir da versão publicada no npm |

Para gerar o bundle do Bubble com o código **local** (ainda não publicado):

```bash
npm run build
cd bubble
MC_UI_SOURCE=local npm run build          # Git Bash / macOS / Linux
# $env:MC_UI_SOURCE="local"; npm run build  # PowerShell
node harness/serve.mjs                    # http://localhost:4321/harness/index.html
```

## Publicar uma versão

Use [versionamento semântico](https://semver.org/lang/pt-BR/): **patch** para correção, **minor** para componente/prop novo, **major** para mudança que quebra (evite).

1. `npm run typecheck`, `npm run build` e o bundle do Bubble com `MC_UI_SOURCE=local`.
2. Suba `version` no `package.json`.
3. `npm publish` (precisa de `npm login`).
4. Atualize a versão no plugin do Bubble (passo a passo em [`bubble/README.md`](./bubble/README.md#publicação)).
