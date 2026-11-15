// Descarga UNA VEZ, en desarrollo, los pictogramas ARASAAC de «su mundo en todo» (S14, ADR-026): los
// COLORES y las ACCIONES (la etiqueta `colores` y la `acciones` llegan a los dibujos) y los que piden los
// pares de acción de gemelas. Misma licencia y atribución que el lote principal (CC BY-NC-SA, ARASAAC /
// Gobierno de Aragón: public/pictogramas/LICENCIA.md). En runtime la app NO llama a ARASAAC (e2e cero-red).
// NO destructivo: salta lo que ya existe y anota la traza en public/pictogramas/lote-su-mundo.json.
//
// Uso: node scripts/descargar-pictos-su-mundo.mjs   (los PNG resultantes se commitean)

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://api.arasaac.org/api/pictograms/es/bestsearch";
const ESTATICO = "https://static.arasaac.org/pictograms";
const RESOLUCION = 500;

// Búsqueda en ARASAAC (español) → archivo. La palabra visible vive en content/pictogramas.ts.
const NUEVAS = [
  ["rojo", "rojo.png"],
  ["azul", "azul.png"],
  ["amarillo", "amarillo.png"],
  ["verde", "verde.png"],
  ["comer", "comer.png"],
  ["beber", "beber.png"],
  ["saltar", "saltar.png"],
  ["correr", "correr.png"],
  ["dormir", "dormir.png"],
  ["lavar las manos", "lavar.png"],
  ["tocar", "tocar.png"],
  ["cavar", "cavar.png"],
  ["cerdo", "cerdo.png"],
  ["bañar", "banar.png"],
];

const salida = resolve(dirname(fileURLToPath(import.meta.url)), "../public/pictogramas");
mkdirSync(salida, { recursive: true });

const traza = [];
for (const [busqueda, archivo] of NUEVAS) {
  const destino = resolve(salida, archivo);
  const res = await fetch(`${API}/${encodeURIComponent(busqueda)}`);
  const mejor = res.ok ? (await res.json())[0] : null;
  if (!mejor?._id) {
    console.warn(`⚠️  sin pictograma para "${busqueda}"`);
    continue;
  }
  const etiqueta = mejor.keywords?.[0]?.keyword ?? "";
  if (!existsSync(destino)) {
    const png = await fetch(`${ESTATICO}/${mejor._id}/${mejor._id}_${RESOLUCION}.png`);
    if (!png.ok) {
      console.warn(`⚠️  no se pudo descargar ${busqueda} (${png.status})`);
      continue;
    }
    writeFileSync(destino, Buffer.from(await png.arrayBuffer()));
  }
  traza.push({ busqueda, archivo, arasaacId: mejor._id, etiqueta });
  console.log(`✓ ${busqueda.padEnd(9)} → ${archivo} (arasaac ${mejor._id}, «${etiqueta}»)`);
}
writeFileSync(resolve(salida, "lote-su-mundo.json"), `${JSON.stringify(traza, null, 2)}\n`);
console.log(`\nOK → ${traza.length} pictogramas de su mundo.`);
