// Descarga UNA VEZ, en desarrollo, los pictogramas ARASAAC que faltan para las PALABRAS GEMELAS
// (pares mínimos, S3). NO destructivo: solo baja las palabras nuevas a public/pictogramas/,
// sin tocar los 41 pictos existentes ni su lote.json (los pares reusan pato/gato/luna que ya están).
//
// Licencia idéntica al lote principal (CC BY-NC-SA, Sergio Palao / ARASAAC / Gobierno de Aragón):
// ver public/pictogramas/LICENCIA.md. En runtime la app NO llama a ARASAAC (e2e cero-red lo vigila).
//
// Uso: node scripts/descargar-gemelas.mjs   (los PNG resultantes se commitean)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://api.arasaac.org/api/pictograms/es/bestsearch";
const ESTATICO = "https://static.arasaac.org/pictograms";
const RESOLUCION = 500;

// Solo las palabras NUEVAS (pato, gato, luna ya viven en el lote principal).
const NUEVAS = [
  "mano",
  "mono",
  "foca",
  "boca",
  "casa",
  "taza",
  "cuna",
  "gota",
  "bota",
];

const salida = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/pictogramas",
);
mkdirSync(salida, { recursive: true });

const traza = [];
for (const palabra of NUEVAS) {
  const archivo = `${palabra}.png`;
  const destino = resolve(salida, archivo);
  if (existsSync(destino)) {
    console.log(`· ${palabra} ya existe, se salta`);
    continue;
  }
  const res = await fetch(`${API}/${encodeURIComponent(palabra)}`);
  if (!res.ok) {
    console.warn(`⚠️  sin resultados para "${palabra}" (${res.status})`);
    continue;
  }
  const mejor = (await res.json())[0];
  if (!mejor?._id) {
    console.warn(`⚠️  sin pictograma para "${palabra}"`);
    continue;
  }
  const url = `${ESTATICO}/${mejor._id}/${mejor._id}_${RESOLUCION}.png`;
  const png = await fetch(url);
  if (!png.ok) {
    console.warn(`⚠️  no se pudo descargar ${url} (${png.status})`);
    continue;
  }
  writeFileSync(destino, Buffer.from(await png.arrayBuffer()));
  traza.push({ palabra, archivo, arasaacId: mejor._id });
  console.log(`✓ ${palabra.padEnd(8)} → ${archivo} (arasaac ${mejor._id})`);
}

// Traza aparte (no toca lote.json del lote principal).
const lotePath = resolve(salida, "lote-gemelas.json");
const previo = existsSync(lotePath)
  ? JSON.parse(readFileSync(lotePath, "utf8"))
  : [];
const porPalabra = new Map(previo.map((p) => [p.palabra, p]));
for (const t of traza) porPalabra.set(t.palabra, t);
writeFileSync(
  lotePath,
  `${JSON.stringify([...porPalabra.values()], null, 2)}\n`,
);

console.log(`\nOK → ${traza.length} pictogramas nuevos de gemelas.`);
