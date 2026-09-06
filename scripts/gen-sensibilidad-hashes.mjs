// Genera tests/fixtures/sensibilidad-hashes.json desde la lista de términos sensibles de la
// planeadora (RO, privada). La lista NUNCA se copia: solo viajan los SHA-256 de cada término
// normalizado. Correr cuando la lista cambie (la planeadora avisa):
//
//   node scripts/gen-sensibilidad-hashes.mjs
//   SENSIBILIDAD_LISTA=/otra/ruta.txt node scripts/gen-sensibilidad-hashes.mjs
//
// Entran las líneas que no son comentario (#) ni vacías. Los términos «para REVISAR» de la lista
// van comentados, así que no entran — como pide la orden. El término de PRUEBA de la lista sí
// entra: es el que demuestra el gate en rojo.

import { readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { N_MAX, hashDeTermino, normalizar } from "./lib/sensibilidad.ts";

const ruta =
  process.env.SENSIBILIDAD_LISTA ??
  join(homedir(), "Code/hr01-develop-ai-apps/portafolio/habla/sensibilidad-terminos.txt");

const lineas = readFileSync(ruta, "utf8").split("\n");
const hashes = new Set();
let terminos = 0;
let largos = 0;
for (const cruda of lineas) {
  const linea = cruda.trim();
  if (!linea || linea.startsWith("#")) continue;
  const palabras = normalizar(linea);
  if (palabras.length === 0) continue;
  if (palabras.length > N_MAX) {
    largos++; // se reporta el hecho, jamás el término
    continue;
  }
  hashes.add(hashDeTermino(palabras));
  terminos++;
}

const salida = {
  _que_es:
    "SHA-256 de cada término de la lista de sensibilidad de la planeadora (privada), normalizado: minúsculas, sin acentos, no-alfanumérico → espacio. El test compara los n-gramas (1–4 palabras) del contenido público contra este conjunto. Aquí no hay ningún término: solo sus huellas.",
  version: 1,
  generado: new Date().toISOString().slice(0, 10),
  n_max: N_MAX,
  terminos,
  hashes: [...hashes].sort(),
};
writeFileSync(
  new URL("../tests/fixtures/sensibilidad-hashes.json", import.meta.url),
  JSON.stringify(salida, null, 2) + "\n",
);
console.log(
  `tests/fixtures/sensibilidad-hashes.json — ${terminos} términos, ${hashes.size} hashes` +
    (largos ? ` · ${largos} término(s) de más de ${N_MAX} palabras NO entraron (revisar)` : ""),
);
