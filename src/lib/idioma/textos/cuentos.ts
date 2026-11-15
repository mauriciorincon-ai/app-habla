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
    titulo: { es: "Lo que le encanta", en: "What your child loves" },
    ayuda: {
      es: "Lo que le encanta sale de su perfil, en palabras generales, y va en el pedido. Las palabras que practican, aquí abajo, separadas por comas; si no escribes ninguna, van las de la meta de la semana. Nada más viaja: ni su nombre, ni su edad, ni su voz.",
      en: "What they love comes from their profile, in general words, and goes in the request. The words you are practicing go below, separated by commas; if you write none, the ones from this week's goal go. Nothing else travels: not their name, not their age, not their voice.",
    },
    intereses: { es: "Lo que le encanta (de su perfil)", en: "What they love (from their profile)" },
    sinIntereses: { es: "Aún no hay nada en su perfil.", en: "Nothing in their profile yet." },
    cambiarEnPerfil: { es: "Cambiar en el perfil", en: "Change in the profile" },
    palabras: {
      es: "Palabras que están practicando",
      en: "Words you are practicing",
    },
    guardar: { es: "Guardar", en: "Save" },
    guardado: {
      es: "✓ Guardado en este dispositivo.",
      en: "✓ Saved on this device.",
    },
    sensible: {
      es: "Alguna de esas palabras no puede ir en un pedido. Usa palabras generales, sin nombres.",
      en: "One of those words cannot go in a request. Use general words, no names.",
    },
    error: {
      es: "Revisa: cada palabra, una sola, sin números (hasta ocho).",
      en: "Check: each practice word a single word, no numbers (up to eight).",
    },
    pedirTitulo: { es: "Pedir cuentos nuevos", en: "Ask for new stories" },
    pedirAyuda: {
      es: "Descarga el pedido y guárdalo en la carpeta privado/bandeja/ del proyecto. Luego corre /bandeja en Claude Code: escribe el lote ahí mismo. La app no envía nada a internet.",
      en: "Download the request and save it in the project's privado/bandeja/ folder. Then run /bandeja in Claude Code: it writes the batch right there. The app sends nothing to the internet.",
    },
    descargar: { es: "Descargar el pedido", en: "Download the request" },
    faltaGusto: {
      es: "Añade al menos una cosa que le encante en su perfil (Ajustes) para pedir cuentos.",
      en: "Add at least one thing they love in their profile (Settings) to ask for stories.",
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
    sinLugar: {
      es: "{n} no cupieron: la lista está llena. Quita rechazados para hacer lugar.",
      en: "{n} did not fit: the list is full. Remove rejected ones to make room.",
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
    decididos: { es: "Ya decididos", en: "Already decided" },
    retirar: { es: "Retirar", en: "Withdraw" },
    quitar: { es: "Quitar", en: "Remove" },
    estadoAprobado: { es: "✓ Aprobado", en: "✓ Approved" },
    estadoRechazado: { es: "✕ Rechazado", en: "✕ Rejected" },
  },
  narrar: {
    titulo: { es: "Tu voz para los cuentos", en: "Your voice for the stories" },
    ayuda: {
      es: "Graba cada página leyéndola tú. Se guarda en este dispositivo y solo sale en el archivo cifrado de «Pasar a la otra casa» si tú lo marcas. Si no grabas, la lees en vivo.",
      en: "Record each page as you read it. It stays on this device and only leaves in the locked file of “Take it to the other home” if you tick it. If you don't record, you read it live.",
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
