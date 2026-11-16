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
  const candidatos =
    ruta === "/"
      ? ["index.html"]
      : [`${ruta.slice(1)}.html`, join(ruta.slice(1), "index.html")];
  for (const c of candidatos) {
    const p = join(NEXT, "server", "app", c);
    if (existsSync(p)) return readFileSync(p, "utf8");
  }
  return null;
}

/** Every hashed file under .next/static (js, css, fonts), as /_next/static/... URLs. */
function todoLoEstatico(dir = join(NEXT, "static")) {
  const fuera = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) fuera.push(...todoLoEstatico(p));
    else if (/\.(?:js|css|woff2)$/.test(e.name))
      fuera.push(`/_next/static/${p.slice(join(NEXT, "static").length + 1)}`);
  }
  return fuera;
}

// A host that lays the build out differently (the deploy platform) may not have a route's HTML where the
// local build does. Then the build must not fail: the route is still listed and ALL hashed static files go in.
const sinHtml = [];

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
  alFaltarHtml: (ruta) => sinHtml.push(ruta),
  extras: [...worklets, ...modulos, ...pictogramas, ...iconos, "/manifest.webmanifest"],
});
if (sinHtml.length > 0) {
  console.warn(`sw-precache: sin HTML en el build para ${sinHtml.join(", ")}; se precachea todo .next/static`);
  const todo = new Set(lista.urls);
  for (const u of todoLoEstatico()) todo.add(u);
  lista.urls = [...todo].sort();
}
writeFileSync(SALIDA, scriptPrecache(lista));
console.log(`sw-precache: ${lista.urls.length} archivos · versión ${version}`);
