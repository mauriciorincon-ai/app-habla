import { z } from "zod";
import { TEMAS } from "@/lib/storage/temas";

/**
 * El lote de pictogramas del juego palabra↔objeto (ADR 008).
 *
 * Los DIBUJOS son de ARASAAC (autor Sergio Palao, propiedad del Gobierno de Aragón, licencia
 * CC BY-NC-SA — atribución obligatoria, visible en Ajustes → Acerca de y en
 * `public/pictogramas/LICENCIA.md`). Las PALABRAS son nuestras y van en **es-CO**: el dibujo del
 * archivo `coche.png` se muestra como "carro", y `autobus.png` como "bus" — así se dice en la
 * casa de este niño, y así debe oírlo; en inglés se juega con `en`, la etiqueta inglesa del mismo
 * dibujo (S8, ADR-017).
 *
 * NIVEL: palabras sueltas (ADR 005). Sustantivos concretos y nombrables, cosas que existen en su
 * mundo. El juego NUNCA exige que el niño diga la palabra: cualquier vocalización cuenta; el
 * acierto lo juzga el padre, jamás la app.
 *
 * Los archivos se sirven desde el repo: en runtime NO hay ninguna llamada a ARASAAC (el e2e de
 * cero-red lo vigila). Para regenerar el lote: `node scripts/descargar-pictos.mjs`.
 */

export const PictogramaSchema = z.object({
  id: z.string().min(1),
  /** La palabra que se muestra y que el padre nombra — es-CO. */
  palabra: z.string().min(1).max(20),
  /**
   * La misma cosa en inglés (S8, regla 20): la etiqueta inglesa de ARASAAC, o la palabra corriente de
   * los niños cuando la de ARASAAC es rara (lorry→truck, aeroplane→plane, tortoise→turtle, stone→rock).
   */
  en: z.string().min(1).max(20),
  tema: z.enum(TEMAS),
  /** Archivo dentro de public/pictogramas/. */
  archivo: z.string().regex(/^[a-z0-9-]+\.png$/),
  /** Trazabilidad del pictograma original en ARASAAC (atribución y reemplazo futuro). */
  arasaacId: z.number().int().positive(),
});

export type Pictograma = z.infer<typeof PictogramaSchema>;

/** Mínimo del sprint: ≥40 pictogramas cubriendo los 6 temas del onboarding. */
export const LotePictogramasSchema = z
  .array(PictogramaSchema)
  .min(40)
  .refine(
    (pictos) => TEMAS.every((tema) => pictos.some((p) => p.tema === tema)),
    { message: "Cada tema de interés debe tener al menos un pictograma." },
  );

export const PICTOGRAMAS: Pictograma[] = [
  // Animales
  {
    id: "animales-perro",
    palabra: "perro",
    en: "dog",
    tema: "animales",
    archivo: "perro.png",
    arasaacId: 2517,
  },
  {
    id: "animales-gato",
    palabra: "gato",
    en: "cat",
    tema: "animales",
    archivo: "gato.png",
    arasaacId: 2406,
  },
  {
    id: "animales-pajaro",
    palabra: "pájaro",
    en: "bird",
    tema: "animales",
    archivo: "pajaro.png",
    arasaacId: 2490,
  },
  {
    id: "animales-caballo",
    palabra: "caballo",
    en: "horse",
    tema: "animales",
    archivo: "caballo.png",
    arasaacId: 2294,
  },
  {
    id: "animales-vaca",
    palabra: "vaca",
    en: "cow",
    tema: "animales",
    archivo: "vaca.png",
    arasaacId: 2609,
  },
  {
    id: "animales-pato",
    palabra: "pato",
    en: "duck",
    tema: "animales",
    archivo: "pato.png",
    arasaacId: 2563,
  },
  {
    id: "animales-conejo",
    palabra: "conejo",
    en: "rabbit",
    tema: "animales",
    archivo: "conejo.png",
    arasaacId: 2351,
  },
  {
    id: "animales-elefante",
    palabra: "elefante",
    en: "elephant",
    tema: "animales",
    archivo: "elefante.png",
    arasaacId: 2372,
  },

  // Carros y cosas que ruedan (es-CO: "carro", "bus")
  {
    id: "carros-carro",
    palabra: "carro",
    en: "car",
    tema: "carros",
    archivo: "coche.png",
    arasaacId: 2339,
  },
  {
    id: "carros-camion",
    palabra: "camión",
    en: "truck",
    tema: "carros",
    archivo: "camion.png",
    arasaacId: 2306,
  },
  {
    id: "carros-bus",
    palabra: "bus",
    en: "bus",
    tema: "carros",
    archivo: "autobus.png",
    arasaacId: 2262,
  },
  {
    id: "carros-moto",
    palabra: "moto",
    en: "motorcycle",
    tema: "carros",
    archivo: "moto.png",
    arasaacId: 2480,
  },
  {
    id: "carros-tren",
    palabra: "tren",
    en: "train",
    tema: "carros",
    archivo: "tren.png",
    arasaacId: 2603,
  },
  {
    id: "carros-avion",
    palabra: "avión",
    en: "plane",
    tema: "carros",
    archivo: "avion.png",
    arasaacId: 2264,
  },
  {
    id: "carros-bici",
    palabra: "bici",
    en: "bike",
    tema: "carros",
    archivo: "bicicleta.png",
    arasaacId: 2277,
  },

  // El espacio
  {
    id: "espacio-sol",
    palabra: "sol",
    en: "sun",
    tema: "espacio",
    archivo: "sol.png",
    arasaacId: 2798,
  },
  {
    id: "espacio-luna",
    palabra: "luna",
    en: "moon",
    tema: "espacio",
    archivo: "luna.png",
    arasaacId: 2933,
  },
  {
    id: "espacio-estrella",
    palabra: "estrella",
    en: "star",
    tema: "espacio",
    archivo: "estrella.png",
    arasaacId: 2752,
  },
  {
    id: "espacio-cohete",
    palabra: "cohete",
    en: "rocket",
    tema: "espacio",
    archivo: "cohete.png",
    arasaacId: 2344,
  },
  {
    id: "espacio-planeta",
    palabra: "planeta",
    en: "planet",
    tema: "espacio",
    archivo: "planeta.png",
    arasaacId: 2829,
  },
  {
    id: "espacio-nube",
    palabra: "nube",
    en: "cloud",
    tema: "espacio",
    archivo: "nube.png",
    arasaacId: 2883,
  },
  {
    id: "espacio-cielo",
    palabra: "cielo",
    en: "sky",
    tema: "espacio",
    archivo: "cielo.png",
    arasaacId: 6978,
  },

  // Dinosaurios (y su mundo)
  {
    id: "dinosaurios-dino",
    palabra: "dinosaurio",
    en: "dinosaur",
    tema: "dinosaurios",
    archivo: "dinosaurio.png",
    arasaacId: 2738,
  },
  {
    id: "dinosaurios-huevo",
    palabra: "huevo",
    en: "egg",
    tema: "dinosaurios",
    archivo: "huevo.png",
    arasaacId: 2427,
  },
  {
    id: "dinosaurios-hueso",
    palabra: "hueso",
    en: "bone",
    tema: "dinosaurios",
    archivo: "hueso.png",
    arasaacId: 2972,
  },
  {
    id: "dinosaurios-volcan",
    palabra: "volcán",
    en: "volcano",
    tema: "dinosaurios",
    archivo: "volcan.png",
    arasaacId: 6247,
  },
  {
    id: "dinosaurios-arbol",
    palabra: "árbol",
    en: "tree",
    tema: "dinosaurios",
    archivo: "arbol.png",
    arasaacId: 2256,
  },
  {
    id: "dinosaurios-roca",
    palabra: "roca",
    en: "rock",
    tema: "dinosaurios",
    archivo: "roca.png",
    arasaacId: 6594,
  },

  // Música
  {
    id: "musica-tambor",
    palabra: "tambor",
    en: "drum",
    tema: "musica",
    archivo: "tambor.png",
    arasaacId: 2578,
  },
  {
    id: "musica-guitarra",
    palabra: "guitarra",
    en: "guitar",
    tema: "musica",
    archivo: "guitarra.png",
    arasaacId: 2417,
  },
  {
    id: "musica-piano",
    palabra: "piano",
    en: "piano",
    tema: "musica",
    archivo: "piano.png",
    arasaacId: 2521,
  },
  {
    id: "musica-flauta",
    palabra: "flauta",
    en: "flute",
    tema: "musica",
    archivo: "flauta.png",
    arasaacId: 2396,
  },
  {
    id: "musica-campana",
    palabra: "campana",
    en: "bell",
    tema: "musica",
    archivo: "campana.png",
    arasaacId: 5938,
  },
  {
    id: "musica-cantar",
    palabra: "cantar",
    en: "sing",
    tema: "musica",
    archivo: "cantar.png",
    arasaacId: 2315,
  },

  // El mar
  {
    id: "mar-pez",
    palabra: "pez",
    en: "fish",
    tema: "mar",
    archivo: "pez.png",
    arasaacId: 2520,
  },
  {
    id: "mar-agua",
    palabra: "agua",
    en: "water",
    tema: "mar",
    archivo: "agua.png",
    arasaacId: 2248,
  },
  {
    id: "mar-barco",
    palabra: "barco",
    en: "boat",
    tema: "mar",
    archivo: "barco.png",
    arasaacId: 2273,
  },
  {
    id: "mar-concha",
    palabra: "concha",
    en: "shell",
    tema: "mar",
    archivo: "concha.png",
    arasaacId: 34625,
  },
  {
    id: "mar-playa",
    palabra: "playa",
    en: "beach",
    tema: "mar",
    archivo: "playa.png",
    arasaacId: 2826,
  },
  {
    id: "mar-pulpo",
    palabra: "pulpo",
    en: "octopus",
    tema: "mar",
    archivo: "pulpo.png",
    arasaacId: 3379,
  },
  {
    id: "mar-tortuga",
    palabra: "tortuga",
    en: "turtle",
    tema: "mar",
    archivo: "tortuga.png",
    arasaacId: 2596,
  },
];

/** La ruta pública del pictograma (los archivos viven en el repo — cero red en runtime). */
export function rutaPictograma(picto: Pictograma): string {
  return `/pictogramas/${picto.archivo}`;
}
