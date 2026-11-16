#!/usr/bin/env node
// Writes public/sw-precache.js from the Next build output (S15, ADR-027). Runs right after
// `next build`; `--stub` writes an empty list for `next dev` (the worker is not registered there).
//
// The cache version is the build id, so a new deploy installs a new cache and drops the old one.

import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { listaPrecache, scriptPrecache } from "./precache.mjs";

const RAIZ = resolve(import.meta.dirname, "..");
const SALIDA = join(RAIZ, "public", "sw-precache.js");

if (process.argv.includes("--stub")) {
  writeFileSync(SALIDA, scriptPrecache({ version: "dev", urls: [] }));
  console.log("sw-precache: stub de desarrollo");
  process.exit(0);
}

const NEXT = join(RAIZ, ".next");
const version = readFileSync(join(NEXT, "BUILD_ID"), "utf8").trim();

function htmlDeRuta(ruta) {
  const archivo = ruta === "/" ? "index.html" : `${ruta.slice(1)}.html`;
  const p = join(NEXT, "server", "app", archivo);
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

function leerChunk(url) {
  const p = join(NEXT, url.replace(/^\/_next\//, ""));
  return existsSync(p) ? readFileSync(p, "utf8") : null;
}

// The worklet URLs are the ones the mic session really loads (with their ?v= busting), read from
// the source so the two never drift apart.
const mic = readFileSync(join(RAIZ, "src", "lib", "voice", "mic-session.ts"), "utf8");
const worklets = [...mic.matchAll(/"(\/worklets\/[^"]+)"/g)].map((m) => m[1]);
const modulos = readdirSync(join(RAIZ, "public", "worklets"))
  .filter((f) => f.endsWith(".js"))
  .map((f) => `/worklets/${f}`);
const pictogramas = readdirSync(join(RAIZ, "public", "pictogramas"))
  .filter((f) => f.endsWith(".png"))
  .map((f) => `/pictogramas/${f}`);
const iconos = readdirSync(join(RAIZ, "public", "icons")).map((f) => `/icons/${f}`);

const lista = listaPrecache({
  version,
  htmlDeRuta,
  leerChunk,
  extras: [...worklets, ...modulos, ...pictogramas, ...iconos, "/manifest.webmanifest"],
});
writeFileSync(SALIDA, scriptPrecache(lista));
console.log(`sw-precache: ${lista.urls.length} archivos · versión ${version}`);
