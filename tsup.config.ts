import { defineConfig } from "tsup";

// Sem bundle: cada arquivo mantém a própria diretiva "use client" (o Sidebar usa createContext).
export default defineConfig({
  entry: ["src/**/*.{ts,tsx}"],
  bundle: false,
  format: ["esm"],
  dts: false,
  clean: true,
});
