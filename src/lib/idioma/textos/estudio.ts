import type { Catalogo } from "../index";

// El estudio de voz del adulto: grabar el banco de voz de la familia. Los avisos de privacidad
// dicen lo mismo en los dos idiomas: la grabación vive solo en este dispositivo (regla dura 2-bis).
// Los fragmentos con negrita se parten en trozos: el DOM es el mismo en los dos idiomas.
export const estudio = {
  titulo: { es: "La voz de la familia", en: "The family's voice" },
  tituloPestana: { es: "La voz de la familia · Hablemos San", en: "The family's voice · Hablemos San" },
  salida: {
    ajustes: { es: "← Ajustes", en: "← Settings" },
    banco: { es: "← Tu banco de voz", en: "← Your voice bank" },
  },
  promesa: {
    a: {
      es: "Graba tu voz —la de mamá o papá— para que los juegos suenen con la voz que tu hijo conoce. ",
      en: "Record your own voice — Mom's or Dad's — so the games sound like the voice your child knows. ",
    },
    negrita1: {
      es: "La voz de tu hijo nunca se graba.",
      en: "Your child's voice is never recorded.",
    },
    b: { es: " Todo lo que grabes vive ", en: " Everything you record lives " },
    negrita2: { es: "solo en este dispositivo", en: "only on this device" },
    c: {
      es: ": no se sube a internet ni sale de aquí.",
      en: ": it is not uploaded to the internet and never leaves here.",
    },
  },
  categoria: {
    palabra: { es: "Palabras", en: "Words" },
    consigna: { es: "Consignas del juego", en: "Game cues" },
    celebracion: { es: "Celebraciones", en: "Celebrations" },
  },
  gestion: {
    conTuVozVas: { es: "Con tu voz vas", en: "Recorded so far" },
    grabar: { es: "Grabar", en: "Record" },
    grabarGrupo: { es: "Grabar {grupo}", en: "Record {grupo}" },
    privacidad: {
      a: { es: "Estas grabaciones viven ", en: "These recordings live " },
      negrita1: { es: "SOLO en este dispositivo", en: "ONLY on this device" },
      b: {
        es: ". No se suben a ningún lado; solo salen en el archivo cifrado de «Pasar a la otra casa» si tú marcas esa casilla. La voz que grabas es la ",
        en: ". They are not uploaded anywhere; they only leave in the locked file of “Take it to the other home” if you tick that box. The voice you record is ",
      },
      negrita2: { es: "tuya", en: "yours" },
      c: {
        es: " —la de los adultos—: la de tu hijo nunca se graba.",
        en: " — the adults' voice: your child's is never recorded.",
      },
    },
    grabarMiVoz: { es: "Grabar mi voz", en: "Record my voice" },
    grabarMas: { es: "Grabar más", en: "Record more" },
  },
  lista: {
    titulo: { es: "Lo que ya grabaste", en: "What you've already recorded" },
    delObjetivo: { es: "del objetivo de la semana", en: "part of this week's goal" },
    escuchar: { es: "Escuchar", en: "Listen" },
    borrar: { es: "Borrar", en: "Delete" },
    seguro: { es: "¿Seguro?", en: "Sure?" },
  },
  lote: {
    deEstaTanda: { es: "de {n} de esta tanda", en: "of {n} in this round" },
    grabateDiciendo: { es: "Grábate diciendo", en: "Record yourself saying" },
    escucharCaptura: { es: "Escuchar cómo quedó", en: "Listen to how it sounds" },
    guardar: { es: "Está bien, guardar", en: "Sounds good, save it" },
    regrabar: { es: "Regrabar", en: "Record again" },
    parar: { es: "Parar", en: "Stop" },
    grabando: { es: "Grabando…", en: "Recording…" },
    medidor: {
      es: "Si la barra se mueve cuando hablas, te está oyendo bien.",
      en: "If the bar moves when you talk, it is hearing you fine.",
    },
    abriendoMic: { es: "Abriendo el micrófono…", en: "Opening the microphone…" },
    grabar: { es: "Grabar", en: "Record" },
  },
  aviso: {
    volver: { es: "Volver", en: "Back" },
    sinEspacio: {
      titulo: {
        es: "Se llenó el espacio del dispositivo",
        en: "This device is out of space",
      },
      cuerpo: {
        es: "El banco de voz no cabe más en este dispositivo. Puedes borrar algunas grabaciones que ya no uses y seguir.",
        en: "The voice bank doesn't fit on this device any more. You can delete some recordings you no longer use and keep going.",
      },
    },
    denegado: {
      titulo: { es: "No pude abrir el micrófono", en: "I couldn't open the microphone" },
      cuerpo: {
        es: "Para grabar tu voz, dale permiso al micrófono desde el candado de la barra de direcciones y vuelve a intentar.",
        en: "To record your voice, allow the microphone from the padlock in the address bar and try again.",
      },
    },
    error: {
      titulo: {
        es: "Algo salió mal con el micrófono",
        en: "Something went wrong with the microphone",
      },
      cuerpo: {
        es: "No pude usar el micrófono. Revisa que ningún otro programa lo esté usando y vuelve a intentar.",
        en: "I couldn't use the microphone. Check that no other program is using it and try again.",
      },
    },
    listo: {
      titulo: { es: "¡Listo por ahora!", en: "All set for now!" },
      cuerpo: {
        es: "Grabaste todo lo que había pendiente en este lote. Tu voz ya suena en los juegos. Puedes volver cuando quieras a grabar más.",
        en: "You recorded everything that was waiting in this round. Your voice already plays in the games. Come back whenever you like to record more.",
      },
      salir: { es: "Ver mi banco de voz", en: "See my voice bank" },
    },
  },
} satisfies Catalogo;
