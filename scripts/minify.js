import * as esbuild from "esbuild";
import process from "node:process";

await esbuild.build({
  entryPoints: [`${process.cwd()}/src/index.js`],
  bundle: true,
  outfile: "dist/echoes.esm.js",
  minify: true,
  format: "esm",
});

await esbuild.build({
  entryPoints: [`${process.cwd()}/src/index.js`],
  bundle: true,
  outfile: "dist/echoes.iife.js",
  minify: true,
  format: "iife",
  globalName: "Echoes",
});
