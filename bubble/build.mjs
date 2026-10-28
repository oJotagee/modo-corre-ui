// Gera dist/mc-ui-bubble.js (React + @modo-corre/ui + CSS) e
// dist/bubble-color-tokens.json a partir do pacote publicado.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as esbuild from "esbuild";

const here = dirname(fileURLToPath(import.meta.url));
// MC_UI_SOURCE=local usa o build deste repositório (dist/) em vez do pacote do npm:
// necessário só para gerar o bundle de uma versão nova antes de publicá-la.
const local = process.env.MC_UI_SOURCE === "local";
const pkgDir = local ? join(here, "..") : join(here, "node_modules", "@modo-corre", "ui");
if (local) console.warn("[mc-ui] usando o build local de @modo-corre/ui (MC_UI_SOURCE=local)");
const libraryVersion = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8")).version;
const tmp = join(here, ".build");
const out = join(here, "dist");

rmSync(tmp, { recursive: true, force: true });
mkdirSync(tmp, { recursive: true });
mkdirSync(out, { recursive: true });

// 1. Tokens: usa o arquivo do pacote; a 0.1.0 publicada não inclui tokens.css,
//    então cai no tokens.css do repositório (mesma fonte, ainda não publicada).
let tokensPath = join(pkgDir, "tokens.css");
if (!existsSync(tokensPath)) {
  tokensPath = join(here, "..", "tokens.css");
  console.warn(`[mc-ui] @modo-corre/ui@${libraryVersion} não publica tokens.css; usando ${tokensPath}`);
}
const tokensRaw = readFileSync(tokensPath, "utf8");
const fontsUrl = tokensRaw.match(/@import\s+url\(["']?([^"')]+)["']?\)\s*;/)?.[1] ?? "";
const tokens = tokensRaw
  .replace(/@import\s+url\([^)]*\)\s*;\s*/g, "")
  // Dentro do Shadow DOM :root não casa; :host recebe as variáveis.
  .replace(/:root\s*\{/g, ":root, :host {");
writeFileSync(join(tmp, "tokens.css"), tokens);

// 2. Tema oficial: copia styles.css do pacote sem alterar suas regras.
const styles = readFileSync(join(pkgDir, "styles.css"), "utf8").replace(
  /@import\s+"tailwindcss"\s*;/,
  '@import "tailwindcss" source(none);',
);
writeFileSync(join(tmp, "styles.css"), styles);
writeFileSync(
  join(tmp, "entry.css"),
  `@import "./styles.css";
@source "${local ? "../../dist" : "../node_modules/@modo-corre/ui/dist"}";
@source "../src";
.mc-root {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  font-family: var(--font-sans);
  color: var(--foreground);
  -webkit-font-smoothing: antialiased;
}
`,
);

// 3. Tailwind compila apenas as classes usadas pelos componentes.
const cli = join(here, "node_modules", "@tailwindcss", "cli", "dist", "index.mjs");
execFileSync(process.execPath, [cli, "-i", join(tmp, "entry.css"), "-o", join(tmp, "mc-ui.css"), "--minify"], {
  cwd: here,
  stdio: "inherit",
});
let css = readFileSync(join(tmp, "mc-ui.css"), "utf8");

// 4. @property vai para o documento (o Chrome ignora dentro de shadow roots).
const properties = css.match(/@property\s+[^{]+\{[^}]*\}/g) ?? [];
css = css.replace(/@property\s+[^{]+\{[^}]*\}/g, "");
const propertiesCss = properties.join("\n");

// 5. Bundle IIFE único com React, Base UI e os componentes publicados.
await esbuild.build({
  entryPoints: [join(here, "src", "runtime.tsx")],
  outfile: join(out, "mc-ui-bubble.js"),
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  minify: true,
  legalComments: "eof",
  jsx: "automatic",
  // No modo local, a biblioteca vem de ../dist e o React/Lucide são forçados a
  // vir de bubble/node_modules, para não haver duas cópias no bundle.
  alias: local
    ? {
        "@modo-corre/ui": join(here, "..", "dist", "index.js"),
        react: join(here, "node_modules", "react"),
        "react-dom": join(here, "node_modules", "react-dom"),
        "lucide-react": join(here, "node_modules", "lucide-react"),
      }
    : undefined,
  define: { "process.env.NODE_ENV": '"production"' },
  banner: { js: `/* @modo-corre/ui ${libraryVersion} · Bubble runtime */` },
  plugins: [
    {
      name: "mc-css",
      setup(build) {
        build.onResolve({ filter: /^virtual:mc-css$/ }, () => ({ path: "mc-css", namespace: "mc" }));
        build.onLoad({ filter: /.*/, namespace: "mc" }, () => ({
          contents: `export const css=${JSON.stringify(css)};export const propertiesCss=${JSON.stringify(
            propertiesCss,
          )};export const fontsUrl=${JSON.stringify(fontsUrl)};export const libraryVersion=${JSON.stringify(libraryVersion)};`,
          loader: "js",
        }));
      },
    },
  ],
});
writeFileSync(join(out, "mc-ui.css"), css);

// 6. Cores oficiais resolvidas para variáveis de cor do Bubble.
const vars = Object.fromEntries(
  [...tokens.split(".dark")[0].matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
);
const resolve = (v, depth = 0) => {
  const ref = v.match(/^var\(--([\w-]+)\)$/);
  return ref && depth < 5 && vars[ref[1]] ? resolve(vars[ref[1]], depth + 1) : v;
};
const hexToRgba = (hex) => {
  const h = hex.replace("#", "");
  const n = (i) => parseInt(h.slice(i, i + 2), 16);
  return `rgba(${n(0)},${n(2)},${n(4)},1)`;
};
const colorTokens = Object.entries(vars)
  .map(([name, value]) => [name, resolve(value)])
  .filter(([, value]) => /^#[0-9a-f]{6}$/i.test(value))
  .map(([name, value]) => ({ name: `ui-${name}`, hex: value, rgba: hexToRgba(value), source: `--${name}` }));
writeFileSync(join(out, "bubble-color-tokens.json"), JSON.stringify({ libraryVersion, colorTokens }, null, 2) + "\n");

const kb = (f) => (readFileSync(join(out, f)).length / 1024).toFixed(1) + " KB";
console.log(`[mc-ui] ok · @modo-corre/ui@${libraryVersion} · mc-ui-bubble.js ${kb("mc-ui-bubble.js")} · css ${kb("mc-ui.css")}`);
