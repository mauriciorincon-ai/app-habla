import type { Catalogo } from "../index";

// Ajustes y privacidad. Los nombres y las descripciones de las etapas (ADR 006) viven aquí, por
// clave de etapa: `content/schema.ts` guarda la versión en español que usan los tests y las cápsulas.
export const ajustes = {
  tituloPestana: {
    es: "Ajustes y privacidad · Hablemos San",
    en: "Settings and privacy · Hablemos San",
  },
  titulo: { es: "Ajustes y privacidad", en: "Settings and privacy" },
  etapa: {
    titulo: { es: "¿Cómo habla su hijo hoy?", en: "How does your child talk today?" },
    ayuda: {
      antes: {
        es: "Elija lo que ve en casa, no lo que quisiera ver. Las cápsulas del día se ajustan a esa etapa. ",
        en: "Choose what you see at home, not what you wish you saw. The daily capsules adjust to that stage. ",
      },
      fuerte: { es: "Cambiarla no borra nada:", en: "Changing it erases nothing:" },
      despues: {
        es: " el progreso y los días practicados se quedan como están, y puede volver cuando quiera.",
        en: " what you've done and the days you've practiced stay as they are, and you can go back whenever you like.",
      },
    },
    leyenda: { es: "Etapa del habla", en: "Speech stage" },
    elegida: { es: "Elegida", en: "Selected" },
    recomendada: { es: "Recomendada", en: "Recommended" },
    nombre: {
      "sonidos-e-intentos": { es: "Sonidos e intentos", en: "Sounds and attempts" },
      "palabras-sueltas": { es: "Palabras sueltas", en: "Single words" },
      "primeras-frases": { es: "Primeras frases", en: "First phrases" },
    },
    descripcion: {
      "sonidos-e-intentos": {
        es: "Todavía explora: hace sonidos, señala, lleva de la mano. Los intentos y los gestos son su forma de hablar.",
        en: "Still exploring: makes sounds, points, leads you by the hand. Attempts and gestures are their way of talking.",
      },
      "palabras-sueltas": {
        es: "Dice palabras de a una: “agua”, “mamá”, “carro”. Todavía no las junta — y no hace falta apurarlo.",
        en: "Says words one at a time: “water”, “mama”, “car”. Doesn't put them together yet — and there's no need to hurry.",
      },
      "primeras-frases": {
        es: "A veces junta dos palabras: “más agua”, “carro grande”. Sigue diciendo mucho de a una, y está bien.",
        en: "Sometimes puts two words together: “more water”, “big car”. Still says a lot of them one at a time, and that's fine.",
      },
    },
    sidudaAntes: { es: "Si duda, quédese en ", en: "If you're unsure, stay with " },
    sidudaFuerte: { es: "palabras sueltas", en: "single words" },
    sidudaDespues: {
      es: ": es donde más trabajo hace esta app, y de donde nace todo lo demás.",
      en: ": it's where this app does the most work, and where everything else grows from.",
    },
  },
  perfil: {
    titulo: { es: "Apodo y temas", en: "Nickname and topics" },
    aunNo: {
      antes: {
        es: "Aún no han empezado en este dispositivo. El apodo y los temas se eligen ",
        en: "You haven't started on this device yet. The nickname and topics are chosen ",
      },
      enlace: { es: "en la pantalla de Hoy", en: "on the Today screen" },
      despues: { es: ", la primera vez.", en: ", the first time." },
    },
    guardarCambios: { es: "Guardar cambios", en: "Save changes" },
    apodo: { es: "Apodo:", en: "Nickname:" },
    sinApodo: { es: "sin apodo", en: "no nickname" },
    temas: { es: "Temas:", en: "Topics:" },
    noBorra: {
      es: "Cambiarlos no borra nada: el progreso y los días practicados se quedan como están.",
      en: "Changing them erases nothing: what you've done and the days you've practiced stay as they are.",
    },
    cambiar: { es: "Cambiar apodo y temas", en: "Change nickname and topics" },
  },
  modoCalma: {
    titulo: { es: "Modo calma", en: "Calm mode" },
    descripcion: {
      es: "Colores de atardecer, sin medidor y sin meta. El globo sube mientras suena su voz y baja despacio en el silencio. Se puede activar también dentro del juego, en un toque.",
      en: "Sunset colors, no meter and no goal. The balloon rises while their voice sounds and slowly comes down in the quiet. You can also turn it on inside the game, with one tap.",
    },
  },
  apariencia: {
    titulo: { es: "Claro u oscuro", en: "Light or dark" },
    ayudaAntes: { es: "Cómo se ve ", en: "How " },
    ayudaFuerte: { es: "esta", en: "this" },
    ayudaDespues: {
      es: " pantalla, la tuya. La del niño es clara siempre — su juego no cambia de color según la hora.",
      en: " screen looks, your screen. The child's is always light — their game doesn't change color with the time of day.",
    },
    opciones: {
      sistema: {
        nombre: { es: "El del sistema", en: "The system's" },
        nota: { es: "Como tu computador", en: "Like your computer" },
      },
      claro: {
        nombre: { es: "Claro", en: "Light" },
        nota: { es: "Siempre claro", en: "Always light" },
      },
      oscuro: {
        nombre: { es: "Oscuro", en: "Dark" },
        nota: { es: "Siempre oscuro", en: "Always dark" },
      },
    },
    elegida: { es: "Elegida", en: "Selected" },
  },
  reducirAnimaciones: {
    titulo: { es: "Reducir animaciones", en: "Reduce animations" },
    descripcion: {
      es: "Quita los movimientos que no son parte del juego. (Si el sistema ya pide menos movimiento, la app lo respeta sin que toques nada.)",
      en: "Removes the movement that isn't part of the game. (If your system already asks for less motion, the app respects that without you touching anything.)",
    },
  },
  voz: {
    titulo: { es: "La voz de la familia", en: "The family's voice" },
    texto: {
      es: "Graba tu voz para que los juegos suenen con la voz que tu hijo conoce.",
      en: "Record your voice so the games sound like the voice your child knows.",
    },
    vas: { es: "Vas", en: "You're at" },
    deTotal: { es: "{grabados} de {total}", en: "{grabados} of {total}" },
    conTuVoz: { es: "con tu voz.", en: "with your voice." },
    soloAqui: {
      es: "Vive solo en este dispositivo; la voz de tu hijo nunca se graba.",
      en: "It lives only on this device; your child's voice is never recorded.",
    },
    gestionar: { es: "Grabar o gestionar mi voz", en: "Record or manage my voice" },
    grabar: { es: "Grabar mi voz", en: "Record my voice" },
    usar: { es: "Usar la voz de la familia", en: "Use the family's voice" },
    usarAyuda: {
      es: "Cuando está activo y hay grabaciones, los juegos suenan con tu voz. Apagarlo no borra nada.",
      en: "When it's on and there are recordings, the games sound like your voice. Turning it off erases nothing.",
    },
    siBorrar: { es: "Sí, borrar el banco de voz", en: "Yes, delete the voice bank" },
    mejorNo: { es: "Mejor no", en: "Never mind" },
    borrarSolo: { es: "Borrar solo el banco de voz", en: "Delete only the voice bank" },
  },
  borrar: {
    titulo: { es: "Borrar todos los datos", en: "Delete all data" },
    antes: {
      es: "Borra el apodo, los temas, los ajustes, el progreso y ",
      en: "Deletes the nickname, topics, settings, what you've done and ",
    },
    fuerte: { es: "el banco de voz de la familia", en: "the family's voice bank" },
    despues: {
      es: " de este dispositivo. No hay copia en ningún otro lado: cuando se borran, se van de verdad. (La voz de su hijo nunca se guardó, así que de él no hay nada que borrar.)",
      en: " from this device. There is no copy anywhere else: once deleted, they're really gone. (Your child's voice was never saved, so there is nothing of theirs to delete.)",
    },
    si: { es: "Sí, borrar todo", en: "Yes, delete everything" },
    mejorNo: { es: "Mejor no", en: "Never mind" },
    boton: { es: "Borrar mis datos", en: "Delete my data" },
  },
  mide: {
    titulo: { es: "Qué mide y qué NO mide esta app", en: "What this app measures and does NOT measure" },
    si: {
      titulo: { es: "Sí mide", en: "It does measure" },
      texto: {
        es: "Si hay voz (energía del sonido por encima del ruido de la casa), cuánto tiempo se sostiene y, en el cohete, si el tono de la voz sube o baja. Eso es todo lo que el juego sabe, y es lo único que la app va a afirmar.",
        en: "Whether there is a voice (sound energy above the noise of your home), how long it lasts and, in the rocket, whether the pitch of the voice goes up or down. That is all the game knows, and it is the only thing the app will claim.",
      },
    },
    no: {
      titulo: { es: "No mide", en: "It does not measure" },
      texto: {
        es: "No sabe qué palabra dijo su hijo, ni si la pronunció bien. Hoy ningún sistema evalúa con fiabilidad la pronunciación de un niño pequeño que apenas empieza a hablar en español. Por eso el juez del acierto es usted, no la app: aquí nadie felicita por felicitar.",
        en: "It doesn't know which word your child said, or whether they said it well. Today no system can reliably judge the pronunciation of a little one just starting to talk. That is why you are the judge of getting it right, not the app: here nobody cheers just to cheer.",
      },
    },
    voz: {
      titulo: { es: "Qué pasa con su voz", en: "What happens to their voice" },
      texto: {
        es: "El sonido se analiza en el momento, dentro de este dispositivo, y se descarta. No se graba, no se guarda y no viaja a ningún servidor. La cámara no se usa nunca.",
        en: "The sound is analyzed on the spot, inside this device, and thrown away. It is not recorded, not saved and never travels to any server. The camera is never used.",
      },
    },
    noEs: {
      titulo: { es: "Qué no es esta app", en: "What this app is not" },
      texto: {
        es: "No es terapia ni una evaluación, y no promete resultados en un plazo. Es práctica estructurada de estimulación en casa, complementaria a las terapias integrales del lenguaje de su hijo.",
        en: "It is not therapy, and it makes no promises about what will change. It is structured practice at home, to go alongside your child's speech and language therapies.",
      },
    },
  },
  dibujos: {
    titulo: { es: "Acerca de los dibujos", en: "About the pictures" },
    a: { es: "Los pictogramas del juego “Palabra y dibujo” son obra de ", en: "The pictograms in the “Word and picture” game are the work of " },
    b: { es: " para ", en: " for " },
    c: { es: ", que los distribuye bajo licencia ", en: ", which distributes them under the license " },
    d: { es: ". Son propiedad del ", en: ". They are the property of the " },
    gobierno: { es: "Gobierno de Aragón", en: "Government of Aragón" },
    e: {
      es: " (España). Esta app es personal y sin fines comerciales. Los dibujos viven dentro de la app: no se descargan de internet mientras juegan.",
      en: " (Spain). This app is personal and non-commercial. The pictures live inside the app: they are not downloaded from the internet while you play.",
    },
  },
  palabrasDiccionario: {
    titulo: { es: "Acerca de las palabras", en: "About the words" },
    a: {
      es: "Las sugerencias de ortografía del Objetivo salen de una lista de las palabras más usadas en libros, tomada de ",
      en: "The Goal's spelling suggestions come from a list of the most-used words in books, taken from ",
    },
    b: { es: ", publicada por Google bajo la licencia ", en: ", published by Google under the license " },
    c: {
      es: ". La lista vive dentro de la app y se carga solo cuando escribes un objetivo: no se descarga de internet mientras juegan.",
      en: ". The list lives inside the app and loads only when you write a goal: nothing is downloaded from the internet while you play.",
    },
  },
} satisfies Catalogo;
