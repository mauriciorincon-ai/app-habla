#!/usr/bin/env node
// Brings the recognizer assets into public/ at build time (S11, ADR-023). Nothing here enters the repo:
// public/modelos/*.zip and public/vosk/* are git-ignored. Every file is checked against the SHA-256
// pinned in scripts/modelos.json; a mismatch fails the build. The device later checks the same hash
// before it uses a file (src/lib/reconocer/modelo.ts).
//
// The model archives are the upstream Vosk .zip files, served as they are: the wasm build of
// vosk-browser extracts them with libarchive, so there is no repacking and the pin is upstream's.
//
// Downloads are cached in node_modules/.cache/habla-modelos (CI caches that folder by this file's hash).

import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifiesto = JSON.parse(await readFile(join(raiz, "scripts/modelos.json"), "utf8"));
const cache = join(raiz, "node_modules/.cache/habla-modelos");
const destinoModelos = join(raiz, "public/modelos");
const destinoMotor = join(raiz, "public/vosk");
const motorDist = join(raiz, "node_modules/@lichess-org/vosk-browser/dist");

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function verificado(ruta, esperado) {
  if (!existsSync(ruta)) return false;
  return sha256(await readFile(ruta)) === esperado;
}

async function descargar(url, ruta, esperado) {
  if (await verificado(ruta, esperado)) return;
  process.stdout.write(`traer-modelos: downloading ${url}\n`);
  const r = await fetch(url);
  if (!r.ok) throw new Error(`traer-modelos: HTTP ${r.status} for ${url}`);
  const buf = Buffer.from(await r.arrayBuffer());
  const real = sha256(buf);
  if (real !== esperado)
    throw new Error(`traer-modelos: hash mismatch for ${url}: ${real} ≠ ${esperado}`);
  await writeFile(`${ruta}.parcial`, buf);
  await rename(`${ruta}.parcial`, ruta);
}

await mkdir(cache, { recursive: true });
await mkdir(destinoModelos, { recursive: true });
await mkdir(destinoMotor, { recursive: true });

for (const [idioma, m] of Object.entries(manifiesto.modelos)) {
  const enCache = join(cache, `${m.nombre}.zip`);
  await descargar(m.url, enCache, m.sha256);
  const destino = join(destinoModelos, `${idioma}.zip`);
  if (!(await verificado(destino, m.sha256))) await copyFile(enCache, destino);
}

for (const [archivo, esperado] of Object.entries(manifiesto.motor.archivos)) {
  const origen = join(motorDist, archivo);
  if (!(await verificado(origen, esperado)))
    throw new Error(
      `traer-modelos: ${archivo} in ${manifiesto.motor.paquete} does not match its pinned hash`,
    );
  await copyFile(origen, join(destinoMotor, archivo));
}

process.stdout.write(
  `traer-modelos: ${Object.keys(manifiesto.modelos).length} models and ${Object.keys(manifiesto.motor.archivos).length} engine files verified\n`,
);
