// INFORME de sensibilidad sobre el resto del repo (lo que el gate NO vigila): textos previos al
// S5 — manual, guía, las 50 cápsulas de habla, brochure, README, summaries viejos… Solo REPORTA
// (archivo · línea · tamaño del n-grama), jamás el término, y nunca falla: lo que aparezca lo
// decide el usuario aparte, sin tocar nada hasta entonces (nota «para REVISAR» de la lista).
//
//   node scripts/sensibilidad-informe.mjs

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { ALCANCE_GATE, archivoDe, buscarCoincidencias } from "./lib/sensibilidad.ts";

const hashes = new Set(
  JSON.parse(readFileSync(new URL("../tests/fixtures/sensibilidad-hashes.json", import.meta.url), "utf8")).hashes,
);
const enGate = new Set(ALCANCE_GATE.map(archivoDe));
const EXCLUIDOS = new Set(["CLAUDE.md", "tests/fixtures/sensibilidad-hashes.json", "pnpm-lock.yaml"]);
const EXT = /\.(md|html|ts|tsx|mjs|json|txt)$/;

const archivos = execSync("git ls-files", { encoding: "utf8" })
  .split("\n")
  .filter((f) => f && EXT.test(f) && !enGate.has(f) && !EXCLUIDOS.has(f));

let totalArchivos = 0;
let totalCoincidencias = 0;
for (const f of archivos) {
  const c = buscarCoincidencias(readFileSync(f, "utf8"), hashes);
  if (!c.length) continue;
  totalArchivos++;
  totalCoincidencias += c.length;
  const lineas = [...new Set(c.map((x) => x.linea))].slice(0, 12).join(", ");
  console.log(`${f} — ${c.length} coincidencia(s) en línea(s) ${lineas}${c.length > 12 ? "…" : ""}`);
}
console.log(
  totalArchivos
    ? `\n${totalCoincidencias} coincidencia(s) en ${totalArchivos} archivo(s) fuera del alcance del gate. Se reportan, no se tocan: decisión del usuario.`
    : "\nSin coincidencias fuera del alcance del gate.",
);
