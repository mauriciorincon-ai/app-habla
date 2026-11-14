import type { Catalogo } from "../index";

// «Pasar a la otra casa» (S10, ADR-020). El adulto lleva el progreso de su hijo a otro aparato en un
// archivo cifrado con una frase que solo él conoce. Sin internet: el archivo lo mueve él.
export const otraCasa = {
  titulo: { es: "Pasar a la otra casa", en: "Take it to the other home" },
  intro: {
    es: "Si su hijo practica en dos casas, lleve lo de aquí a la otra en un archivo protegido con una frase. Viaja el objetivo de la semana, lo que han practicado y lo que han logrado. Nunca viaja la voz de su hijo, ni los videos, ni su apodo.",
    en: "If your child practices in two homes, take what is here to the other one in a file locked with a phrase. It carries the goal of the week, what you have practiced and what you have achieved. It never carries your child's voice, the videos or their nickname.",
  },
  crear: {
    titulo: { es: "Crear el archivo", en: "Make the file" },
    incluirBanco: {
      es: "Incluir mi voz grabada ({n} grabaciones)",
      en: "Include my recorded voice ({n} recordings)",
    },
    incluirBancoAyuda: {
      es: "Solo su voz de adulto, la del banco (hasta unos 60 MB; si hay más, las demás se quedan aquí). Algunos aparatos no reproducen las grabaciones de otros: al abrir el archivo, la otra casa ve cuáles suenan allá.",
      en: "Only your adult voice, from the voice bank (up to about 60 MB; if there is more, the rest stays here). Some devices cannot play recordings made on others: when the file is opened, the other home sees which ones play there.",
    },
    frase: { es: "Frase para proteger el archivo", en: "Phrase to lock the file" },
    fraseAyuda: {
      es: "Al menos diez letras. Escríbala en la otra casa para abrirlo. La app no la guarda: si se olvida, el archivo no se puede abrir.",
      en: "At least ten characters. Type it in the other home to open the file. The app does not keep it: if it is forgotten, the file cannot be opened.",
    },
    repetir: { es: "Escríbala otra vez", en: "Type it again" },
    boton: { es: "Crear y descargar", en: "Make and download" },
    creando: { es: "Protegiendo el archivo…", en: "Locking the file…" },
    listo: {
      es: "✓ Archivo descargado. Llévelo a la otra casa como prefiera y ábralo allá con la misma frase.",
      en: "✓ File downloaded. Take it to the other home however you like and open it there with the same phrase.",
    },
    corta: { es: "La frase necesita al menos diez letras.", en: "The phrase needs at least ten characters." },
    distintas: { es: "Las dos frases no son iguales.", en: "The two phrases do not match." },
    error: {
      es: "No se pudo crear el archivo en este navegador. No se guardó nada.",
      en: "The file could not be made in this browser. Nothing was saved.",
    },
  },
  abrir: {
    titulo: { es: "Abrir un archivo de la otra casa", en: "Open a file from the other home" },
    archivo: { es: "Elegir el archivo .habla", en: "Choose the .habla file" },
    frase: { es: "La frase con que se protegió", en: "The phrase it was locked with" },
    boton: { es: "Ver qué trae", en: "See what it brings" },
    abriendo: { es: "Abriendo…", en: "Opening…" },
    formato: {
      es: "Ese archivo no es de esta app. No entró nada.",
      en: "That file is not from this app. Nothing came in.",
    },
    fraseMala: {
      es: "La frase no abre este archivo. No se cambió nada.",
      en: "The phrase does not open this file. Nothing was changed.",
    },
    contenido: {
      es: "El archivo se abrió, pero lo que trae no tiene la forma esperada. No entró nada.",
      en: "The file opened, but what it holds is not in the expected shape. Nothing came in.",
    },
    faltaArchivo: { es: "Primero elija el archivo.", en: "First choose the file." },
    navegador: {
      es: "Este navegador no puede abrir archivos protegidos (hace falta una conexión segura). No se cambió nada.",
      en: "This browser cannot open locked files (a secure connection is needed). Nothing was changed.",
    },
    inesperado: {
      es: "No se pudo abrir el archivo en este aparato. No se cambió nada.",
      en: "The file could not be opened on this device. Nothing was changed.",
    },
  },
  plan: {
    titulo: { es: "Esto es lo que cambia aquí", en: "This is what changes here" },
    nadaSeBorra: {
      es: "Nada de este aparato se borra: lo que trae el archivo se suma.",
      en: "Nothing on this device is deleted: what the file brings is added.",
    },
    objetivo: {
      es: "Objetivo de la semana: «{antes}» → «{despues}»",
      en: "Goal of the week: «{antes}» → «{despues}»",
    },
    sinObjetivo: { es: "ninguno", en: "none" },
    sesiones: { es: "Juegos practicados que se suman: {n}", en: "Games played that are added: {n}" },
    gemelas: {
      es: "Rondas de palabras gemelas que se suman: {n}",
      en: "Twin-word rounds that are added: {n}",
    },
    capsulas: { es: "Actividades del día que se suman: {n}", en: "Activities of the day that are added: {n}" },
    banco: {
      es: "Grabaciones de su voz que entran: {n}",
      en: "Recordings of your voice that come in: {n}",
    },
    bancoYa: { es: "Ya estaban aquí: {n}", en: "Already here: {n}" },
    bancoNoSuena: {
      es: "⚠ No suenan en este aparato y no entran: {n}. Puede grabarlas aquí desde Estudio.",
      en: "⚠ Do not play on this device and do not come in: {n}. You can record them here from the Studio.",
    },
    nada: {
      es: "Este archivo no trae nada nuevo para este aparato.",
      en: "This file brings nothing new for this device.",
    },
    confirmar: { es: "✓ Sí, sumarlo", en: "✓ Yes, add it" },
    cancelar: { es: "✕ Ahora no", en: "✕ Not now" },
    hecho: { es: "✓ Listo: ya está en este aparato.", en: "✓ Done: it is on this device now." },
    cancelado: { es: "No se cambió nada.", en: "Nothing was changed." },
    errorAlSumar: {
      es: "No se pudo sumar todo, así que no se escribió ningún dato de texto: puede intentarlo otra vez.",
      en: "Not everything could be added, so no text data was written: you can try again.",
    },
    ciclo: { es: "Avance en las etapas de la práctica", en: "Progress in the practice stages" },
  },
} satisfies Catalogo;
