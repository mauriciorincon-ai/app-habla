// ALINEACIÓN DEL OBJETIVO DE LA SEMANA (Outcome 2) — motor PURO: sin DOM, sin storage, sin red.
//
// El padre escribe un objetivo en texto libre ("animales", "el baño", "más agua"). Esto lo
// convierte en un mapeo DETERMINISTA sobre el contenido: qué cápsulas, pictogramas y pares
// coinciden. Sin IA (quinto sprint con cero LLM) — es comparación de palabras normalizadas.
//
// Honestidad (regla dura 3 llevada al objetivo): si el objetivo no coincide con NADA ("colores",
// que no existe en el contenido), la app lo dice claro y no finge alinear algo. El objetivo NUNCA
// salta de etapa (ADR-005): alinea DENTRO de la etapa activa, jamás fuerza contenido de otra.

/** Palabras estructurales (artículos, preposiciones, conjunciones) de ≥3 letras que no aportan. */
const PALABRAS_VACIAS = new Set([
  "del",
  "las",
  "los",
  "una",
  "unas",
  "unos",
  "con",
  "por",
  "para",
  "que",
  "sus",
  "mis",
]);

/**
 * Normaliza un texto a sus palabras significativas: sin tildes, en minúsculas, sin signos, sin
 * palabras estructurales, y solo tokens de ≥3 letras. "El Baño de María" → ["bano", "maria"].
 */
export function normalizar(texto: string): string[] {
  return normalizarConForma(texto).map((t) => t.clave);
}

/**
 * Como `normalizar`, pero cada token conserva su FORMA real (eñes y tildes) junto a su clave
 * normalizada: "El Baño" → [{ forma: "baño", clave: "bano" }]. La clave COMPARA; la forma se
 * MUESTRA — una sugerencia debe decir «baño», jamás «bano» (hallazgo del gate S4, bloque O).
 * Misma tokenización que antes: las marcas diacríticas nunca separan palabras.
 */
export function normalizarConForma(
  texto: string,
): { forma: string; clave: string }[] {
  return texto
    .normalize("NFD")
    .toLowerCase()
    .split(/[^a-z0-9̀-ͯ]+/)
    .map((cruda) => ({
      forma: cruda.normalize("NFC"),
      clave: cruda.replace(/[̀-ͯ]/g, ""),
    }))
    .filter(({ clave }) => clave.length >= 3 && !PALABRAS_VACIAS.has(clave));
}

export type Alineacion = {
  /** ¿Hay un objetivo con al menos una palabra significativa? */
  activo: boolean;
  /** Las palabras normalizadas del objetivo (para depurar / mostrar). */
  tokens: string[];
  /** ¿Alguna de estas etiquetas coincide con el objetivo? (para las cápsulas). */
  coincideEtiquetas: (etiquetas: readonly string[]) => boolean;
  /** ¿Esta palabra suelta coincide? (para pictogramas y pares de gemelas). */
  coincidePalabra: (palabra: string) => boolean;
  /** ¿Este tema coincide? (para priorizar pictogramas del tema, p. ej. "animales"). */
  coincideTema: (tema: string) => boolean;
};

/**
 * Construye la alineación de un objetivo. Con texto vacío o solo estructural, `activo=false` y
 * todos los predicados devuelven `false` → el contenido se comporta EXACTAMENTE como sin objetivo
 * (identidad; es lo que garantiza que los e2e por semilla del S3 no se muevan).
 */
export function alinear(texto: string | null | undefined): Alineacion {
  const tokens = texto ? normalizar(texto) : [];
  const activo = tokens.length > 0;
  const objetivo = new Set(tokens);

  const comparte = (candidato: string): boolean => {
    for (const t of normalizar(candidato)) if (objetivo.has(t)) return true;
    return false;
  };

  return {
    activo,
    tokens,
    coincideEtiquetas: (etiquetas) => activo && etiquetas.some(comparte),
    coincidePalabra: (palabra) => activo && comparte(palabra),
    coincideTema: (tema) => activo && comparte(tema),
  };
}

export type Contenido = {
  capsulas: readonly { etiquetas: readonly string[] }[];
  pictos: readonly { palabra: string; tema: string }[];
  pares: readonly { a: { palabra: string }; b: { palabra: string } }[];
};

export type ResumenAlineacion = {
  activo: boolean;
  /** `activo` pero sin ninguna coincidencia (el caso honesto "colores"). */
  vacio: boolean;
  capsulas: number;
  /** Pictogramas distintos que coinciden (por palabra o por tema). */
  palabras: number;
  pares: number;
};

/**
 * Cuenta cuánto alinea un objetivo contra el contenido — insumo del preview honesto del /objetivo
 * ("con «animales»: N palabras y M cápsulas se priorizan") y del estado "sin coincidencias".
 */
export function contarAlineacion(
  alineacion: Alineacion,
  contenido: Contenido,
): ResumenAlineacion {
  if (!alineacion.activo) {
    return { activo: false, vacio: false, capsulas: 0, palabras: 0, pares: 0 };
  }
  const capsulas = contenido.capsulas.filter((c) =>
    alineacion.coincideEtiquetas(c.etiquetas),
  ).length;
  const palabras = contenido.pictos.filter(
    (p) =>
      alineacion.coincidePalabra(p.palabra) || alineacion.coincideTema(p.tema),
  ).length;
  const pares = contenido.pares.filter(
    (p) =>
      alineacion.coincidePalabra(p.a.palabra) ||
      alineacion.coincidePalabra(p.b.palabra),
  ).length;

  return {
    activo: true,
    vacio: capsulas + palabras + pares === 0,
    capsulas,
    palabras,
    pares,
  };
}
