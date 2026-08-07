// Genera src/lib/objetivo/palabras-es.ts: el diccionario embebido de ortografía del objetivo
// (gate S4, bloque O — pedido del usuario: sugerir la palabra bien escrita AUNQUE no esté en el
// contenido de la app, en un color distinto de los términos que sí alinean).
//
// Fuente: lista de frecuencia del español de OpenSubtitles 2018 (hermitdave/FrequencyWords,
// licencia MIT; datos derivados del corpus OpenSubtitles). Se descarga, se CURA y se congela en
// el repo — la app jamás toca la red por esto (regla dura 1: determinista primero).
//
// Curaduría (el corpus de subtítulos trae basura que NO puede salir como chip en una app
// familiar): solo minúsculas del alfabeto español, sin inglés (marcadores + lista explícita),
// sin interjecciones (jaja, mmm), sin groserías ni términos sexuales (lista es/es-CO), y el
// tope en las 10 000 más frecuentes que sobrevivan. Correr: `node scripts/gen-diccionario.mjs`.

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const URL_LISTA =
  "https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/es/es_50k.txt";
const TOPE = 10_000;
const DESTINO = resolve(import.meta.dirname, "../src/lib/objetivo/palabras-es.ts");

/** Solo alfabeto español en minúscula, de 3 a 16 letras. */
const FORMA_VALIDA = /^[a-záéíóúüñ]{3,16}$/;

/** Letras y grupos que el español no usa: casi siempre inglés o nombre propio del corpus. */
const MARCADORES_NO_ESPANOL =
  /[kw]|th|sh|ph|gh|ck|ss|ff|pp|tt|bb|dd|mm|zz|hh|hn|hm/;

/** Interjecciones y risas: tres letras repetidas, cadenas de ja/je/ji…, y sueltas. */
const TRIPLE_REPETIDA = /(.)\1\1/;
const RISA = /^(ja|je|ji|jo|ju|ha)+s?$/;
const INTERJECCIONES = new Set(["aha", "ajá", "ajam", "ejem", "uhm", "uff", "pff", "psst"]);

/** Inglés frecuente en subtítulos que pasa los marcadores y NO es palabra española. */
const INGLES = new Set([
  "the", "you", "and", "are", "not", "but", "have", "out", "get", "can",
  "just", "like", "yeah", "love", "good", "night", "man", "hello", "please",
  "sorry", "yes", "baby", "honey", "boy", "girl", "god", "damn", "hell",
  "one", "two", "all", "her", "him", "his", "its", "mister", "dear", "gonna",
  "wanna", "why", "because", "people", "really", "maybe", "never", "right",
  "time", "here", "look", "going", "said", "been", "does", "done", "gone",
  "mom", "dad", "oyé", "hey", "bye", "lady", "big", "old", "guy", "guys",
  "cool", "great", "nice", "very", "much", "more", "over", "again", "about",
  "house", "home", "life", "live", "give", "take", "make", "made", "let",
  "comé", "stop", "run", "help", "call", "tell", "talk", "say", "see",
  "mean", "need", "find", "leave", "put", "use", "way", "long", "little",
  "only", "some", "any", "other", "our", "your", "their", "them", "then",
  "than", "into", "from", "back", "off", "oń", "listen", "money", "father",
  "mother", "brother", "sister", "friend", "john", "jack", "sam", "tom",
  "harry", "frank", "charlie", "george", "henry", "james", "danny", "joe",
  "billy", "bill", "bob", "nick", "peter", "paul", "mary", "sarah", "max",
  "ben", "alex", "jim", "jimmy", "eddie", "tony", "michael", "david",
]);

/** Groserías, insultos y términos sexuales (es + es-CO): JAMÁS como sugerencia. */
const VETADAS = new Set([
  "mierda", "mierdas", "puta", "puto", "putas", "putos", "putita", "joder",
  "jodido", "jodida", "jodidos", "jodidas", "jodete", "jódete", "coño",
  "coños", "carajo", "cabrón", "cabron", "cabrones", "cabrona", "cabronas",
  "pendejo", "pendeja", "pendejos", "pendejas", "pendejada", "pendejadas",
  "gilipollas", "polla", "pollas", "verga", "vergas", "culo", "culos",
  "culito", "teta", "tetas", "follar", "follando", "folla", "marica",
  "maricas", "maricón", "maricon", "maricones", "mariquita", "zorra",
  "zorras", "cojones", "chingar", "chingada", "chingado", "chingados",
  "pinche", "pinches", "malparido", "malparida", "hijueputa", "hijoputa",
  "hijaputa", "gonorrea", "huevon", "huevón", "huevona", "güevón", "coger",
  "cogiendo", "sexo", "sexual", "sexuales", "pene", "penes", "vagina",
  "vaginas", "semen", "condón", "condones", "desnudo", "desnuda",
  "desnudos", "desnudas", "prostituta", "prostitutas", "violar", "violada",
  "violación", "estúpido", "estúpida", "estúpidos", "estúpidas", "idiota",
  "idiotas", "imbécil", "imbécil", "imbéciles", "estupidez", "maldito",
  "maldita", "malditos", "malditas", "bastardo", "bastarda", "bastardos",
]);

// "coger" se veta a pesar de ser neutra en es-CO: la lista viaja con la app y el costo de
// no sugerirla es cero (nadie escribe "coger" como objetivo de la semana).

/** El español casi nunca termina en estas consonantes: el residuo de nombres ingleses del
 *  corpus (robert, adam, eric…) cae aquí. Los préstamos legítimos van en la lista blanca. */
const TERMINACION_NO_ESPANOLA = /[bcfgmptvx]$|h$/;
const PRESTAMOS = new Set([
  "club", "reloj", "internet", "robot", "álbum", "chip", "test", "ballet",
  "picnic", "coñac", "fax", "chef", "golf", "film", "blog", "surf", "pop",
  "top", "set",
]);

const respuesta = await fetch(URL_LISTA);
if (!respuesta.ok) {
  throw new Error(`Descarga falló: ${respuesta.status} ${URL_LISTA}`);
}
const crudo = await respuesta.text();

const palabras = [];
const sospechosas = [];
for (const linea of crudo.split("\n")) {
  if (palabras.length >= TOPE) break;
  const palabra = linea.split(" ")[0];
  if (!palabra || !FORMA_VALIDA.test(palabra)) continue;
  if (MARCADORES_NO_ESPANOL.test(palabra)) continue;
  if (TRIPLE_REPETIDA.test(palabra) || RISA.test(palabra)) continue;
  if (INTERJECCIONES.has(palabra) || INGLES.has(palabra) || VETADAS.has(palabra)) continue;
  if (TERMINACION_NO_ESPANOLA.test(palabra) && !PRESTAMOS.has(palabra)) continue;
  palabras.push(palabra);
  // Vigía para el ojo humano: sin tildes ni eñes Y terminada en consonante rara para el
  // español — el residuo inglés/nombres suele caer aquí. Se imprime, no se filtra.
  if (/[^aeiouáéíóúñsdnlrzy]$/.test(palabra)) sospechosas.push(palabra);
}

if (palabras.length < 8000) {
  throw new Error(`Quedaron solo ${palabras.length} palabras: revisar filtros.`);
}

const lineas = [];
for (let i = 0; i < palabras.length; i += 8) {
  lineas.push("  " + palabras.slice(i, i + 8).map((p) => JSON.stringify(p)).join(", ") + ",");
}

const contenido = `// GENERADO por scripts/gen-diccionario.mjs — NO editar a mano (correrlo de nuevo).
// Diccionario de ortografía del objetivo (gate S4, bloque O): las ${palabras.length} palabras más
// frecuentes del español que sobrevivieron la curaduría (fuente: OpenSubtitles 2018 vía
// hermitdave/FrequencyWords, MIT). Orden = frecuencia real de uso (el índice ES el rango).
// Se carga BAJO DEMANDA al primer teclazo de /objetivo — jamás en el bundle inicial.

export const PALABRAS_ES: readonly string[] = [
${lineas.join("\n")}
];
`;

writeFileSync(DESTINO, contenido);
console.log(`✔ ${palabras.length} palabras → ${DESTINO}`);
console.log(`Sospechosas para el ojo humano (${sospechosas.length}):`);
console.log(sospechosas.slice(0, 120).join(" "));
