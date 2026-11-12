// La capa de idioma de Hablemos San — español e inglés (ADR-017, que sustituye al ADR-001).
//
// Cada texto nace como un mapa `{ es, en }` REDACTADO en los dos idiomas, uno al lado del otro: no
// se escribe en español para traducir después. En inglés se practica en inglés (regla 20): lo que
// cambia con el idioma no es solo la frase, también las palabras y los pares que se juegan.
//
// Esta capa es PURA: no toca React, ni el DOM, ni el navegador. El idioma elegido vive aparte
// (`estado.ts`). Nada de esto lleva datos de la familia (regla dura 8): los catálogos son copy de
// producto, jamás nombres ni edades.

export const IDIOMAS = ["es", "en"] as const;
export type Idioma = (typeof IDIOMAS)[number];
export const IDIOMA_POR_DEFECTO: Idioma = "es";

/** El nombre de cada idioma escrito en su propio idioma — para el conmutador. */
export const NOMBRE_PROPIO: Record<Idioma, string> = {
  es: "Español",
  en: "English",
};

/** El valor del atributo `lang` del documento para cada idioma. */
export const LANG_HTML: Record<Idioma, string> = { es: "es-CO", en: "en" };

export function esIdioma(valor: unknown): valor is Idioma {
  return typeof valor === "string" && (IDIOMAS as readonly string[]).includes(valor);
}

/** Un texto con sus dos caras. Los marcadores `{nombre}` se llenan con `Datos`. */
export interface Texto {
  readonly es: string;
  readonly en: string;
}

/** Un catálogo: textos agrupados por pantalla o por tema, anidables. */
export interface Catalogo {
  readonly [clave: string]: Texto | Catalogo | readonly (Texto | Catalogo)[];
}

export type Datos = Readonly<Record<string, string | number>>;

/** Elige la cara del texto y llena los marcadores `{nombre}`. Un marcador sin dato se deja tal cual. */
export function t(texto: Texto, idioma: Idioma, datos?: Datos): string {
  const base = texto[idioma];
  if (!datos) return base;
  return base.replace(/\{(\w+)\}/g, (m, k: string) => (k in datos ? String(datos[k]) : m));
}

/**
 * El idioma que piden las preferencias del navegador (en su orden): la primera que sea español o
 * inglés gana; si no hay ninguna, el defecto. Lo repite, en JavaScript plano, el script previo a la
 * pintura de `layout.tsx` — `tests/unit/idioma.test.ts` los mantiene de acuerdo.
 */
export function detectarIdioma(preferencias: readonly string[]): Idioma {
  for (const p of preferencias) {
    const base = p.toLowerCase().split("-")[0];
    if (base === "en") return "en";
    if (base === "es") return "es";
  }
  return IDIOMA_POR_DEFECTO;
}

/** Recorre un catálogo y entrega cada `Texto` con su ruta (para el test de paridad). */
export function* textosDe(c: Catalogo | Texto | readonly (Texto | Catalogo)[], ruta = ""): Generator<[string, Texto]> {
  if (esTexto(c)) {
    yield [ruta, c];
    return;
  }
  if (Array.isArray(c)) {
    for (let i = 0; i < c.length; i++) yield* textosDe(c[i], `${ruta}[${i}]`);
    return;
  }
  for (const [k, v] of Object.entries(c as Catalogo)) yield* textosDe(v, ruta ? `${ruta}.${k}` : k);
}

export function esTexto(v: unknown): v is Texto {
  return typeof v === "object" && v !== null && "es" in v && "en" in v && typeof (v as Texto).es === "string";
}
