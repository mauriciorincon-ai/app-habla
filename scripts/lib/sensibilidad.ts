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
 * LO QUE EL GATE VIGILA (falla el test): todo lo que los sprints del documento de la mamá
 * producen y publican — contenido, documento generado, scripts, tests, bitácoras, summaries,
 * auditoría, propuestas, ADR, y las secciones S5/S6 de la guía y el manual (entre marcadores).
 * CLAUDE.md queda fuera (lo dice la lista). Las 24 del S5 siguen vigiladas aunque ya no se
 * publiquen en el documento (son la fuente de las fichas y el repo es público). El resto del repo
 * —incluidas las 50 cápsulas de la app, que no se tocan— lo cubre el INFORME
 * (scripts/sensibilidad-informe.mjs), que solo reporta.
 */
export const ALCANCE_GATE: Alcance[] = [
  // S7: los lotes de limpieza (README · manual · guía · brochure) quedaron en 0 coincidencias, así que
  // esos documentos entran ENTEROS (ya no solo los tramos s5/s6), junto con lo nuevo del sprint.
  "README.md",
  "docs/MANUAL-DE-USO.md",
  "docs/MANUAL-DE-USO.en.md",
  "docs/GUIA-DE-PRUEBA.html",
  "docs/BROCHURE.html",
  "docs/BLUEPRINT.html",
  "docs/REGLAS-ANEXO.md",
  "decisions/017-bilingual-es-en.md",
  // S6 «La pirámide»
  "content/fichas.ts",
  "docs/LA-PIRAMIDE.html",
  "scripts/gen-la-piramide.mjs",
  "tests/unit/fichas.test.ts",
  "tests/e2e/mirada.spec.ts",
  "sprints/SPRINT_006-implementation-log.md",
  "sprints/SPRINT_006-summary.md",
  "sprints/SPRINT_006-auditoria.md",
  "sprints/PROPUESTA-sprint-006-piramide.md",
  "decisions/016-la-piramide-fichas-y-retiro-del-registro.md",
  // S5 «Contacto visual» y lo compartido (el schema desde el dominio del S5 incluye el del S6)
  { archivo: "content/schema.ts", desde: "DOMINIO «CONTACTO VISUAL»" },
  "content/contacto-visual.ts",
  "scripts/copiar-documentos.mjs",
  "scripts/lib/catalogo-comun.mjs",
  "scripts/lib/sensibilidad.ts",
  "scripts/gen-sensibilidad-hashes.mjs",
  "scripts/sensibilidad-informe.mjs",
  "tests/unit/sensibilidad.test.ts",
  "tests/unit/contacto-visual-schema.test.ts",
  "sprints/SPRINT_005-implementation-log.md",
  "sprints/SPRINT_005-summary.md",
  "sprints/PROPUESTA-sprint-005-contacto-visual.md",
  "decisions/015-dominio-contacto-visual-y-gate-de-sensibilidad.md",
];

/**
 * S7 «dos idiomas»: todo lo que contiene el texto del adulto en los dos idiomas entra al gate. Son
 * directorios (los catálogos y las cápsulas en inglés crecen): cada archivo .ts/.tsx se vigila.
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

// S8: el dato nuevo del inglés (etiquetas, pares, diccionarios y vocabulario del alineador) entra al gate.
ALCANCE_GATE.push(
  "content/pictogramas.ts",
  "content/pares-gemelos.ts",
  "src/lib/objetivo/palabras-es.ts",
  "src/lib/objetivo/palabras-en.ts",
  "src/lib/objetivo/etiquetas-en.ts",
  "src/lib/objetivo/LICENCIA-diccionario.md",
  "src/lib/banco-voz/catalogo.ts",
  "scripts/gen-diccionario.mjs",
  // F2: la videoteca y su copy entran al gate desde el primer día.
  "src/lib/idioma/textos/videoteca.ts",
  "src/lib/videoteca/reglas.ts",
  "src/components/estudio/videoteca-cliente.tsx",
);

// S9 «cuentos de casa»: el resto del copy vigente (fuera de `sprints/`, que son bitácoras) quedó en 0 coincidencias
// y entra al gate para que no vuelva a crecer.
ALCANCE_GATE.push(
  ".claude/skills/diseno-ui.md",
  ".claude/skills/ia-embebida.md",
  ".claude/skills/security-owasp.md",
  "decisions/005-palabras-sueltas-primero.md",
  "decisions/006-etapas-del-habla-como-motor.md",
  "decisions/007-pitch-infantil-yin.md",
  "decisions/009-el-padre-juzga-la-palabra.md",
  "decisions/013-cohete-sin-fin.md",
  "design-system.md",
  "scripts/gen-iconos.mjs",
  "src/app/spike/audio/page.tsx",
  "src/components/ajustes/etapa-del-habla.tsx",
  "src/components/iconos.tsx",
  "src/components/juego/palabra-objeto.tsx",
  "src/lib/rumbo/hitos.ts",
  "src/lib/storage/local.ts",
  "tests/e2e/rumbo.spec.ts",
  "tests/unit/daily-coach.test.ts",
  // S9: contacto visual en «Hoy» (el copy de los dos idiomas ya vive en src/lib/idioma, que se vigila entero).
  "src/lib/coach/contacto-visual-hoy.ts",
  "src/components/hoy/contacto-visual-hoy.tsx",
  "src/components/ajustes/nivel-contacto-visual.tsx",
  "tests/unit/contacto-visual-hoy.test.ts",
  "tests/e2e/contacto-visual-hoy.spec.ts",
);

ALCANCE_GATE.push(...archivosDeIdiomas(join(import.meta.dirname, "..", "..")), "tests/unit/idioma.test.ts", "tests/unit/gate-idiomas.test.ts");

/** Nombre legible de un alcance, único aunque el archivo se vigile por varias secciones. */
export function nombreDe(alcance: Alcance): string {
  if (typeof alcance === "string") return alcance;
  if ("desde" in alcance) return `${alcance.archivo} (desde su marcador)`;
  if ("excepto" in alcance) return `${alcance.archivo} (salvo ${alcance.excepto[0]})`;
  return `${alcance.archivo} (${alcance.entre[0]})`;
}
