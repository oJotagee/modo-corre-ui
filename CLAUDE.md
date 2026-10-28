# CLAUDE.md

As instruções gerais do projeto estão em `AGENTS.md` (compartilhado com outras ferramentas de IA). Leia-o primeiro:

@AGENTS.md

## Específico do Claude Code

- Regras detalhadas por área ficam em `.claude/rules/` e são carregadas quando você mexe nos arquivos correspondentes:
  - `componentes.md` — como criar/alterar componentes (shadcn primeiro, do zero só em último caso).
  - `bubble.md` — como traduzir um componente para elemento do Bubble.
  - `tema-tokens.md` — cores, fontes e tema.
  - `publicacao.md` — versionamento, npm e atualização do plugin.
- Ao adicionar um componente, rode `npm run shadcn:add -- <nome>` antes de pensar em escrever do zero.
- Depois de qualquer mudança em `src/`, rode `npm run typecheck` e `npm run build`. Se mexer em `bubble/`, rode também `cd bubble && npm run typecheck` e o build do bundle.
- Responda e documente em português.
- Os MCPs do Bubble alteram apps reais: só use quando o usuário pedir, e pergunte em qual branch trabalhar.
