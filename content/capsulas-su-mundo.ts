import type { Capsula } from "./schema";

/**
 * SU MUNDO EN TODO (S14, ADR-026): las cápsulas que faltaban para que la meta de la semana alinee lo
 * que de verdad se trabaja en casa — los COLORES pegados a lo que le encanta («un carro ROJO») y el
 * BAÑO, una rutina diaria que tenía solo dos cápsulas. Nacen con sus dos caras, redactadas en cada
 * idioma (no traducidas), cada una con su técnica y su fuente. Nivel: palabras sueltas (ADR-005) — el
 * color se modela como UNA palabra con énfasis, jamás como examen («¿de qué color es?» está prohibido
 * aquí: hoy nombra el adulto).
 */
export const CAPSULAS_SU_MUNDO: Capsula[] = [
  // ── Colores ────────────────────────────────────────────────────────────────────────────────────
  {
    id: "colores-el-color-de-lo-que-ama",
    tecnica: "estimulacion-focalizada",
    etapa: "palabras-sueltas",
    titulo: {
      es: "Un color, pegado a lo que le encanta",
      en: "One color, stuck to the thing they love",
    },
    explicacion: {
      es: "Los colores se aprenden mejor pegados a algo que a él ya le importa. No hace falta una lección: toma su juguete favorito y ponle el color encima, una y otra vez, con la misma palabra clara. «Rojo» suena distinto cuando es el de SU carro. Escoge un solo color para hoy y repítelo en muchos momentos, sin preguntarle cuál es.",
      en: "Colors stick best when they are glued to something your child already cares about. No lesson needed: pick up their favorite toy and put the color on it, again and again, with the same clear word. “Red” lands differently when it's THEIR truck. Choose one color for today and say it in lots of moments, without asking them which one it is.",
    },
    guion: {
      es: "Señala su juguete y di, despacio: “un carro… ¡ROJO!”. Y sigue jugando.",
      en: "Point at their toy and say it slowly: “a truck… RED!” Then keep playing.",
    },
    actividad: {
      texto: {
        es: "Elige un color para hoy. Cada vez que aparezca en algo que a él le guste —un carro, un dinosaurio, una pelota—, nómbralo con énfasis: “¡rojo!”. Cinco veces en el día basta. Nada de “¿de qué color es?”: hoy nombras tú.",
        en: "Pick one color for today. Every time it shows up on something they like (a truck, a dinosaur, a ball), name it with a little stress: “red!”. Five times across the day is plenty. No “what color is it?”: today, you do the naming.",
      },
      conPantalla: false,
    },
    fuente:
      "Estimulación focalizada: el adulto repite una palabra objetivo muchas veces en contextos con sentido, sin exigir que el niño la diga (Girolametto, Pearce y Weitzman 1996, JSHR).",
    etiquetas: ["colores", "juego"],
  },
  {
    id: "colores-vestirse-con-color",
    tecnica: "modelado",
    etapa: "palabras-sueltas",
    titulo: { es: "Vestirse con colores", en: "Getting dressed in colors" },
    explicacion: {
      es: "Vestirse pasa todos los días, y cada prenda trae su color. Es el lugar perfecto para modelar sin esfuerzo: mientras le pasas la media, nombras el color; mientras sube el pantalón, otra vez. No le pidas que repita. Él te está oyendo poner palabras a lo que tiene en las manos.",
      en: "Getting dressed happens every day, and every piece of clothing brings a color with it. It's the easiest place to model: as you hand over the sock, say its color; as the trousers go on, say it again. Don't ask them to repeat it. They are listening to you put words on what's in their hands.",
    },
    guion: {
      es: "Muéstrale la media antes de ponérsela: “¡azul!”. Y espera un momento, sonriendo.",
      en: "Hold up the sock before it goes on: “blue!” Then wait a moment, smiling.",
    },
    actividad: {
      texto: {
        es: "Mañana, al vestirlo, nombra el color de dos o tres prendas, una palabra cada vez. Si él dice algo —un sonido, un intento, otra palabra—, respóndele con el color otra vez y sigue.",
        en: "Tomorrow while dressing, name the color of two or three things, one word at a time. If they say anything back (a sound, a try, another word), answer with the color again and carry on.",
      },
      conPantalla: false,
    },
    fuente:
      "Modelado por padres en rutinas diarias: el adulto nombra lo que el niño está mirando o tocando, en el momento (Roberts y Kaiser 2011, AJSLP; Heidlage et al. 2019).",
    etiquetas: ["colores", "vestirse"],
  },
  {
    id: "colores-su-palabra-con-color",
    tecnica: "expansion-recast",
    etapa: "palabras-sueltas",
    titulo: {
      es: "Su palabra, con un color encima",
      en: "Their word, with a color on top",
    },
    explicacion: {
      es: "Cuando él nombra algo —“carro”, “pez”—, tienes un regalo en la mano: devuélvele su misma palabra y súmale el color. No corriges nada; solo le muestras el paso siguiente. Si no lo repite, no pasa nada: lo oyó en el mejor momento, justo cuando él estaba hablando de eso.",
      en: "When your child names something (“truck”, “fish”), you've been handed a gift: give them back their own word and add the color. You're not correcting anything, just showing the next step. If they don't repeat it, that's fine: they heard it at the best moment, right while they were talking about that thing.",
    },
    guion: {
      es: "Él dice “carro”. Tú, contento: “¡carro… rojo!”. Y le sigues el juego.",
      en: "They say “truck”. You, delighted: “truck… red truck!” And follow their game.",
    },
    actividad: {
      texto: {
        es: "Hoy, cuando nombre algo que tiene un color claro, devuélveselo con el color: “pez… pez amarillo”. Tres veces en el día. Si dice solo una palabra, perfecto: eso es lo que esperamos.",
        en: "Today, when they name something with a clear color, hand it back with the color: “fish… yellow fish”. Three times across the day. If they say just one word, perfect: that's what we're hoping for.",
      },
      conPantalla: false,
    },
    fuente:
      "Expansión y recast: devolver lo que el niño dijo con un elemento más, sin corregir (Cleave et al. 2015, AJSLP, revisión sistemática de los recasts).",
    etiquetas: ["colores", "carros"],
  },
  {
    id: "colores-el-rojo-o-el-azul",
    tecnica: "seguir-interes",
    etapa: "palabras-sueltas",
    titulo: { es: "¿El rojo o el azul?", en: "The red one or the blue one?" },
    explicacion: {
      es: "Elegir le da poder, y el poder da ganas de comunicarse. Ofrécele dos cosas que quiera de verdad y que solo se diferencien por el color: dos crayones, dos tapas, dos carritos. Nómbralas al mostrarlas y espera. Cualquier respuesta cuenta: señalar, mirar, un sonido. Dale lo que eligió y nómbralo otra vez.",
      en: "Choosing gives them power, and power makes them want to communicate. Offer two things they really want that differ only in color: two crayons, two lids, two little cars. Name them as you show them, then wait. Any answer counts: pointing, looking, a sound. Give them what they chose and name it again.",
    },
    guion: {
      es: "Sostén los dos en alto: “¿rojo… o azul?”, y espera con cara de pregunta.",
      en: "Hold both up: “red… or blue?”, then wait with a curious face.",
    },
    actividad: {
      texto: {
        es: "En tres momentos de hoy, ofrécele elegir entre dos cosas iguales de distinto color. Ante cualquier respuesta, entrégale la que eligió diciendo el color: “¡azul!”.",
        en: "Three times today, offer a choice between two matching things in different colors. Whatever the answer, hand over the one they picked and say the color: “blue!”.",
      },
      conPantalla: false,
    },
    fuente:
      "Seguir el interés y ofrecer elecciones aumenta la iniciación comunicativa (Crank et al. 2021); el adulto modela la palabra justo antes de entregar (Kaiser y Roberts 2013, enseñanza en el ambiente).",
    etiquetas: ["colores", "elegir"],
  },
  // ── Baño ───────────────────────────────────────────────────────────────────────────────────────
  {
    id: "bano-cada-parte-su-nombre",
    tecnica: "modelado",
    etapa: "palabras-sueltas",
    titulo: {
      es: "En el baño, cada parte tiene su nombre",
      en: "At bath time, every part has a name",
    },
    explicacion: {
      es: "El baño es una rutina lenta, cálida y repetida: perfecta para palabras. Mientras lo lavas, nombra lo que tocas, una palabra cada vez: “pies”, “manos”, “panza”. Siempre en el mismo orden, todos los días. La repetición es lo que hace que la palabra se quede.",
      en: "Bath time is slow, warm and repeated: perfect for words. As you wash, name what you touch, one word at a time: “feet”, “hands”, “tummy”. Same order, every day. Repetition is what makes a word stay.",
    },
    guion: {
      es: "Mientras le lavas los pies, di despacio: “pies… pies”. Y pasa a las manos.",
      en: "As you wash their feet, say it slowly: “feet… feet”. Then move on to the hands.",
    },
    actividad: {
      texto: {
        es: "Hoy en el baño, nombra tres partes del cuerpo mientras las lavas, en el mismo orden de siempre. Si él señala o hace un sonido, respóndele con la palabra.",
        en: "In the bath today, name three body parts as you wash them, in the usual order. If they point or make a sound, answer with the word.",
      },
      conPantalla: false,
    },
    fuente:
      "Modelado en rutinas: las rutinas repetidas dan contextos predecibles donde la palabra se asocia con la acción (Roberts y Kaiser 2011, AJSLP).",
    etiquetas: ["baño", "agua"],
  },
  {
    id: "bano-antes-de-la-llave",
    tecnica: "espera-estructurada",
    etapa: "palabras-sueltas",
    titulo: {
      es: "Antes de abrir la llave, espera",
      en: "Before you turn on the tap, wait",
    },
    explicacion: {
      es: "Él sabe que viene el agua. Ese saber es tu oportunidad: pon la mano en la llave, míralo y espera unos segundos antes de abrirla. Si hace un sonido, mira la llave o dice algo, abre enseguida y nombra: “¡agua!”. Si no pasa nada, ábrela igual, contento. La espera es una invitación, no una prueba.",
      en: "They know the water is coming. That knowing is your chance: put your hand on the tap, look at them and wait a few seconds before you turn it. If they make a sound, look at the tap or say something, turn it on right away and name it: “water!”. If nothing happens, turn it on anyway, cheerfully. The wait is an invitation, not a test.",
    },
    guion: {
      es: "Mano en la llave, míralo y cuenta cinco en silencio. Luego abre: “¡agua!”.",
      en: "Hand on the tap, look at them and count five in silence. Then turn it: “water!”",
    },
    actividad: {
      texto: {
        es: "Hoy, tres veces durante el baño (la llave, la regadera, el jarrito), haz la misma pausa antes del agua. Cualquier intento abre el agua.",
        en: "Three times in the bath today (the tap, the shower, the little cup), make the same pause before the water. Any attempt turns the water on.",
      },
      conPantalla: false,
    },
    fuente:
      "Espera estructurada: una pausa expectante del adulto en una rutina conocida aumenta las iniciaciones del niño (PubMed 29054980; Kaiser y Roberts 2013).",
    etiquetas: ["baño", "agua", "espera"],
  },
  {
    id: "bano-una-palabra-burbuja",
    tecnica: "estimulacion-focalizada",
    etapa: "palabras-sueltas",
    titulo: {
      es: "Una palabra para todo el baño: burbuja",
      en: "One word for the whole bath: bubble",
    },
    explicacion: {
      es: "Elige una sola palabra para el baño de hoy y úsala muchas veces, en distintos momentos: “burbuja” cuando sale, cuando sube, cuando él la revienta. No le pidas que la diga. Lo que hace la magia es oírla muchas veces, clara y ligada a algo que él está mirando.",
      en: "Pick a single word for today's bath and use it lots, at different moments: “bubble” when one appears, when it floats up, when they pop it. Don't ask them to say it. The magic comes from hearing it many times, clearly, tied to something they're looking at.",
    },
    guion: {
      es: "Sopla una burbuja y, cuando él la mire, di: “¡burbuja!”. Y otra. Y otra.",
      en: "Blow a bubble and, when they look at it, say: “bubble!” And another. And another.",
    },
    actividad: {
      texto: {
        es: "Elige la palabra del baño (burbuja, pato, agua) y dila unas diez veces durante el baño, siempre cuando él esté mirando la cosa. Sin pedirle que repita.",
        en: "Pick the bath word (bubble, duck, water) and say it about ten times during the bath, always while they're looking at the thing. No asking them to repeat.",
      },
      conPantalla: false,
    },
    fuente:
      "Estimulación focalizada: muchas repeticiones de una palabra objetivo en contexto, sin exigir que el niño la diga (Girolametto, Pearce y Weitzman 1996, JSHR).",
    etiquetas: ["baño", "juego"],
  },
  {
    id: "bano-su-palabra-y-una-mas",
    tecnica: "expansion-recast",
    etapa: "palabras-sueltas",
    titulo: {
      es: "En el agua, su palabra y una más",
      en: "In the water, their word plus one",
    },
    explicacion: {
      es: "En el baño él está tranquilo y con ganas de jugar: es buen momento para devolverle lo que dice. Si dice “agua”, tú: “agua… agua tibia”. Si hace un sonido al salpicar, tú: “¡plaf!”. Sin corregir, sin pedir. Solo le das el modelo un pasito más allá.",
      en: "In the bath they're relaxed and ready to play: a good moment to hand back what they say. If they say “water”, you say: “water… warm water”. If they make a sound as they splash, you say: “splash!”. No correcting, no asking. You just give them the model one small step further.",
    },
    guion: {
      es: "Él dice “agua”. Tú, alegre: “¡agua… agua tibia!”. Y sigues bañándolo.",
      en: "They say “water”. You, cheerful: “water… warm water!” And keep washing.",
    },
    actividad: {
      texto: {
        es: "Hoy, cada vez que diga o intente algo en el baño, devuélveselo con una palabra más. Tres veces basta. Si no dice nada, nombra tú lo que él hace.",
        en: "Today, every time they say or try something in the bath, give it back with one more word. Three times is enough. If they say nothing, name what they're doing.",
      },
      conPantalla: false,
    },
    fuente:
      "Recast y expansión: devolver lo que dijo el niño, ampliado, sin corrección explícita (Cleave et al. 2015, AJSLP).",
    etiquetas: ["baño", "agua"],
  },
  {
    id: "bano-el-juguete-que-elija",
    tecnica: "seguir-interes",
    etapa: "palabras-sueltas",
    titulo: {
      es: "El juguete del baño que él elija",
      en: "The bath toy they pick",
    },
    explicacion: {
      es: "Pon dos o tres juguetes cerca de la bañera y deja que él elija con cuál juega. Donde vaya su atención, ahí van tus palabras: si agarra el barco, el baño es del barco. “Barco… se hunde… ¡arriba!”. Seguirlo a él hace que las palabras lleguen cuando las está escuchando de verdad.",
      en: "Put two or three toys near the tub and let them choose which one to play with. Wherever their attention goes, your words go too: if they grab the boat, the bath belongs to the boat. “Boat… down it goes… up!” Following them means the words arrive when they are really listening.",
    },
    guion: {
      es: "Deja que agarre un juguete y nómbralo: “¡barco!”. Luego, lo que hace: “¡arriba!”.",
      en: "Let them grab a toy and name it: “boat!” Then what it does: “up!”",
    },
    actividad: {
      texto: {
        es: "En el baño de hoy, ofrécele dos juguetes y sigue el que elija. Nombra el juguete y una o dos acciones (“nada”, “salta”, “abajo”). Cinco minutos y listo.",
        en: "In today's bath, offer two toys and follow the one they pick. Name the toy and one or two actions (“swim”, “jump”, “down”). Five minutes and you're done.",
      },
      conPantalla: false,
    },
    fuente:
      "Seguir el interés del niño: nombrar el foco de atención que él eligió se asocia con más vocabulario (Crank et al. 2021; Roberts y Kaiser 2011).",
    etiquetas: ["baño", "juego", "acciones"],
  },
  {
    id: "sonidos-bano-salpicar",
    tecnica: "modelado",
    etapa: "sonidos-e-intentos",
    titulo: {
      es: "Salpicar también es hablar",
      en: "Splashing is talking too",
    },
    explicacion: {
      es: "Para un niño que todavía explora sonidos, el baño es un concierto: el agua cae, salpica, gotea. Ponle sonido a cada cosa —“¡plaf!”, “glu glu”, “pss”— y espera a ver si él te devuelve alguno. Si lo hace, repítelo tú, como un juego de eco. Cualquier sonido cuenta.",
      en: "For a child who is still exploring sounds, the bath is a concert: water falls, splashes, drips. Give each thing a sound (“splash!”, “glug glug”, “drip”) and wait to see if they give one back. If they do, repeat it, like an echo game. Any sound counts.",
    },
    guion: {
      es: "Deja caer agua del jarrito y di: “¡plaf!”. Espera. Si él hace un sonido, repítelo.",
      en: "Pour water from the cup and say: “splash!” Wait. If they make a sound, copy it.",
    },
    actividad: {
      texto: {
        es: "Hoy en el baño, haz tres sonidos con el agua y espera después de cada uno. Si él te devuelve algo, devuélveselo igual: eso es un turno.",
        en: "In the bath today, make three water sounds and wait after each one. If they give you something back, give it back the same way: that's a turn.",
      },
      conPantalla: false,
    },
    fuente:
      "Modelado de sonidos e imitación por turnos dentro del juego temprano (Roberts y Kaiser 2011, AJSLP; Kaiser y Roberts 2013).",
    etiquetas: ["baño", "sonidos", "imitación"],
  },
];
