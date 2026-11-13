import type { Catalogo } from "../index";

// «Palabra y dibujo» y «Palabras gemelas»: lo que el adulto lee, en los dos idiomas. En inglés se
// practica en inglés (S8, regla 20): los dibujos llevan su etiqueta inglesa y los pares son pares
// mínimos del inglés; este catálogo es solo la voz de la pantalla.
export const palabras = {
  tituloPestana: { es: "Palabra y dibujo · Hablemos San", en: "Word and picture · Hablemos San" },
  titulo: { es: "Cada dibujo tiene su palabra", en: "Every picture has its word" },
  intro: {
    antes: { es: "Aparece un dibujo con su nombre.", en: "A picture appears with its name." },
    usted: { es: "Usted lo nombra", en: "You say its name" },
    medio: {
      es: "—una sola palabra— y espera. El dibujo se enciende con",
      en: "—just one word— and wait. The picture lights up with",
    },
    cualquier: { es: "cualquier sonido", en: "any sound" },
    despues: {
      es: "que él haga: la app no le exige la palabra ni juzga si la dijo bien. Eso lo sabe usted. Nada de lo que él diga se graba ni sale de este dispositivo.",
      en: "your child makes: the app doesn't ask for the word or judge whether it was said right. You're the one who knows. Nothing they say is recorded or leaves this device.",
    },
  },
  guion: {
    etiqueta: { es: "Palabra y dibujo", en: "Word and picture" },
    guion: {
      es: "Señala el dibujo, nómbralo UNA vez —“¡perro!”— y espera tres segundos en silencio.",
      en: "Point at the picture, say its name ONCE —“dog!”— and wait three seconds in silence.",
    },
    nota: {
      es: "El dibujo se enciende con CUALQUIER sonido que él haga: no tiene que decir la palabra ni pronunciarla bien. Si dijo algo parecido, el que lo sabe eres tú — la app no lo juzga.",
      en: "The picture lights up with ANY sound your child makes: they don't have to say the word or say it perfectly. If they said something close, you're the one who knows — the app doesn't judge it.",
    },
  },
  juego: {
    encendidos: { es: "Dibujos encendidos con su voz:", en: "Pictures lit up by their voice:" },
    tuOiste: { es: "Palabras que TÚ oíste:", en: "Words YOU heard:" },
    otroDibujo: { es: "Otro dibujo", en: "Another picture" },
    dijoPregunta: { es: "¿Dijo “{palabra}”? Tócalo tú", en: "Did they say “{palabra}”? Tap it yourself" },
    dijoAfirma: { es: "Dijiste que dijo “{palabra}”", en: "You said they said “{palabra}”" },
  },
  escenario: {
    oir: { es: "Oír “{palabra}”", en: "Hear “{palabra}”" },
    dijo: { es: "¡Dijo la palabra! Lo oíste tú.", en: "They said the word! You heard it." },
    salio: { es: "¡Le salió la voz! Lo intentó.", en: "Their voice came out! They tried." },
    espera: {
      es: "El dibujo espera su voz… nómbralo tú otra vez y espera.",
      en: "The picture is waiting for their voice… say its name again and wait.",
    },
    cualquierSonido: {
      es: "Cualquier sonido lo enciende. Nómbralo tú y espera.",
      en: "Any sound lights it up. Say its name and wait.",
    },
  },
  gemelas: {
    tituloPestana: { es: "Palabras gemelas · Hablemos San", en: "Twin words · Hablemos San" },
    titulo: { es: "Dos palabras que suenan casi igual", en: "Two words that sound almost alike" },
    intro: {
      antes: { es: "Salen dos dibujos parecidos (foca y boca, pato y gato).", en: "Two pictures that sound alike come up (bed and bell, boat and boot)." },
      pide: { es: "Usted le pide que diga uno", en: "You ask them to say one" },
      medio: {
        es: "y marca el que oyó. No hay respuesta correcta ni incorrecta para él: cualquier intento vale.",
        en: "and mark the one you heard. There is no right or wrong answer for them: any try counts.",
      },
      noOye: { es: "La app no oye la palabra", en: "The app doesn't hear the word" },
      despues: {
        es: "—no usa micrófono aquí—, el que la oye es usted.",
        en: "—it doesn't use the microphone here—, you're the one who hears it.",
      },
    },
    sinPares: {
      titulo: { es: "Las gemelas llegan un poquito después", en: "Twin words come a little later" },
      antes: { es: "Este juego es para cuando ya dice palabras sueltas. Ahora está en", en: "This game is for when they already say single words. Right now they're at" },
      despues: {
        es: ". Lo puedes cambiar en Ajustes cuando sea el momento — sin apuros.",
        en: ". You can change that in Settings whenever the time comes — no rush.",
      },
    },
    guion: {
      etiqueta: { es: "Palabras gemelas", en: "Twin words" },
      guion: {
        es: "Señala los dos dibujos, pídele que diga UNO, y marca tú el que oíste.",
        en: "Point at the two pictures, ask them to say ONE, and mark the one you heard yourself.",
      },
      nota: {
        es: "No hay respuesta correcta ni incorrecta para él: cualquier intento vale. La app no oye la palabra — el que la oye eres tú. Si hoy solo quiere mirar, también está bien.",
        en: "There is no right or wrong answer for them: any try counts. The app doesn't hear the word — you do. If they'd rather just look today, that's fine too.",
      },
    },
    salir: { es: "Salir", en: "Exit" },
    ronda: { es: "Ronda {n} de {total}", en: "Round {n} of {total}" },
    oidas: { es: "Palabras que le oíste:", en: "Words you heard from them:" },
    oir: { es: "Oír «{palabra}»", en: "Hear “{palabra}”" },
    cual: { es: "¿Cuál oíste?", en: "Which one did you hear?" },
    saltar: { es: "Hoy solo miramos esta — siguiente", en: "Today we only look at this one — next" },
    dijo: { es: "¡Dijo «{palabra}»!", en: "They said “{palabra}”!" },
    siguiente: { es: "Siguiente pareja", en: "Next pair" },
  },
} satisfies Catalogo;
