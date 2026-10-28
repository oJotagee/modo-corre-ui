---
paths:
  - "bubble/**"
---

# Regras: tradução de componentes para o Bubble

Guia completo para pessoas: `bubble/README.md` (seção "Como funciona a tradução React → Bubble").

## Princípios

- **O componente real vem de `@modo-corre/ui`.** Nunca copie ou reescreva um componente da biblioteca dentro de `bubble/`. Se faltar algo no componente, mude a biblioteca (de forma aditiva) e depois o adaptador.
- **O adaptador só traduz**: campos do Bubble → props; interações → `emit(evento, estados)`. Nada de regra de negócio, consultas ou chamadas de API no runtime.
- **O Bubble é dono dos dados.** O elemento recebe só textos/números/listas para exibir. Ex.: `MC Pagination` não muda de página sozinho; emite `page_changed` e o workflow decide.

## Passo a passo para um elemento novo `MC <Nome>`

1. Componente existe e está exportado em `src/components/ui/index.ts`.
2. Em `bubble/src/runtime.tsx`:
   - importe o componente de `@modo-corre/ui`;
   - crie `type MC<Nome>Props` com as chaves dos campos em `snake_case`, todas opcionais;
   - crie `function MC<Nome>({ emit, ...p }: WithEmit<MC<Nome>Props>)`;
   - normalize **todo** campo: `text()` para textos (Bubble manda `null` para vazio), `bool()` para yes/no, `pick(valor, LISTA, padrão)` para dropdowns, `asList()` para listas, `Number(...)` com fallback para números;
   - avise o Bubble com `emit("evento", { estado: valor })` (estados são publicados **antes** do evento, então o workflow já lê o valor novo); `emit(null, {...})` só atualiza estado;
   - portais: `container={portalContainer()}`;
   - registre em `COMPONENTS` (`<Nome>: MC<Nome>`).
3. Em `bubble/plugin/elements.json`: `name` = `MC <Nome>`, `component` = chave do `COMPONENTS`, `defaultSize`, `fields` (mesmas chaves, `caption` em português, `type`: `text` | `number` | `yes / no` | `dropdown` com `choices`), `states`, `events`.
4. Se o elemento tiver `reset` (inputs), documente que é preciso marcar "Add a reset function" no editor.
5. Adicione o elemento no harness (`bubble/harness/index.html`, função `create(...)`) e teste.
6. Documente o elemento na seção "Elementos" de `bubble/README.md` (campos, estados, eventos).

## Convenções de nomes

| Coisa | Padrão | Exemplo |
| --- | --- | --- |
| Elemento no Bubble | `MC <Nome>` | `MC User Menu` |
| Chave em `COMPONENTS` | PascalCase | `UserMenu` |
| Adaptador | `MC<Nome>` | `MCUserMenu` |
| Campos / estados | `snake_case` | `avatar_url`, `requested_page` |
| Eventos | `snake_case`, fato no passado | `clicked`, `value_changed`, `item_selected` |
| Captions | português | "Texto", "Página atual" |

## Cuidados técnicos

- **Tailwind**: o build só compila classes encontradas em `@modo-corre/ui/dist` e `bubble/src`. Escreva classes por extenso; nunca monte nome de classe com template string (`` `bg-${cor}` `` não funciona).
- **Ícones**: só o mapa `ICONS`. Ícone novo = import nomeado do `lucide-react` + entrada no mapa + valor em `choices` no `elements.json`. Nunca `import * as Icons`.
- **Listas do Bubble** chegam como objeto com `length()`/`get()`; `fromBubble` já converte. Listas paralelas (`labels`/`icons`/`hrefs`) usam a mesma posição para o mesmo item.
- **Shadow DOM**: o CSS do Bubble não entra e o nosso não sai. Não injete CSS no `document`, exceto o que já está em `ensureDocumentGlobals` (fontes e `@property`).
- **Compatibilidade**: renomear/remover campo, estado, evento ou valor de dropdown quebra elementos já colocados em páginas. Só adicione; campos novos com `default`.
- `bubble/package.json` fixa a versão do npm. Para testar código local não publicado: `npm run build` na raiz e `MC_UI_SOURCE=local npm run build` em `bubble/`.

## Verificação

```bash
cd bubble && npm run typecheck && npm run build && node harness/serve.mjs
```
Abra `http://localhost:4321/harness/index.html`, confira visual, o log de estados/eventos e que o CSS "hostil" da página não afetou o componente.
