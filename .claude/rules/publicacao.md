---
paths:
  - "package.json"
  - "bubble/package.json"
  - "tsup.config.ts"
---

# Regras: versão e publicação

Só publique quando a pessoa pedir explicitamente. Publicar no npm e atualizar o plugin Bubble não tem volta simples.

## Versionamento (semver)

- **patch** (0.3.x): correção sem mudar API.
- **minor** (0.x.0): componente/elemento novo, prop/campo novo opcional.
- **major**: remover/renomear prop, variante, campo, estado ou evento. Evite; no Bubble isso quebra páginas.

## Fluxo

1. `npm run typecheck` e `npm run build` na raiz.
2. Gere o bundle Bubble com o código local: `cd bubble && MC_UI_SOURCE=local npm run build` e teste no harness.
3. Suba `version` no `package.json` raiz.
4. `npm publish` (exige `npm login`; token expirado aparece como `404 Not Found`).
5. Confira o arquivo no jsDelivr: `https://cdn.jsdelivr.net/npm/@modo-corre/ui@<versão>/bubble/dist/mc-ui-bubble.js`.
6. Atualize `@modo-corre/ui` em `bubble/package.json` para a versão publicada.
7. No editor de plugins do Bubble: troque a versão na URL do **Page header**, crie/ajuste elementos conforme `elements.json` e publique nova versão do plugin. Depois atualize o plugin no app (Plugins → Modo Corre UI → versão).
8. Registre a mudança no histórico de `bubble/README.md`.

Nunca use `@latest` na URL do plugin.
