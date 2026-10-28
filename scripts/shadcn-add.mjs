// Traz um componente oficial do shadcn/ui (estilo base-vega, Base UI) para
// src/components/ui, já com os imports no padrão desta biblioteca.
//
// Uso: npm run shadcn:add -- tooltip [popover ...] [--force]
//
// Por que não `npx shadcn add`? Este repositório é uma biblioteca, não um app:
// não há alias "@/" no tsconfig, e a CLI gravaria os arquivos numa pasta "@/".
// Aqui usamos `shadcn view` (só lê o registry) e gravamos no lugar certo.
import { execFileSync } from "node:child_process";
import { existsSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const force = args.includes("--force");
const names = args.filter((a) => !a.startsWith("--"));

if (names.length === 0) {
  console.error("Uso: npm run shadcn:add -- <componente> [outro ...] [--force]");
  process.exit(1);
}

// Chama a CLI pelo Node (o .cmd do Windows quebra em caminhos com espaço).
const cli = join(root, "node_modules", "shadcn", "dist", "index.js");
const raw = execFileSync(process.execPath, [cli, "view", ...names], { cwd: root, encoding: "utf8" });
const items = JSON.parse(raw.slice(raw.indexOf("[")));

// Imports do registry → imports relativos usados em src/components/ui.
const fixImports = (code) =>
  code
    .replace(/from "cn"/g, 'from "../../lib/utils"')
    .replace(/from "@\/lib\/utils"/g, 'from "../../lib/utils"')
    .replace(/from "@\/(?:registry\/[\w-]+\/)?(?:components\/)?ui\/([\w-]+)"/g, 'from "./$1"');

for (const item of items) {
  for (const file of item.files ?? []) {
    if (file.type !== "registry:ui") {
      console.warn(`[shadcn:add] ignorado (${file.type}): ${file.path}`);
      continue;
    }
    const target = join(root, "src", "components", "ui", basename(file.path));
    if (existsSync(target) && !force) {
      console.warn(`[shadcn:add] já existe, não sobrescrito: ${target} (use --force)`);
      continue;
    }
    writeFileSync(target, fixImports(file.content));
    console.log(`[shadcn:add] criado ${target}`);
  }
  const deps = (item.dependencies ?? []).filter((d) => d !== "cn");
  const regDeps = item.registryDependencies ?? [];
  if (deps.length) console.log(`  dependências npm: ${deps.join(", ")}`);
  if (regDeps.length) console.log(`  depende de outros componentes: ${regDeps.join(", ")}`);
  if (item.meta?.links?.docs) console.log(`  docs: ${item.meta.links.docs}`);
}

console.log("\nPróximos passos: exportar em src/components/ui/index.ts, registrar em registry.json, rodar npm run typecheck e npm run build.");
