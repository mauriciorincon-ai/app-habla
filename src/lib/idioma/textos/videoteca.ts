import type { Catalogo } from "../index";

// La videoteca de la familia (S8): clips que el adulto ELIGE de su galería para mostrar una conducta
// (pedir, saludar, jugar). La app no abre la cámara y los clips viven solo en este dispositivo.
// Nada de lo de aquí nombra a nadie: «quién aparece» lo escribe la familia y se queda en local.
export const videoteca = {
  tituloPestana: { es: "Videos de la familia · Hablemos San", en: "Family videos · Hablemos San" },
  titulo: { es: "Videos de la familia", en: "Family videos" },
  salida: { es: "← La voz de la familia", en: "← The family's voice" },
  entrada: {
    titulo: { es: "Videos de la familia", en: "Family videos" },
    texto: {
      es: "Clips cortos de tu galería que muestran pedir, saludar o jugar. Tu hijo los mira contigo, como utilería del juego.",
      en: "Short clips from your gallery that show asking, greeting or playing. Your child watches them with you, as a prop for the game.",
    },
    abrir: { es: "Abrir los videos", en: "Open the videos" },
  },
  promesa: {
    a: { es: "Eliges clips de tu galería. ", en: "You pick clips from your gallery. " },
    negrita1: { es: "La app no abre la cámara.", en: "The app never opens the camera." },
    b: { es: " Cada clip vive ", en: " Each clip lives " },
    negrita2: { es: "solo en este dispositivo", en: "only on this device" },
    c: {
      es: ": no se sube a internet, la app no tiene botón para enviarlo ni descargarlo y no entra en ninguna copia. Los borras en dos toques.",
      en: ": it is not uploaded, the app has no button to send or download it, and it is not part of any export. You delete them in two taps.",
    },
    soloOtros: {
      es: "Pensado para clips de otras personas que tu hijo conoce, no para grabarlo a él.",
      en: "Meant for clips of other people your child knows, not for filming your child.",
    },
  },
  anadir: {
    titulo: { es: "Añadir un clip", en: "Add a clip" },
    queMuestra: { es: "¿Qué muestra el clip?", en: "What does the clip show?" },
    quien: { es: "¿Quién aparece? (opcional, solo se queda aquí)", en: "Who is in it? (optional, stays here only)" },
    quienEjemplo: { es: "por ejemplo: la abuela", en: "for example: Grandma" },
    elegir: { es: "Elegir un video de la galería", en: "Choose a video from the gallery" },
    guardando: { es: "Guardando…", en: "Saving…" },
    limites: {
      es: "Hasta {segundos} segundos y {megas} MB por clip, y hasta {clips} clips.",
      en: "Up to {segundos} seconds and {megas} MB per clip, and up to {clips} clips.",
    },
  },
  conducta: {
    pedir: { es: "Pedir", en: "Asking" },
    saludar: { es: "Saludar", en: "Greeting" },
    jugar: { es: "Jugar", en: "Playing" },
  },
  error: {
    "no-es-video": { es: "Ese archivo no es un video. Elige uno de tu galería.", en: "That file is not a video. Choose one from your gallery." },
    "demasiado-grande": { es: "Ese clip pesa demasiado. Elige uno más corto.", en: "That clip is too large. Choose a shorter one." },
    "demasiado-largo": { es: "Ese clip dura demasiado. Elige uno más corto.", en: "That clip is too long. Choose a shorter one." },
    "sin-lugar": { es: "La videoteca está llena. Borra un clip para añadir otro.", en: "The video shelf is full. Delete a clip to add another." },
    almacenamiento: {
      es: "No se pudo guardar el clip en este dispositivo (quizá no hay espacio). No se guardó nada.",
      en: "The clip could not be saved on this device (there may be no space). Nothing was saved.",
    },
  },
  lista: {
    titulo: { es: "Tus clips", en: "Your clips" },
    vacio: {
      es: "Todavía no hay clips. Añade el primero cuando quieras.",
      en: "There are no clips yet. Add the first one whenever you like.",
    },
    ver: { es: "Ver", en: "Watch" },
    cerrar: { es: "Cerrar", en: "Close" },
    conSonido: { es: "Con sonido", en: "Sound on" },
    sinSonido: { es: "Sin sonido", en: "Sound off" },
    borrar: { es: "Borrar", en: "Delete" },
    seguro: { es: "¿Seguro? Toca otra vez", en: "Sure? Tap again" },
    borrarTodos: { es: "Borrar todos los clips", en: "Delete all clips" },
    seguroTodos: { es: "¿Seguro? Toca otra vez para borrar todos", en: "Sure? Tap again to delete them all" },
    borradoTodos: { es: "Se borraron todos los clips de este dispositivo.", en: "All clips were deleted from this device." },
    duracion: { es: "{s} s", en: "{s} sec" },
    clipDe: { es: "Clip de {conducta}", en: "Clip: {conducta}" },
    verClip: { es: "Ver el clip de {conducta}", en: "Watch the clip: {conducta}" },
    borrarClip: { es: "Borrar el clip de {conducta}", en: "Delete the clip: {conducta}" },
    errorBorrar: {
      es: "No se pudo borrar. Inténtalo de nuevo.",
      en: "It could not be deleted. Please try again.",
    },
    noSePuede: {
      es: "Este aparato no puede reproducir este clip.",
      en: "This device cannot play this clip.",
    },
  },
} satisfies Catalogo;
