import { z } from "zod";
import type { Idioma } from "@/lib/idioma";
import { ETAPAS, type Etapa } from "./schema";

/**
 * PALABRAS GEMELAS — pares mínimos en es-CO (Outcome 3, VISION § 1).
 *
 * Un par mínimo son dos palabras que suenan casi igual y se distinguen por UN solo sonido
 * (foca/boca, pato/gato). El juego: el niño dice una, y **el PADRE marca cuál oyó** (ADR-009 — el
 * padre juzga, no un reconocedor; jamás se graba ni se analiza la voz del niño para esto). Es
 * práctica fonológica jugando (investigación § A.4: pares mínimos es lo más "app-able" para 4-6
 * años — contenido estructurado + audio pregrabado + juicio del padre).
 *
 * NIVEL (ADR-005): pares mínimos exigen que el niño INTENTE dos palabras distintas → viven en
 * "palabras-sueltas" hacia arriba, nunca en "sonidos-e-intentos" (ahí todavía no dice palabras).
 * `etapaMinima` lo declara; el motor de rondas filtra por la etapa activa.
 *
 * Los dibujos son ARASAAC (CC BY-NC-SA, misma licencia que el lote principal — LICENCIA.md).
 * pato/gato/luna reusan pictos del lote de palabra↔objeto; el resto se bajó con
 * `scripts/descargar-gemelas.mjs`. En runtime cero red (e2e lo vigila).
 */

const ORDEN_ETAPA: Record<Etapa, number> = {
  "sonidos-e-intentos": 0,
  "palabras-sueltas": 1,
  "primeras-frases": 2,
};

/** ¿El par es jugable en la etapa activa? (su etapa mínima ya se alcanzó). */
export function parJugableEn(par: ParGemelo, etapa: Etapa): boolean {
  return ORDEN_ETAPA[etapa] >= ORDEN_ETAPA[par.etapaMinima];
}

const PalabraGemelaSchema = z.object({
  /** La palabra en es-CO (se muestra escrita y se puede grabar con la voz familiar). */
  palabra: z.string().min(1).max(20),
  /** Archivo dentro de public/pictogramas/. */
  archivo: z.string().regex(/^[a-z0-9-]+\.png$/),
});

export const ParGemeloSchema = z.object({
  id: z.string().min(1),
  etapaMinima: z.enum(ETAPAS),
  /** Qué sonido cambia entre las dos palabras (para el guion del padre, no para el niño). */
  contraste: z.string().min(1).max(40),
  a: PalabraGemelaSchema,
  b: PalabraGemelaSchema,
});

export type ParGemelo = z.infer<typeof ParGemeloSchema>;

/** Mínimo del sprint: ≥6 pares, todos jugables desde "palabras-sueltas" (el default). */
export const LoteParesSchema = z
  .array(ParGemeloSchema)
  .min(6)
  .refine((pares) => pares.some((p) => p.etapaMinima === "palabras-sueltas"), {
    message: "Debe haber pares jugables en la etapa por defecto.",
  })
  .refine((pares) => new Set(pares.map((p) => p.id)).size === pares.length, {
    message: "Los ids de los pares deben ser únicos.",
  });

export const PARES_GEMELOS: ParGemelo[] = [
  {
    id: "pato-gato",
    etapaMinima: "palabras-sueltas",
    contraste: "la p y la g al empezar",
    a: { palabra: "pato", archivo: "pato.png" },
    b: { palabra: "gato", archivo: "gato.png" },
  },
  {
    id: "mano-mono",
    etapaMinima: "palabras-sueltas",
    contraste: "la a y la o del medio",
    a: { palabra: "mano", archivo: "mano.png" },
    b: { palabra: "mono", archivo: "mono.png" },
  },
  {
    id: "foca-boca",
    etapaMinima: "palabras-sueltas",
    contraste: "la f y la b al empezar",
    a: { palabra: "foca", archivo: "foca.png" },
    b: { palabra: "boca", archivo: "boca.png" },
  },
  {
    id: "casa-taza",
    etapaMinima: "palabras-sueltas",
    contraste: "la c y la t al empezar",
    a: { palabra: "casa", archivo: "casa.png" },
    b: { palabra: "taza", archivo: "taza.png" },
  },
  {
    id: "luna-cuna",
    etapaMinima: "palabras-sueltas",
    contraste: "la l y la c al empezar",
    a: { palabra: "luna", archivo: "luna.png" },
    b: { palabra: "cuna", archivo: "cuna.png" },
  },
  {
    id: "gota-bota",
    etapaMinima: "palabras-sueltas",
    contraste: "la g y la b al empezar",
    a: { palabra: "gota", archivo: "gota.png" },
    b: { palabra: "bota", archivo: "bota.png" },
  },
  // ── Ampliación del gate S4 (bloque L: "si son pocas necesitamos más") ──────────────────────
  // Misma investigación § A.4; pictos revisados visualmente (se descartaron "rama" y "piso" por
  // depender de flechas didácticas o escenas abstractas — débiles a esa edad).
  {
    id: "rana-lana",
    etapaMinima: "palabras-sueltas",
    contraste: "la r y la l al empezar",
    a: { palabra: "rana", archivo: "rana.png" },
    b: { palabra: "lana", archivo: "lana.png" },
  },
  {
    id: "sol-sal",
    etapaMinima: "palabras-sueltas",
    contraste: "la o y la a del medio",
    a: { palabra: "sol", archivo: "sol.png" },
    b: { palabra: "sal", archivo: "sal.png" },
  },
  {
    id: "toro-loro",
    etapaMinima: "palabras-sueltas",
    contraste: "la t y la l al empezar",
    a: { palabra: "toro", archivo: "toro.png" },
    b: { palabra: "loro", archivo: "loro.png" },
  },
  {
    id: "casa-cama",
    etapaMinima: "palabras-sueltas",
    contraste: "la s y la m del medio",
    a: { palabra: "casa", archivo: "casa.png" },
    b: { palabra: "cama", archivo: "cama.png" },
  },
  {
    id: "queso-beso",
    etapaMinima: "palabras-sueltas",
    contraste: "la q y la b al empezar",
    a: { palabra: "queso", archivo: "queso.png" },
    b: { palabra: "beso", archivo: "beso.png" },
  },
  {
    id: "moto-mono",
    etapaMinima: "palabras-sueltas",
    contraste: "la t y la n del medio",
    a: { palabra: "moto", archivo: "moto.png" },
    b: { palabra: "mono", archivo: "mono.png" },
  },
];

/**
 * PARES MÍNIMOS DEL INGLÉS (S8, regla 20): no son los del español traducidos — foca/boca no es un par en
 * inglés. Cada par se distingue por UN sonido del inglés (bed/bell, boat/boot, house/mouse) y usa los
 * dibujos que ya viajan (los del lote y los de gemelas) más los que baja `scripts/descargar-gemelas-en.mjs`,
 * todos ARASAAC (CC BY-NC-SA, misma atribución). La etiqueta de cada dibujo es la `en` de pictogramas.ts
 * (o la de ARASAAC): bone = hueso, boat = barco, boot = bota, bell = campana, bull = toro, rock = roca…
 */
export const PARES_GEMELOS_EN: ParGemelo[] = [
  { id: "hat-cat", etapaMinima: "palabras-sueltas", contraste: "the h and the c at the start",
    a: { palabra: "hat", archivo: "hat.png" }, b: { palabra: "cat", archivo: "gato.png" } },
  { id: "house-mouse", etapaMinima: "palabras-sueltas", contraste: "the h and the m at the start",
    a: { palabra: "house", archivo: "casa.png" }, b: { palabra: "mouse", archivo: "mouse.png" } },
  { id: "mouth-mouse", etapaMinima: "palabras-sueltas", contraste: "the th and the s at the end",
    a: { palabra: "mouth", archivo: "boca.png" }, b: { palabra: "mouse", archivo: "mouse.png" } },
  { id: "bed-bell", etapaMinima: "palabras-sueltas", contraste: "the d and the l at the end",
    a: { palabra: "bed", archivo: "cama.png" }, b: { palabra: "bell", archivo: "campana.png" } },
  { id: "bull-bell", etapaMinima: "palabras-sueltas", contraste: "the u and the e in the middle",
    a: { palabra: "bull", archivo: "toro.png" }, b: { palabra: "bell", archivo: "campana.png" } },
  { id: "boat-boot", etapaMinima: "palabras-sueltas", contraste: "the long o and the oo in the middle",
    a: { palabra: "boat", archivo: "barco.png" }, b: { palabra: "boot", archivo: "bota.png" } },
  { id: "bone-cone", etapaMinima: "palabras-sueltas", contraste: "the b and the c at the start",
    a: { palabra: "bone", archivo: "hueso.png" }, b: { palabra: "cone", archivo: "cone.png" } },
  { id: "rock-sock", etapaMinima: "palabras-sueltas", contraste: "the r and the s at the start",
    a: { palabra: "rock", archivo: "roca.png" }, b: { palabra: "sock", archivo: "sock.png" } },
  { id: "rain-train", etapaMinima: "palabras-sueltas", contraste: "the r and the tr at the start",
    a: { palabra: "rain", archivo: "rain.png" }, b: { palabra: "train", archivo: "tren.png" } },
];

/** Los pares del idioma de la pantalla: en inglés se juega con los del inglés, no con los del español. */
export function paresDe(idioma: Idioma): ParGemelo[] {
  return idioma === "en" ? PARES_GEMELOS_EN : PARES_GEMELOS;
}

/** Todas las palabras del banco de gemelas (para el catálogo de grabación del banco de voz). */
export function palabrasDeGemelos(idioma: Idioma = "es"): { palabra: string; archivo: string }[] {
  return paresDe(idioma).flatMap((p) => [p.a, p.b]);
}
