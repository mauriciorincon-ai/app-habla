// Genera los iconos de la PWA (public/icons/) SIN dependencias — encoder PNG a mano con node:zlib.
// Deuda del remate S4: de placeholder a iconos REALES del design system. El emblema es el GLOBO
// —el personaje que la voz del niño mueve— en crema sobre verde salvia (paleta operador
// "Clínica cálida"). Se generan tres:
//   - icon-192.png, icon-512.png        → el icono normal (globo grande, centrado).
//   - icon-512-maskable.png             → variante MASKABLE: el globo vive dentro de la zona segura
//                                          (~60 % central) para que el recorte del sistema (círculo,
//                                          squircle) no lo corte. Fondo sólido, sin transparencia.
// Uso: node scripts/gen-iconos.mjs   ·   El sw.js sirve estos assets por URL (no fija hashes),
// así que regenerarlos con el MISMO nombre basta.

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SAGE = [46, 70, 40]; // #2E4628 sage-700 (acento operador)
const CREAM = [251, 248, 242]; // #FBF8F2 cream-50
const SAGE_CLARO = [63, 95, 55]; // #3F5F37 sage-600 (brillo sutil del globo)

function crc32(buf) {
  let c = ~0;
  for (const byte of buf) {
    c ^= byte;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo, "ascii"), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

/** `escala` = qué tan grande es el globo respecto al lienzo (menor = más margen, para maskable). */
function png(size, escala) {
  const cx = size / 2;
  const cyGlobo = size * (0.5 - escala * 0.06); // el globo, un pelín arriba del centro
  const rx = size * escala * 0.3;
  const ry = rx * 1.18; // óvalo: un poco más alto que ancho

  const filas = [];
  for (let y = 0; y < size; y++) {
    const fila = Buffer.alloc(1 + size * 3); // filtro 0 al inicio de cada fila
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cyGlobo;
      const dentroGlobo = (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
      // Brillo: un óvalo pequeño arriba-izquierda del globo.
      const bx = x - (cx - rx * 0.35);
      const by = y - (cyGlobo - ry * 0.35);
      const enBrillo =
        dentroGlobo &&
        (bx * bx) / (rx * 0.32 * (rx * 0.32)) +
          (by * by) / (ry * 0.32 * (ry * 0.32)) <=
          1;
      // Nudo del globo (triangulito bajo el óvalo).
      const yNudo = cyGlobo + ry;
      const enNudo =
        y >= yNudo &&
        y < yNudo + size * escala * 0.03 &&
        Math.abs(dx) < size * escala * 0.03 * (1 - (y - yNudo) / (size * escala * 0.03));
      // Cuerdita ondulada que cuelga del nudo.
      const yCuerdaFin = size * (0.5 + escala * 0.28);
      const enCuerda =
        y > yNudo + size * escala * 0.02 &&
        y < yCuerdaFin &&
        Math.abs(dx - Math.sin((y / size) * 16) * size * escala * 0.02) <
          size * 0.008;

      let color = SAGE;
      if (dentroGlobo || enNudo || enCuerda) color = CREAM;
      if (enBrillo) color = SAGE_CLARO;

      const off = 1 + x * 3;
      fila[off] = color[0];
      fila[off + 1] = color[1];
      fila[off + 2] = color[2];
    }
    filas.push(fila);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor RGB (sin alfa: fondo sólido, requisito de maskable)

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.concat(filas), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const destino = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/icons",
);
mkdirSync(destino, { recursive: true });

// Icono normal: globo grande (escala 1). Maskable: globo dentro de la zona segura (escala 0.72).
const salidas = [
  { archivo: "icon-192.png", size: 192, escala: 1 },
  { archivo: "icon-512.png", size: 512, escala: 1 },
  { archivo: "icon-512-maskable.png", size: 512, escala: 0.72 },
];
for (const { archivo, size, escala } of salidas) {
  const ruta = resolve(destino, archivo);
  writeFileSync(ruta, png(size, escala));
  console.log(`OK → ${ruta}`);
}
