import type { PlantillaCuento } from "./schema";

// LA BIBLIOTECA DE RESPALDO DE «CUENTOS DE CASA» (S9, ADR-019). Seis cuentos cortos, redactados en cada
// idioma (no traducidos), de cuatro páginas con una palabra meta por página: palabras sueltas primero
// (regla 7). Dos huecos se llenan en el aparato con lo que escribe el adulto: `{interes}` (algo que le
// gusta, en palabras genéricas) y `{palabra}` (una palabra que están practicando). Las frases evitan
// concordar con el hueco («con {interes}», «y {interes}»), para que sirva un singular o un plural.
// Sin plazos, sin puntajes, sin cifras. La app está completa con esta biblioteca sola; los lotes de la
// bandeja son el acento.

export const CUENTOS: readonly PlantillaCuento[] = [
  {
    id: "el-paseo",
    titulo: { es: "El paseo", en: "The walk" },
    porDefecto: {
      interes: { es: "los dinosaurios", en: "the dinosaurs" },
      palabra: { es: "hola", en: "hello" },
    },
    paginas: [
      {
        texto: {
          es: "Hoy salimos de casa con {interes}.",
          en: "Today we leave the house with {interes}.",
        },
        palabra: { es: "casa", en: "house" },
      },
      {
        texto: {
          es: "En la calle, un perro dice guau.",
          en: "On the street, a dog says woof.",
        },
        palabra: { es: "guau", en: "woof" },
      },
      {
        texto: {
          es: "Nosotros y {interes} decimos: {palabra}.",
          en: "We wave with {interes} and say: {palabra}.",
        },
        palabra: { es: "{palabra}", en: "{palabra}" },
      },
      {
        texto: {
          es: "Ya es tarde. Volvemos a casa. Adiós.",
          en: "It is late. We go home. Bye.",
        },
        palabra: { es: "adiós", en: "bye" },
      },
    ],
  },
  {
    id: "arriba-y-abajo",
    titulo: { es: "Arriba y abajo", en: "Up and down" },
    porDefecto: {
      interes: { es: "los carros", en: "the cars" },
      palabra: { es: "mamá", en: "mom" },
    },
    paginas: [
      {
        texto: {
          es: "Con {interes} subimos la escalera. Arriba.",
          en: "With {interes} we climb the stairs. Up.",
        },
        palabra: { es: "arriba", en: "up" },
      },
      {
        texto: {
          es: "Desde arriba vemos el patio.",
          en: "From up here we can see the yard.",
        },
        palabra: { es: "patio", en: "yard" },
      },
      {
        texto: {
          es: "Con {interes} bajamos despacio. Abajo.",
          en: "With {interes} we go down slowly. Down.",
        },
        palabra: { es: "abajo", en: "down" },
      },
      {
        texto: {
          es: "Abajo nos espera {palabra}.",
          en: "Down here, {palabra} is waiting.",
        },
        palabra: { es: "{palabra}", en: "{palabra}" },
      },
    ],
  },
  {
    id: "la-hora-del-bano",
    titulo: { es: "La hora del baño", en: "Bath time" },
    porDefecto: {
      interes: { es: "los patos", en: "the ducks" },
      palabra: { es: "pijama", en: "pajamas" },
    },
    paginas: [
      {
        texto: {
          es: "Es la hora del baño. Abre el agua.",
          en: "It is bath time. Turn on the water.",
        },
        palabra: { es: "agua", en: "water" },
      },
      {
        texto: {
          es: "Con {interes} nos metemos. ¡Chap, chap!",
          en: "In we go with {interes}. Splash!",
        },
        palabra: { es: "chap", en: "splash" },
      },
      {
        texto: {
          es: "Cuánta espuma. Sopla: fuuu.",
          en: "So many bubbles. Blow: fooo.",
        },
        palabra: { es: "sopla", en: "blow" },
      },
      {
        texto: {
          es: "Al salir, toalla y {palabra}.",
          en: "Out we come: a towel and {palabra}.",
        },
        palabra: { es: "{palabra}", en: "{palabra}" },
      },
    ],
  },
  {
    id: "a-buscar",
    titulo: { es: "A buscar", en: "Let's look" },
    porDefecto: {
      interes: { es: "el oso", en: "the bear" },
      palabra: { es: "hola", en: "hi" },
    },
    paginas: [
      {
        texto: {
          es: "Buscamos a {interes}. Aquí no.",
          en: "We look for {interes}. Not here.",
        },
        palabra: { es: "aquí", en: "here" },
      },
      {
        texto: { es: "¿Debajo de la mesa? No.", en: "Under the table? No." },
        palabra: { es: "no", en: "no" },
      },
      {
        texto: {
          es: "¿Detrás de la puerta? ¡Sí! Ahí.",
          en: "Behind the door? Yes! Right there.",
        },
        palabra: { es: "sí", en: "yes" },
      },
      {
        texto: {
          es: "¡Encontrado! Decimos: {palabra}.",
          en: "Found! We say: {palabra}.",
        },
        palabra: { es: "{palabra}", en: "{palabra}" },
      },
    ],
  },
  {
    id: "a-comer",
    titulo: { es: "A comer", en: "Time to eat" },
    porDefecto: {
      interes: { es: "el conejo", en: "the bunny" },
      palabra: { es: "más", en: "more" },
    },
    paginas: [
      {
        texto: {
          es: "Tenemos hambre. ¿Qué hay? Pan.",
          en: "We are hungry. What is there? Bread.",
        },
        palabra: { es: "pan", en: "bread" },
      },
      {
        texto: {
          es: "Con {interes} compartimos el pan. Toma.",
          en: "We share the bread with {interes}. Take some.",
        },
        palabra: { es: "toma", en: "take" },
      },
      {
        texto: {
          es: "Ahora agua. Glu, glu, glu.",
          en: "Now some water. Gulp, gulp.",
        },
        palabra: { es: "agua", en: "water" },
      },
      {
        texto: {
          es: "¿Quieres más? Di: {palabra}.",
          en: "Do you want more? Say: {palabra}.",
        },
        palabra: { es: "{palabra}", en: "{palabra}" },
      },
    ],
  },
  {
    id: "buenas-noches",
    titulo: { es: "Buenas noches", en: "Good night" },
    porDefecto: {
      interes: { es: "las estrellas", en: "the stars" },
      palabra: { es: "chao", en: "bye" },
    },
    paginas: [
      {
        texto: {
          es: "Ya es de noche. Mira la luna.",
          en: "It is night now. Look at the moon.",
        },
        palabra: { es: "luna", en: "moon" },
      },
      {
        texto: {
          es: "Con {interes} cerramos los ojos.",
          en: "With {interes} we close our eyes.",
        },
        palabra: { es: "ojos", en: "eyes" },
      },
      {
        texto: {
          es: "Apagamos la luz. Clic.",
          en: "We turn off the light. Click.",
        },
        palabra: { es: "luz", en: "light" },
      },
      {
        texto: {
          es: "Un abrazo, y a decir: {palabra}.",
          en: "A hug, and we say: {palabra}.",
        },
        palabra: { es: "{palabra}", en: "{palabra}" },
      },
    ],
  },
];
