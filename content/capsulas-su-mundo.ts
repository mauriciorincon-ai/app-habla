import type { CapsulaEs } from "./schema";

/**
 * SU MUNDO EN TODO (S14, ADR-026): las cápsulas que faltaban para que la meta de la semana alinee lo
 * que de verdad se trabaja en casa — los COLORES pegados a lo que le encanta («un carro ROJO») y el
 * BAÑO, una rutina diaria que tenía solo dos cápsulas. Nacen con sus dos caras, redactadas en cada
 * idioma (no traducidas), cada una con su técnica y su fuente. Nivel: palabras sueltas (ADR-005) — el
 * color se modela como UNA palabra con énfasis, jamás como examen («¿de qué color es?» está prohibido
 * aquí: hoy nombra el adulto).
 */
export const CAPSULAS_SU_MUNDO_ES: CapsulaEs[] = [
  {
    id: "colores-el-color-de-lo-que-ama",
    tecnica: "estimulacion-focalizada",
    etapa: "palabras-sueltas",
    titulo: "Un color, pegado a lo que le encanta",
    explicacion:
      "Los colores se aprenden mejor pegados a algo que a él ya le importa. No hace falta una lección: toma su juguete favorito y ponle el color encima, una y otra vez, con la misma palabra clara. «Rojo» suena distinto cuando es el de SU carro. Escoge un solo color para hoy y repítelo en muchos momentos, sin preguntarle cuál es.",
    guion:
      "Señala su juguete y di, despacio: “un carro… ¡ROJO!”. Y sigue jugando.",
    actividad: {
      texto:
        "Elige un color para hoy. Cada vez que aparezca en algo que a él le guste —un carro, un dinosaurio, una pelota—, nómbralo con énfasis: “¡rojo!”. Cinco veces en el día basta. Nada de “¿de qué color es?”: hoy nombras tú.",
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
    titulo: "Vestirse con colores",
    explicacion:
      "Vestirse pasa todos los días, y cada prenda trae su color. Es el lugar perfecto para modelar sin esfuerzo: mientras le pasas la media, nombras el color; mientras sube el pantalón, otra vez. No le pidas que repita. Él te está oyendo poner palabras a lo que tiene en las manos.",
    guion:
      "Muéstrale la media antes de ponérsela: “¡azul!”. Y espera un momento, sonriendo.",
    actividad: {
      texto:
        "Mañana, al vestirlo, nombra el color de dos o tres prendas, una palabra cada vez. Si él dice algo —un sonido, un intento, otra palabra—, respóndele con el color otra vez y sigue.",
      conPantalla: false,
    },
    fuente:
      "Modelado por padres en rutinas diarias: el adulto nombra lo que el niño está mirando o tocando, en el momento (Roberts y Kaiser 2011, AJSLP).",
    etiquetas: ["colores", "vestirse"],
  },
  {
    id: "colores-su-palabra-con-color",
    tecnica: "expansion-recast",
    etapa: "palabras-sueltas",
    titulo: "Su palabra, con un color encima",
    explicacion:
      "Cuando él nombra algo —“carro”, “pez”—, tienes un regalo en la mano: devuélvele su misma palabra y súmale el color. No corriges nada; solo le muestras el paso siguiente. Si no lo repite, no pasa nada: lo oyó en el mejor momento, justo cuando él estaba hablando de eso.",
    guion:
      "Él dice “carro”. Tú, contento: “¡carro… rojo!”. Y le sigues el juego.",
    actividad: {
      texto:
        "Hoy, cuando nombre algo que tiene un color claro, devuélveselo con el color: “pez… pez amarillo”. Tres veces en el día. Si dice solo una palabra, perfecto: eso es lo que esperamos.",
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
    titulo: "¿El rojo o el azul?",
    explicacion:
      "Elegir le da poder, y el poder da ganas de comunicarse. Ofrécele dos cosas que quiera de verdad y que solo se diferencien por el color: dos crayones, dos tapas, dos carritos. Nómbralas al mostrarlas y espera. Cualquier respuesta cuenta: señalar, mirar, un sonido. Dale lo que eligió y nómbralo otra vez.",
    guion:
      "Sostén los dos en alto: “¿rojo… o azul?”, y espera con cara de pregunta.",
    actividad: {
      texto:
        "En tres momentos de hoy, ofrécele elegir entre dos cosas iguales de distinto color. Ante cualquier respuesta, entrégale la que eligió diciendo el color: “¡azul!”.",
      conPantalla: false,
    },
    fuente:
      "Seguir el interés y ofrecer elecciones aumenta la iniciación comunicativa y el adulto modela la palabra justo antes de entregar (Kaiser y Roberts 2013, enseñanza en el ambiente).",
    etiquetas: ["colores", "elegir"],
  },
  {
    id: "bano-cada-parte-su-nombre",
    tecnica: "modelado",
    etapa: "palabras-sueltas",
    titulo: "En el baño, cada parte tiene su nombre",
    explicacion:
      "El baño es una rutina lenta, cálida y repetida: perfecta para palabras. Mientras lo lavas, nombra lo que tocas, una palabra cada vez: “pies”, “manos”, “panza”. Siempre en el mismo orden, todos los días. La repetición es lo que hace que la palabra se quede.",
    guion:
      "Mientras le lavas los pies, di despacio: “pies… pies”. Y pasa a las manos.",
    actividad: {
      texto:
        "Hoy en el baño, nombra tres partes del cuerpo mientras las lavas, en el mismo orden de siempre. Si él señala o hace un sonido, respóndele con la palabra.",
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
    titulo: "Antes de abrir la llave, espera",
    explicacion:
      "Él sabe que viene el agua. Ese saber es tu oportunidad: pon la mano en la llave, míralo y espera unos segundos antes de abrirla. Si hace un sonido, mira la llave o dice algo, abre enseguida y nombra: “¡agua!”. Si no pasa nada, ábrela igual, contento. La espera es una invitación, no una prueba.",
    guion:
      "Mano en la llave, míralo y cuenta cinco en silencio. Luego abre: “¡agua!”.",
    actividad: {
      texto:
        "Hoy, tres veces durante el baño (la llave, la regadera, el jarrito), haz la misma pausa antes del agua. Cualquier intento abre el agua.",
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
    titulo: "Una palabra para todo el baño: burbuja",
    explicacion:
      "Elige una sola palabra para el baño de hoy y úsala muchas veces, en distintos momentos: “burbuja” cuando sale, cuando sube, cuando él la revienta. No le pidas que la diga. Lo que hace la magia es oírla muchas veces, clara y ligada a algo que él está mirando.",
    guion:
      "Sopla una burbuja y, cuando él la mire, di: “¡burbuja!”. Y otra. Y otra.",
    actividad: {
      texto:
        "Elige la palabra del baño (burbuja, pato, agua) y dila unas diez veces durante el baño, siempre cuando él esté mirando la cosa. Sin pedirle que repita.",
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
    titulo: "En el agua, su palabra y una más",
    explicacion:
      "En el baño él está tranquilo y con ganas de jugar: es buen momento para devolverle lo que dice. Si dice “agua”, tú: “agua… agua tibia”. Si hace un sonido al salpicar, tú: “¡plaf!”. Sin corregir, sin pedir. Solo le das el modelo un pasito más allá.",
    guion:
      "Él dice “agua”. Tú, alegre: “¡agua… agua tibia!”. Y sigues bañándolo.",
    actividad: {
      texto:
        "Hoy, cada vez que diga o intente algo en el baño, devuélveselo con una palabra más. Tres veces basta. Si no dice nada, nombra tú lo que él hace.",
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
    titulo: "El juguete del baño que él elija",
    explicacion:
      "Pon dos o tres juguetes cerca de la bañera y deja que él elija con cuál juega. Donde vaya su atención, ahí van tus palabras: si agarra el barco, el baño es del barco. “Barco… se hunde… ¡arriba!”. Seguirlo a él hace que las palabras lleguen cuando las está escuchando de verdad.",
    guion:
      "Deja que agarre un juguete y nómbralo: “¡barco!”. Luego, lo que hace: “¡arriba!”.",
    actividad: {
      texto:
        "En el baño de hoy, ofrécele dos juguetes y sigue el que elija. Nombra el juguete y una o dos acciones (“nada”, “salta”, “abajo”). Cinco minutos y listo.",
      conPantalla: false,
    },
    fuente:
      "Seguir el interés del niño: nombrar el foco de atención que él eligió se asocia con más vocabulario (Roberts y Kaiser 2011).",
    etiquetas: ["baño", "juego", "acciones"],
  },
  {
    id: "sonidos-bano-salpicar",
    tecnica: "modelado",
    etapa: "sonidos-e-intentos",
    titulo: "Salpicar también es hablar",
    explicacion:
      "Para un niño que todavía explora sonidos, el baño es un concierto: el agua cae, salpica, gotea. Ponle sonido a cada cosa —“¡plaf!”, “glu glu”, “pss”— y espera a ver si él te devuelve alguno. Si lo hace, repítelo tú, como un juego de eco. Cualquier sonido cuenta.",
    guion:
      "Deja caer agua del jarrito y di: “¡plaf!”. Espera. Si él hace un sonido, repítelo.",
    actividad: {
      texto:
        "Hoy en el baño, haz tres sonidos con el agua y espera después de cada uno. Si él te devuelve algo, devuélveselo igual: eso es un turno.",
      conPantalla: false,
    },
    fuente:
      "Modelado de sonidos e imitación por turnos dentro del juego temprano (Roberts y Kaiser 2011, AJSLP; Kaiser y Roberts 2013).",
    etiquetas: ["baño", "sonidos", "imitación"],
  },
];
