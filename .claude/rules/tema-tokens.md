---
paths:
  - "tokens.css"
  - "styles.css"
---

# Regras: tema e tokens

- `tokens.css` é a **fonte única** das cores, raio e fontes. Componentes, o pacote npm e o plugin Bubble leem daqui.
- `styles.css` só mapeia tokens para o Tailwind (`@theme inline`) e define a base. Não coloque cores fixas nele.
- Nomes seguem o padrão shadcn (`--background`, `--primary`, `--muted-foreground`, `--sidebar-*`…) mais os da marca (`--ink`, `--brand`, `--brand-dark`, `--brand-light`, `--line`, `--mute`, `--hero`).
- Token novo: declare em `:root` (e em `.dark`, se houver tema escuro), e se precisar de classe Tailwind (`bg-<nome>`), adicione `--color-<nome>: var(--<nome>);` no `@theme inline`.
- Prefira valores em hex `#rrggbb` para cores de marca: o build do Bubble só exporta para `bubble-color-tokens.json` as cores que resolvem para hex de 6 dígitos.
- Mudou `tokens.css`? Rode o build do Bubble para regenerar `bubble/dist/bubble-color-tokens.json` e avise quem cuida das variáveis de cor do app Bubble.
- Mudar cor de token muda **todos** os consumidores (apps React e Bubble). Trate como mudança visível e registre no README/histórico.
