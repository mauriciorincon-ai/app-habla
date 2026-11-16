// INFORME de sensibilidad: el mismo universo que el gate (desde el S16, TODO el repo salvo CLAUDE.md, el
// fixture de hashes y el lockfile), para consultar sin correr vitest. Solo REPORTA archivo · línea —
// jamás el término ni la edad — y nunca falla: el que falla es tests/unit/sensibilidad.test.ts.
//
//   node scripts/sensibilidad-informe.mjs

import { readFileSync } from "node:fs";
import { ALCANCE_GATE, archivoDe, buscarCoincidencias, lineasConEdad } from "./lib/sensibilidad.ts";

const hashes = new Set(
  JSON.parse(readFileSync(new URL("../tests/fixtures/sensibilidad-hashes.json", import.meta.url), "utf8")).hashes,
);
const archivos = ALCANCE_GATE.map(archivoDe);

let totalArchivos = 0;
let totalCoincidencias = 0;
let totalEdades = 0;
for (const f of archivos) {
  const texto = readFileSync(f, "utf8");
  const c = buscarCoincidencias(texto, hashes);
  const e = lineasConEdad(texto);
  if (!c.length && !e.length) continue;
  totalArchivos++;
  totalCoincidencias += c.length;
  totalEdades += e.length;
  const lineas = [...new Set(c.map((x) => x.linea))].slice(0, 12).join(", ");
  if (c.length) console.log(`${f} — ${c.length} coincidencia(s) en línea(s) ${lineas}${c.length > 12 ? "…" : ""}`);
  if (e.length) console.log(`${f} — ${e.length} línea(s) con forma de edad: ${e.slice(0, 12).join(", ")}`);
}
console.log(
  totalArchivos
    ? `\n${totalCoincidencias} coincidencia(s) y ${totalEdades} edad(es) en ${totalArchivos} de ${archivos.length} archivo(s). El gate falla hasta reescribirlas.`
    : `\nSin coincidencias ni edades en ${archivos.length} archivo(s): el repo entero está limpio.`,
);
