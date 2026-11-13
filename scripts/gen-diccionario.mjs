// Genera src/lib/objetivo/palabras-es.ts y palabras-en.ts: los diccionarios embebidos de ortografía del
// Objetivo (ADR-014; S8 los pasa a dos idiomas y cambia la fuente).
//
// FUENTE (S8): Google Books Ngram, 1-gramas, edición 20200217, español («spa») e inglés («eng»).
// Licencia CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/): solo exige atribución, que viaja
// en Ajustes → Acerca de y en src/lib/objetivo/LICENCIA-diccionario.md. FrequencyWords (la fuente de
// antes) sale: su contenido es CC BY-SA 4.0 y no queríamos esa herencia.
//
// Cómo: los fragmentos de Ngram pesan varios GB; se leen EN FLUJO (descarga → gunzip → línea) y de cada
// línea solo se guarda el conteo reciente (1990-2019) de las formas que pasan el alfabeto. Nada del
// crudo toca el disco ni el repo (la app jamás toca la red por esto: regla dura 1).
//
// Curaduría (Ngram trae OCR, nombres propios, otros idiomas y groserías que NO pueden salir como chip en
// una app familiar): solo minúsculas del alfabeto del idioma, sin etiquetas gramaticales (_NOUN…), sin
// nombres propios (la forma con mayúscula pesa más que la minúscula), sin interjecciones, sin groserías ni
// términos sexuales, sin las palabras de la lista de sensibilidad (por hash: jamás se escribe el término)
// y el tope en las más frecuentes que sobrevivan.
//
//   node scripts/gen-diccionario.mjs            # los dos idiomas
//   node scripts/gen-diccionario.mjs es         # solo uno
//
// Tarda unos minutos (≈ 8 GB en flujo). Escribe además el solape del top 2000 contra la lista vieja si
// existe la variable SOLAPE_CON (ruta a un palabras-es.ts anterior).

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createInterface } from "node:readline";
import { spawn } from "node:child_process";

const BASE = "https://storage.googleapis.com/books/ngrams/books/20200217";
const TOPE = 16_000;
const AÑO_DESDE = 1990;
/** Conteo mínimo (1990-2019) para guardar una forma: lo de abajo es ruido de OCR y nombres raros. */
const PISO = 300;
/** Rango en que entra el suplemento a mano: dentro del primer tercio, que es lo que el sugeridor muestra. */
const SUPLEMENTO_EN = 1500;
const AQUI = import.meta.dirname;

// ---------------------------------------------------------------------------------------------------
// Curaduría por idioma
// ---------------------------------------------------------------------------------------------------

const ES = {
  codigo: "es",
  nombre: "español",
  corpus: "spa",
  fragmentos: 3,
  destino: resolve(AQUI, "../src/lib/objetivo/palabras-es.ts"),
  constante: "PALABRAS_ES",
  /** Solo alfabeto español en minúscula, de 3 a 16 letras. */
  forma: /^[a-záéíóúüñ]{3,16}$/,
  /** Mayúscula inicial de la misma forma, para medir si es nombre propio. */
  capital: (p) => p[0].toUpperCase() + p.slice(1),
  /** Letras y grupos que el español no usa: casi siempre otro idioma o nombre propio del corpus. */
  marcadores: /[kw]|th|sh|ph|gh|ck|ss|ff|pp|tt|bb|dd|mm|zz|hh|hn|hm/,
  triple: /(.)\1\1/,
  risa: /^(ja|je|ji|jo|ju|ha)+s?$/,
  interjecciones: new Set(["aha", "ajá", "ajam", "ejem", "uhm", "uff", "pff", "psst"]),
  /** Otro idioma frecuente que pasa los marcadores y NO es palabra española. */
  ajenas: new Set([
    "the", "you", "and", "are", "not", "but", "have", "out", "get", "can", "just", "like", "yeah",
    "love", "good", "man", "hello", "please", "sorry", "yes", "baby", "boy", "girl", "god", "one",
    "two", "all", "her", "him", "his", "its", "dear", "why", "because", "people", "really", "maybe",
    "never", "right", "time", "here", "look", "going", "said", "been", "does", "done", "gone", "mom",
    "dad", "hey", "bye", "lady", "big", "old", "guy", "cool", "great", "nice", "very", "much", "more",
    "over", "again", "about", "house", "home", "life", "live", "give", "take", "make", "made", "let",
    "stop", "run", "help", "call", "tell", "talk", "say", "see", "mean", "need", "find", "leave",
    "put", "use", "way", "long", "little", "only", "some", "any", "other", "our", "your", "their",
    "them", "then", "than", "into", "from", "back", "off", "money", "father", "mother", "brother",
    "sister", "friend", "who", "what", "when", "where", "with", "was", "were", "has", "had", "this",
    "that", "these", "those", "for", "new", "now", "how", "its", "also", "which",
  ]),
  vetadas: new Set([
    "mierda", "mierdas", "puta", "puto", "putas", "putos", "putita", "joder", "jodido", "jodida",
    "jodidos", "jodidas", "jodete", "jódete", "coño", "coños", "carajo", "cabrón", "cabron", "cabrones",
    "cabrona", "cabronas", "pendejo", "pendeja", "pendejos", "pendejas", "pendejada", "pendejadas",
    "gilipollas", "polla", "pollas", "verga", "vergas", "culo", "culos", "culito", "teta", "tetas",
    "follar", "follando", "folla", "marica", "maricas", "maricón", "maricon", "maricones", "mariquita",
    "zorra", "zorras", "cojones", "chingar", "chingada", "chingado", "chingados", "pinche", "pinches",
    "malparido", "malparida", "hijueputa", "hijoputa", "hijaputa", "gonorrea", "huevon", "huevón",
    "huevona", "güevón", "coger", "cogiendo", "sexo", "sexual", "sexuales", "pene", "penes", "vagina",
    "vaginas", "semen", "condón", "condones", "desnudo", "desnuda", "desnudos", "desnudas",
    "prostituta", "prostitutas", "violar", "violada", "violación", "estúpido", "estúpida", "estúpidos",
    "estúpidas", "idiota", "idiotas", "imbécil", "imbéciles", "estupidez", "maldito", "maldita",
    "malditos", "malditas", "bastardo", "bastarda", "bastardos", "erótico", "erótica", "pornografía",
    "porno", "violador", "violadores", "pedófilo", "pedofilia", "masturbación", "orgasmo", "burdel",
    "puñeta", "mamón", "mamona", "guevón", "boludo", "pelotudo", "concha", "ramera", "prostitución",
  ]),
  /** El español casi nunca termina en estas consonantes; los préstamos legítimos van en la lista blanca. */
  terminacionAjena: /[bcfgmptvx]$|h$/,
  prestamos: new Set([
    "club", "reloj", "internet", "robot", "álbum", "chip", "test", "ballet", "picnic", "coñac", "fax",
    "chef", "golf", "film", "blog", "surf", "pop", "top", "set",
  ]),
  /** Factor: la forma con mayúscula pesa más de N veces la minúscula ⇒ nombre propio. */
  razonPropio: 4,
  /**
   * Los libros son un registro formal: faltan las palabras de la casa (saludos, órdenes cortas, cariños).
   * Van a mano, sin licencia que citar, y entran en el rango SUPLEMENTO_EN si pasan el mismo veto.
   */
  suplemento: [
    "hola", "adiós", "chao", "dame", "dime", "dale", "déjame", "ven", "mira", "vamos", "miren", "quiero",
    "mamá", "papá", "mami", "papi", "abuelo", "abuela", "abuelos", "tío", "tía", "primo", "prima",
    "gracias", "perdón", "porfa", "bueno", "listo", "ayúdame", "espera", "espere", "siéntate",
    "quédate", "cállate", "bienvenido", "cuidado", "ándale", "ojalá", "chévere", "lindo", "linda",
    "bebé", "bebés", "pipí", "popó", "chao", "juguete", "juguetes", "pelota", "muñeca", "carrito",
    "cuento", "cuentos", "canción", "canciones", "dibujo", "dibujos", "colores", "galleta", "galletas",
    "dulce", "dulces", "helado", "jugo", "jugos", "agua", "leche", "pan", "arepa", "sopa", "fruta",
    "frutas", "banano", "manzana", "naranja", "uva", "uvas", "mono", "monos", "pato", "gallina",
    "vaca", "caballo", "oveja", "cerdo", "ratón", "pollito", "mariposa", "hormiga", "abeja",
  ],
};

const EN = {
  codigo: "en",
  nombre: "English",
  corpus: "eng",
  fragmentos: 24,
  destino: resolve(AQUI, "../src/lib/objetivo/palabras-en.ts"),
  constante: "PALABRAS_EN",
  forma: /^[a-z]{3,16}$/,
  capital: (p) => p[0].toUpperCase() + p.slice(1),
  /** El inglés no usa estas combinaciones: casi siempre OCR o residuo de otro idioma. */
  marcadores: /[ñáéíóúü]|(.)\1\1|^[^aeiouy]{4,}$|[^aeiouy]{6,}|q(?!u)|^tbe$|^bnt$/,
  triple: /(.)\1\1/,
  risa: /^(ha|he|hi|ho|ja)+s?$/,
  interjecciones: new Set(["hmm", "hmmm", "ugh", "pfft", "shh", "psst", "huh", "yeah", "uhh", "umm"]),
  /** Otro idioma frecuente (en libros ingleses: francés, latín, alemán) que NO es palabra inglesa. */
  ajenas: new Set([
    "dans", "avec", "pour", "und", "der", "die", "das", "ein", "est", "les", "des", "une", "qui",
    "que", "sur", "pas", "nicht", "ist", "von", "mit", "sich", "auf", "den", "dem", "zur", "aus",
    "nach", "bei", "sind", "wird", "auch", "eine", "ihre", "che", "per", "della", "non", "una", "del",
    "los", "las", "con", "por", "para", "como", "cum", "sunt", "est", "quam", "ejus", "sed", "enim",
    "autem", "nam", "tamen", "ibid", "vol", "pdf", "isbn", "http", "www", "com", "org", "html",
    "bnt", "tbe", "ofthe", "andthe",
  ]),
  vetadas: new Set([
    "fuck", "fucks", "fucked", "fucking", "fucker", "shit", "shits", "shitty", "bitch", "bitches",
    "bastard", "bastards", "asshole", "assholes", "dick", "dicks", "cock", "cocks", "pussy", "cunt",
    "whore", "whores", "slut", "sluts", "damn", "damned", "goddamn", "crap", "piss", "pissed",
    "penis", "penises", "vagina", "vaginas", "sex", "sexual", "sexually", "sexuality", "sexes",
    "nude", "nudes", "naked", "nudity", "porn", "porno", "pornography", "erotic", "erotica",
    "rape", "raped", "rapist", "rapists", "raping", "prostitute", "prostitutes", "prostitution",
    "brothel", "orgasm", "orgasms", "masturbate", "masturbation", "semen", "sperm", "condom",
    "condoms", "nigger", "niggers", "negro", "negroes", "faggot", "fag", "retard", "retarded",
    "idiot", "idiots", "stupid", "moron", "morons", "imbecile", "dumb", "tits", "tit", "boob",
    "boobs", "breast", "breasts", "nipple", "nipples", "anus", "rectum", "genital", "genitals",
    "genitalia", "fetish", "lust", "lustful", "lewd", "obscene", "pervert", "perverted", "molest",
    "molested", "molestation", "pedophile", "paedophile", "incest", "bondage", "slave", "slaves",
    "kill", "kills", "killed", "killing", "killer", "murder", "murdered", "murderer", "suicide",
    "hell", "whiskey", "whisky", "drunk", "drunken", "cocaine", "heroin", "opium", "marijuana",
  ]),
  /** Inglés sin terminación filtrada (casi todas son válidas). */
  terminacionAjena: /$^/,
  prestamos: new Set(),
  razonPropio: 4,
  suplemento: [
    "hello", "hi", "bye", "goodbye", "please", "thanks", "sorry", "okay", "mommy", "daddy", "mama",
    "papa", "grandma", "grandpa", "granny", "auntie", "uncle", "cousin", "baby", "babies", "toy",
    "toys", "ball", "doll", "story", "stories", "song", "songs", "drawing", "colors", "cookie",
    "cookies", "candy", "juice", "milk", "water", "bread", "soup", "fruit", "banana", "apple",
    "orange", "grape", "grapes", "puppy", "doggy", "kitty", "bunny", "birdie", "duck", "chicken",
    "cow", "horse", "sheep", "pig", "mouse", "butterfly", "ant", "bee", "yummy", "stinky", "potty",
    "bubble", "bubbles", "blanket", "nap", "hug", "hugs", "kiss", "peekaboo", "wow", "look",
    "give", "want", "more", "again", "mine", "yours", "turn", "share", "wait", "come", "stop",
  ],
};

const IDIOMAS = { es: ES, en: EN };

// ---------------------------------------------------------------------------------------------------
// Sensibilidad: una palabra cuyo hash coincide con la lista privada JAMÁS entra al diccionario.
// ---------------------------------------------------------------------------------------------------

const hashes = new Set(
  JSON.parse(readFileSync(resolve(AQUI, "../tests/fixtures/sensibilidad-hashes.json"), "utf8")).hashes,
);
const normaliza = (p) =>
  p
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
const sha = (s) => createHash("sha256").update(s, "utf8").digest("hex");
const esSensible = (p) => hashes.has(sha(normaliza(p)));

// ---------------------------------------------------------------------------------------------------
// Lectura en flujo de un idioma
// ---------------------------------------------------------------------------------------------------

/** Suma los conteos de los años recientes de una línea `token\taño,conteo,volumenes\t…`. */
function conteoReciente(columnas) {
  let total = 0;
  for (let i = 1; i < columnas.length; i++) {
    const [anio, n] = columnas[i].split(",");
    if (Number(anio) >= AÑO_DESDE) total += Number(n);
  }
  return total;
}

async function leer(cfg) {
  const minusculas = new Map(); // palabra → conteo
  const mayusculas = new Map(); // palabra en minúscula → conteo de su forma Capitalizada
  const plano = new RegExp(`^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{3,16}$`);
  let lineas = 0;
  for (let k = 0; k < cfg.fragmentos; k++) {
    const nombre = `1-${String(k).padStart(5, "0")}-of-${String(cfg.fragmentos).padStart(5, "0")}.gz`;
    const url = `${BASE}/${cfg.corpus}/${nombre}`;
    // curl | gunzip: el gunzip de Node se detenía en silencio a mitad de fragmento (archivo multi-miembro).
    const hijo = spawn("sh", ["-c", `curl -sf --retry 3 "${url}" | gunzip`], { stdio: ["ignore", "pipe", "inherit"] });
    const rl = createInterface({ input: hijo.stdout, crlfDelay: Infinity });
    const cerrado = new Promise((ok, mal) =>
      hijo.on("close", (code) => (code === 0 ? ok() : mal(new Error(`curl|gunzip salió con ${code}: ${url}`)))),
    );
    for await (const linea of rl) {
      lineas++;
      const tab = linea.indexOf("\t");
      if (tab < 0) continue;
      const token = linea.slice(0, tab);
      if (token.includes("_") || !plano.test(token)) continue;
      const total = conteoReciente(linea.split("\t"));
      if (total < PISO) continue; // el OCR y las rarezas no caben en memoria ni en un diccionario de 16 000
      // Copia plana: un `slice` de la línea la mantendría viva entera (≈ 7 KB por forma) y agota la memoria.
      const minus = Buffer.from(token.toLowerCase(), "utf8").toString("utf8");
      if (token === minus) {
        if (cfg.forma.test(minus)) minusculas.set(minus, (minusculas.get(minus) ?? 0) + total);
      } else if (token === cfg.capital(minus)) {
        mayusculas.set(minus, (mayusculas.get(minus) ?? 0) + total);
      }
    }
    await cerrado;
    console.log(`  ${cfg.corpus} ${k + 1}/${cfg.fragmentos} (${(lineas / 1e6).toFixed(0)} M líneas, ${minusculas.size} formas)`);
  }
  return { minusculas, mayusculas };
}

function curar(cfg, minusculas, mayusculas) {
  const ordenadas = [...minusculas.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  const palabras = [];
  const descartes = { propio: 0, vetada: 0, sensible: 0, forma: 0 };
  for (const [palabra, conteo] of ordenadas) {
    if (palabras.length >= TOPE) break;
    if (cfg.marcadores.test(palabra) || cfg.triple.test(palabra) || cfg.risa.test(palabra)) {
      descartes.forma++;
      continue;
    }
    if (cfg.interjecciones.has(palabra) || cfg.ajenas.has(palabra)) {
      descartes.forma++;
      continue;
    }
    if (cfg.vetadas.has(palabra)) {
      descartes.vetada++;
      continue;
    }
    if (esSensible(palabra)) {
      descartes.sensible++;
      continue;
    }
    if (cfg.terminacionAjena.test(palabra) && !cfg.prestamos.has(palabra)) {
      descartes.forma++;
      continue;
    }
    // Nombre propio: la forma con mayúscula pesa varias veces más que la minúscula.
    if ((mayusculas.get(palabra) ?? 0) > conteo * cfg.razonPropio) {
      descartes.propio++;
      continue;
    }
    palabras.push(palabra);
  }
  // Suplemento a mano (registro de casa), con el mismo veto, sin repetir lo que ya está.
  const ya = new Set(palabras);
  const extra = cfg.suplemento.filter(
    (p) => !ya.has(p) && cfg.forma.test(p) && !cfg.vetadas.has(p) && !esSensible(p),
  );
  const unicas = [...new Set(extra)];
  palabras.splice(SUPLEMENTO_EN, 0, ...unicas);
  palabras.length = Math.min(palabras.length, TOPE);
  descartes.suplemento = unicas.length;
  return { palabras, descartes };
}

function escribir(cfg, palabras) {
  const lineas = [];
  for (let i = 0; i < palabras.length; i += 8) {
    lineas.push("  " + palabras.slice(i, i + 8).map((p) => JSON.stringify(p)).join(", ") + ",");
  }
  const contenido = `// GENERADO por scripts/gen-diccionario.mjs — NO editar a mano (correrlo de nuevo).
// Diccionario de ortografía del Objetivo (${cfg.nombre}): las ${palabras.length} formas más frecuentes que
// sobrevivieron la curaduría. Fuente: Google Books Ngram 1-gramas («${cfg.corpus}», edición 20200217),
// licencia CC BY 3.0 — atribución en Ajustes → Acerca de y en src/lib/objetivo/LICENCIA-diccionario.md.
// Orden = frecuencia real de uso (el índice ES el rango).
// Se carga BAJO DEMANDA al primer teclazo de /objetivo — jamás en el bundle inicial.

export const ${cfg.constante}: readonly string[] = [
${lineas.join("\n")}
];
`;
  writeFileSync(cfg.destino, contenido);
}

// ---------------------------------------------------------------------------------------------------

const pedidos = process.argv.slice(2).filter((a) => a in IDIOMAS);
for (const codigo of pedidos.length ? pedidos : ["es", "en"]) {
  const cfg = IDIOMAS[codigo];
  console.log(`▸ ${cfg.nombre}`);
  const { minusculas, mayusculas } = await leer(cfg);
  const { palabras, descartes } = curar(cfg, minusculas, mayusculas);
  if (palabras.length < 12000) {
    throw new Error(`Quedaron solo ${palabras.length} palabras en ${cfg.nombre}: revisar filtros.`);
  }
  escribir(cfg, palabras);
  console.log(`✔ ${palabras.length} palabras → ${cfg.destino}`);
  console.log(`  descartes: ${JSON.stringify(descartes)}`);
  if (codigo === "es" && process.env.SOLAPE_CON) {
    const vieja = [...readFileSync(process.env.SOLAPE_CON, "utf8").matchAll(/"([^"]+)"/g)].map((m) => m[1]);
    const top = (l, n) => new Set(l.slice(0, n));
    for (const n of [2000, 5000, 10000]) {
      const a = top(vieja, n);
      const comunes = palabras.slice(0, n).filter((p) => a.has(p)).length;
      console.log(`  solape top ${n} con la lista vieja: ${((comunes / n) * 100).toFixed(1)} %`);
    }
  }
}
