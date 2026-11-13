// «Cuentos de casa» (S9, ADR-019). El adulto pide cuentos nuevos (el pedido lleva solo intereses en
// palabras generales y palabras meta), trae el lote, lee y aprueba cada uno; el niño ve la biblioteca de
// la app y lo aprobado. La narración es la voz del adulto grabada en este dispositivo, o su lectura en vivo.
export const cuentos = {
  adulto: {
    tituloPestana: {
      es: "Cuentos de casa · Hablemos San",
      en: "Stories at home · Hablemos San",
    },
    titulo: { es: "Cuentos de casa", en: "Stories at home" },
    salida: { es: "← La voz de la familia", en: "← The family's voice" },
    intro: {
      es: "Cuentos cortos, una palabra por página, con lo que a tu hijo le gusta. La app trae seis listos. Puedes pedir más: ninguno le llega sin que lo leas y lo apruebes.",
      en: "Short stories, one word per page, built on what your child enjoys. The app comes with six. You can ask for more: none reaches your child until you read and approve it.",
    },
    verLado: {
      es: "Ver los cuentos de tu hijo",
      en: "See your child's stories",
    },
  },
  pedido: {
    titulo: { es: "Lo que le gusta", en: "What your child enjoys" },
    ayuda: {
      es: "En palabras generales, separadas por comas: «trenes, animales». Llenan los cuentos de la app y van en el pedido. Nada más viaja: ni su nombre, ni su edad, ni su voz.",
      en: "In general words, separated by commas: «trains, animals». They fill the app's stories and go in the request. Nothing else travels: not their name, not their age, not their voice.",
    },
    intereses: { es: "Le gusta", en: "Enjoys" },
    palabras: {
      es: "Palabras que están practicando",
      en: "Words you are practicing",
    },
    guardar: { es: "Guardar", en: "Save" },
    guardado: {
      es: "✓ Guardado en este dispositivo.",
      en: "✓ Saved on this device.",
    },
    error: {
      es: "Revisa: cada gusto de una a tres palabras, sin números (hasta cinco); cada palabra, una sola (hasta ocho).",
      en: "Check: each interest one to three words, no numbers (up to five); each practice word a single word (up to eight).",
    },
    pedirTitulo: { es: "Pedir cuentos nuevos", en: "Ask for new stories" },
    pedirAyuda: {
      es: "Descarga el pedido y guárdalo en la carpeta privado/bandeja/ del proyecto. Luego corre /bandeja en Claude Code: escribe el lote ahí mismo. La app no envía nada a internet.",
      en: "Download the request and save it in the project's privado/bandeja/ folder. Then run /bandeja in Claude Code: it writes the batch right there. The app sends nothing to the internet.",
    },
    descargar: { es: "Descargar el pedido", en: "Download the request" },
    faltaGusto: {
      es: "Escribe al menos un gusto y guárdalo para pedir cuentos.",
      en: "Write and save at least one interest to ask for stories.",
    },
  },
  importar: {
    titulo: { es: "Traer un lote", en: "Bring in a batch" },
    ayuda: {
      es: "Elige el archivo lote-….json que dejó /bandeja. Cada cuento entra esperando tu lectura.",
      en: "Pick the lote-….json file that /bandeja left. Each story comes in waiting for you to read it.",
    },
    elegir: { es: "Elegir el archivo del lote", en: "Choose the batch file" },
    nuevos: {
      es: "{n} cuentos nuevos esperan tu lectura.",
      en: "{n} new stories are waiting for you to read.",
    },
    repetidos: {
      es: "{n} ya estaban y no se repitieron.",
      en: "{n} were already here and were not repeated.",
    },
    rechazados: { es: "{n} no entraron:", en: "{n} did not come in:" },
    invalido: {
      es: "Ese archivo no es un lote de cuentos de esta app. No entró nada.",
      en: "That file is not a story batch for this app. Nothing came in.",
    },
    motivo: {
      esquema: {
        es: "no tiene la forma de un cuento (páginas cortas, una palabra por página, sin cifras)",
        en: "it is not shaped like a story (short pages, one word per page, no digits)",
      },
      "plazo-o-puntaje": {
        es: "habla de plazos o de puntajes",
        en: "it talks about deadlines or keeping count",
      },
      "texto-a-agente": {
        es: "trae instrucciones en vez de un cuento",
        en: "it carries instructions instead of a story",
      },
      sensible: {
        es: "usa palabras que esta app no escribe",
        en: "it uses words this app does not write",
      },
      "id-repetido": {
        es: "repite un cuento que ya está",
        en: "it repeats a story already here",
      },
    },
  },
  revision: {
    titulo: { es: "Esperan tu lectura", en: "Waiting for you to read" },
    ayuda: {
      es: "Léelo entero. Solo lo que apruebas aparece en los cuentos de tu hijo.",
      en: "Read it all the way through. Only what you approve shows up in your child's stories.",
    },
    vacio: { es: "No hay cuentos esperando.", en: "No stories are waiting." },
    aprobar: { es: "✓ Aprobar", en: "✓ Approve" },
    rechazar: { es: "✕ Este no", en: "✕ Not this one" },
    aprobados: { es: "Aprobados: {n}", en: "Approved: {n}" },
    rechazadosCuenta: { es: "Rechazados: {n}", en: "Rejected: {n}" },
    palabra: { es: "Palabra:", en: "Word:" },
  },
  narrar: {
    titulo: { es: "Tu voz para los cuentos", en: "Your voice for the stories" },
    ayuda: {
      es: "Graba cada página leyéndola tú. Se guarda solo en este dispositivo y no sale de aquí. Si no grabas, la lees en vivo.",
      en: "Record each page as you read it. It stays only on this device and never leaves it. If you don't record, you read it live.",
    },
    grabarCuento: { es: "Grabar mi voz", en: "Record my voice" },
    pagina: { es: "Página {n} de {total}", en: "Page {n} of {total}" },
    grabar: { es: "● Grabar esta página", en: "● Record this page" },
    detener: { es: "■ Parar", en: "■ Stop" },
    escuchar: { es: "▶ Escuchar", en: "▶ Listen" },
    guardar: { es: "Guardar", en: "Save" },
    otraVez: { es: "Otra vez", en: "Again" },
    grabada: { es: "✓ Grabada", en: "✓ Recorded" },
    anterior: { es: "← Anterior", en: "← Previous" },
    siguiente: { es: "Siguiente →", en: "Next →" },
    listo: { es: "Listo", en: "Done" },
    denegado: {
      es: "El navegador no dio permiso al micrófono. Puedes leer los cuentos en vivo.",
      en: "The browser did not allow the microphone. You can read the stories live.",
    },
    soloAdulto: {
      es: "Graba solo tu voz: la del niño nunca se guarda.",
      en: "Record only your own voice: the child's voice is never saved.",
    },
  },
  nino: {
    tituloPestana: {
      es: "Cuentos · Hablemos San",
      en: "Stories · Hablemos San",
    },
    titulo: { es: "Cuentos", en: "Stories" },
    salida: { es: "← Hoy", en: "← Today" },
    guion: {
      es: "Tú lees la página en voz alta. Señala la palabra grande y espera: si la dice, la imita o la señala, cuenta.",
      en: "You read the page out loud. Point to the big word and wait: saying it, copying it or pointing to it all count.",
    },
    deLaApp: { es: "De la app", en: "From the app" },
    aprobado: { es: "✓ Aprobado por ti", en: "✓ Approved by you" },
    leerYo: { es: "Lo leo yo", en: "I'll read it" },
    conMiVoz: { es: "Con mi voz grabada", en: "With my recorded voice" },
    tuVoz: { es: "▶ Tu voz", en: "▶ Your voice" },
    sinGrabar: {
      es: "Esta página no tiene tu voz: léela tú.",
      en: "This page has no recording: read it yourself.",
    },
    pagina: { es: "Página {n} de {total}", en: "Page {n} of {total}" },
    anterior: { es: "← Anterior", en: "← Previous" },
    siguiente: { es: "Siguiente →", en: "Next →" },
    otro: { es: "Fin. Elegir otro cuento", en: "The end. Pick another story" },
    volver: { es: "← Los cuentos", en: "← The stories" },
  },
  entrada: {
    titulo: { es: "Cuentos de casa", en: "Stories at home" },
    texto: {
      es: "Cuentos cortos con lo que le gusta. Pides lotes nuevos, los lees y apruebas, y les pones tu voz.",
      en: "Short stories built on what your child enjoys. Ask for new batches, read and approve them, and give them your voice.",
    },
    abrir: { es: "Abrir los cuentos", en: "Open the stories" },
    hoy: { es: "Un cuento para leer juntos", en: "A story to read together" },
  },
};
