// Genera los iconos de la PWA (public/icons/icon-{192,512}.png) sin dependencias.
// Placeholder honesto del sprint 1: fondo sage (paleta operador) con un globo crema — el mismo
// globo que el niño mueve con la voz. Se refina en el gate visual con el usuario.
// Uso: node scripts/gen-iconos.mjs

import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SAGE = [46, 70, 40]; // #2E4628
const CREAM = [251, 248, 242]; // #FBF8F2

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

function png(size) {
  const cx = size / 2;
  const cyGlobo = size * 0.44;
  const rGlobo = size * 0.26;

  // Filas RGB con filtro 0 (sin filtro) al inicio de cada una.
  const filas = [];
  for (let y = 0; y < size; y++) {
    const fila = Buffer.alloc(1 + size * 3);
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cyGlobo;
      const dentroGlobo = (dx * dx) / (rGlobo * rGlobo) + (dy * dy) / (rGlobo * 1.15 * (rGlobo * 1.15)) <= 1;
      // Cuerdita del globo.
      const enCuerda =
        y > cyGlobo + rGlobo * 1.05 &&
        y < size * 0.82 &&
        Math.abs(dx - Math.sin((y / size) * 12) * size * 0.02) < size * 0.012;

      const [r, g, b] = dentroGlobo || enCuerda ? CREAM : SAGE;
      const off = 1 + x * 3;
      fila[off] = r;
      fila[off + 1] = g;
      fila[off + 2] = b;
    }
    filas.push(fila);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type: truecolor RGB
  // 10-12: compression, filter, interlace = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(Buffer.concat(filas), { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const destino = resolve(dirname(fileURLToPath(import.meta.url)), "../public/icons");
mkdirSync(destino, { recursive: true });
for (const size of [192, 512]) {
  const archivo = resolve(destino, `icon-${size}.png`);
  writeFileSync(archivo, png(size));
  console.log(`OK → ${archivo}`);
}
