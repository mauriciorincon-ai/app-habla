import type { Capsula } from "./schema";

/**
 * Biblioteca semilla de "Hoy" — la respuesta diaria al padre.
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
    id: "modelado-comida",
    tecnica: "modelado",
    titulo: "Ponle palabras a lo que él ya está haciendo",
    explicacion:
      "Modelar es decir en voz alta, con frases cortas, lo que tu hijo está viviendo en ese momento: “agua”, “más pan”, “está caliente”. No le pides que repita ni le haces preguntas: solo le prestas las palabras que todavía no tiene. Él las escucha justo cuando le hacen falta, y eso es lo que se las deja disponibles para después.",
    guion:
      "Nombra en voz alta lo que él mira o toca: “jugo”, “más jugo”, “rico”.",
    actividad: {
      texto:
        "En la comida de hoy, escoge tres palabras (por ejemplo: agua, más, listo) y dilas cada vez que aparezcan. Sin pedirle que repita.",
      conPantalla: false,
    },
    fuente:
      "Heidlage et al. 2019 (Early Childhood Research Quarterly): la intervención guiada por padres muestra g=0.42 en lenguaje expresivo; g=0.50 cuando ocurre en el juego y las rutinas.",
  },
  {
    id: "modelado-frases-cortas",
    tecnica: "modelado",
    titulo: "Una palabra más que él",
    explicacion:
      "Si tu hijo dice una palabra, tú respondes con dos. Si dice dos, tú respondes con tres. Suena simple porque lo es: hablarle apenas un escalón por encima de donde está le deja ver el siguiente paso sin abrumarlo. Frases largas de adulto, en cambio, se le pierden.",
    guion: "Él dice “carro”; tú respondes: “carro rojo”.",
    actividad: {
      texto:
        "Durante 10 minutos de juego, cuenta mentalmente cuántas palabras usa él y respóndele siempre con una sola palabra más.",
      conPantalla: false,
    },
    fuente:
      "Roberts & Kaiser 2011: los padres que ajustan su lenguaje al nivel del niño son el motor del cambio; el efecto pasa por la conducta del adulto, no por la del niño.",
  },
  {
    id: "modelado-bano",
    tecnica: "modelado",
    titulo: "El baño también habla",
    explicacion:
      "Las rutinas que se repiten todos los días son las mejores maestras: el niño ya sabe qué va a pasar, así que su cabeza queda libre para escuchar las palabras. El baño tiene agua, jabón, patico, frío, caliente, otra vez. No hace falta inventar nada; solo decirlo.",
    guion: "Mientras lo enjabonas: “jabón”, “más jabón”, “ahora el agua”.",
    actividad: {
      texto:
        "Elige dos palabras del baño y dilas siempre en el mismo momento, todos los días de esta semana.",
      conPantalla: false,
    },
    fuente:
      "Heidlage et al. 2019: los efectos más grandes aparecen cuando el modelado ocurre dentro del juego y las rutinas diarias, no en sesiones aparte.",
  },
  {
    id: "recast-devolver-completo",
    tecnica: "expansion-recast",
    titulo: "Devuélvele su frase, completa",
    explicacion:
      "Cuando tu hijo dice algo incompleto, no lo corriges: se lo devuelves bien dicho, como quien le pasa la pelota. Él dice “papá va”; tú dices “sí, papá se va al trabajo”. Nunca le pides que lo repita. Esta es, de todas las técnicas, la que más evidencia tiene a favor.",
    guion: "Él dice “perro come”; tú: “sí, el perro está comiendo”.",
    actividad: {
      texto:
        "Ponte una meta hoy: devolverle bien dicha una frase cada minuto de juego. Sin corregir, sin pedir que repita.",
      conPantalla: false,
    },
    fuente:
      "Cleave et al. 2015 (AJSLP), meta-análisis de 35 estudios: los recasts muestran un efecto de 0.96 en medidas cercanas, y funcionan mejor con una densidad de al menos un recast por minuto.",
  },
  {
    id: "recast-sin-corregir",
    tecnica: "expansion-recast",
    titulo: "Corregir apaga; devolver enciende",
    explicacion:
      "“No se dice así, di bien” hace que el niño hable menos: aprende que hablar trae correcciones. La alternativa es devolverle la versión correcta como parte natural de la conversación, sin señalar el error. Él la oye igual, pero sin el costo de sentirse equivocado.",
    guion: "Él dice “yo poní”; tú: “ah, ¡tú lo pusiste ahí!”.",
    actividad: {
      texto:
        "Hoy no corriges ni una vez. Cada vez que sientas ganas de corregir, devuélvele la frase bien dicha y sigue jugando.",
      conPantalla: false,
    },
    fuente:
      "Cleave et al. 2015 (AJSLP): el recast funciona integrado en la conversación; su fuerza está en la reformulación, no en la corrección explícita.",
  },
  {
    id: "recast-agrega-idea",
    tecnica: "expansion-recast",
    titulo: "Agrégale una idea, no solo una palabra",
    explicacion:
      "Expandir no es solo alargar la frase: es añadirle un pedacito de mundo. Él dice “carro”; tú puedes decir “el carro corre rápido”. Le sumas información nueva (qué hace, cómo es, dónde está) en la frase que él mismo empezó.",
    guion: "Él dice “agua”; tú: “el agua está fría, ¿la tocas?”.",
    actividad: {
      texto:
        "En el juego de hoy, a cada palabra suya súmale algo que se pueda ver o tocar en ese momento.",
      conPantalla: false,
    },
    fuente:
      "Cleave et al. 2015 (AJSLP): las expansiones conversacionales muestran efectos de 0.96 (proximal) y 0.76 (distal) sobre el lenguaje del niño.",
  },
  {
    id: "espera-cuenta-cinco",
    tecnica: "espera-estructurada",
    titulo: "Cuenta hasta cinco por dentro",
    explicacion:
      "El silencio incomoda, y por eso los adultos lo llenamos. Pero un niño que está armando una palabra necesita más tiempo del que creemos. Si le das cinco segundos completos —mirándolo, con cara de expectativa—, a veces esa palabra sale. Si llenas el silencio, nunca sabremos si iba a salir.",
    guion:
      "Mírale a los ojos, sonríe y espera cinco segundos completos antes de hablar tú.",
    actividad: {
      texto:
        "Escoge un momento del día (el jugo, la puerta, el juguete) y espera cinco segundos antes de dárselo o de hablar. Solo espera.",
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
      "En una canción que él se sabe, corta justo antes de la última palabra y espera. El hueco es una invitación clarísima: la melodía pide esa palabra y él ya sabe cuál es. Muchos niños que no hablan “a pedido” sí completan la canción.",
    guion: "Canta “estrellita, ¿dónde…?” y quédate callado, esperando.",
    actividad: {
      texto:
        "Canta hoy una canción que él conozca y deja tres huecos. Si no los llena, no pasa nada: cántala completa y sigue.",
      conPantalla: false,
    },
    fuente:
      "Espera estructurada / tiempo de espera dentro de EMT (PubMed 29054980), técnica del coach del padre en las intervenciones naturalistas.",
  },
  {
    id: "espera-no-adivines",
    tecnica: "espera-estructurada",
    titulo: "No adivines tan rápido",
    explicacion:
      "Cuando adivinamos lo que quiere antes de que lo pida, le quitamos la razón para pedirlo. Prueba a poner su juguete favorito a la vista pero fuera de su alcance, y espera. No es una trampa ni un castigo: es dejarle un motivo real para usar su voz.",
    guion:
      "Sostén el juguete, míralo, y espera en silencio con cara de “¿qué pasa?”.",
    actividad: {
      texto:
        "Una sola vez hoy, deja algo que él quiera a la vista y espera cinco segundos. Si no pide, se lo das igual — sin condiciones.",
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
      "El niño aprende las palabras de aquello a lo que ya le está poniendo atención, no de aquello a lo que queremos que se la ponga. Si está fascinado con la rueda del carro, la palabra del día es “rueda”. Seguir su interés no es rendirse: es apuntar donde su cabeza ya está.",
    guion: "Siéntate a su altura, mira lo que él mira y nombra eso.",
    actividad: {
      texto:
        "Diez minutos de juego donde él elige TODO. Tú solo pones palabras a lo que él hace. Sin dirigir, sin proponer otra cosa.",
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
      "Cuando su voz hace que algo pase —que un personaje avance, que una torre se caiga—, hablar deja de ser una tarea y se vuelve un poder. Hoy usamos el juego de voz de la app: mientras él sostiene el sonido, el personaje vuela. Tú te sientas al lado, celebras con él y le pones palabras. La pantalla es la excusa; el juego son ustedes dos.",
    guion: "“Mira: cuando tú haces aaaaah, él vuela. ¿Lo hacemos juntos?”",
    actividad: {
      texto:
        "Juega con él el juego de voz de la app, sentados juntos. Hazlo tú primero para mostrarle cómo, y celebra lo que de verdad sostuvo.",
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
      "Los estudios son claros y a la vez tranquilizadores: la pantalla sola no enseña a hablar, pero la pantalla con un adulto al lado que comenta, pregunta y celebra, sí ayuda. Lo que enseña es la interacción contigo; la app solo la organiza. Por eso aquí no existe el “modo niño solo”.",
    guion:
      "Siéntate al lado, comenta lo que pasa: “¡subió!”, “se paró… ¡otra vez!”.",
    actividad: {
      texto:
        "Si hoy usan pantalla, que sea poquito y contigo al lado hablando. Si él prefiere jugar sin pantalla, mejor.",
      conPantalla: true,
    },
    fuente:
      "Madigan et al. 2020 (JAMA Pediatrics): más pantalla se asocia a menor lenguaje (r=−0.14), pero el contenido educativo visto acompañado se asocia positivamente. La carencia es la interacción, no la pantalla.",
  },
  {
    id: "focalizada-palabra-semana",
    tecnica: "estimulacion-focalizada",
    titulo: "Una sola palabra, muchas veces",
    explicacion:
      "En vez de exponerlo a cien palabras nuevas, escoge una que le sirva de verdad (“más”, “abre”, “mío”) y úsala muchísimas veces en contextos distintos, sin pedirle que la diga. La repetición concentrada hace que la palabra se vuelva familiar antes de que él tenga que producirla.",
    guion:
      "Elige “más” y dilo hoy en cada oportunidad: “más agua”, “más rápido”, “¿más?”.",
    actividad: {
      texto:
        "Escoge una palabra útil para él y propóntela decir 20 veces hoy, en momentos distintos. No le pidas repetirla ni una sola vez.",
      conPantalla: false,
    },
    fuente:
      "Estimulación focalizada (revisión de facilitación del lenguaje, ASHA; revisión sistemática AJSLP 2022): exposición concentrada sin exigir producción. La evidencia es más fuerte en niños con retraso del lenguaje que en autismo — por eso la usamos sin prometer resultados.",
  },
  {
    id: "focalizada-sin-examen",
    tecnica: "estimulacion-focalizada",
    titulo: "No lo pongas a examen",
    explicacion:
      "“¿Cómo se llama esto?”, “¿qué es?”, “dilo” convierten el juego en un examen, y a un niño que le cuesta hablar el examen le enseña a callarse. La estimulación focalizada hace lo contrario: baña de palabras el ambiente y le quita toda presión de responder. Él habla cuando está listo, no cuando lo evaluamos.",
    guion:
      "Cambia la pregunta por un comentario: en vez de “¿qué es?”, di “un perro”.",
    actividad: {
      texto:
        "Hoy cuentas cuántas preguntas de examen le haces. La meta no es cero de golpe: es notarlas y cambiar la mitad por comentarios.",
      conPantalla: false,
    },
    fuente:
      "Estimulación focalizada (ASHA; AJSLP 2022): el niño recibe modelos abundantes de la palabra objetivo sin demanda de producción — el rasgo que la distingue del entrenamiento por repetición.",
  },
];
