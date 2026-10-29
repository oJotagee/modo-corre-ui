# @modo-corre/ui no Bubble

Integração dos componentes **reais** de `@modo-corre/ui` às aplicações Bubble por meio de um plugin Web. A biblioteca continua sendo a única fonte dos componentes, cores, tipografia e tokens; esta pasta apenas empacota o que já é publicado no npm para o formato que o Bubble consegue carregar.

## Arquitetura

```
@modo-corre/ui (npm) ──► bubble/build.mjs ──► bubble/dist/mc-ui-bubble.js ──► plugin Bubble (header) ──► elementos MC * no editor
     componentes            Tailwind 4 + esbuild      React + componentes + CSS        <script src=jsDelivr>        campos, estados, eventos
```

- **Sem novo repositório, runtime hospedado ou biblioteca paralela.** `bubble/` é só uma etapa de build dentro do repositório existente. Ela instala `@modo-corre/ui` **do npm** (versão fixada em `bubble/package.json`), igual a qualquer consumidor React/Next.
- **Componentes reais**: `src/runtime.tsx` importa `Button`, `Badge`, `Input`, `Pagination*`, `Sidebar*`, `Sheet*`, `DropdownMenu*` e `Avatar*` de `@modo-corre/ui`. Os adaptadores só convertem campos do Bubble em props e callbacks em eventos/estados. Nenhum componente shadcn foi copiado ou reescrito.
- **Isolamento de CSS por Shadow DOM**: cada elemento renderiza dentro de um shadow root com o CSS do Tailwind compilado a partir da biblioteca. O CSS do Bubble não afeta os componentes, e o CSS dos componentes (incluindo o preflight) não afeta o Bubble. Só duas coisas vão para o documento, porque o Chrome as ignora dentro de shadow roots: as regras `@property` do Tailwind (registram variáveis `--tw-*` e não estilizam nada) e o `<link>` das fontes Public Sans/Archivo.
- **Um arquivo só**: React, Base UI, os componentes e o CSS ficam em `mc-ui-bubble.js` (≈455 KB minificado, ≈130 KB gzip; React DOM responde por 205 KB e Base UI por 98 KB).
- **Hospedagem**: o arquivo é incluído no próprio pacote npm (`files` do `package.json` raiz) e servido pelo jsDelivr: `https://cdn.jsdelivr.net/npm/@modo-corre/ui@<versão>/bubble/dist/mc-ui-bubble.js`. Nenhum servidor novo.

Por que não só CSS? Exportar tokens não reaproveita comportamento (estados, foco, acessibilidade, variantes). Por que não Shadow DOM-free? Sem shadow root, o preflight e utilitários como `.hidden`/`.flex` colidiriam com o CSS global do Bubble e de 43 plugins instalados.

> **Como ler este documento:** a seção [Como funciona a tradução React → Bubble](#como-funciona-a-tradução-react--bubble) é o guia para quem vai criar ou alterar elementos. As seções seguintes são referência (build, publicação, elementos) e o histórico das migrações já feitas no app.

## Como funciona a tradução React → Bubble

### 1. O vocabulário do Bubble

Um elemento de plugin no Bubble conversa com o mundo por três canais. Toda a tradução se resume a mapear o componente React para eles:

| Bubble | Direção | Equivalente no React | Exemplo (MC Input) |
| --- | --- | --- | --- |
| **Campo** (field) | Bubble → componente | prop | `placeholder`, `disabled`, `value` (valor inicial) |
| **Estado exposto** (exposed state) | componente → Bubble | valor que o Bubble pode ler a qualquer momento | `MC Input's value` |
| **Evento** (event) | componente → Bubble | callback (`onClick`, `onChange`…) | `value_changed` dispara o workflow *When MC Input value_changed* |

Regra de ouro: **campos entram, estados e eventos saem**. O componente nunca busca dados no banco, nunca decide regra de negócio e nunca navega sozinho (exceto links simples, como no MC Sidebar). Ele mostra o que recebeu e avisa o que aconteceu; os workflows do Bubble decidem o resto.

### 2. As quatro peças

```
src/components/ui/switch.tsx     ① componente React da biblioteca (não sabe que o Bubble existe)
            │  publicado no npm / ou build local
            ▼
bubble/src/runtime.tsx           ② adaptador MCSwitch: campos → props, interação → emit()
            │  bubble/build.mjs (Tailwind + esbuild)
            ▼
bubble/dist/mc-ui-bubble.js      bundle único: React + componentes + CSS, expõe window.MCUI
            │  <script> no Page header do plugin
            ▼
bubble/plugin/elements.json      ③ descrição do elemento (campos, estados, eventos)
bubble/plugin/element-code.js    ④ código colado no editor de plugins (initialize/update/reset)
```

| Peça | Arquivo | Quem lê |
| --- | --- | --- |
| ① Componente | `src/components/ui/*.tsx` | apps React **e** o bundle Bubble |
| ② Adaptador | `bubble/src/runtime.tsx` | o bundle `mc-ui-bubble.js` |
| ③ Definição | `bubble/plugin/elements.json` | pessoas (para configurar o editor de plugins) e o harness |
| ④ Código do elemento | `bubble/plugin/element-code.js` | o editor de plugins do Bubble (é igual para todos os elementos; só muda `COMPONENT`) |

### 3. O que acontece em tempo de execução

```
Página Bubble carrega
  └─ Page header: <script src=".../mc-ui-bubble.js">  →  window.MCUI pronto, evento "mcui:ready"

Bubble cria o elemento "MC Switch"
  └─ initialize(instance)  →  MCUI.bubbleElement(instance, "Switch")

Bubble manda os campos (e de novo sempre que um valor dinâmico muda)
  └─ update(instance, properties)
       └─ bubbleElement.update  → converte listas do Bubble em arrays
            └─ 1ª vez: cria um Shadow DOM no canvas, aplica o CSS e monta o React
               depois: só re-renderiza com as props novas

Usuário clica no switch
  └─ adaptador chama emit("changed", { checked: true })
       ├─ instance.publishState("checked", true)   ← estado primeiro…
       └─ instance.triggerEvent("changed")          ← …depois o evento,
                                                       então o workflow já lê o valor novo
```

Detalhes que o runtime já resolve para você:

- **Valores vazios**: o Bubble manda `null`/`undefined` para campo vazio e strings livres em dropdowns. Por isso todo campo passa por `text()`, `bool()`, `pick()` ou `asList()`.
- **Listas**: campos do tipo lista chegam como objeto do Bubble (`length()`/`get()`); `fromBubble` converte em array.
- **Isolamento de CSS**: cada elemento roda dentro de um Shadow DOM. O CSS do Bubble não entra e o nosso não vaza.
- **Portais** (menus, gavetas, popups) iriam para o `<body>`, fora do Shadow DOM, e ficariam sem estilo. Por isso eles usam `container={portalContainer()}`, que é um host próprio no `<body>`, também com Shadow DOM e `z-index` acima dos grupos flutuantes do Bubble.
- **Reset**: as ações *Reset group* / *Reset relevant inputs* chamam `reset`, que remonta o componente com os últimos campos (o que foi digitado é descartado).

### 4. Exemplo completo: criando o MC Switch

O `Switch` já existe na biblioteca, mas ainda não tem elemento no Bubble. Este é o roteiro para criá-lo (e para qualquer elemento novo).

**Passo 1 — confira o componente.** Ele está em `src/components/ui/switch.tsx` e exportado em `index.ts`. Ele recebe as props do Base UI (`checked`, `onCheckedChange`, `disabled`…). Se faltar algo (ex.: uma prop de tamanho), adicione **na biblioteca**, nunca no adaptador.

**Passo 2 — escreva o adaptador** em `bubble/src/runtime.tsx`:

```tsx
import { /* ... */ Switch } from "@modo-corre/ui";

// ---------------------------------------------------------------- Switch

type MCSwitchProps = {
  checked?: boolean;       // campo "Ligado" (valor inicial/dinâmico)
  disabled?: boolean;
  label?: string;          // texto ao lado do switch
};

function MCSwitch({ emit, ...p }: WithEmit<MCSwitchProps>) {
  const external = bool(p.checked);
  const [checked, setChecked] = React.useState(external);

  // Quando o Bubble muda o campo, o componente acompanha e o estado é republicado.
  React.useEffect(() => {
    setChecked(external);
    emit(null, { checked: external });
  }, [external]);

  return (
    <label className="flex items-center gap-2 text-sm text-foreground">
      <Switch
        checked={checked}
        disabled={bool(p.disabled)}
        onCheckedChange={(next) => {
          setChecked(next);
          emit("changed", { checked: next });
        }}
      />
      {text(p.label)}
    </label>
  );
}
```

E registre no mapa:

```tsx
const COMPONENTS = {
  // ...
  Switch: MCSwitch,
} as const;
```

**Passo 3 — descreva o elemento** em `bubble/plugin/elements.json` com **as mesmas chaves** usadas no adaptador:

```json
{
  "name": "MC Switch",
  "component": "Switch",
  "defaultSize": { "width": 160, "height": 24 },
  "fields": [
    { "key": "checked", "caption": "Ligado", "type": "yes / no", "default": false },
    { "key": "disabled", "caption": "Desabilitado", "type": "yes / no", "default": false },
    { "key": "label", "caption": "Texto", "type": "text", "optional": true }
  ],
  "states": [{ "key": "checked", "caption": "Ligado", "type": "yes / no" }],
  "events": [{ "key": "changed", "caption": "MC Switch é alterado" }]
}
```

**Passo 4 — teste no harness.** Em `harness/index.html`, crie um canvas e chame `create`:

```html
<div class="canvas" id="switch1" style="width:160px;height:24px"></div>
<script>/* dentro de boot(): */ create("switch1", "Switch", { label: "Ativa", checked: true });</script>
```

```bash
cd bubble
npm run typecheck
MC_UI_SOURCE=local npm run build     # usa o código local da biblioteca (rode npm run build na raiz antes)
node harness/serve.mjs               # http://localhost:4321/harness/index.html
```

No log da página aparecem `switch1 state checked = false` e `switch1 event changed` ao clicar. No console, `harness.switch1.set({ checked: true })` simula o Bubble mudando o campo.

**Passo 5 — documente** o elemento na seção [Elementos](#elementos) deste README.

**Passo 6 — publique e configure no Bubble** (seção [Publicação](#publicação) e [Criar o plugin no Bubble](#criar-o-plugin-no-bubble-manual)): no editor de plugins, *Add a new element* → nome `MC Switch`, campos/estados/eventos iguais ao `elements.json`, e no código cole `element-code.js` trocando `COMPONENT` por `Switch`.

**Passo 7 — use no app**: insira o MC Switch na página, ligue `Ligado` ao dado (ex.: `Current cell's catalogo_categoria's status`) e crie o workflow *When MC Switch é alterado* → *Make changes to …* com `status = MC Switch's Ligado`.

### 5. Tabela de tradução de tipos

| Tipo no Bubble (`elements.json`) | Chega no adaptador como | Normalize com |
| --- | --- | --- |
| `text` | `string`, `null` ou `undefined` | `text(p.campo)` |
| `number` | `number` ou `null` | `Number(p.campo)` com valor padrão |
| `yes / no` | `boolean` (às vezes `"yes"`) | `bool(p.campo)` |
| `dropdown` | `string` livre | `pick(p.campo, LISTA_PERMITIDA, "padrão")` |
| lista de textos | objeto do Bubble → array (via `fromBubble`) | `asList(p.campo)` |

### 6. Convenções

| Coisa | Padrão | Exemplo |
| --- | --- | --- |
| Nome do elemento | `MC <Nome>` | `MC User Menu` |
| Chave em `COMPONENTS` / `component` | PascalCase | `UserMenu` |
| Adaptador | `MC<Nome>` | `MCUserMenu` |
| Campos e estados | `snake_case` | `avatar_url`, `requested_page` |
| Eventos | `snake_case`, no passado | `clicked`, `value_changed`, `item_selected` |
| Captions | português | "Texto", "Página atual" |

### 7. Armadilhas comuns

- **Classe Tailwind montada dinamicamente não funciona.** O build só gera CSS para classes escritas por extenso no código. `` `bg-${cor}` `` não é compilada; use um mapa `{ verde: "bg-primary", … }`.
- **Ícones são um conjunto fechado.** Para um ícone novo: import nomeado do `lucide-react`, entrada no mapa `ICONS` e o nome nas `choices` do campo em `elements.json`. Nunca importe todos os ícones (o bundle vai a megabytes).
- **Componente com portal sem `container`** aparece sem estilo ou atrás do Bubble. A prop `container` precisa existir na biblioteca (ex.: `DropdownMenuContent`, `SheetContent`); o `Dialog` e o `Select` ainda não têm.
- **Mudar chave de campo, estado, evento ou valor de dropdown quebra páginas** que já usam o elemento. Só adicione; campo novo sempre com `default`.
- **Dropdown obrigatório novo** precisa de valor em todos os elementos já colocados nas páginas.
- **Campos novos via MCP do Bubble**: criar o elemento já passando campos novos pode falhar sem mensagem; crie e depois defina os campos.
- **Elementos de plugin não têm "fit width to content"** no Bubble: defina a largura ou ofereça um campo como `full_width`.

## Build

```bash
npm run build:bubble          # na raiz: instala bubble/ e gera bubble/dist
# ou
cd bubble && npm install && npm run build && npm run typecheck
```

Saídas em `bubble/dist/`:

| Arquivo | Conteúdo |
| --- | --- |
| `mc-ui-bubble.js` | Runtime: React + `@modo-corre/ui` + CSS. Expõe `window.MCUI` e dispara `mcui:ready`. |
| `mc-ui.css` | O CSS injetado nos shadow roots (para inspeção). |
| `bubble-color-tokens.json` | Cores de `tokens.css` resolvidas em `rgba()`, prontas para virar variáveis de cor do Bubble. |

O build lê `tokens.css` e `styles.css` **do pacote instalado** (a versão fixada em `bubble/package.json`; com `MC_UI_SOURCE=local`, deste repositório). Se um dia instalar uma versão sem `tokens.css` (como a 0.1.0), o build usa o `tokens.css` deste repositório e avisa no console.

## Publicação

1. `npm run build:bubble` (o bundle usa a versão de `@modo-corre/ui` fixada em `bubble/package.json`).
2. Suba a versão do pacote raiz e `npm publish` (exige `npm login` válido; um token expirado aparece como `404 Not Found` no PUT). O tarball inclui `tokens.css` e `bubble/dist/*`.
3. Aguarde o npm processar (alguns minutos) e confira `https://cdn.jsdelivr.net/npm/@modo-corre/ui@<versão>/bubble/dist/mc-ui-bubble.js`.
4. No plugin Bubble, troque a versão na URL do header e publique uma nova versão do plugin.

Histórico: **0.4.1** (a publicar) corrige um bug da 0.4.0 no MC Button: a limpeza de rótulo removia a letra "s" ("Todas" virava "Toda"; "Lista", "Li ta"). **0.4.0** (publicada; plugin 0.4.0) adiciona os elementos MC Textarea, MC Switch, MC Checkbox e MC Breadcrumb (os componentes da biblioteca já existiam e não mudaram) e faz o MC Button tratar rótulo só com espaços ou U+200B como vazio. **0.3.0** (publicada; substitui a 0.2.1, que não chegou a ser publicada) adiciona `DropdownMenu` e `Avatar` à biblioteca (portados do os-panel, `DropdownMenuContent` aceita `container`), o elemento **MC User Menu**, os ícones `menu`, `zoom-in`, `chat`, `ticket`, `megaphone` e `log-out`, logo maior na sidebar (156 px aberto, 52 px recolhido, 140 px na gaveta), rolagem na gaveta mobile (antes a lista passava da altura da tela sem rolar) e o atributo `data-mc-sidebar` no `<html>` enquanto houver um MC Sidebar na página. Também põe o host de portais (`[data-mc-portal]`) com `z-index: 2000`, acima dos grupos flutuantes do Bubble (~1504), que cobriam a gaveta mobile na `estoque`. **0.2.0** adiciona `Sheet` e `Sidebar` à biblioteca e o elemento MC Sidebar. **0.1.3** traz ícones no Button/Input e `reset` no Input. **0.1.2** faz o runtime pedir explicitamente as fontes usadas dentro do Shadow DOM. **0.1.1** foi a primeira com o bundle Bubble. Ela também passou a incluir `tokens.css` e corrigiu o `Switch`, que na 0.1.0 não renderizava (`return;` antes do JSX). O bundle da 0.1.1 foi gerado contra os componentes da 0.1.0 (idênticos para Button, Badge, Input e Pagination), por isso `MCUI.version` mostra `0.1.0`.

Fixe sempre uma versão exata na URL (nunca `@latest`): o Bubble só muda quando alguém atualiza o plugin conscientemente.

## Plugin publicado

| Item | Valor |
| --- | --- |
| Nome | `Modo Corre UI` (privado, plataforma Web, categoria Technical) |
| Plugin id | `1793127801545x177614502237306880` |
| Versão do plugin | `0.3.0` — header aponta para `@modo-corre/ui@0.3.0` (0.0.1 → 0.1.0 → 0.2.0 → 0.3.0) |
| Apps autorizados | `devmodocorre` |
| Instalado em | `devmodocorre`, branch `dev-joao-guilherme` (`83mll`), plugin 0.3.0 |
| Tipos de elemento | `MC Button` `…-AAC`, `MC Badge` `…-AAL`, `MC Input` `…-AAP`, `MC Pagination` `…-AAb`, `MC Sidebar` `…-AAm`, `MC User Menu` `…-AAx` (estado `…-ABF`, evento `…-ABG`) |

Campos, estados, eventos e código conferidos no editor contra `plugin/elements.json` e `plugin/element-code.js` após recarregar a página.

## Migração piloto: `catalogo-categoria` (branch `dev-joao-guilherme`)

Savepoint antes da migração: `1793129325508` (restaurável pelo version control do Bubble). Os elementos originais foram **ocultados, não excluídos**, para rollback imediato.

| Antes | Depois | Workflow |
| --- | --- | --- |
| `Button Nova categoria` (`bZVWf`, oculto) | `MCButton A` (`bZVjI`) — Texto "Nova categoria", tooltip, largura total | O mesmo workflow `bZVbt` agora é disparado por *A MC Button is clicked*; ações intactas (Reset Pp Popup → Set state modo_popup → Show Pp Popup) |
| `Group HZ` com Anterior / "Página X de Y" / Próxima (`bZVZT`, oculto) | `MCPagination A` (`bZVjK`) — Página atual = `pagina`; Total = `RepeatingGroup B's count / 12 :ceiling max 1` (mesma expressão anterior) | O workflow `bZVbl` agora é disparado por *A MC Pagination page requested*; Set state `pagina` passou de `pagina - 1` para `MCPagination A's Página solicitada`; Scroll to Group U mantido. `bZVbp` (Próxima) segue ligado ao botão oculto, inerte |
| `Text ● Ativa` nos cards (`bZVXx`, oculto) | `MCBadge A` (`bZVjN`) — "Ativa"/default; condicional *status is no* → "Inativa"/secondary (mesma condição do texto) | — |

### Fase 1 (botões sem ícone)

Mesmo método: MC Button novo ao lado, original oculto, workflow existente com o gatilho trocado para *A MC Button is clicked* (ações e ids intactos). Condicionais copiadas.

| Original (oculto) | MC Button | Workflow | Variante / condicional |
| --- | --- | --- | --- |
| `Button Todas` `bZVXh` | `bZWFN` | `bZVbA` | outline → default quando `status_filtrado` é no |
| `Button Ativas` `bZVXj` | `bZWFP` | `bZVbK` | outline → default quando filtrado e `f_status` yes |
| `Button Inativas` `bZVXl` | `bZWFR` | `bZVbU` | outline → default quando filtrado e `f_status` no |
| `Button Desativar` (card) `bZVYT` | `bZWFT` | `bZVcV` | outline; texto "Ativar" quando status no |
| `Button Editar` (lista) `bZVYx` | `bZWFV` | `bZVcP` | ghost, sm |
| `Button Nova categoria` (vazio) `bZVZL` | `bZWFX` | `bZVby` | default, lg |
| `Button Limpar filtros` `bZVZN` | `bZWFZ` | `bZVcD` | outline, lg |
| `Salvar Button` (popup) `bZTSk0` | `bZWFb` | `bZTTU0` | default; oculto em `visualizar` |
| `Cancelar Button` (popup) `bZTSl0` | `bZWFd` | `bZTTf0` | outline; texto "Fechar" em `visualizar` |

As ações por linha leem `Group V's`/`Group CZ's catalogo_categoria`, então o contexto do RepeatingGroup é preservado.

### Fase 2 (depende de `@modo-corre/ui@0.1.3` + plugin v0.0.2)

- **Ícones no MC Button** (`icon`, `icon_position`): conjunto fechado de 17 ícones Lucide — necessário para *Cards*, *Lista* e o *Editar* do card.
- **Ícone no MC Input** (`icon`, ex.: `search`): lupa dentro do campo, para o MC Input substituir o grupo inteiro da busca (moldura + HTML da lupa + input). O original tinha borda dupla no foco — o grupo com borda e o estilo de input do Bubble com outra borda —, defeito que já existia e também aparece na `catalogo-tag`, que não foi alterada.
- **Hover do "Editar" do card**: o estilo Bubble "Filled Light Primary" deixa fundo e texto azul-marinho no hover (texto some). Também preexistente e presente na `catalogo-tag`; resolvido ao trocar pelo MC Button.
- **Reset no MC Input**: o Bubble chama `reset` em *Reset relevant inputs* e *Reset Group*; o runtime remonta o componente com os últimos campos (volta ao valor inicial e republica `value`). Necessário para a busca (limpa por *Limpar filtros*) e para o campo do popup.

### Fase 2 aplicada (plugin 0.1.0 com `@modo-corre/ui@0.1.3`)

| Original (oculto) | Novo | Ligação |
| --- | --- | --- |
| `Button Editar` (card) `bZVYR` | MC Button `bZWHY` (outline, ícone `pencil`) | workflow `bZVcJ` → *MC Button is clicked* |
| `Button Cards` `bZVXb` / `Button Lista` `bZVXd` | MC Button `bZWHa` (`layout-grid`) / `bZWHc` (`list`); ghost → outline quando a `visao` é a deles | workflows `bZVbf` / `bZVbi` |
| `Group R` (moldura + lupa + `Input Busque…` `bZVXV`) | MC Input `bZWHe` (type search, ícone `search`) | consulta de `bZVXn` (fonte e condicional "Nome (A–Z)") lê `MCInput A's value:trimmed`; workflow `bZVbZ` → *MC Input value changed*; *Limpar filtros* limpa via reset |
| `Description Input` (popup) `bZTSe0` | MC Input `bZWHg` (valor inicial = `Pp Popup's catalogo_categoria's descrição`; desabilitado em `visualizar`) | *Create a new…* e *Make changes…* do *Pp save* leem `MCInput B's value` |

Observações:
- Atualizar a versão de um plugin já instalado não é suportado pelo MCP (só instalar); foi feito no editor do app (*Plugins → Modo Corre UI → versão*). Desinstalar/reinstalar quebraria os elementos.
- Com o plugin 0.1.0, criar um elemento passando os campos novos (`icon`, `icon_position`) na mesma chamada faz o MCP falhar sem mensagem; criar sem eles e definir em seguida funciona. Dropdowns não opcionais precisam de valor em todos os elementos existentes (preenchidos com `none`/`start`).

Testes no preview (Chrome, usuário logado), todos aprovados: renderização sem botões/inputs antigos visíveis; hover do *Editar* legível; busca com borda única e anel de foco; busca "teste" → 1 resultado, "testezzz" → 0 e estado vazio; *Limpar filtros* esvazia a busca (reset) e volta a 2 resultados; *Editar* abre "Editar catálogo" com o MC Input preenchido; *Salvar* sem alteração no registro de teste "categoria teste" fecha o popup e mostra o alerta; *Nova categoria* abre "Novo catálogo" com o campo vazio; *Cancelar* fecha; *Lista*, *Inativas* e *Todas* funcionam; nenhum erro no console. Não testados: troca de página (só 2 registros), larguras de celular.

Ainda nativos do Bubble na página (sem componente equivalente na biblioteca):
- **Dropdown "Mais recentes / Nome (A–Z)"** — precisa de um MC Select (o `Select` da biblioteca usa portal; ver Limitações).
- **Switch de status na visão em lista** — clicável, com workflow próprio (ChangeThing); a biblioteca tem `Switch`, mas não há elemento MC Switch.
- **Cards de KPI clicáveis, tabela da visão em lista, popup** — estrutura de grupos/RepeatingGroup do Bubble.

Validação inicial (antes das fases 1 e 2) no preview (`version-83mll`, usuário logado): página carrega; 1 MC Button, 2 MC Badges e 1 MC Pagination renderizados com Public Sans; clicar no MC Button abre o popup "Novo catálogo" (cancelado, nada gravado); paginação mostra "Página 1 de 1" com Anterior/Próxima desabilitados; filtro Ativas e visão Lista funcionam; nenhum erro no console; `check_node_issues` da página sem issues.

## Criar o plugin no Bubble (manual)

O MCP do Bubble disponível não cria nem edita plugins (só busca/instala plugins do marketplace e edita páginas), então esta etapa é feita no editor de plugins:

1. bubble.io → **Plugins → New plugin**, nome `Modo Corre UI`, tipo privado.
2. Aba **Shared → Page header**:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@modo-corre/ui@<versão>/bubble/dist/mc-ui-bubble.js"></script>
   ```
3. Para cada item de `plugin/elements.json`, aba **Elements → Add a new element**:
   - Nome = `name` (ex.: `MC Button`), tamanho padrão = `defaultSize`.
   - **Fields**: um campo por item de `fields`, com a mesma `key` (é o nome que o código lê), o `caption` e o tipo (`text`, `number`, `yes / no`, `dropdown` com as `choices`).
   - **Exposed states**: itens de `states` (mesma `key`, mesmo tipo).
   - **Events**: itens de `events` (mesma `key`).
   - **Element actions**: nenhuma.
   - **Code**: cole os corpos de `initialize`, `update` e `preview` de `plugin/element-code.js`, trocando `COMPONENT` pelo `component` do elemento (`Button`, `Badge`, `Input`, `Pagination`, `Sidebar`, `UserMenu`). Para o MC Input, marque também *Add a reset function* e cole o corpo de `reset`.
4. **Settings → Publish** (privado) e instale no app `devmodocorre`, branch `dev-joao-guilherme`.

Depois de instalado, os elementos aparecem no editor como qualquer outro e podem ser inseridos pelo editor ou pelo MCP.

## Elementos

### MC Button
| Campo | Tipo | Observação |
| --- | --- | --- |
| `label` | text | Texto do botão |
| `variant` | dropdown | `default`, `outline`, `secondary`, `ghost`, `destructive`, `link` (variantes da biblioteca) |
| `size` | dropdown | `default`, `xs`, `sm`, `lg` |
| `disabled` | yes/no | Desabilita de verdade (`disabled` nativo; não emite clique) |
| `loading` | yes/no | Spinner `Loader2` + desabilitado + `aria-busy`. A biblioteca não tem prop de loading; o adaptador compõe o `Button` original |
| `tooltip` | text | Atributo `title` |
| `full_width` | yes/no | Ocupa a largura do elemento |

Evento: **clicked**.

### MC Badge
Campos `label`, `variant` (`default`, `secondary`, `destructive`, `outline`, `ghost`, `link`), `dot` (ponto colorido antes do texto). Sem eventos.

### MC Input
| Campo | Tipo | Observação |
| --- | --- | --- |
| `value` | text | Valor inicial/dinâmico; quando muda no Bubble, substitui o digitado |
| `placeholder` | text | |
| `type` | dropdown | `text`, `search`, `email`, `number`, `tel`, `url`, `password` |
| `disabled`, `invalid` | yes/no | `invalid` liga `aria-invalid` e a borda destrutiva |
| `error_message` | text | Mostrada abaixo do campo, ligada por `aria-describedby`; também marca o campo como inválido |
| `accessible_label` | text | `aria-label` (cai no placeholder se vazio) |
| `debounce_ms` | number | Atraso do evento `value_changed` (padrão 300) |

Estado: **value** (atualizado a cada tecla). Eventos: **value_changed** (após o atraso), **submitted** (Enter).

### MC Pagination
| Campo | Tipo | Observação |
| --- | --- | --- |
| `page` | number | Página atual — **controlada pelo Bubble** |
| `total_pages` | number | |
| `disabled` | yes/no | |
| `show_numbers` | yes/no | Números com reticências (1 … 4 5 6 … 12); senão "Página X de Y" |
| `summary` | text | Texto à esquerda, ex.: "Mostrando 1–12 de 40 categorias" |

Estado: **requested_page**. Evento: **page_changed**. O componente não muda a página sozinho e não conhece as consultas; o workflow decide.

### MC Sidebar
| Campo | Tipo | Observação |
| --- | --- | --- |
| `labels` / `icons` / `hrefs` | listas de texto | Mesma posição = mesmo item. `href` é nome de página relativo (`estoque`) ou URL `http(s)` (abre em nova aba); `#` = item sem destino |
| `active` | text | Item destacado quando `href == active` |
| `logo_url` / `logo_mark_url` | text | Logo aberto / recolhido |
| `home_href` | text | Destino do logo (padrão `dashboard`) |
| `storage_key` | text | Chave do `localStorage` da preferência recolhido/aberto (compartilhada entre páginas) |
| `mobile_trigger` | yes/no | Mostra o botão hambúrguer fixo no celular |

Estado: **collapsed** (sempre `no` no celular). Desktop (≥ 768 px): `<aside>` fixo à esquerda, 240/72 px. Celular: botão hambúrguer + gaveta (`Sheet`) num portal com Shadow DOM próprio; qualquer código pode abri-la com `window.dispatchEvent(new Event("mcui:sidebar-open"))`. O próprio elemento ocupa no layout só a largura reservada (ver MC Menu).

### MC User Menu
Avatar com o menu da conta, no padrão do `UserMenu` do os-panel (`DropdownMenu` + `Avatar`).

| Campo | Tipo | Observação |
| --- | --- | --- |
| `name` | text | Nome completo (iniciais no avatar e "Conectado como") |
| `subtitle` | text | Linha abaixo do nome (ex.: perfil) |
| `avatar_url` | text | Foto; sem ela, iniciais |
| `show_name` | yes/no | Nome e seta ao lado do avatar (desktop) |
| `labels` / `icons` | listas de texto | Itens do menu e seus ícones |
| `danger_label` | text | Item vermelho no fim (ex.: "Sair") |

Estado: **selected_item** (rótulo escolhido). Evento: **item_selected**. O elemento não sabe o que cada item faz: os workflows do Bubble decidem (`Only when MC User Menu's Item escolhido is "Chat"` → mesmas ações do botão original).

### MC Textarea
| Campo | Tipo | Observação |
| --- | --- | --- |
| `value` | text | Valor inicial/dinâmico (substitui o digitado) |
| `placeholder` | text | |
| `rows` | number (estático) | Linhas visíveis (padrão 3); o campo ocupa a altura do elemento |
| `max_length` | number (estático) | 0 = sem limite; com limite mostra o contador "n/máx" |
| `disabled` / `invalid` | yes/no | |
| `error_message` | text | Texto vermelho abaixo; também marca o campo como inválido |
| `accessible_label` | text | `aria-label` (cai no placeholder) |
| `debounce_ms` | number (estático) | Atraso do evento (padrão 300) |

Estado: **value**. Evento: **value_changed**. Tem função de reset (marcada no editor).

### MC Switch e MC Checkbox
| Campo | Tipo | Observação |
| --- | --- | --- |
| `checked` | yes/no | Valor inicial/dinâmico |
| `label` | text | Texto ao lado; clicar nele também alterna |
| `disabled` | yes/no | |

Estado: **checked**. Evento: **changed** (o estado já vem atualizado). O elemento não grava nada: o workflow decide o que fazer com o novo valor. Têm função de reset.

### MC Breadcrumb
| Campo | Tipo | Observação |
| --- | --- | --- |
| `labels` | lista de texto | O último item é a página atual (sem link) |
| `hrefs` | lista de texto | Mesma posição dos rótulos; vazio = texto sem link |

Sem estados nem eventos.

### Fase 3 aplicada na `catalogo-categoria` (plugin 0.4.0)

Savepoint antes: `1793279113059`. Originais ocultados, não excluídos.

| Antes | Depois | Ligação |
| --- | --- | --- |
| `Group guia` (`bZTRF0`: Catálogo › Categoria) | MC Breadcrumb `bZWWI` | rótulos `Catálogo|Categoria`, destino `catalogo` |
| MC Input B (`bZWHg`, descrição no popup) | MC Textarea `bZWWK` | valor = descrição do popup; desabilitado em "visualizar"; `Create a new` (`bZTTV0`) e `Make changes` (`bZTTZ0`) leem `MCTextarea A's Valor` |
| MC Button E (`bZWFT`, Ativar/Desativar no card) | MC Switch `bZWWM` "Ativa" | ligado = status da categoria; workflow `bZWWO` → `Make changes` status = `MCSwitch A's Ligado` |

Checkbox: a página não tinha nenhum; o elemento fica disponível no plugin.

Testado no Chrome: breadcrumb com link para `catalogo`; Switch desliga/religa "categoria teste" (badge e contadores Ativas/Inativas acompanham; voltou ao estado original); Editar abre o Textarea preenchido e Salvar sem mudanças mantém o nome; Nova categoria abre o Textarea vazio. Uma primeira tentativa do Switch numa aba aberta antes da publicação (o Bubble avisava "esta página foi atualizada") travou a aba; numa aba recém-carregada não se repetiu.

## Menu lateral: option set `MenuItem` + reusável `MC Menu`

**Por que assim:** os menus antigos (`Menu Lateral` `bTHFF` e `Menu Lateral Dinamico` `bVklv0`) repetiam grupos por perfil com condicionais de visibilidade. Agora a lista de itens é dado (option set) e a regra de quem vê o quê continua **numa expressão do Bubble**: o componente só recebe o que já pode ser mostrado.

Option set `MenuItem` (`option.menuitem`), 28 opções: `rotulo`, `icone` (nome do mapa de ícones do runtime), `pagina`, `ordem`, `perfis` (lista), `acesso_exigido`, `ocultar_para_nomes` (lista). Copiado dos menus antigos, inclusive Banking/Central de alertas exigindo acesso `BANKING`/`ALERTA` e itens ocultos para "Fernando Souza".

Reusável `MC Menu` (`bZWPl`) contém `MCSidebar A` (`bZWPy`):
- `labels`/`icons`/`hrefs` = `All MenuItem:sorted by ordem:format as text:extract with Regex [^|]+`, onde o conteúdo por item é `This MenuItem's perfis contains Current User's perfil and ocultar_para_nomes doesn't contain Current User's nome and (acesso_exigido is empty or Current User's acesso contains acesso_exigido) :formatted as text` → `rotulo` (ou `icone`, `pagina`) se sim, `|` se não. A regex descarta os itens não permitidos e mantém as três listas alinhadas; `icone` vazio vira `file` e `pagina` vazia vira `#`.
  - Motivo: o MCP do Bubble não consegue gravar `:filtered` com constraint avançada em option sets. Se alguém preferir, no editor dá para trocar por `All MenuItem:filtered (Advanced: …)` com a mesma condição.
  - Atenção ao gravar via MCP: as propriedades de `:formatted as text` em yes/no são `formatting_for_true`/`formatting_for_false` (com `true_text`/`false_text` o validador aceita, mas o Bubble ignora e devolve "yes"/"no").
- `active` = `Current page name`; condicional: se a página não está em `All MenuItem's pagina`, usa o prefixo antes do primeiro `-` (`catalogo-categoria` → `catalogo`, `estoque-saldos` → `estoque`).
- Largura reservada: 240 px; condicional `Recolhido is yes` → 72 px; `Current page width < 768` → 0 px. A instância na página precisa de **Fit width to content** e altura mínima 0 (só pelo editor: o MCP não expõe esses campos em instâncias de reusável).

Páginas migradas (originais **ocultados**, não excluídos):

| Página | Novo | Ocultado | Ajustes |
| --- | --- | --- | --- |
| `catalogo-categoria` | `MC Menu A` `bZWQB` em `Group body` | `Menu Lateral A` `bZTQz0` | `Group container` `bZTRD0`: `padding_top` 56 em < 768 px (espaço do hambúrguer) |
| `estoque` | `MC Menu A` `bZWQF` em `Group body` | `Menu Lateral Dinamico A` `bZUyN`, `falsoLateral` `bZUyK` | `FloatingGroup B` (header) largura `calc(100% - 240px)`; `MC Menu A's width < 120` → `calc(100% - 72px)`; < 768 px → `calc(100% - 56px)` |

O lado direito do header (busca, ícones, usuário, sair) é o reusável `Menu Superior` original, intocado.

Testado em `version-83mll` no Chrome (usuário com perfil USUARIO, sem acessos BANKING/ALERTA): itens filtrados corretamente (Banking e Central de alertas ocultos), item ativo nas duas páginas, recolher/expandir com a preferência mantida entre páginas, conteúdo e header acompanhando 240/72 px, celular (390 px) com hambúrguer, gaveta abrindo/fechando (Esc e X) e desmontando ao fechar. Outros perfis não foram testados (exigiria logar como outro usuário).

Pendências/decisões: VENDEDOR leva Banking/Comercial/Alertas para `comercial` (fiel ao clique do menu antigo, parece provisório); itens sem página (Investidores, Investidor, Vendas) aparecem com `#`; o widget "Chat interno" é arrastável e global, não faz parte do menu.

## Header no celular (reusável `Menu Superior`)

O header é o HTML `HTML D` (`#mc-topbar`, `bZNRM`), que desenha busca, ícones, avatar e sair e repassa cada clique para o elemento original do Bubble (que tem o workflow). No desktop nada mudou. Abaixo de 768 px a linha fica: **hambúrguer · busca "Ir para a página" · avatar com menu**.

| Peça | Id | O que faz |
| --- | --- | --- |
| `MC Button` `mc-m-menu` | `bZWQe` | ícone `menu`, ghost, visível só com `Current page width < 768`. Workflow `bZWQi`: *Run javascript* `window.dispatchEvent(new Event('mcui:sidebar-open'))`. O CSS do header o esconde nas páginas sem MC Sidebar (`html:not([data-mc-sidebar])`), onde ele não teria o que abrir. |
| `MC User Menu` `mc-m-user` | `bZWQg` | nome = `Current User's nome`, subtítulo = perfil; itens Busca expressa, Chat, Reportar erro / melhoria e **Avisos globais só com acesso DEV** (mesma regra do botão original); "Sair" em vermelho. Visível só abaixo de 768 px. |
| Workflow do menu | `bZWQl` → `bZWQn` | *Run javascript* que clica no mesmo alvo do header HTML: `mc-old-lupa`, `btn_abrir_chat`, `btn_abrir_ticket`, `btn_abrir_avisos` ou `mtb-out` (que abre a confirmação de saída existente). Nenhum workflow foi duplicado. |
| CSS em `HTML D` | — | três regras novas: os dois ids acima saem da regra que tira os elementos antigos do layout; `#mtb .acts` some abaixo de 768 px; o hambúrguer some sem `data-mc-sidebar`. O resto do HTML/JS ficou idêntico. |

Dois detalhes descobertos no teste:
- O `Group DZZZ` (`#glass`) quebra linha no celular e o `#mc-topbar` ocupa `flex-basis: 100%`; abaixo de 768 px o CSS passa o topbar para `flex: 1 1 0%` e manda `#mc-avisos` (faixa de avisos globais) para a linha de baixo.
- Campo de texto vazio em elemento de plugin volta ao **valor padrão do campo** ("Botão"). O hambúrguer usa um espaço de largura zero (U+200B) como texto; o nome acessível vem do tooltip "Abrir menu". Para dispensar esse truque, o runtime pode passar a ignorar rótulos só com espaços numa próxima versão.

Testado no Chrome (390 px, usuário USUARIO sem acesso DEV): linha única na catalogo-categoria e na estoque; Busca expressa, Chat ("Suporte IA") e Reportar erro abrem os popups originais; Sair abre a confirmação existente e Cancelar fecha sem deslogar; hambúrguer abre a gaveta acima do header flutuante; a gaveta rola até o último item. Na catalogo-tag (menu antigo) o hambúrguer fica oculto e o avatar aparece. No desktop o header continua igual.

Com isso o MC Sidebar das páginas piloto passou a `mobile_trigger = no` (o botão fixo do próprio componente sumiu). Saíram também os ajustes que ele exigia: `padding_top` 56 px do `Group container` da catalogo-categoria e a largura `calc(100% - 56px)` do header da estoque no celular (agora 100%).

Como o `Menu Superior` é usado em todas as páginas, o menu do avatar no celular vale para o app inteiro na branch; o hambúrguer só aparece onde há MC Sidebar.

## Conectar aos workflows (exemplos das páginas de catálogo)

As páginas `catalogo-categoria` e `catalogo-tag` paginam por um estado da página (`pagina`, 12 itens por página) sobre o RepeatingGroup oculto `RepeatingGroup catalogo_categoria` (id `bZVXn` em categorias, `bZVdt` em tags).

**MC Pagination** no lugar de `Group HZ` (Anterior / Página X de Y / Próxima):
- `page` = `catalogo-categoria's pagina`
- `total_pages` = `RepeatingGroup B's List of catalogo_categorias:count / 12:ceiling max 1` (mesma expressão do texto atual)
- `summary` = mesma expressão do `Text NZ`
- Workflow **When MC Pagination page_changed** → *Set state* `pagina` of `catalogo-categoria` = `MC Pagination's requested_page` → *Scroll to* `Group U` (as mesmas ações dos workflows `bZVbl`/`bZVbp` de hoje).

**MC Button** no lugar de `Button Nova categoria` (`bZVWf`):
- `label` = "Nova categoria", `tooltip` = "Cadastrar uma nova categoria"
- Workflow **When MC Button clicked** → as mesmas três ações do workflow `bZVbt`: *Reset Pp Popup* → *Set state modo_popup* → *Show Pp Popup*.

**MC Badge** no lugar de `Text ● Ativa` (`bZVXx`): `label`/`variant` com a mesma condição de status que o texto usa hoje (ex.: ativa → `default`, inativa → `secondary`), `dot` = yes.

**MC Input** no lugar de `Input Busque pela descrição` (`bZVXV`): a busca do RepeatingGroup passa a ler `MC Input's value`; o workflow *Input B value changed* (`bZVbZ`) vira *When MC Input value_changed* com a mesma ação (*Set state pagina = 1*).

Regras: o Bubble continua dono de consultas, privacidade e regras de negócio. Os elementos só recebem textos/números para exibir e emitem eventos; nenhum dado de registro é enviado ao JavaScript além do que o próprio elemento mostra.

## Cores e tokens no Bubble

- **Dentro dos elementos MC**: automático, vem de `tokens.css` da biblioteca.
- **Elementos nativos do Bubble**: `dist/bubble-color-tokens.json` lista cada cor de `tokens.css` resolvida (`ui-primary`, `ui-ink`, `ui-brand`…). Ela pode ser aplicada como variáveis de cor do Bubble (Styles → Variables). Gere de novo a cada mudança de `tokens.css` em vez de editar valores à mão.

> **Atenção: as paletas divergem.** O app `devmodocorre` usa uma paleta "Modo Corre v2" com primário azul-marinho (`mc-brand` `#001F7B`) e verde `#55B277`. Na biblioteca, `--primary` é verde `#317d2d` e o texto `#09123c`. Um MC Button `default` vai aparecer verde ao lado de botões azuis do Bubble. É preciso decidir qual paleta é a oficial antes de migrar páginas inteiras; se for a do Bubble, o ajuste certo é em `tokens.css` da biblioteca (e todos os consumidores mudam junto).

## Testar localmente

```bash
cd bubble && npm run build && node harness/serve.mjs
# abra http://localhost:4321/harness/index.html
```

O harness emula a API `instance` do Bubble (`canvas`, `publishState`, `triggerEvent`, `update`) e carrega **o mesmo** `plugin/element-code.js` que vai para o editor de plugins, sobre uma página com CSS global hostil. `window.harness.<id>.set({...})` simula o Bubble mudando campos.

## Atualizar a biblioteca sem quebrar a integração

1. Publique a nova versão da biblioteca normalmente.
2. Atualize `@modo-corre/ui` em `bubble/package.json`, rode `npm run build:bubble` e o harness.
3. Se um componente mudar de API (props/variantes), ajuste só o adaptador em `src/runtime.tsx` e o `elements.json`.
4. Publique o pacote e troque a versão na URL do header do plugin.

## Limitações conhecidas

- **Criação do plugin é manual** (o MCP do Bubble não cria plugins).
- **Validado no domínio real, ainda não nas páginas do catálogo**: o bundle da 0.1.1, vindo do jsDelivr, foi injetado na página de login de `modocorreapp.com.br/version-83mll`. Ele carregou sem bloqueio de CSP e renderizou os quatro componentes com os estilos oficiais, o clique chegou ao callback e o CSS da página não mudou. As páginas de catálogo e estoque exigem login, e os elementos só podem ser colocados nelas depois que o plugin existir. Para testes locais, `http://localhost` não carrega dentro de páginas HTTPS (mixed content).
- **Fontes dentro do Shadow DOM**: o texto que existe só em shadow roots pode não disparar o download das faces declaradas no documento. Desde a 0.1.2 o runtime pede os pesos usados via `document.fonts.load`; na 0.1.1 o texto pode cair em `system-ui`.
- **Erro de typecheck preexistente** em `src/components/ui/separator.tsx` (`decorative` não existe em `SeparatorProps` do Base UI 1.9). `Separator` também não é exportado em `src/components/ui/index.ts`. Não alterados.
- **Dialog e Select** usam portais do Base UI que montam no `document.body`, fora do shadow root, e os wrappers da biblioteca não repassam `container` ao `Portal`. Para usá-los no Bubble é preciso uma mudança aditiva na biblioteca: aceitar `container` em `DialogContent`/`SelectContent` e repassar ao `Portal`. Não implementado nesta etapa.
- **Table**: a biblioteca não tem componente de tabela. As listas das páginas são RepeatingGroups com botões por linha ligados a workflows (Editar, Desativar); trocá-las por uma tabela React exigiria enviar os registros ao JavaScript e recriar as ações por linha. Mantidas como RepeatingGroup.
- **Elementos de plugin no Bubble não têm "fit width to content"**: defina a largura do elemento ou use `full_width`.
- **Sem gancho de destruição**: o Bubble não avisa quando um elemento de plugin sai da página; o React root fica preso ao canvas e é recriado se o Bubble reinicializar o elemento (o shadow root é reaproveitado, sem duplicar nós ou listeners).
- No painel de navegador usado para os testes, transições CSS não avançam (`currentTime` fica em 0); os estados finais foram conferidos finalizando as animações. Num navegador normal isso não ocorre.
