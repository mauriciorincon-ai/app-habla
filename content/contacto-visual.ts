import type { CapsulaContactoVisual } from "./schema";

/**
 * Biblioteca de CONTACTO VISUAL (Sprint 005) — el documento que la mamá trabaja sin pantallas.
 *
 * ⚠️ FASE 0: estas cápsulas son DE PRUEBA. Existen solo para probar el generador del catálogo,
 * la ruta que lo sirve y el registro diario en un teléfono real. Se reemplazan ENTERAS en la
 * fase 2 por la progresión real (18–24 cápsulas ancladas a las actividades que describen las
 * fuentes de la investigación aprobada). Mientras tanto la biblioteca NO cumple su schema
 * completo (mínimo 18): el generador del catálogo lo detecta y marca el documento como prueba.
 *
 * (Solo `import type` desde ./schema, como en capsulas.ts: el generador corre con Node
 * quitando tipos y un import de valor sin extensión no resuelve ahí.)
 */
export const CAPSULAS_CONTACTO_VISUAL: CapsulaContactoVisual[] = [
  {
    id: "prueba-cosquillas-con-pausa",
    dominio: "contacto-visual",
    tecnica: "pausa-antes-de-lo-mejor",
    nivel: "n2",
    titulo: "Cosquillas que se detienen justo antes",
    explicacion:
      "Las cosquillas ya le sacan la mirada. Hoy solo les agregas un hueco: cuando ya va a llegar la parte que más le gusta, te detienes con las manos listas y la cara de «¿y ahora?». Ese instante lo llena él — con la mirada, con un brazo, con un sonido. Cuando aparece cualquiera de esas señales, sigues. No hace falta pedirle nada.",
    guion: "«¡Ahí vienen las cosquillas!… (pausa, manos listas, cara de espera)… ¡Aquí van!»",
    actividad: {
      texto:
        "En un momento en que ya esté contento, haz la ronda de cosquillas dos o tres veces igual. A la siguiente, detente justo antes de lo mejor: manos en el aire, cara expectante, tres segunditos. Si te mira, hace un gesto o un sonido, sigues de inmediato. Si nada, sigues igual y lo intentas otra vez más tarde.",
      duracion: "3–5 min",
      momentos: ["juego", "dormir"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No le pidas que te mire ni alargues la pausa hasta que se frustre: tres segundos y sigues, mire o no mire.",
    fuente: "Nomikou, 2017, Front Psychol · Muuvila, 2022",
  },
  {
    id: "prueba-dos-juguetes-iguales",
    dominio: "contacto-visual",
    tecnica: "hago-lo-que-el-hace",
    nivel: "n1",
    titulo: "Dos carros iguales: tú haces lo que él hace",
    explicacion:
      "Cuando alguien copia exactamente lo que hacemos, nos volvemos visibles para él sin que nadie nos lo pida. Con un juguete igual al suyo, copias en el momento lo que hace: si lo rueda, lo ruedas; si lo golpea, lo golpeas; si hace un sonido, lo haces. Nada más. En unos minutos suele voltear a mirar quién es ese que hace lo mismo que él.",
    guion: "Sin decir nada al principio. Cuando te mire: «¡Igual que tú!»",
    actividad: {
      texto:
        "Consigue dos juguetes iguales (dos carros, dos cucharas, dos bloques). Siéntate a su altura, de frente o al lado, y durante tres minutos copia todo lo que hace con el suyo. Cuando te mire, sonríe y sigue copiando. Si se levanta, copia también.",
      duracion: "3–5 min",
      momentos: ["juego"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No conviertas la copia en una clase («ahora haz tú esto»): hoy copias tú, nada más.",
    fuente: "Field, 2001 · Sanefuji, 2013, Infant Ment Health J",
  },
  {
    id: "prueba-misma-rutina-con-papa",
    dominio: "contacto-visual",
    tecnica: "misma-rutina-otra-persona",
    nivel: "n5",
    titulo: "Las mismas cosquillas, ahora con papá",
    explicacion:
      "Lo que ya funciona contigo no pasa solo a otras personas: hay que llevarlo. La regla de oro es cambiar UNA sola cosa a la vez: la persona nueva hace exactamente el mismo juego, con las mismas palabras y la misma pausa que tú. Persona nueva o juego nuevo, nunca los dos juntos.",
    guion: "Le explicas a papá: «Igualito que yo: dos rondas, y en la tercera te detienes antes de lo mejor».",
    actividad: {
      texto:
        "Elige la rutina que mejor le funciona contigo. Hazla tú primero una vez, con papá al lado mirando. Luego papá la hace igual, con tus mismas palabras y tu misma pausa, mientras tú te quedas cerca. Si él busca tu cara en la pausa, no pasa nada: papá sigue.",
      duracion: "5 min",
      momentos: ["juego", "dormir"],
      conPantalla: false,
    },
    conQuien: "otra-persona",
    queNoHacer:
      "No estrenes un juego nuevo con una persona nueva el mismo día: una sola cosa cambia a la vez.",
    fuente: "Stokes, 1977, J Appl Behav Anal · Kasari, 2015, J Consult Clin Psychol",
  },
];
