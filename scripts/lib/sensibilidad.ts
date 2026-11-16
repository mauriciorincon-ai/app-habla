// El GATE DE SENSIBILIDAD (Sprint 005) — la parte que comparten el generador de hashes, el test
// y el informe.
//
// Por qué existe: este repo es PÚBLICO y la app es sobre un niño real. La lista de términos que
// no pueden aparecer en lo que se publica (condiciones, etiquetas, jerga, marcas de métodos,
// instrumentos) vive en la planeadora, PRIVADA. Al repo viaja solo un archivo de HASHES de esos
// términos, y el test compara los n-gramas del contenido público contra ese conjunto: cero
// coincidencias. Ni el test, ni el informe, ni la bitácora escriben jamás un término — cuando
// hay coincidencia se reporta archivo, línea y tamaño del n-grama, nada más.
//
// Normalización (idéntica a ambos lados): minúsculas · sin acentos · todo lo que no sea letra o
// número se vuelve espacio (así «p-algo» y «p algo» son lo mismo) · n-gramas de 1 a 5 palabras
// (S5: la lista traía un término de 4 palabras; S6: la lista ampliada trae tres de 5 — con menos
// no se cazarían).

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

export const N_MAX = 5;

export function normalizar(texto: string): string[] {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

export function sha256(s: string): string {
  return createHash("sha256").update(s, "utf8").digest("hex");
}

/** Hash de un término de la lista (ya normalizado a sus palabras). */
export function hashDeTermino(palabras: string[]): string {
  return sha256(palabras.join(" "));
}

export type Coincidencia = { linea: number; n: number };

/**
 * Recorre el texto línea a línea, arma los n-gramas (1..N_MAX) de cada línea y devuelve dónde
 * hubo coincidencia con el conjunto de hashes. Nunca devuelve el texto que coincidió.
 */
export function buscarCoincidencias(
  texto: string,
  hashes: Set<string>,
): Coincidencia[] {
  const out: Coincidencia[] = [];
  const lineas = texto.split("\n");
  for (let i = 0; i < lineas.length; i++) {
    const palabras = normalizar(lineas[i]);
    for (let a = 0; a < palabras.length; a++) {
      for (let n = 1; n <= N_MAX && a + n <= palabras.length; n++) {
        if (hashes.has(hashDeTermino(palabras.slice(a, a + n)))) {
          out.push({ linea: i + 1, n });
        }
      }
    }
  }
  return out;
}

/** Recorta un archivo a la parte que produjo este sprint, por marcadores. */
export type Alcance =
  | string
  | { archivo: string; desde: string }
  | { archivo: string; entre: [string, string] }
  /** Todo el archivo MENOS lo que va entre los marcadores (p. ej. contenido previo al sprint embebido). */
  | { archivo: string; excepto: [string, string] };

export function recortar(texto: string, alcance: Alcance): string {
  if (typeof alcance === "string") return texto;
  if ("desde" in alcance) {
    const i = texto.indexOf(alcance.desde);
    return i === -1 ? "" : texto.slice(i);
  }
  if ("excepto" in alcance) {
    const [ini, fin] = alcance.excepto;
    let out = "";
    let desde = 0;
    for (;;) {
      const i = texto.indexOf(ini, desde);
      if (i === -1) break;
      const j = texto.indexOf(fin, i + ini.length);
      out += texto.slice(desde, i) + "\n";
      if (j === -1) return out; // marcador sin cierre: lo que sigue no entra
      desde = j + fin.length;
    }
    return out + texto.slice(desde);
  }
  const [ini, fin] = alcance.entre;
  let out = "";
  let desde = 0;
  for (;;) {
    const i = texto.indexOf(ini, desde);
    if (i === -1) break;
    const j = texto.indexOf(fin, i + ini.length);
    if (j === -1) {
      out += texto.slice(i + ini.length);
      break;
    }
    out += texto.slice(i + ini.length, j) + "\n";
    desde = j + fin.length;
  }
  return out;
}

export function archivoDe(alcance: Alcance): string {
  return typeof alcance === "string" ? alcance : alcance.archivo;
}

/**
 * LO QUE EL GATE VIGILA (falla el test), desde el S16: TODO el repo. Cada archivo versionado o nuevo (no
 * ignorado) con extensión de texto entra entero, sin listas a mano ni recortes por marcador. Quedan fuera
 * solo tres: `CLAUDE.md` (lo escribe la planeadora y nombra la lista), el fixture de hashes y el lockfile.
 * El informe (`scripts/sensibilidad-informe.mjs`) recorre el mismo universo y solo reporta.
 */
export const EXTENSIONES_GATE = /\.(md|html|ts|tsx|mjs|json|txt)$/;
export const EXCLUIDOS_GATE = new Set(["CLAUDE.md", "tests/fixtures/sensibilidad-hashes.json", "pnpm-lock.yaml"]);

export function alcanceGate(raiz: string): string[] {
  return execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard"], {
    cwd: raiz,
    encoding: "utf8",
  })
    .split("\n")
    .filter((f) => f && EXTENSIONES_GATE.test(f) && !EXCLUIDOS_GATE.has(f) && existsSync(join(raiz, f)))
    .sort();
}

export const ALCANCE_GATE: Alcance[] = alcanceGate(join(import.meta.dirname, "..", ".."));

/**
 * Las EDADES no son términos de la lista: esta guardia las busca por forma («N años», «N–M años», «el
 * hermano (N», «tiene N años» y sus formas en inglés) en el mismo universo del gate.
 */
export const EDAD = [
  /\b\d{1,2}\s*(?:[–-]\s*\d{1,2}\s*)?años\b/i,
  /hermano\s*\(\s*\d{1,2}/i,
  /\btiene\s+\d{1,2}\s+años\b/i,
  /\b\d{1,2}\s*(?:[–-]\s*\d{1,2}\s*)?[- ]?years?[- ]?(?:old)?\b/i,
  /\bage[sd]?\s+\d{1,2}\b/i,
  /\b(?:brother|sister)\s*\(\s*\d{1,2}/i,
];

export function lineasConEdad(texto: string): number[] {
  return texto.split("\n").flatMap((l, i) => (EDAD.some((r) => r.test(l)) ? [i + 1] : []));
}

/**
 * S7 «dos idiomas»: los directorios con el texto del adulto en los dos idiomas. Ya los cubre el gate
 * entero; los recorre `tests/unit/gate-idiomas.test.ts` (paridad y copy del inglés).
 */
export const DIRS_IDIOMAS = ["src/lib/idioma", "content/capsulas-en", "content/fichas-en", "content/contacto-visual-en"];

export function archivosDeIdiomas(raiz: string): string[] {
  const out: string[] = [];
  const andar = (rel: string) => {
    const abs = join(raiz, rel);
    if (!existsSync(abs)) return;
    for (const nombre of readdirSync(abs).sort()) {
      const r = `${rel}/${nombre}`;
      if (statSync(join(raiz, r)).isDirectory()) andar(r);
      else if (/\.(ts|tsx)$/.test(nombre)) out.push(r);
    }
  };
  DIRS_IDIOMAS.forEach(andar);
  return out;
}

/** Nombre legible de un alcance, único aunque el archivo se vigile por varias secciones. */
export function nombreDe(alcance: Alcance): string {
  if (typeof alcance === "string") return alcance;
  if ("desde" in alcance) return `${alcance.archivo} (desde su marcador)`;
  if ("excepto" in alcance) return `${alcance.archivo} (salvo ${alcance.excepto[0]})`;
  return `${alcance.archivo} (${alcance.entre[0]})`;
}
