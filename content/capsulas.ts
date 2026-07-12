import type { Capsula } from "./schema";

/**
 * Biblioteca semilla de "Hoy" — la respuesta diaria al padre.
 *
 * NIVEL: **palabras sueltas** (calibrado al niño real de esta app, 2026-07-12, feedback del
 * padre en el gate visual). El niño dice palabras de a una; el objetivo de esta etapa es
 * despertar la ASOCIACIÓN palabra↔objeto/actividad y provocar más palabras sueltas. Ninguna
 * cápsula asume que arma frases. Un sonido, un intento o un gesto también cuentan como
 * comunicación — y se responden nombrando. (Un nivel "frases" llegará después como ajuste;
 * este es y seguirá siendo el nivel por defecto.)
 *
 * Cada cápsula: una técnica con evidencia (§A.3), explicada en ~30 segundos, con UN guion que
 * se puede decir tal cual hoy, una actividad concreta y su fuente citada.
 *
 * Tono: cálido, directo, es-CO. Prohibido (§D anti-claims): "terapia", "diagnóstico", plazos
 * ("en X semanas"), puntajes clínicos, elogios desacoplados de lo medido. Esto es práctica de
 * estimulación en casa — complementaria, nunca sustituta, de la fonoaudiología del niño.
 */
export const CAPSULAS: Capsula[] = [
  {
    id: "modelado-nombra-su-mundo",
    tecnica: "modelado",
    titulo: "Ponle nombre a lo que él está mirando",
    explicacion:
      "A esta edad las palabras se aprenden así: el niño tiene la atención puesta en algo y justo en ese momento oye su nombre. Ahí se enciende la asociación entre la palabra y la cosa. Tu trabajo de hoy es simple y poderoso: ser el que le pone nombre al mundo. Una sola palabra, clara, en el momento exacto: “agua”, “carro”, “pelota”. Sin pedirle que repita — él está grabando.",
    guion:
      "Cuando él mire o agarre algo, di su nombre, una sola palabra: “¡pelota!”.",
    actividad: {
      texto:
        "En la comida de hoy, nombra tres cosas cada vez que él las mire o las toque: “jugo”, “pan”, “cuchara”. Solo el nombre, cálido y claro. Nada más.",
      conPantalla: false,
    },
    fuente:
      "Heidlage et al. 2019 (Early Childhood Research Quarterly): la intervención guiada por padres muestra g=0.42 en lenguaje expresivo; el efecto es mayor cuando ocurre dentro del juego y las rutinas (g=0.50).",
  },
  {
    id: "modelado-mismas-palabras-rutina",
    tecnica: "modelado",
    titulo: "Las mismas palabras, en los mismos momentos",
    explicacion:
      "Las rutinas que se repiten todos los días son las mejores maestras: el niño ya sabe qué va a pasar, así que su cabeza queda libre para conectar la palabra con la cosa. El baño tiene agua, jabón, patico. Si “agua” suena todos los días en el mismo momento, esa palabra encuentra su lugar. No hace falta inventar nada; solo decirlo igual, cada vez.",
    guion: "En el baño, las mismas dos palabras de siempre: “agua… jabón”.",
    actividad: {
      texto:
        "Elige dos palabras del baño (o de la comida) y dilas siempre en el mismo momento, todos los días de esta semana. La repetición en rutina es lo que sella la asociación.",
      conPantalla: false,
    },
    fuente:
      "Heidlage et al. 2019: los efectos más grandes del modelado aparecen dentro del juego y las rutinas diarias, no en sesiones aparte.",
  },
  {
    id: "modelado-habla-a-su-tamano",
    tecnica: "modelado",
    titulo: "Háblale a su tamaño",
    explicacion:
      "Las frases largas de adulto se le pierden a un niño que está en palabras sueltas: no alcanza a pescar dónde empieza y termina cada palabra. Hablarle “a su tamaño” es usar una o dos palabras por turno, despacio y con ganas: “¡carro!”, “carro grande”. Así cada palabra le llega entera, y el siguiente escalón (dos palabras juntas) le queda a la vista.",
    guion:
      "Cambia “mira ese carro tan bonito que va por ahí” por: “¡carro!… carro rojo”.",
    actividad: {
      texto:
        "Durante 10 minutos de juego, háblale solo en palabras de a una o de a dos. Si se te escapa una frase larga, no pasa nada: recorta la siguiente.",
      conPantalla: false,
    },
    fuente:
      "Roberts & Kaiser 2011: el motor del cambio es el ajuste del lenguaje del adulto al nivel del niño; el efecto pasa por lo que hace el padre, no por exigirle al niño.",
  },
  {
    id: "recast-devuelve-la-palabra",
    tecnica: "expansion-recast",
    titulo: "Devuélvele la palabra, completa y celebrada",
    explicacion:
      "Cuando tu hijo intenta una palabra y le sale a medias (“aba” por agua, “tete” por chupete), no lo corrijas ni le pidas repetir: devuélvele la palabra completa, con alegría, como confirmando que le entendiste: “¡Agua! Sí, agua”. Él oye la versión buena justo cuando más le importa — en su propio intento — y sin ningún costo de sentirse equivocado. Esta es, de todas las técnicas, la que más evidencia tiene a favor.",
    guion: "Él dice “aba”; tú: “¡Agua! Sí, agua”. Y se la das.",
    actividad: {
      texto:
        "Hoy, cada intento de palabra que le salga a medias se lo devuelves completo y cálido. Cuenta mentalmente cuántas veces lo lograste. Sin corregir, sin “di agua”.",
      conPantalla: false,
    },
    fuente:
      "Cleave et al. 2015 (AJSLP), meta-análisis de 35 estudios: los recasts muestran un efecto de 0.96 en medidas cercanas, y funcionan mejor con al menos un recast por minuto.",
  },
  {
    id: "recast-su-palabra-mas-una",
    tecnica: "expansion-recast",
    titulo: "Su palabra + una tuya",
    explicacion:
      "Cuando tu hijo dice una palabra, respóndele con esa misma palabra más una: él dice “carro”, tú dices “carro rojo” o “más carro”. Le confirmas que su palabra funcionó (¡te movió a ti!) y le muestras, sin pedirle nada, cómo suena el siguiente escalón. No esperes que lo repita: hoy solo lo está oyendo, y eso es exactamente lo que toca.",
    guion: "Él dice “agua”; tú: “agua fría” — y se la pasas.",
    actividad: {
      texto:
        "En el juego de hoy, cada palabra suya recíbela y devuélvela con una más: “pelota” → “pelota grande”. Una vez por minuto ya es muchísimo.",
      conPantalla: false,
    },
    fuente:
      "Cleave et al. 2015 (AJSLP): las expansiones muestran efectos de 0.96 (proximal) y 0.76 (distal); la densidad recomendada es ≥1 por minuto de juego.",
  },
  {
    id: "espera-cuenta-cinco",
    tecnica: "espera-estructurada",
    titulo: "Cuenta hasta cinco por dentro",
    explicacion:
      "El silencio incomoda, y por eso los adultos lo llenamos. Pero un niño que está buscando una palabra necesita más tiempo del que creemos. Si le das cinco segundos completos —mirándolo, con cara de expectativa— a veces sale una palabra, un sonido o un gesto. Todo eso cuenta como comunicación, y todo eso se responde igual: nombrando. “¡Jugo! Toma tu jugo”.",
    guion:
      "Míralo, sonríe y espera cinco segundos antes de hablar tú. Lo que salga, nómbralo.",
    actividad: {
      texto:
        "Escoge un momento del día (el jugo, la puerta, el juguete) y espera cinco segundos antes de dárselo o de hablar. Si pide con un sonido o señalando, también vale: dale la cosa y dile su nombre.",
      conPantalla: false,
    },
    fuente:
      "Espera estructurada dentro del enfoque EMT (ensayo controlado, PubMed 29054980): produce ganancias en lenguaje; el sostenimiento depende de que la práctica continúe.",
  },
  {
    id: "espera-pausa-canciones",
    tecnica: "espera-estructurada",
    titulo: "Deja el hueco en la canción",
    explicacion:
      "En una canción que él se sabe, corta justo antes de la última palabra y espera. El hueco es una invitación clarísima: la melodía pide esa palabra y él ya sabe cuál va. Muchos niños que no dicen palabras “a pedido” sí completan la canción — porque no es un examen, es un juego que ya conocen.",
    guion:
      "Canta “los pollitos dicen…” y quédate callado, esperando con cara de juego.",
    actividad: {
      texto:
        "Canta hoy una canción que él conozca y deja tres huecos en la última palabra. Si no los llena, no pasa nada: cántala completa y sigue. El hueco queda sembrado.",
      conPantalla: false,
    },
    fuente:
      "Espera estructurada / tiempo de espera dentro de EMT (PubMed 29054980), técnica central de las intervenciones naturalistas implementadas por padres.",
  },
  {
    id: "espera-no-adivines",
    tecnica: "espera-estructurada",
    titulo: "No adivines tan rápido",
    explicacion:
      "Cuando adivinamos lo que quiere antes de que lo pida, le quitamos la razón para usar su voz. Prueba a poner su juguete favorito a la vista pero fuera de su alcance, y espera. No es una trampa ni un castigo: es dejarle un motivo real para pedir. Y pedir, a esta edad, puede ser una palabra, un sonido o señalar con el dedo — todo cuenta, y todo se responde nombrando la cosa.",
    guion:
      "Sostén el juguete, míralo y espera. Pida como pida, dáselo y di: “¡pelota!”.",
    actividad: {
      texto:
        "Una sola vez hoy, deja algo que él quiera a la vista y espera cinco segundos. Si no pide, se lo das igual — sin condiciones. El nombre de la cosa suena siempre.",
      conPantalla: false,
    },
    fuente:
      "Espera estructurada (EMT, PubMed 29054980): crear oportunidades comunicativas dentro de la rutina, sin forzar ni condicionar el acceso.",
  },
  {
    id: "interes-el-manda",
    tecnica: "seguir-interes",
    titulo: "Habla de lo que él está mirando",
    explicacion:
      "El niño aprende las palabras de aquello a lo que ya le está poniendo atención, no de aquello a lo que queremos que se la ponga. Si está fascinado con la rueda del carro, la palabra de hoy es “rueda” — no “carro”, que es lo que tú mirarías. Seguir su interés no es rendirse: es apuntar la palabra exactamente donde su cabeza ya está. Ahí es donde la asociación prende.",
    guion:
      "Siéntate a su altura, mira lo que él mira, y nombra ESO: “¡rueda!”.",
    actividad: {
      texto:
        "Diez minutos de juego donde él elige TODO. Tú solo pones nombre a lo que él va tocando y mirando. Sin dirigir, sin proponer otra cosa.",
      conPantalla: false,
    },
    fuente:
      "Intervenciones naturalistas del desarrollo (revisión Crank et al. 2021): seguir el foco de atención del niño es el núcleo común de los enfoques con mejor respaldo.",
  },
  {
    id: "interes-voz-mueve",
    tecnica: "seguir-interes",
    titulo: "Su voz mueve el mundo",
    explicacion:
      "Cuando su voz hace que algo pase —que un globo vuele—, usar la voz deja de ser una tarea y se vuelve un poder. Hoy usamos el juego de voz de la app: mientras él sostiene CUALQUIER sonido (“aaaah”, un balbuceo, lo que le salga), el globo vuela. No necesita decir palabras: el juego celebra la voz misma. Tú te sientas al lado, haces el sonido primero y le pones nombre a lo que pasa: “¡globo!… ¡sube!”.",
    guion: "“Mira: cuando haces aaaah, el globo vuela. Yo primero… ¡ahora tú!”",
    actividad: {
      texto:
        "Jueguen juntos el juego de voz de la app. Hazlo tú primero para mostrarle cómo. Cualquier sonido sostenido vale — y tú nombras: “globo”, “sube”, “¡más!”.",
      conPantalla: true,
    },
    fuente:
      "Juegos controlados por voz (Flappy Voice, Apraxia World — evidencia prometedora, pilotos): la voz como control del juego sostiene la práctica; el co-uso adulto-niño es lo que la vuelve lenguaje (Madigan et al. 2020, JAMA Pediatrics).",
  },
  {
    id: "interes-co-uso",
    tecnica: "seguir-interes",
    titulo: "La pantalla solo sirve si estás al lado",
    explicacion:
      "Los estudios son claros y a la vez tranquilizadores: la pantalla sola no enseña a hablar, pero la pantalla con un adulto al lado que nombra, comenta y celebra, sí ayuda. Lo que enseña es la interacción contigo; la app solo la organiza. Por eso aquí no existe el “modo niño solo”. Y las palabras que él oye de ti frente a la pantalla (“globo”, “sube”, “más”) son tan reales como las del parque.",
    guion:
      "Al lado de él, nombra lo que pasa, en palabras de a una: “¡globo!… ¡sube!… ¿más?”.",
    actividad: {
      texto:
        "Si hoy usan pantalla, que sea poquito y contigo al lado poniendo nombres. Si él prefiere jugar sin pantalla, mejor todavía.",
      conPantalla: true,
    },
    fuente:
      "Madigan et al. 2020 (JAMA Pediatrics): más pantalla se asocia a menor lenguaje (r=−0.14), pero el contenido visto acompañado se asocia positivamente. La carencia es la interacción, no la pantalla.",
  },
  {
    id: "focalizada-palabra-semana",
    tecnica: "estimulacion-focalizada",
    titulo: "Una sola palabra, muchas veces",
    explicacion:
      "En vez de exponerlo a cien palabras nuevas, escoge UNA que le sirva de verdad (“más”, “agua”, “abre”) y úsala muchísimas veces hoy, en contextos distintos, sin pedirle nunca que la diga. La repetición concentrada hace que la palabra se vuelva familiar — y una palabra familiar es la que un día sale sola. Este es el corazón de la etapa de tu hijo: pocas palabras, muy regadas por el día.",
    guion:
      "Elige “más” y úsala en cada oportunidad: “¿más?”, “¡más agua!”, “más carro”.",
    actividad: {
      texto:
        "Escoge una palabra útil para él y propóntela decir 20 veces hoy, en momentos distintos. No le pidas repetirla ni una sola vez. Mañana, la misma u otra.",
      conPantalla: false,
    },
    fuente:
      "Estimulación focalizada (revisión de facilitación del lenguaje, ASHA; revisión sistemática AJSLP 2022): exposición concentrada sin exigir producción. La evidencia es más fuerte en niños con retraso del lenguaje que en autismo — por eso la usamos sin prometer resultados.",
  },
  {
    id: "focalizada-el-nombre-vive-en-la-cosa",
    tecnica: "estimulacion-focalizada",
    titulo: "El nombre vive en la cosa",
    explicacion:
      "Para despertar la asociación palabra↔objeto, la palabra tiene que sonar SIEMPRE que la cosa aparece — no en una lámina ni en una lista, sino en el objeto real, en sus manos. Elige sus tres cosas favoritas (su carro, su vaso, su peluche) y conviértete en el eco fiel de sus nombres: cada vez que una aparezca, suena su nombre. Corto, igual, cada vez.",
    guion:
      "Cada vez que agarre su carro, tú: “¡carro!”. Cada vez. Siempre la misma palabra.",
    actividad: {
      texto:
        "Elige TRES objetos favoritos de él. Hoy, cada vez que uno entre en escena, di su nombre (solo el nombre). La constancia — mismo objeto, misma palabra — es lo que suelda la asociación.",
      conPantalla: false,
    },
    fuente:
      "Estimulación focalizada (ASHA; AJSLP 2022): modelos abundantes y consistentes de la palabra objetivo en su contexto natural, sin demanda de producción.",
  },
  {
    id: "focalizada-sin-examen",
    tecnica: "estimulacion-focalizada",
    titulo: "No lo pongas a examen",
    explicacion:
      "“¿Cómo se llama esto?”, “¿qué es?”, “di agua” convierten el juego en un examen, y a un niño al que le cuesta hablar el examen le enseña a callarse. Lo contrario funciona mejor: baña de nombres el ambiente y quítale toda presión de responder. En vez de preguntar “¿qué es?”, afirma: “un perro”. Él habla cuando está listo — tu trabajo es que, cuando llegue ese día, las palabras ya estén ahí, cargadas.",
    guion: "Cambia “¿qué es esto?” por la respuesta regalada: “¡un perro!”.",
    actividad: {
      texto:
        "Hoy cuenta cuántas preguntas de examen le haces. La meta no es cero de golpe: es notarlas y cambiar la mitad por el nombre regalado.",
      conPantalla: false,
    },
    fuente:
      "Estimulación focalizada (ASHA; AJSLP 2022): el niño recibe modelos abundantes de la palabra objetivo sin demanda de producción — el rasgo que la distingue del entrenamiento por repetición.",
  },
];
