import type { Catalogo } from "../index";

// «Hojas para imprimir» (S10): tarjetas con pictograma y un tablero de turnos, para jugar lejos de la
// pantalla. Ninguna hoja lleva nombre ni edad; todas llevan el crédito de ARASAAC. {es, en} redactado.
export const imprimibles = {
  tituloPestana: {
    es: "Hojas para imprimir · Hablemos San",
    en: "Printable sheets · Hablemos San",
  },
  titulo: { es: "Hojas para imprimir", en: "Printable sheets" },
  intro: {
    es: "Tarjetas con dibujo y un tablero de turnos para jugar lejos de la pantalla, sentados juntos. Las hojas no llevan ningún nombre ni edad: son para pegar en la nevera o recortar.",
    en: "Picture cards and a turn board to play away from the screen, sitting together. The sheets carry no name or age: stick them on the fridge or cut them out.",
  },
  entrada: {
    titulo: { es: "Hojas para imprimir", en: "Printable sheets" },
    texto: {
      es: "Tarjetas con dibujo y un tablero de turnos, listas para imprimir y jugar sin pantalla.",
      en: "Picture cards and a turn board, ready to print and play without a screen.",
    },
    abrir: { es: "Abrir las hojas", en: "Open the sheets" },
  },
  idioma: { es: "Idioma de las hojas", en: "Language of the sheets" },
  idiomaEs: { es: "Español", en: "Spanish" },
  idiomaEn: { es: "Inglés", en: "English" },
  imprimir: { es: "Imprimir", en: "Print" },
  volver: { es: "← Estudio", en: "← Study" },
  origen: {
    palabras: {
      es: "Las tarjetas salen de las palabras e intereses que usted escribió en «Cuentos de casa»; si faltan, se completan con un lote base. Solo se imprimen el dibujo y su palabra.",
      en: "The cards come from the words and interests you wrote in “Home stories”; if some are missing, a base set fills the gap. Only the picture and its word are printed.",
    },
  },
  tarjetas: { es: "Tarjetas", en: "Cards" },
  tablero: {
    titulo: { es: "Tablero de turnos", en: "Turn board" },
    miTurno: { es: "Mi turno", en: "My turn" },
    tuTurno: { es: "Tu turno", en: "Your turn" },
    instruccion: {
      es: "Cada uno tapa un círculo cuando termina su turno. Se juega mirándose, sin prisa.",
      en: "Each one covers a circle when their turn is over. Play looking at each other, no rush.",
    },
    adulto: { es: "Adulto", en: "Grown-up" },
    nino: { es: "Niño o niña", en: "Child" },
  },
  hoja: { es: "Hoja {n} de {total}", en: "Sheet {n} of {total}" },
  credito: {
    es: "Pictogramas de Sergio Palao para ARASAAC (arasaac.org), propiedad del Gobierno de Aragón, licencia Creative Commons BY-NC-SA. Uso personal y sin fines comerciales.",
    en: "Pictograms by Sergio Palao for ARASAAC (arasaac.org), property of the Government of Aragón, Creative Commons BY-NC-SA license. Personal, non-commercial use.",
  },
} satisfies Catalogo;
