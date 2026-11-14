import type { Catalogo } from "../index";

// «El mapa de las vocales» (S10, ADR-021): juego EXPERIMENTAL. Cada texto nace {es, en} redactado;
// en inglés se practican los sonidos del inglés (ah, eh, ee, oh, oo). Siempre «quizás»: la app mide
// formantes, no juzga la vocal (regla dura 3); el color nunca va solo (letra + dibujo + color).
export const vocales = {
  tituloPestana: {
    es: "El mapa de las vocales · Hablemos San",
    en: "The vowel map · Hablemos San",
  },
  titulo: { es: "El mapa de las vocales", en: "The vowel map" },
  experimental: { es: "Experimental · en prueba", en: "Experimental · still testing" },
  avisoExperimental: {
    es: "Experimental: la app mide la forma del sonido y adivina, con margen de error, a qué vocal se parece. Puede equivocarse, sobre todo con voces muy agudas. Nada de lo que él diga se graba ni sale de este dispositivo.",
    en: "Experimental: the app measures the shape of the sound and guesses, with some margin of error, which vowel it resembles. It can be wrong, especially with very high voices. Nothing they say is recorded or leaves this device.",
  },
  intro: {
    antes: { es: "Cada vocal tiene su", en: "Every vowel has its own" },
    enfasis: { es: "zona del mapa", en: "spot on the map" },
    despues: {
      es: ": al estirar una vocal, la zona que se parece se enciende. Jueguen con a, e, i, o, u, una por una y también de una a otra. Nada de palabras.",
      en: ": when they stretch a vowel, the spot that sounds most like it lights up. Play with ah, eh, ee, oh, oo, one at a time and also from one to another. No words.",
    },
  },
  etiqueta: { es: "El mapa de las vocales", en: "The vowel map" },
  guion: {
    es: "“Estira una vocal: aaaa… eeee… iiii… oooo… uuuu. ¡Mira qué zona se enciende!”",
    en: "“Stretch a vowel: ahhh… ehhh… eeee… ohhh… oooo. Look which spot lights up!”",
  },
  nota: {
    es: "Hágalo usted primero, despacio y con la boca bien marcada: a muy abierta, i muy sonriente, o y u redondeadas. La zona que se enciende es solo una pista, con margen de error; lo que usted oye manda. Si hoy solo quiere mirar, también está bien.",
    en: "Go first, slowly, with a clearly shaped mouth: ah wide open, ee in a big smile, oh and oo rounded. The spot that lights up is only a hint, with a margin of error; what you hear is what counts. If they'd rather just watch today, that's fine too.",
  },
  invitacion: { es: "Estira una vocal: aaaa, eeee, iiii…", en: "Stretch a vowel: ahhh, ehhh, eeee…" },
  escuchando: { es: "El mapa escucha…", en: "The map is listening…" },
  quizas: { es: "Quizás suena como", en: "Maybe it sounds like" },
  mapaEtiqueta: { es: "Mapa de las cinco vocales", en: "Map of the five vowels" },
  zona: { es: "Zona de la vocal {v}: {forma}", en: "Spot for the vowel {v}: {forma}" },
  encendida: { es: "encendida", en: "lit up" },
  vistas: { es: "Zonas que ya sonaron:", en: "Spots that already sounded:" },
  cambios: { es: "Pasó de una a otra:", en: "Moved from one to another:" },
  vez: { es: "{n} vez", en: "{n} time" },
  veces: { es: "{n} veces", en: "{n} times" },
  forma: {
    a: { es: "círculo", en: "circle" },
    e: { es: "triángulo", en: "triangle" },
    i: { es: "rombo", en: "diamond" },
    o: { es: "cuadrado", en: "square" },
    u: { es: "estrella", en: "star" },
  },
  sonido: {
    a: { es: "a", en: "ah" },
    e: { es: "e", en: "eh" },
    i: { es: "i", en: "ee" },
    o: { es: "o", en: "oh" },
    u: { es: "u", en: "oo" },
  },
  celebracion: {
    antes: { es: "¡Sonaron", en: "You played with" },
    una: { es: "{n} zona del mapa", en: "{n} spot on the map" },
    varias: { es: "{n} zonas del mapa", en: "{n} spots on the map" },
    despues: { es: "con su voz!", en: "with their voice!" },
    cambios: { es: "Y pasó de una a otra", en: "And it moved from one to another" },
    cuerpo: {
      es: "Eso es lo que el medidor escuchó, con margen de error: la forma de su sonido se parecía a esas vocales. Si dijo bien la vocal, el que lo sabe eres tú — la app solo sugiere y no va a fingir que juzga.",
      en: "That is what the meter heard, with a margin of error: the shape of their sound resembled those vowels. If the vowel was said well, you're the one who knows — the app only suggests and won't pretend to judge.",
    },
    sinVoz: {
      es: "Hoy el mapa se quedó esperando",
      en: "Today the map stayed waiting",
    },
  },
} satisfies Catalogo;
