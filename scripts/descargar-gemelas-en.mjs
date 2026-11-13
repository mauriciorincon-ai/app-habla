// Descarga UNA VEZ, en desarrollo, los pictogramas ARASAAC que faltan para los PARES MÍNIMOS DEL INGLÉS
// (S8). Misma licencia y misma atribución que el lote principal (CC BY-NC-SA, ARASAAC / Gobierno de
// Aragón: public/pictogramas/LICENCIA.md). En runtime la app NO llama a ARASAAC (el e2e de cero-red lo
// vigila). NO destructivo: salta lo que ya existe y anota la traza en public/pictogramas/lote-gemelas-en.json.
//
// Uso: node scripts/descargar-gemelas-en.mjs   (los PNG resultantes se commitean)

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://api.arasaac.org/api/pictograms/en/bestsearch";
const ESTATICO = "https://static.arasaac.org/pictograms";
const RESOLUCION = 500;

// Palabra inglesa → nombre de archivo (en minúscula, sin colisionar con los del español).
const NUEVAS = ["hat", "mouse", "cone", "sock", "foot", "rain"];

const salida = resolve(dirname(fileURLToPath(import.meta.url)), "../public/pictogramas");
mkdirSync(salida, { recursive: true });

const traza = [];
for (const palabra of NUEVAS) {
  const archivo = `${palabra}.png`;
  const destino = resolve(salida, archivo);
  const res = await fetch(`${API}/${encodeURIComponent(palabra)}`);
  const mejor = res.ok ? (await res.json())[0] : null;
  if (!mejor?._id) {
    console.warn(`⚠️  sin pictograma para "${palabra}"`);
    continue;
  }
  const etiqueta = mejor.keywords?.[0]?.keyword ?? "";
  if (!existsSync(destino)) {
    const png = await fetch(`${ESTATICO}/${mejor._id}/${mejor._id}_${RESOLUCION}.png`);
    if (!png.ok) {
      console.warn(`⚠️  no se pudo descargar ${palabra} (${png.status})`);
      continue;
    }
    writeFileSync(destino, Buffer.from(await png.arrayBuffer()));
  }
  traza.push({ palabra, archivo, arasaacId: mejor._id, etiqueta });
  console.log(`✓ ${palabra.padEnd(7)} → ${archivo} (arasaac ${mejor._id}, «${etiqueta}»)`);
}
writeFileSync(resolve(salida, "lote-gemelas-en.json"), `${JSON.stringify(traza, null, 2)}\n`);
console.log(`\nOK → ${traza.length} pictogramas de gemelas en inglés.`);
