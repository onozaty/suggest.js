import { readFileSync } from "fs";
import { defineConfig } from "tsup";

const pkg = JSON.parse(readFileSync("./package.json", "utf8"));

export default defineConfig({
  entry: ["src/suggest.ts"],
  format: ["esm", "cjs", "iife"],
  dts: true,
  clean: true,
  splitting: false,
  sourcemap: true,
  minify: false,
  globalName: "Suggest",
  outDir: "dist",
  target: "es2022",
  platform: "browser",
  esbuildOptions(options) {
    const repositoryUrl =
      pkg.repository?.url ||
      pkg.repository ||
      "https://github.com/onozaty/suggest.js";
    options.banner = {
      js: `/* suggest.js v${pkg.version} | MIT License | ${repositoryUrl} */`,
    };
  },
});
