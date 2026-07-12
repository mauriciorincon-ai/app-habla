import type { Capsula } from "./schema";

/**
 * Biblioteca de "Hoy" — la respuesta diaria al padre. 50 cápsulas es-CO organizadas por
 * **etapa del habla** (ADR 006), que el padre elige en Ajustes:
 *
 *   - `sonidos-e-intentos` (8): todavía explora. Sonidos, gestos y miradas YA son comunicación.
 *   - `palabras-sueltas` (35): **el DEFAULT PERMANENTE de esta app** (ADR 005, ratificado por el
 *     padre 2026-07-12). El niño dice palabras de a una; el objetivo es despertar la ASOCIACIÓN
 *     palabra↔objeto/actividad. Ninguna cápsula asume que arma frases.
 *   - `primeras-frases` (7): **OPT-IN**. Jamás se activa sola — el padre la elige cuando su hijo
 *     ya junta dos palabras. Aun aquí, la palabra suelta sigue valiendo.
 *
 * Ningún juego de la app exige palabras (miden voz, no vocabulario). Un sonido, un intento o un
 * gesto cuentan como comunicación — y se responden nombrando.
 *
 * Cada cápsula: una técnica con evidencia (§A.3), explicada en ~30 segundos, con UN guion que
 * se puede decir tal cual hoy, una actividad concreta y su fuente citada. La novedad viene de
 * las RUTINAS reales (carro, mercado, parque, calle, vestirse, dormir), los turnos con sonidos,
 * las canciones con pausa y los mini-retos sin pantalla — no de rellenar con variaciones.
 *
 * Tono: cálido, directo, es-CO. Prohibido (§D anti-claims): "terapia", "diagnóstico", plazos
 * ("en X semanas"), puntajes clínicos, elogios desacoplados de lo medido. Esto es práctica de
 * estimulación en casa — complementaria, nunca sustituta, de la fonoaudiología del niño.
 */
export const CAPSULAS: Capsula[] = [
  {
    id: "modelado-nombra-su-mundo",
    tecnica: "modelado",
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
    etapa: "palabras-sueltas",
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
  // ---------------------------------------------------------------------------------------
  // ETAPA: sonidos e intentos — todavía explora. Un sonido, un gesto o una mirada YA son
  // comunicación: se responden nombrando. Aquí no se pide ninguna palabra (ADR 005).
  // ---------------------------------------------------------------------------------------
  {
    id: "sonidos-ponle-sonido-al-mundo",
    tecnica: "modelado",
    etapa: "sonidos-e-intentos",
    titulo: "Ponle sonido a lo que pasa",
    explicacion:
      "Antes de las palabras vienen los sonidos, y son mucho más fáciles de imitar: “brum”, “pum”, “guau”, “aaah”. Un sonido tiene todo lo que necesita una palabra —alguien lo dice, significa algo, y provoca respuesta— pero sin la dificultad de pronunciarlo. Hoy tu trabajo es sonorizar el mundo de él.",
    guion:
      "Cada vez que algo se mueva o se caiga, ponle sonido: “¡pum!”, “¡brum!”, “¡uuuh!”.",
    actividad: {
      texto:
        "Saca sus carros o sus muñecos y juega 5 minutos poniéndole sonido a todo: el carro hace “brum”, la torre se cae “¡pum!”, el perro “guau”. Si él hace cualquier sonido, celébralo como si te hubiera hablado — porque te habló.",
      conPantalla: false,
    },
    fuente:
      "Heidlage et al. 2019 (Early Childhood Research Quarterly): la intervención guiada por padres muestra g=0.42 en lenguaje expresivo, y el efecto es mayor cuando ocurre dentro del juego (g=0.50).",
  },
  {
    id: "sonidos-habla-como-el",
    tecnica: "seguir-interes",
    etapa: "sonidos-e-intentos",
    titulo: "Háblale en su idioma: imita sus sonidos",
    explicacion:
      "Cuando imitas el sonido que él acaba de hacer, pasan dos cosas grandes: él descubre que lo que sale de su boca TE MUEVE a ti, y descubre el turno (yo hago, tú haces). Es la semilla de la conversación, y no necesita ni una palabra. Imita su sonido tal cual, con cara de fiesta, y espera a ver si lo repite.",
    guion: "Él hace “ba-ba”; tú haces “ba-ba” igualito, lo miras y esperas.",
    actividad: {
      texto:
        "Durante 5 minutos, cada sonido que él haga, devuélveselo igual. Si repite, hazlo otra vez: ya están conversando. Si cambia el sonido, síguelo a él — el que manda es él.",
      conPantalla: false,
    },
    fuente:
      "Intervenciones naturalistas del desarrollo (NDBI): responder contingentemente a la iniciativa del niño —incluidos sus sonidos y gestos— es el mecanismo central; Crank et al. 2021, con la cautela de que las magnitudes varían.",
  },
  {
    id: "sonidos-espera-con-cara-de-pregunta",
    tecnica: "espera-estructurada",
    etapa: "sonidos-e-intentos",
    titulo: "Espera con cara de pregunta",
    explicacion:
      "El silencio del adulto es lo que abre el espacio para el sonido del niño. Nos cuesta: llenamos las pausas por costumbre. Hoy pruebas lo contrario — pones la cara de “te estoy esperando” (cejas arriba, sonrisa, cuerpo hacia él) y aguantas. El intento que salga, sea el que sea, es la respuesta.",
    guion:
      "Sostén el juguete, míralo con cejas de pregunta y cuenta hasta cinco en silencio.",
    actividad: {
      texto:
        "En tres momentos del día (comida, juego, salir), haz la pausa de cinco segundos con cara de pregunta. Lo que salga —un sonido, un gesto, un jalón— respóndelo nombrando: “¿jugo? ¡jugo!”, y dáselo.",
      conPantalla: false,
    },
    fuente:
      "Enseñanza del Milieu Mejorada (EMT): el ensayo aleatorizado con toddlers muestra ganancias en comunicación cuando el adulto crea oportunidades y espera; el efecto no se sostuvo al año, así que se habla de práctica sostenida, no de resultados prometidos (PubMed 29054980).",
  },
  {
    id: "sonidos-senalar-ya-es-hablar",
    tecnica: "seguir-interes",
    etapa: "sonidos-e-intentos",
    titulo: "Si señala, ya está hablando",
    explicacion:
      "Señalar, llevarte de la mano, mirarte y mirar el objeto: todo eso ES comunicación, y de la buena. El error común es responder solo dándole la cosa. Lo que multiplica el lenguaje es darle la cosa Y ponerle el nombre. Así el gesto que ya tiene se convierte, con el tiempo, en la palabra que todavía no.",
    guion:
      "Él señala la galleta; tú: “¡galleta!” — y se la das. El nombre siempre acompaña.",
    actividad: {
      texto:
        "Hoy, cada vez que él pida con un gesto, nombra lo que pide con UNA palabra y dáselo enseguida. Sin pedirle que la repita. Estás enseñando que las palabras sirven, no evaluándolo.",
      conPantalla: false,
    },
    fuente:
      "La CAA y el gesto no frenan el habla: la evidencia muestra que apoyar la comunicación por otras vías se asocia a MÁS producción verbal, no a menos (§A.5 de la investigación).",
  },
  {
    id: "sonidos-su-sonido-tu-palabra",
    tecnica: "expansion-recast",
    etapa: "sonidos-e-intentos",
    titulo: "Su sonido, tu palabra",
    explicacion:
      "Él dice “aaa” señalando el agua. Ese “aaa” no es un error que corregir: es un intento que hay que celebrar y completar. Tú lo recoges y se lo devuelves hecho palabra, con alegría y sin corregir. Él oye la versión completa justo cuando su cabeza está pensando en eso — el mejor momento posible para aprenderla.",
    guion:
      "Él dice “aaa”; tú: “¡Agua! Sí, agua.” — y se la das. Nunca “no, se dice agua”.",
    actividad: {
      texto:
        "Hoy, cada sonido que él haga con intención, devuélveselo convertido en su palabra, feliz. Si no entiendes qué quiso decir, adivina con cariño y sigue: equivocarte no rompe nada.",
      conPantalla: false,
    },
    fuente:
      "Recast/expansión conversacional: meta-análisis de 35 estudios con tamaño de efecto 0.96 en medidas próximas y 0.76 en distales; funciona mejor con densidad de al menos un recast por minuto (Cleave et al. 2015, AJSLP).",
  },
  {
    id: "sonidos-un-solo-sonido-todo-el-dia",
    tecnica: "estimulacion-focalizada",
    etapa: "sonidos-e-intentos",
    titulo: "Un solo sonido, muchas veces",
    explicacion:
      "En vez de regarte en muchos sonidos, elige UNO y sé insistente y cálido con él todo el día. La repetición masiva de un blanco —sin pedirle que lo produzca— es justo lo que hace la estimulación focalizada. Un buen sonido para empezar: “aaah” (largo, fácil, y además es el que mueve el globo en el juego).",
    guion:
      "Elige “aaah” y úsalo en todo: el avión hace “aaah”, el columpio sube “aaah”.",
    actividad: {
      texto:
        "Escoge un sonido (“aaah”, “mmm”, “brum”) y métetelo en el día: en el juego, en la comida, al despedirte. Que lo oiga veinte veces sin que se lo pidas ni una.",
      conPantalla: false,
    },
    fuente:
      "Estimulación focalizada (ASHA; revisión en AJSLP 2022): el niño recibe modelos abundantes del blanco SIN demanda de producción — es el rasgo que la distingue del entrenamiento por repetición.",
  },
  {
    id: "sonidos-turnos-de-sonidos",
    tecnica: "modelado",
    etapa: "sonidos-e-intentos",
    titulo: "El juego de los turnos: yo, tú, yo, tú",
    explicacion:
      "Hablar es, antes que nada, tomar turnos. Y los turnos se pueden practicar sin una sola palabra: tú golpeas la mesa dos veces, esperas; él golpea; tú haces un sonido, esperas; él hace el suyo. Ese ritmo de ida y vuelta es el esqueleto de toda conversación futura, y a los niños les encanta.",
    guion:
      "Haz un sonido, señálate: “yo”. Luego señálalo a él y espera: es su turno.",
    actividad: {
      texto:
        "Cinco minutos de turnos con un tambor, una olla o las palmas. Cuando él haga cualquier cosa en su turno, celébralo. Después cambia el golpe por un sonido de la boca: el turno es el mismo, la voz es nueva.",
      conPantalla: false,
    },
    fuente:
      "Heidlage et al. 2019 (ECRQ): las estrategias implementadas por padres funcionan mejor incrustadas en rutinas de juego recíproco, donde el niño ya está motivado a participar.",
  },
  {
    id: "sonidos-cualquier-sonido-cuenta",
    tecnica: "seguir-interes",
    etapa: "sonidos-e-intentos",
    titulo: "Cualquier sonido cuenta: su voz mueve el mundo",
    explicacion:
      "Hoy la pantalla es la utilería de tu juego. En el juego de voz, el globo (o el cohete) se mueve con CUALQUIER sonido que él haga: no hay que decir ninguna palabra ni pronunciar bien. Lo que él descubre —y es enorme— es que su voz cambia el mundo. Tú estás al lado, nombrando lo que pasa.",
    guion: "“Mira: cuando haces aaaah, el globo vuela. Yo primero… ¡ahora tú!”",
    actividad: {
      texto:
        "Abre el juego de voz y juega TÚ primero: haz el sonido, que él vea el globo subir. Luego pásale el turno. Si solo mira, ya ganaron: mañana probará. Cinco minutos bastan.",
      conPantalla: true,
    },
    fuente:
      "Juegos controlados por voz con parámetros simples (sonoridad, duración, tono) son factibles y muestran pilotos positivos en habla infantil; se clasifican como PROMETEDORES, no como tratamiento probado (Flappy Voice, CHI PLAY 2014; Apraxia World, Hair et al. 2021).",
  },
  // ---------------------------------------------------------------------------------------
  // ETAPA: palabras sueltas — el nivel POR DEFECTO PERMANENTE de esta app (ADR 005).
  // Rutinas reales de la casa y de la calle: la palabra se aprende donde vive.
  // ---------------------------------------------------------------------------------------
  {
    id: "modelado-en-el-carro",
    tecnica: "modelado",
    etapa: "palabras-sueltas",
    titulo: "El carro es un salón de clase",
    explicacion:
      "El carro tiene todo lo que necesita una buena rutina de lenguaje: pasa siempre lo mismo, hay cosas que se repiten afuera, y ustedes dos están quietos y juntos. No hace falta un ejercicio: solo nombrar lo que aparece, una palabra a la vez, cuando él lo está mirando.",
    guion:
      "Cuando pase algo por la ventana, nómbralo con una sola palabra: “¡moto!”, “¡perro!”.",
    actividad: {
      texto:
        "En el próximo viaje en carro o en bus, nombra tres cosas que él mire: “bus”, “luz”, “agua”. Solo el nombre, claro y con ganas. Si él hace cualquier sonido, respóndele nombrando otra vez.",
      conPantalla: false,
    },
    fuente:
      "Heidlage et al. 2019 (ECRQ): el efecto de la intervención por padres es mayor cuando ocurre dentro de rutinas cotidianas (g=0.50) que en sesiones separadas de la vida diaria.",
  },
  {
    id: "modelado-vestirse",
    tecnica: "modelado",
    etapa: "palabras-sueltas",
    titulo: "Vestirse: la misma palabra, todos los días",
    explicacion:
      "Vestirse pasa todos los días, en el mismo orden, con los mismos objetos. Esa repetición es oro: el niño oye “media” cuando ve la media, y mañana otra vez, y pasado también. La palabra se pega por costumbre, no por esfuerzo. Elige tres palabras de la rutina y no las cambies.",
    guion:
      "Levanta la prenda, espera que él la mire y di su nombre: “¡media!”.",
    actividad: {
      texto:
        "Al vestirlo hoy, di solo tres palabras, siempre las mismas: “camisa”, “media”, “zapato”. Levanta cada prenda, espera que la mire, nómbrala. Nada más.",
      conPantalla: false,
    },
    fuente:
      "Estimulación focalizada (ASHA; AJSLP 2022): pocos blancos, muchas repeticiones y sin demanda de producción — las rutinas diarias son el vehículo natural de esa dosis.",
  },
  {
    id: "modelado-mercado",
    tecnica: "modelado",
    etapa: "palabras-sueltas",
    titulo: "El mercado es un catálogo de palabras",
    explicacion:
      "En el mercado hay cientos de objetos con nombre, y él los va a estar mirando de todas formas. No los nombres todos: elige los que él mire, y solo esos. La regla es la misma de siempre — la palabra entra cuando su atención ya está puesta en la cosa, no cuando tú decides enseñarla.",
    guion:
      "Él mira algo del estante; tú lo bajas, se lo muestras y dices: “¡banano!”.",
    actividad: {
      texto:
        "En el próximo mercado, deja que él escoja qué mirar. Nombra cinco cosas que él haya mirado primero. Si señala, se lo pasas y nombras. El que manda es él.",
      conPantalla: false,
    },
    fuente:
      "Seguir el interés del niño (NDBI): responder al foco atencional que él YA tiene es el mecanismo central de las intervenciones naturalistas del desarrollo (Crank et al. 2021).",
  },
  {
    id: "modelado-parque",
    tecnica: "modelado",
    etapa: "palabras-sueltas",
    titulo: "En el parque, las palabras se mueven",
    explicacion:
      "En el parque las palabras vienen con el cuerpo: “sube”, “baja”, “salta”, “corre”. Los verbos aprendidos con el cuerpo en movimiento se pegan distinto — el niño los siente. Y hay una ventaja enorme: puedes repetir la misma palabra cada vez que él hace la acción, sin que se vuelva aburrido.",
    guion:
      "Cada vez que el columpio suba, di “¡sube!”. Cada vez que baje: “¡baja!”.",
    actividad: {
      texto:
        "En el parque, elige dos palabras de movimiento y dilas cada vez que pase la acción: “sube”, “baja”. Al final, haz la pausa: empújalo, para y espera con cara de pregunta antes de volver a empujar.",
      conPantalla: false,
    },
    fuente:
      "Heidlage et al. 2019 (ECRQ): dentro del juego y del movimiento, el modelado por padres alcanza su mayor efecto (g=0.50) — el niño está motivado y la palabra llega con la experiencia.",
  },
  {
    id: "modelado-hora-de-dormir",
    tecnica: "modelado",
    etapa: "palabras-sueltas",
    titulo: "La noche también enseña palabras",
    explicacion:
      "La rutina de dormir es tranquila, callada y siempre igual: perfecta. Tres o cuatro palabras dichas cada noche, en el mismo orden, terminan siendo de las primeras que el niño usa — porque las oye cuando está calmado y contigo. No es una tarea más: es lo mismo que ya haces, con nombre.",
    guion:
      "En cada paso de la noche, una palabra: “pijama”… “diente”… “cama”… “luz”.",
    actividad: {
      texto:
        "Esta noche, di en voz alta y clara las cuatro palabras de la rutina, una por paso. Al apagar la luz, haz una pausa larga: a veces, en ese silencio, sale una palabra.",
      conPantalla: false,
    },
    fuente:
      "Dosis distribuida: la evidencia favorece práctica breve y frecuente incrustada en rutinas (5–10 minutos al día) sobre sesiones largas y aisladas (§A.8 de la investigación).",
  },
  {
    id: "modelado-la-calle",
    tecnica: "modelado",
    etapa: "palabras-sueltas",
    titulo: "La calle: nombra lo que él ya está mirando",
    explicacion:
      "Caminar por la calle es un desfile de cosas con nombre: perro, moto, bus, árbol, agua. Tu trabajo no es señalarle cosas — es mirar qué está mirando ÉL y ponerle nombre a eso. Sigue sus ojos: ahí está la palabra que hoy sí va a entrar.",
    guion: "Sigue su mirada. Lo que él esté mirando, eso nombras: “¡perro!”.",
    actividad: {
      texto:
        "En la próxima caminata, no nombres nada que él no esté mirando. Solo lo suyo. Cuenta cuántas veces lo hiciste: cinco ya es un día excelente.",
      conPantalla: false,
    },
    fuente:
      "Seguir el interés (NDBI): la palabra dicha sobre el foco de atención que el niño YA tiene es la que mejor se asocia con el objeto; imponer el tema del adulto rinde menos (Crank et al. 2021).",
  },
  {
    id: "espera-el-frasco-dificil",
    tecnica: "espera-estructurada",
    etapa: "palabras-sueltas",
    titulo: "El frasco que no abre solo",
    explicacion:
      "Si todo está al alcance y resuelto, no hace falta pedir nada. Un frasco duro, una bolsa cerrada, el juguete en un estante alto: crean una razón REAL para comunicarse. No es una trampa ni un castigo — es una invitación. Cuando él pida (como pida), tú abres enseguida y nombras.",
    guion:
      "Dale la galleta en su bolsa cerrada, quédate cerca y espera con cara de pregunta.",
    actividad: {
      texto:
        "Hoy, en la merienda, entrega algo que necesite tu ayuda para abrirse. Espera cinco segundos. Ante cualquier intento —sonido, gesto o palabra— abre, nombra (“¡galleta!”) y celebra. Nunca lo hagas esperar por castigo.",
      conPantalla: false,
    },
    fuente:
      "Enseñanza del Milieu Mejorada (EMT): montar el ambiente para crear oportunidades de comunicación y esperar la iniciativa del niño (RCT con toddlers, PubMed 29054980).",
  },
  {
    id: "espera-de-a-poquitos",
    tecnica: "espera-estructurada",
    etapa: "palabras-sueltas",
    titulo: "De a poquitos: cada uno es una oportunidad",
    explicacion:
      "Si le sirves el plato lleno, hay una sola oportunidad de comunicarse. Si le das las uvas de a una, hay diez. Sin apurarlo y sin negarle nada: simplemente, cada vez que se acaba, hay un momento natural para pedir más. Y cada vez que pide (como sea), tú nombras y le das.",
    guion:
      "Dale una uva. Cuando se la coma, espera mirándolo. Ante cualquier intento: “¿más? ¡más!”.",
    actividad: {
      texto:
        "En una merienda, sirve de a poquitos: una uva, un pedacito, un sorbo. Espera cinco segundos entre uno y otro. Nombra siempre lo que le das. Cuenta cuántos intentos hizo hoy: eso es lo que cuenta.",
      conPantalla: false,
    },
    fuente:
      "EMT / comunicación tentadora: fragmentar el acceso al objeto deseado multiplica las oportunidades de iniciación sin frustrar al niño (PubMed 29054980).",
  },
  {
    id: "espera-el-hueco-de-la-rutina",
    tecnica: "espera-estructurada",
    etapa: "palabras-sueltas",
    titulo: "Deja un hueco en lo que él ya se sabe",
    explicacion:
      "Cuando una rutina está muy aprendida —el juego de siempre, la frase de siempre— el niño la anticipa entera. Si tú te detienes justo antes del final, se abre un hueco que a él le PICA llenar. Ese cosquilleo es motivación pura, y muchas veces es lo que empuja la primera palabra.",
    guion:
      "“Uno… dos… ¡y…!” — y te quedas callado, mirándolo, con las manos listas.",
    actividad: {
      texto:
        "Elige un juego que él conozca de memoria (cosquillas, “te voy a atrapar”, subir escaleras contando). Hoy párate justo antes del final y espera. Lo que salga, celébralo y termina el juego enseguida.",
      conPantalla: false,
    },
    fuente:
      "Espera estructurada (EMT): las rutinas predecibles con pausa expectante generan iniciación comunicativa; la evidencia respalda la práctica sostenida, no promesas de resultados (PubMed 29054980).",
  },
  {
    id: "recast-repite-bien-sin-corregir",
    tecnica: "expansion-recast",
    etapa: "palabras-sueltas",
    titulo: "Repítela bien, sin corregirlo nunca",
    explicacion:
      "Él dice “ete” por “leche”. La tentación es corregir: “no, se dice leche”. Eso lo calla. Lo que sí funciona es devolvérsela bien dicha, como si tal cosa, con alegría y con la leche en la mano: “¡Leche! Sí, leche.” Él oye la versión correcta sin sentirse corregido, y sigue hablando.",
    guion:
      "Él dice “ete”; tú, feliz y sin corregir: “¡Leche! Sí, leche.” — y se la das.",
    actividad: {
      texto:
        "Hoy, cada palabra a medias que él diga, devuélvesela completa y celebrada. Prohibido: “no”, “así no”, “repite”. Estás confirmándole que lo entendiste — no evaluándolo.",
      conPantalla: false,
    },
    fuente:
      "Recast conversacional: meta-análisis de 35 estudios, ES 0.96 en medidas próximas y 0.76 en distales; el rasgo clave es que el adulto reformula SIN exigir repetición (Cleave et al. 2015, AJSLP).",
  },
  {
    id: "recast-nombra-lo-que-siente",
    tecnica: "expansion-recast",
    etapa: "palabras-sueltas",
    titulo: "Ponle nombre a lo que le está pasando",
    explicacion:
      "Cuando se ríe, cuando se cae, cuando se enoja: ahí hay una emoción enorme y ninguna palabra. Ponerle nombre a eso —“¡susto!”, “¡rico!”, “¡ay!”— le da algo poderoso: la palabra justo cuando más la siente. Son palabras que se quedan, porque llegaron con el cuerpo.",
    guion:
      "Se cae y se asusta; tú lo abrazas y dices, con su cara: “¡susto! Ya pasó.”",
    actividad: {
      texto:
        "Hoy, cada vez que él sienta algo fuerte (alegría, susto, rabia, cosquillas), ponle una palabra sola y clara. Sin explicaciones largas: una palabra y tu abrazo.",
      conPantalla: false,
    },
    fuente:
      "Modelado y recast dentro de rutinas afectivas: la evidencia de intervención por padres (Heidlage et al. 2019, ECRQ) muestra su mayor efecto en contextos de alta implicación emocional del niño.",
  },
  {
    id: "interes-siéntate-en-el-piso",
    tecnica: "seguir-interes",
    etapa: "palabras-sueltas",
    titulo: "Siéntate en el piso, frente a él",
    explicacion:
      "Parece un detalle y es una técnica: cuando te pones a su altura y de frente, él te ve la cara, ve tu boca hacer la palabra, y siente que están en lo mismo. Desde arriba, tú diriges. Desde el piso, ustedes juegan. La cara del adulto, a la altura del niño, es media técnica ganada.",
    guion: "Siéntate en el piso, mira lo que él mira, y nombra ESO: “¡rueda!”.",
    actividad: {
      texto:
        "Hoy, cinco minutos en el piso, cara a cara, con el juguete que él eligió. No propongas otro juego. Solo nombra lo que él está haciendo, de a una palabra.",
      conPantalla: false,
    },
    fuente:
      "NDBI: la atención conjunta cara a cara y el seguimiento del interés del niño son el núcleo de las intervenciones naturalistas del desarrollo (Crank et al. 2021).",
  },
  {
    id: "interes-el-juguete-que-el-eligio",
    tecnica: "seguir-interes",
    etapa: "palabras-sueltas",
    titulo: "El juguete que él eligió, no el que tú querías",
    explicacion:
      "Tú sacaste el rompecabezas educativo; él quiere la tapa de la olla. Gana la tapa. No porque haya que consentirlo, sino porque el aprendizaje va donde va su atención: la palabra que entra es la de la cosa que él está mirando. La tapa de la olla, con tu voz encima, enseña más que el mejor juguete ignorado.",
    guion: "Deja lo que trajiste y ve a lo suyo: “¡tapa! Suena la tapa. ¡Pum!”",
    actividad: {
      texto:
        "Hoy, en el juego, no propongas nada. Espera a ver qué agarra él y métete ahí, nombrando de a una palabra. Cinco minutos. Es más difícil de lo que parece — y es la técnica.",
      conPantalla: false,
    },
    fuente:
      "Seguir el interés (NDBI): el aprendizaje de palabras se asocia al foco atencional del niño; imponer el material del adulto reduce las oportunidades de aprendizaje (Crank et al. 2021).",
  },
  {
    id: "interes-cohete-de-la-voz",
    tecnica: "seguir-interes",
    etapa: "palabras-sueltas",
    titulo: "El cohete que sube con su voz",
    explicacion:
      "Hoy le muestras algo nuevo: cuando su voz sube de tono, el cohete sube; cuando baja, el cohete baja. No hay que decir ninguna palabra — solo jugar con la voz como una sirena. Es un juego de exploración vocal: el niño descubre que tiene un instrumento adentro, y que ese instrumento manda.",
    guion:
      "“Haz la voz como una sirena: aaaAAAaaa… ¡mira cómo sube el cohete!”",
    actividad: {
      texto:
        "Abre el juego del cohete y hazlo tú primero: sube y baja la voz, exagerado, riéndote. Luego pásale el turno. Si él solo hace un sonido plano, ¡también vale! El cohete responde a su voz, no a su puntería.",
      conPantalla: true,
    },
    fuente:
      "Juegos de voz con parámetros simples (tono, sonoridad, duración): factibles en tiempo real y con pilotos positivos en habla infantil; clasificados como PROMETEDORES, no como tratamiento probado (§A.9 de la investigación).",
  },
  {
    id: "interes-palabra-y-objeto",
    tecnica: "estimulacion-focalizada",
    etapa: "palabras-sueltas",
    titulo: "La palabra y su dibujo, juntos",
    explicacion:
      "El juego de palabra↔objeto pone un dibujo grande de algo que a él le gusta. Tu trabajo es el importante: nombras el dibujo con UNA palabra y esperas. Cualquier sonido que él haga enciende el dibujo. Ojo: el juego NO evalúa si dijo la palabra —eso lo juzgas tú— solo celebra que su voz apareció.",
    guion:
      "Señala el dibujo, nómbralo una vez —“¡perro!”— y espera tres segundos en silencio.",
    actividad: {
      texto:
        "Abre el juego de palabra↔objeto. Por cada dibujo: nómbralo UNA vez, espera, y celebra cualquier intento. No le pidas que repita. Cinco dibujos y paren — mejor corto y con ganas.",
      conPantalla: true,
    },
    fuente:
      "Estimulación focalizada con apoyo visual: modelos abundantes del blanco sin demanda de producción (ASHA; AJSLP 2022). El apoyo visual/CAA no frena el habla — se asocia a más producción (§A.5).",
  },
  {
    id: "focalizada-palabra-abre",
    tecnica: "estimulacion-focalizada",
    etapa: "palabras-sueltas",
    titulo: "Una palabra que le sirva: “abre”",
    explicacion:
      "Las mejores primeras palabras no son las bonitas: son las ÚTILES. “Abre” le sirve veinte veces al día (la puerta, el frasco, la caja, el carro, el paquete). Una palabra que resuelve cosas se usa; una palabra que solo se luce, se olvida. Elige una palabra-herramienta y satúrale el día con ella.",
    guion:
      "Antes de abrir cualquier cosa, mírala, míralo y di: “abre… ¡abre!”.",
    actividad: {
      texto:
        "Hoy elige “abre” (o “más”, o “ya”). Dila cada vez que ocurra la acción, sin pedirle que la repita. Cuenta mentalmente: la meta es que la oiga muchísimas veces.",
      conPantalla: false,
    },
    fuente:
      "Estimulación focalizada (ASHA; AJSLP 2022): pocos blancos funcionales, alta densidad de modelos y cero demanda de producción; los blancos útiles generalizan mejor a la vida diaria.",
  },
  {
    id: "focalizada-misma-palabra-cinco-lugares",
    tecnica: "estimulacion-focalizada",
    etapa: "palabras-sueltas",
    titulo: "La misma palabra en cinco lugares distintos",
    explicacion:
      "Si “agua” solo aparece en el vaso, “agua” significa vaso. Para que la palabra se despegue del objeto y se vuelva una palabra de verdad, tiene que aparecer en sitios distintos: el vaso, la ducha, la lluvia, la piscina, la botella. Misma palabra, mundos distintos: así se generaliza.",
    guion:
      "Di “¡agua!” en la ducha, en el vaso, en la lluvia y en la botella. La misma palabra.",
    actividad: {
      texto:
        "Elige una palabra que él ya oye mucho y hoy dila en cinco contextos diferentes. Es el mismo esfuerzo de siempre, repartido — y hace que la palabra crezca.",
      conPantalla: false,
    },
    fuente:
      "Generalización en estimulación focalizada: la variación de contextos con el mismo blanco favorece el uso funcional de la palabra (revisión de intervenciones para late talkers, AJSLP 2022).",
  },
  {
    id: "modelado-cancion-de-la-rutina",
    tecnica: "modelado",
    etapa: "palabras-sueltas",
    titulo: "Una canción para cada momento",
    explicacion:
      "La música pega las palabras. Si cada momento del día tiene su cancioncita —la de lavarse las manos, la de guardar los juguetes— las palabras de esa canción se repiten sin esfuerzo y con ritmo. No importa si desafinas: importa que sea SIEMPRE la misma y que él la reconozca.",
    guion:
      "Invéntate una cancioncita de tres palabras y cántala cada vez: “a guardar, a guardar”.",
    actividad: {
      texto:
        "Elige un momento (guardar, lavarse, salir) y ponle una canción cortica, de tres o cuatro palabras. Cántala hoy cada vez que llegue ese momento. Mañana también. Y pasado.",
      conPantalla: false,
    },
    fuente:
      "Rutinas predecibles y modelado (Heidlage et al. 2019, ECRQ): la repetición dentro de rutinas familiares es el vehículo con mayor efecto en lenguaje expresivo guiado por padres.",
  },
  {
    id: "espera-tres-segundos-mas",
    tecnica: "espera-estructurada",
    etapa: "palabras-sueltas",
    titulo: "Espera tres segundos más de los que aguantas",
    explicacion:
      "Los adultos esperamos, en promedio, uno o dos segundos antes de volver a hablar. Un niño que está armando una palabra necesita más — a veces mucho más. La técnica de hoy es incómoda a propósito: cuando sientas que ya esperaste bastante, espera tres segundos MÁS. Ahí es donde suelen salir las palabras.",
    guion:
      "Pregunta, cierra la boca y cuenta hasta ocho por dentro. No la abras antes.",
    actividad: {
      texto:
        "Tres veces hoy, después de darle una oportunidad de hablar, cuenta hasta ocho en silencio con cara amable. Vas a sentir que es eterno. Anota qué pasó — te va a sorprender.",
      conPantalla: false,
    },
    fuente:
      "Espera estructurada (EMT): la pausa expectante prolongada aumenta la iniciación comunicativa del niño; el adulto suele subestimar cuánto tiempo necesita (PubMed 29054980).",
  },
  {
    id: "interes-nombra-lo-que-el-hace",
    tecnica: "seguir-interes",
    etapa: "palabras-sueltas",
    titulo: "Narra lo que él hace, no lo que tú piensas",
    explicacion:
      "En vez de hacerle preguntas (que son un examen), narra lo que él está haciendo, de a una palabra: “sube”… “cae”… “rueda”. Es como ponerle subtítulos a su juego. Él no tiene que responder nada — solo oye, una y otra vez, la palabra exacta que corresponde a lo que sus manos están haciendo.",
    guion:
      "Ponle subtítulos a su juego, de a una palabra: “sube”… “cae”… “otra”.",
    actividad: {
      texto:
        "Cinco minutos narrando su juego con palabras sueltas. Sin preguntas, sin instrucciones, sin “¿qué es esto?”. Solo subtítulos. Es sorprendentemente difícil y sorprendentemente potente.",
      conPantalla: false,
    },
    fuente:
      "Modelado dentro del juego (Heidlage et al. 2019, ECRQ, g=0.50) combinado con seguir el interés del niño (NDBI): la palabra llega sobre la acción que él ya está ejecutando.",
  },
  {
    id: "focalizada-no-preguntes-nombra",
    tecnica: "estimulacion-focalizada",
    etapa: "palabras-sueltas",
    titulo: "Cambia las preguntas por regalos",
    explicacion:
      "“¿Qué es esto?” pone al niño a rendir examen, y el que no está seguro se calla. “Regalar” la palabra hace lo contrario: le quita la presión y le da el modelo. La regla de hoy: por cada pregunta que te salga, cámbiala por la respuesta dicha con alegría. Cero exámenes en esta casa.",
    guion: "En vez de “¿qué es esto?”, di la respuesta regalada: “¡un perro!”.",
    actividad: {
      texto:
        "Hoy cuenta cuántas preguntas de examen te salen (“¿cómo se dice?”, “¿qué es?”) y cámbialas TODAS por la palabra regalada. Al final del día, mira cuántas cambiaste.",
      conPantalla: false,
    },
    fuente:
      "Estimulación focalizada (ASHA; AJSLP 2022): modelos abundantes SIN demanda de producción. El refuerzo informativo, no la evaluación, sostiene la motivación (Deci et al. 1999).",
  },
  // ---------------------------------------------------------------------------------------
  // ETAPA: primeras frases — OPT-IN. Nunca se activa sola (ADR 005): el padre la elige en
  // Ajustes cuando su hijo YA junta dos palabras. Aun aquí, la palabra suelta sigue valiendo.
  // ---------------------------------------------------------------------------------------
  {
    id: "frases-una-palabra-mas-una",
    tecnica: "expansion-recast",
    etapa: "primeras-frases",
    titulo: "Su palabra, más una tuya",
    explicacion:
      "Cuando el niño ya dice palabras sueltas con soltura, el siguiente paso natural es que oiga esas mismas palabras acompañadas de UNA más. No dos, no una frase larga: una. Él dice “agua”; tú dices “agua fría”. Esa distancia corta —lo suyo más uno— es la que él puede alcanzar.",
    guion:
      "Él dice “agua”; tú: “agua fría” — y se la pasas. Solo una palabra más.",
    actividad: {
      texto:
        "Hoy, a cada palabra que él diga, devuélvele esa palabra más una sola. “Carro” → “carro rojo”. “Más” → “más pan”. Sin pedirle que lo repita.",
      conPantalla: false,
    },
    fuente:
      "Expansión conversacional: meta-análisis de 35 estudios con ES 0.96 en medidas próximas; la expansión efectiva se mantiene apenas un paso por encima del nivel actual del niño (Cleave et al. 2015, AJSLP).",
  },
  {
    id: "frases-dos-palabras-utiles",
    tecnica: "estimulacion-focalizada",
    etapa: "primeras-frases",
    titulo: "Dos palabras que resuelven la vida",
    explicacion:
      "Las primeras combinaciones útiles son poquitas y valen oro: “más agua”, “no quiero”, “otra vez”, “ya está”. Elige UNA de esas parejas y satúrale el día con ella, igual que hacías con las palabras sueltas. La estrategia no cambia; solo crece el blanco.",
    guion:
      "Elige “más agua” y dila tú, completa, cada vez que ocurra: “¿más agua? ¡Más agua!”.",
    actividad: {
      texto:
        "Escoge una pareja de palabras que él necesite de verdad y dila muchas veces hoy, en su momento natural. Sin pedirle que la repita: hoy solo la oye.",
      conPantalla: false,
    },
    fuente:
      "Estimulación focalizada (ASHA; AJSLP 2022): pocos blancos, alta densidad de modelos, cero demanda de producción — el mismo principio aplicado a combinaciones de dos palabras.",
  },
  {
    id: "frases-el-hueco-de-la-segunda",
    tecnica: "espera-estructurada",
    etapa: "primeras-frases",
    titulo: "Di la primera y deja el hueco de la segunda",
    explicacion:
      "Cuando ya dice dos palabras a veces, puedes ayudarle a llegar: empiezas tú la combinación y le dejas el final. “Más…” y esperas. Ese hueco al final de una frase que él ya conoce es mucho más fácil de llenar que una frase entera desde cero.",
    guion:
      "Con el vaso en la mano: “más…” — y esperas, mirándolo, en silencio.",
    actividad: {
      texto:
        "Hoy, tres veces, empieza una combinación que él conozca y déjale el final. Si no lo llena, complétala tú con alegría y sigue. Nunca insistas dos veces seguidas.",
      conPantalla: false,
    },
    fuente:
      "Espera estructurada (EMT): la pausa expectante dentro de una rutina verbal muy aprendida es una de las formas más eficaces de provocar iniciación (PubMed 29054980).",
  },
  {
    id: "frases-recast-sin-corregir",
    tecnica: "expansion-recast",
    etapa: "primeras-frases",
    titulo: "Devuélvele la frase bien armada, sin corregirlo",
    explicacion:
      "Él dice “nene agua”. La versión correcta sería “el nene quiere agua”, pero corregirlo lo calla. Devuélvesela armada, como si estuvieran conversando: “Sí, el nene quiere agua.” Él oye la estructura completa sin sentirse evaluado — y sigue hablando, que es lo que queremos.",
    guion: "Él dice “nene agua”; tú: “Sí, el nene quiere agua.” — y se la das.",
    actividad: {
      texto:
        "Hoy, cada combinación suya devuélvesela bien armada, con naturalidad y sin corregir. Prohibido: “se dice…”, “repite”. La conversación es el premio.",
      conPantalla: false,
    },
    fuente:
      "Recast conversacional: ES 0.96 proximal / 0.76 distal en meta-análisis de 35 estudios; el efecto depende de que el adulto reformule SIN exigir repetición y con densidad de ≥1 por minuto (Cleave et al. 2015, AJSLP).",
  },
  {
    id: "frases-narra-con-dos",
    tecnica: "modelado",
    etapa: "primeras-frases",
    titulo: "Subtítulos, ahora de a dos palabras",
    explicacion:
      "Es la misma técnica de siempre —ponerle subtítulos a lo que él hace— pero subiendo un escalón: en vez de “cae”, dices “carro cae”. En vez de “sube”, “nene sube”. Dos palabras, no más. Él te oye armar combinaciones cortas todo el día, sin que nadie le pida nada.",
    guion: "Narra su juego de a dos: “carro cae”… “nene sube”… “más torre”.",
    actividad: {
      texto:
        "Cinco minutos narrando su juego con combinaciones de dos palabras. Sin preguntas. Si él contesta con una sola, perfecto: se la devuelves con dos.",
      conPantalla: false,
    },
    fuente:
      "Heidlage et al. 2019 (ECRQ): el modelado por padres dentro del juego alcanza su mayor efecto en lenguaje expresivo (g=0.50); el nivel del modelo se ajusta un paso por encima del niño.",
  },
  {
    id: "frases-elige-tu-o-yo",
    tecnica: "seguir-interes",
    etapa: "primeras-frases",
    titulo: "Ofrécele elegir: dos opciones, dos palabras",
    explicacion:
      "Ofrecer una elección real —“¿jugo o agua?”— hace dos cosas: le da poder de verdad (y eso motiva a hablar) y le regala el modelo de las dos palabras en la misma frase. Sostén las dos cosas en alto, nómbralas, y espera. Lo que él elija, se lo das enseguida.",
    guion:
      "Sostén las dos cosas en alto: “¿jugo… o agua?” — y espera con cara de pregunta.",
    actividad: {
      texto:
        "Hoy, en tres momentos, ofrécele elegir entre dos cosas que de verdad quiera. Nombra ambas al mostrarlas. Ante cualquier respuesta —palabra, sonido o gesto— dale lo que eligió y nombra su elección.",
      conPantalla: false,
    },
    fuente:
      "Seguir el interés y dar control al niño (NDBI): las oportunidades de elección aumentan la iniciación comunicativa; el refuerzo informativo sostiene la motivación intrínseca (Crank et al. 2021; Deci et al. 1999).",
  },
  {
    id: "frases-cuenta-cuentos-con-huecos",
    tecnica: "espera-estructurada",
    etapa: "primeras-frases",
    titulo: "El cuento de siempre, con huecos",
    explicacion:
      "Un cuento que él se sabe de memoria es una mina: puedes parar en cualquier parte y él sabe qué sigue. Al principio, deja el hueco al final de la frase; después, hazlo en el medio. No es un examen: si no llena el hueco, lo llenas tú, contento, y sigues leyendo.",
    guion:
      "Lee el cuento de siempre y párate antes de la palabra final. Mira y espera.",
    actividad: {
      texto:
        "Lee su cuento favorito y deja tres huecos. Si los llena, celébralo con la historia (no con un premio). Si no, sigue leyendo con alegría: mañana hay otro cuento.",
      conPantalla: false,
    },
    fuente:
      "Espera estructurada en rutinas verbales muy aprendidas (EMT, PubMed 29054980); la lectura compartida repetida es uno de los contextos con mejor evidencia para provocar producción.",
  },
];
