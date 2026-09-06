import type { CapsulaContactoVisual } from "./schema";

/**
 * Biblioteca de CONTACTO VISUAL (Sprint 005) — el documento que la mamá trabaja sin pantallas.
 *
 * 24 cápsulas: seis maneras (las técnicas con evidencia de la investigación aprobada), cada una
 * con su escalera de 3–4 peldaños en niveles distintos, y los seis niveles cubiertos. Cada
 * cápsula está anclada a una actividad que describen sus fuentes (anexo C de la investigación)
 * y cita autor · año · revista — o solo autor · año cuando el nombre de la revista describe a
 * quién se estudió (regla de citas del sprint, fijada por el usuario el 2026-09-06). Todo en
 * observable: lo que la mamá ve en su casa.
 *
 * Reglas que atraviesan todas: parten de lo que YA le saca la mirada · nadie le pide que mire ·
 * lo que sigue a la mirada es que el juego sigue · persona nueva O juego nuevo, nunca ambos ·
 * el nombre no se «gasta» · el semáforo (aparta la vista, se tapa la cara, se irrita → parar).
 *
 * (Solo `import type` desde ./schema, como en capsulas.ts: el generador corre con Node
 * quitando tipos y un import de valor sin extensión no resuelve ahí.)
 */
export const CAPSULAS_CONTACTO_VISUAL: CapsulaContactoVisual[] = [
  // ── Hago lo que él hace ─────────────────────────────────────────────────────────────────
  {
    id: "dos-juguetes-iguales",
    dominio: "contacto-visual",
    tecnica: "hago-lo-que-el-hace",
    nivel: "n1",
    titulo: "Dos carros iguales: tú haces lo que él hace",
    explicacion:
      "Cuando alguien copia exactamente lo que hacemos, se vuelve visible sin pedir nada. Con un juguete igual al suyo, copias en el momento lo que hace: si lo rueda, lo ruedas; si lo golpea, lo golpeas; si hace un sonido, lo haces tú. Nada más. En un estudio en casa, mamás que hicieron esto cinco minutos al día durante dos meses vieron a sus hijos mirarlas más tiempo. Con él ya pasa con quien confía: aquí solo lo afianzas.",
    guion: "Sin decir nada al principio. Cuando te mire: «¡Igual que tú!»",
    actividad: {
      texto:
        "Consigue dos juguetes iguales (dos carros, dos cucharas, dos bloques). Siéntate a su altura, de frente o al lado, y copia todo lo que hace con el suyo durante tres a cinco minutos: también sus sonidos y sus movimientos. Cuando te mire, sonríe y sigue copiando. Si se levanta, te levantas. Si se va, se acabó por hoy: mañana otra vez.",
      duracion: "3–5 min",
      momentos: ["juego"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No conviertas la copia en una clase («ahora haz tú esto»): hoy copias tú, nada más. Y no copies nada que sea peligroso.",
    fuente: "Field, 2001 · Sanefuji, 2013, Infant Ment Health J",
  },
  {
    id: "el-prueba-si-lo-copias",
    dominio: "contacto-visual",
    tecnica: "hago-lo-que-el-hace",
    nivel: "n2",
    titulo: "Él prueba si lo copias",
    explicacion:
      "Después de unos días de copiarlo aparece algo nuevo: hace un movimiento y se queda mirándote para ver si lo repites. Cambia de juguete y mira. Golpea tres veces y mira. Eso es él poniéndote a prueba, y es la primera vez que la mirada la pone él. Tu trabajo es no fallarle: copias enseguida, exagerado y con cara de fiesta.",
    guion: "«¿Y ahora?… ¡Igualito!»",
    actividad: {
      texto:
        "Igual que en «dos juguetes iguales», pero fíjate en el instante en que él hace algo y voltea a verte. Copia al segundo, más grande que él, y sonríe. Si cambia de juguete, cambia tú. Si se le ocurre un movimiento raro, más raro tú. Tres a cinco minutos. Si la prueba no aparece, no la busques: sigue copiando y vuelve mañana.",
      duracion: "3–5 min",
      momentos: ["juego"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No te adelantes ni le propongas movimientos: la gracia es que él arranque y tú respondas. Y si voltea a verte y no pasa nada, deja de probar: cópialo siempre.",
    fuente: "Escalona, 2002 · Contaldo, 2016, Front Psychol",
  },
  {
    id: "te-trae-el-otro-juguete",
    dominio: "contacto-visual",
    tecnica: "hago-lo-que-el-hace",
    nivel: "n4",
    titulo: "Te trae el otro juguete: arrancó él",
    explicacion:
      "Cuando el juego de copiarlo ya es de los dos, deja el segundo juguete a la vista y no arranques tú. Un día él te lo va a traer, o va a empezar un movimiento mirándote para que lo sigas. Ese día arrancó él, y eso vale más que cualquier mirada que tú le hayas sacado. Desde ahí, de vez en cuando puedes hacer tú un movimiento nuevo y esperar: a veces te copia él a ti.",
    guion: "«¡Ah, quieres que juguemos igual! Dale, tú primero.»",
    actividad: {
      texto:
        "Deja los dos juguetes iguales en su sitio de siempre, a la mano. Si él trae el tuyo o empieza algo mirándote, es la señal: juegas a copiarlo como siempre. A mitad del juego, una sola vez, haz tú algo nuevo con tu juguete y espera tres segundos con cara de «¿lo haces?». Si lo copia, celebra copiándolo tú de vuelta. Si no, sigues copiándolo a él.",
      duracion: "3–5 min",
      momentos: ["juego"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No lo sientes a jugar ni le pongas el juguete en la mano: si hoy no arranca él, no pasa nada. Y si te copia, no lo vuelvas una tanda de «ahora esto, ahora esto»: una vez y listo.",
    fuente: "Ingersoll, 2010 · Contaldo, 2016, Front Psychol",
  },
  {
    id: "papa-lo-copia",
    dominio: "contacto-visual",
    tecnica: "hago-lo-que-el-hace",
    nivel: "n5",
    titulo: "Papá lo copia: la entrada más suave",
    explicacion:
      "Con una persona nueva, copiarlo es la manera de entrar sin pedirle nada: la persona se vuelve visible para él por ser igual, no por hablarle. Papá, la abuela o el hermano hacen exactamente lo que tú hiciste al principio: dos juguetes iguales y copiar todo, callados, a su altura. Tú te quedas cerca, sin intervenir.",
    guion: "Para papá: «Copia todo lo que haga, sin hablarle. Cuando te mire, sonríe y sigue.»",
    actividad: {
      texto:
        "Elige una persona que lo conozca bien y un momento en que él ya esté tranquilo. Esa persona se sienta a su altura con el segundo juguete y lo copia tres a cinco minutos, tal como tú: acciones, sonidos, movimientos. Si él te busca a ti, sonríes desde donde estás y no te metes. Si se va, se acabó; se intenta otro día.",
      duracion: "3–5 min",
      momentos: ["juego"],
      conPantalla: false,
    },
    conQuien: "otra-persona",
    queNoHacer:
      "No estrenes juguetes nuevos con la persona nueva: los mismos dos de siempre. Y la persona no le habla ni le pregunta nada al principio: solo copia.",
    fuente: "Sanefuji, 2013, Infant Ment Health J · Stokes, 1977, J Appl Behav Anal",
  },

  // ── La pausa antes de lo mejor ──────────────────────────────────────────────────────────
  {
    id: "el-avion-cara-a-cara",
    dominio: "contacto-visual",
    tecnica: "pausa-antes-de-lo-mejor",
    nivel: "n1",
    titulo: "El avión, cara a cara",
    explicacion:
      "Los juegos de cuerpo —el avión, «¡qué grande!», levantarlo, mecerlo— son los que más le sacan la mirada, porque no hay ningún juguete en el medio: solo tu cara. Antes de agregarles nada, hay que tener un juego que se repita igual, con las mismas palabras, para que él lo reconozca. Este peldaño es solo eso: una rutina corta, cara a cara, que le guste.",
    guion: "«¡Avión, avión!… ¡Aterrizó!»",
    actividad: {
      texto:
        "Escoge un juego de cuerpo que ya le guste. Ponte de frente, a su altura, y hazlo una o dos veces con las mismas palabras, empezando y terminando igual. Cuando se ría o se acerque, repites. Cuando pierda interés, lo cierras: «se acabó el avión». Sin pausa todavía: hoy solo estás construyendo la rutina.",
      duracion: "2–3 min",
      momentos: ["juego", "dormir"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No lo hagas si él está ocupado con otra cosa: espera a un rato en que no tenga nada en las manos. Si no le gusta, cambia de juego, no de insistencia.",
    fuente: "Rogers, 2012, J Am Acad Child Adolesc Psychiatry · Binns, 2022",
  },
  {
    id: "cosquillas-que-se-detienen",
    dominio: "contacto-visual",
    tecnica: "pausa-antes-de-lo-mejor",
    nivel: "n2",
    titulo: "Cosquillas que se detienen justo antes",
    explicacion:
      "Las cosquillas ya le sacan la mirada. Hoy solo les agregas un hueco: cuando ya va a llegar la parte que más le gusta, te detienes con las manos listas y la cara de «¿y ahora?». Ese instante lo llena él: con la mirada, con un brazo, con un sonido. En cuanto aparece cualquiera de esas señales, sigues. No hace falta pedirle nada, y la pausa es corta: tres segundos.",
    guion: "«¡Ahí vienen las cosquillas!… (pausa, manos listas, cara de espera)… ¡Aquí van!»",
    actividad: {
      texto:
        "En un momento en que ya esté contento, haz la ronda de cosquillas dos o tres veces igual. A la siguiente, detente justo antes de lo mejor: manos en el aire, cara expectante, tres segunditos. Si te mira, hace un gesto o un sonido, sigues de inmediato. Si nada, sigues igual y lo intentas otra vez más tarde. Sirve lo mismo con «corre que te atrapo»: cuando lo atrapes, retrocede un paso, espera su mirada rápida y persíguelo enseguida.",
      duracion: "3–5 min",
      momentos: ["juego", "dormir"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No le pidas que te mire ni alargues la pausa hasta que se frustre: tres segundos y sigues, mire o no mire. Si se acelera demasiado, bajas el ritmo.",
    fuente: "Nomikou, 2017, Front Psychol · Muuvila, 2022",
  },
  {
    id: "el-globo-en-la-boca",
    dominio: "contacto-visual",
    tecnica: "pausa-antes-de-lo-mejor",
    nivel: "n3",
    titulo: "El globo: lo inflas, lo sueltas, y él mira",
    explicacion:
      "Con un juguete en el medio, la mirada tiene un recorrido: del globo a tu cara y otra vez al globo. Eso es lo que aquí buscas. Inflas el globo, lo sueltas para que vuele por el cuarto, lo recoges… y antes de inflarlo otra vez te quedas con el globo en la boca, sin soplar, mirándolo a él. En ese hueco su mirada sube del globo a tu cara. Ahí soplas.",
    guion: "«¿Lo inflo?… (globo en la boca, ojos en él)… ¡Fffff!»",
    actividad: {
      texto:
        "Un globo, en el piso o en la cama. Ínflalo y suéltalo dos veces seguidas, sin pausa, para que entienda el juego. A la tercera, globo en la boca y pausa de tres segundos mirándolo. Cuando su mirada llegue a tu cara —o haga un gesto, o un sonido—, soplas. Cinco o seis rondas y se acabó. Sirve igual con burbujas o con un molinillo.",
      duracion: "3–5 min",
      momentos: ["juego"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No escondas el globo ni lo retengas hasta que mire: el globo está a la vista todo el tiempo. Y no digas «mírame»: la pausa habla sola.",
    fuente: "Rogers, 2012, J Am Acad Child Adolesc Psychiatry · Muuvila, 2022",
  },
  {
    id: "cucu-cuando-se-tapa-el",
    dominio: "contacto-visual",
    tecnica: "pausa-antes-de-lo-mejor",
    nivel: "n4",
    titulo: "Cucú: cuando se tapa él",
    explicacion:
      "El cucú tiene un momento de espera —la cara tapada— en el que él participa: intenta destapar, se ríe antes de que aparezcas. Cuando ya conoce el juego, el paso siguiente es que lo arranque él: se tapa la cara con las manos, te trae el pañuelo, o tapa al muñeco y te mira. Ese es el peldaño: el juego empieza porque él lo pidió.",
    guion: "«¿Dónde está mamá?… ¡Aquí está!» — y cuando se tape él: «¿Y ahora dónde estás?»",
    actividad: {
      texto:
        "Juega cucú como siempre, con un pañuelo o con las manos, sosteniendo la espera dos o tres segundos mirándolo entre los dedos. Luego deja el pañuelo a su alcance y no arranques tú. Si se tapa, tapa al muñeco o te trae el pañuelo, respondes al instante con el juego completo. Si hoy no arranca él, juegas una ronda normal y lo dejas ahí. Al ponerle la camiseta también hay cucú.",
      duracion: "2–3 min",
      momentos: ["juego", "vestirse"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No le tapes la cara a él si no lo tolera, y no alargues la espera al principio: dos o tres segundos. El cucú no es un examen de dónde está mamá.",
    fuente: "Nomikou, 2017, Front Psychol · Halle, 1981, J Appl Behav Anal",
  },

  // ── Un turno tú, un turno yo ────────────────────────────────────────────────────────────
  {
    id: "me-meto-en-su-juguete",
    dominio: "contacto-visual",
    tecnica: "un-turno-tu-un-turno-yo",
    nivel: "n2",
    titulo: "Me meto en su juguete",
    explicacion:
      "Cuando un juguete lo absorbe, competir con él pierde siempre. Lo que funciona es entrar: sentarte al lado, hacer una sola cosa con ese mismo juguete —empujar el carro un poquito, poner un bloque en su torre— y esperar. Al principio quizá te aparte la mano; después empieza a esperar tu jugada, y a mirar para ver cuándo llega. Ese esperar es el primer turno.",
    guion: "«Me toca un poquito a mí… ¡y ahora a ti!»",
    actividad: {
      texto:
        "Siéntate a su altura frente a lo que está jugando. Haz UNA acción pequeña con su juguete, muy corta, y retira las manos. Deja que él siga. Cuando veas que te aguanta, otra acción, y otra vez las manos atrás. Dos o tres minutos, sin pedirle nada. Si te aparta la mano las dos veces, te retiras y lo intentas mañana con una jugada más chiquita.",
      duracion: "2–3 min",
      momentos: ["juego"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No le quites el juguete ni dirijas el juego («ponlo aquí»): tú te sumas a lo que él ya hace, con turnos de un segundo.",
    fuente: "Carter, 2011, J Child Psychol Psychiatry · Kasari, 2006, J Child Psychol Psychiatry",
  },
  {
    id: "alto-y-ya-con-el-carro",
    dominio: "contacto-visual",
    tecnica: "un-turno-tu-un-turno-yo",
    nivel: "n3",
    titulo: "«¡Alto!… ¡ya!»: el carro se detiene en tu mano",
    explicacion:
      "Es la cápsula del corazón de la escalera. Él empuja el carro; tu mano lo detiene con cara de juego: «¡alto!». Un segundo de pausa… y lo sueltas: «¡ya!». Como el carro está en el medio, su mirada tiene que subir del carro a tu cara para saber cuándo sigue, y volver al carro. Cada ronda ese ir y venir se sostiene un poquito más. Nunca se lo pides: el juego lo pide.",
    guion: "«¡Alto!… (mano en el carro, ojos en él)… ¡Ya!»",
    actividad: {
      texto:
        "Con el carro, la pelota o lo que él esté rodando. Deja que lo empuje dos veces sin meterte. A la tercera, tu mano lo para con cara de travesura: «¡alto!», un segundo, «¡ya!», y lo sueltas. Repite cuatro o cinco veces. Cuando su mirada llegue a tu cara en el «alto», sueltas de inmediato: eso es lo que hace que la mirada valga. Tres a cinco minutos y le devuelves el carro.",
      duracion: "3–5 min",
      momentos: ["juego"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No sostengas el carro más de un par de segundos ni conviertas la mano en castigo: si se enoja, sueltas y haces menos «alto». Nada de «mírame».",
    fuente: "Ingersoll, 2013 · Kasari, 2006, J Child Psychol Psychiatry",
  },
  {
    id: "el-me-pasa-el-turno",
    dominio: "contacto-visual",
    tecnica: "un-turno-tu-un-turno-yo",
    nivel: "n4",
    titulo: "Él me pasa el turno",
    explicacion:
      "Cuando el juego por turnos ya existe, deja de arrancarlo tú. Después de tu turno te quedas quieta, con las manos abiertas, y esperas. Un día él te empuja el carro, te pone el bloque en la mano o te toma la mano para que lo pares otra vez: te pasó el turno. El juego ahora es de él, y tú entraste porque te invitó.",
    guion: "«¿Me toca? ¡Dale, me toca!»",
    actividad: {
      texto:
        "Juega los turnos de siempre con el juguete de siempre. Tras una ronda buena, haz tu turno, y luego nada: manos abiertas sobre las piernas, cara de espera, hasta cinco segundos. Si él te pasa el juguete, te toma la mano o te lo acerca, respondes al instante y con ganas. Si no, retomas tú una ronda más y lo dejas para otro día.",
      duracion: "3–5 min",
      momentos: ["juego"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No le pongas tú el juguete en la mano para que «te lo dé», ni le preguntes «¿me lo das?» tres veces: una espera, y si no viene, se sigue jugando.",
    fuente: "Kasari, 2010 · Whalen, 2003, J Child Psychol Psychiatry",
  },
  {
    id: "los-mismos-turnos-con-papa",
    dominio: "contacto-visual",
    tecnica: "un-turno-tu-un-turno-yo",
    nivel: "n5",
    titulo: "Los mismos turnos, ahora con papá",
    explicacion:
      "En los estudios, el juego por turnos que se aprendió con una persona pasó a la mamá solo cuando se hizo a propósito: la misma rutina, con el mismo juguete y las mismas palabras. Eso es lo que hace papá aquí: el «¡alto!… ¡ya!» calcado, con el carro de siempre. Tú lo haces primero una ronda para que él vea, y luego te haces a un lado.",
    guion: "Para papá: «El carro se para en tu mano: ‘¡alto!’, un segundo, ‘¡ya!’. Cuando te mire, sueltas.»",
    actividad: {
      texto:
        "Un momento tranquilo, el juguete de los turnos. Tú haces dos rondas con él, papá al lado mirando. Luego papá toma tu lugar y hace exactamente lo mismo, con tus palabras y tu segundo de pausa; tú te quedas cerca pero fuera. Tres minutos. Si él te busca a ti en el «alto», papá suelta igual y sigue: no pasa nada.",
      duracion: "3 min",
      momentos: ["juego"],
      conPantalla: false,
    },
    conQuien: "otra-persona",
    queNoHacer:
      "Papá no estrena juguete ni juego nuevo: es el mismo de siempre. Y no lo hacen los dos a la vez sobre el mismo carro: uno juega, la otra mira.",
    fuente: "Kasari, 2006, J Child Psychol Psychiatry · Kasari, 2015, J Consult Clin Psychol",
  },

  // ── Espero en silencio ──────────────────────────────────────────────────────────────────
  {
    id: "burbujas-y-espero",
    dominio: "contacto-visual",
    tecnica: "espero-en-silencio",
    nivel: "n2",
    titulo: "Burbujas: soplo, cierro el frasco y espero",
    explicacion:
      "Esperar en silencio es lo contrario de preguntar. Soplas burbujas, se acaban, y en vez de «¿quieres más?» te quedas con el frasco a la vista, la varita quieta y la cara de «¿y ahora?». Ese silencio abre un hueco que él llena: con la mirada, con un gesto, con un sonido. Cualquiera de esas señales cuenta, y a cualquiera respondes soplando.",
    guion: "(nada: cara de espera, frasco a la vista)… «¡Más burbujas!»",
    actividad: {
      texto:
        "Sopla dos rondas seguidas para que se enganche. Luego cierra la varita en el frasco, sostenlo a la altura de tu cara y espera tres segundos en silencio, mirándolo. Cuando te mire, señale, estire la mano o haga un sonido, soplas al instante. Cinco o seis rondas. Si en tres segundos no hay nada, soplas igual: la espera se estira después, no hoy.",
      duracion: "3–5 min",
      momentos: ["juego", "baño"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No preguntes «¿quieres más?» ni «¿qué dices?» en la espera: el silencio es lo que trabaja. Y no pases de tres segundos al principio.",
    fuente: "Halle, 1981, J Appl Behav Anal · Muuvila, 2022",
  },
  {
    id: "la-espera-se-estira",
    dominio: "contacto-visual",
    tecnica: "espero-en-silencio",
    nivel: "n3",
    titulo: "El frasco que no abre: la espera se estira",
    explicacion:
      "Cuando la espera de tres segundos ya le funciona, se alarga de a poquito: cuatro, cinco, seis. Y sirve con cualquier cosa que él quiera y no pueda solo: el frasco cerrado con las galletas, el carro de cuerda, el juguete en la repisa. Lo sostienes a la vista, esperas, y su mirada hace el recorrido del objeto a tu cara y de vuelta. Cuando llega a tu cara, ayudas. La espera es de él, no contra él.",
    guion: "«Uy, no abre…» (frasco a la vista, cara de espera, silencio)… «¡Te ayudo!»",
    actividad: {
      texto:
        "Escoge algo que quiera y necesite tu mano. Sostenlo a la altura de tu cara y espera en silencio: esta semana, cuatro segundos; la próxima, cinco. Si te mira, ayudas de inmediato. Si estira la mano o hace un sonido, también. Si pasan los segundos y nada, ayudas igual y la próxima vez vuelves a tres. Un par de veces al día alcanza.",
      duracion: "2–3 min",
      momentos: ["juego", "comida"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No alargues la espera si lo ves frustrado: la espera larga que enoja no enseña nada. Y no cambies la ayuda por un «mírame primero».",
    fuente: "Charlop, 1985, J Appl Behav Anal · Halle, 1981, J Appl Behav Anal",
  },
  {
    id: "lo-dejo-a-medias",
    dominio: "contacto-visual",
    tecnica: "espero-en-silencio",
    nivel: "n4",
    titulo: "Lo dejo a medias para que él lo traiga",
    explicacion:
      "Un juego que queda a medias, a la vista, es una invitación: el frasco de burbujas cerrado sobre la mesa, el globo desinflado en el piso, el carro de los turnos en su sitio. Sin decir nada, esperas. Un día él lo trae, te lo pone en la mano o te lleva hasta el juego. Arrancó él. Ahí no lo haces esperar ni un segundo: el juego arranca porque lo pidió.",
    guion: "«¡Ah, quieres burbujas! Dale, aquí vamos.»",
    actividad: {
      texto:
        "Al terminar un juego que le gustó, deja las cosas a la vista y a su alcance, y sigue con lo tuyo cerca de él. No lo mires fijamente esperando: haz otra cosa. Si trae el objeto, te toma la mano o te mira desde el juego, respondes con el juego entero y con ganas. Si hoy no pasa, no pasa: mañana lo dejas otra vez.",
      duracion: "5 min",
      momentos: ["juego", "transiciones"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No le preguntes «¿quieres jugar?» ni le acerques tú el objeto: la gracia es que la idea sea de él. Y no lo dejes a medias cuando está cansado o con hambre.",
    fuente: "Charlop, 1985, J Appl Behav Anal · Ingersoll, 2013",
  },
  {
    id: "una-media-puesta",
    dominio: "contacto-visual",
    tecnica: "espero-en-silencio",
    nivel: "n6",
    titulo: "Una media puesta, la otra en la mano",
    explicacion:
      "La misma espera cabe en el día real, sin preparar nada: al vestirlo, una media puesta y la otra en tu mano, quieta; en la mesa, la cuchara con lo que le gusta, a medio camino; en el baño, la toalla lista sin envolverlo. Tres segundos de silencio y cara de «¿y ahora?». Cuando te mira, sigues. En los estudios, esto fue lo que hizo que la mirada apareciera en momentos que nadie había practicado.",
    guion: "«Una media… (la otra en la mano, silencio)… ¡y la otra!»",
    actividad: {
      texto:
        "Escoge una rutina del día: vestirse, la comida, la toalla. Haz la primera parte normal, y antes de la segunda te detienes con lo que sigue a la vista: tres segundos, silencio, cara de espera. Si te mira, hace un gesto o un sonido, sigues de inmediato. Si no, sigues igual. Una o dos veces al día, nunca cuando van tarde.",
      duracion: "1–2 min",
      momentos: ["vestirse", "comida", "baño"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No lo hagas con prisa ni cuando está de mal humor: si la rutina es tensa, ese día no hay pausa. Y la ropa o la comida nunca se retienen como premio.",
    fuente: "Halle, 1981, J Appl Behav Anal · Stokes, 1977, J Appl Behav Anal",
  },

  // ── Canto a su ritmo ────────────────────────────────────────────────────────────────────
  {
    id: "sigo-su-ritmo",
    dominio: "contacto-visual",
    tecnica: "canto-a-su-ritmo",
    nivel: "n1",
    titulo: "Sigo su ritmo: él golpea, yo golpeo",
    explicacion:
      "Cuando él golpea la mesa, hace un sonido repetido o se balancea, ahí hay un ritmo. Si tú lo sigues —golpeas igual, cantas encima al mismo tempo— él siente que la música viene de él, y voltea a ver de dónde sale ese eco. Es lo que encontraron los estudios de música: cuando el adulto sigue el tempo del niño, aparecen más miradas, y más largas.",
    guion: "(golpeas al mismo ritmo que él y cantas encima) «Pum, pum, pum… ¡así, así!»",
    actividad: {
      texto:
        "Cuando lo veas golpeando o haciendo un sonido repetido, ponte de frente, a su altura, y sigue su ritmo con las manos, con una olla o con la voz. Cántale una melodía cualquiera encima, a su velocidad, no a la tuya. Si acelera, aceleras; si para, paras. Cuando te mire, sonríe y sigue. Dos o tres minutos.",
      duracion: "2–3 min",
      momentos: ["juego", "comida"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No le pongas tu ritmo ni una canción grabada: la música la lleva él. Y no lo hagas si el sonido que hace es de molestia, no de juego.",
    fuente: "Kim, 2008 · Kim, 2009",
  },
  {
    id: "su-cancion-con-hueco",
    dominio: "contacto-visual",
    tecnica: "canto-a-su-ritmo",
    nivel: "n2",
    titulo: "Su canción, con un hueco antes de lo mejor",
    explicacion:
      "Algunas canciones ya le sacan la mirada: son esas, no otras. Cántala igual que siempre, y justo antes de la parte que más le gusta —el «ruedan y ruedan», el «¡pum!»— te callas con la boca abierta y la cara de espera. Ese hueco lo llena él con la mirada, un gesto o un sonido, y ahí sigue la canción.",
    guion: "«Las ruedas del bus van… (silencio, cara de espera)… ¡ruedan y ruedan!»",
    actividad: {
      texto:
        "Escoge una de las canciones que le gustan. Cántala una vez completa, de frente y a su altura. La segunda vez, párate justo antes de lo mejor: dos o tres segundos, cara expectante, manos listas para el gesto. Cuando te mire o haga la señal, sigues cantando. Tres o cuatro rondas y cambias de cosa.",
      duracion: "2–3 min",
      momentos: ["juego", "dormir", "calle"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No pruebes con una canción nueva: la que ya funciona. Y no sostengas el silencio hasta que se aburra: tres segundos y sigues.",
    fuente: "Kim, 2008 · Rogers, 2012, J Am Acad Child Adolesc Psychiatry",
  },
  {
    id: "una-estrofa-mas",
    dominio: "contacto-visual",
    tecnica: "canto-a-su-ritmo",
    nivel: "n3",
    titulo: "Canción con gestos: una estrofa más cada semana",
    explicacion:
      "En una canción con gestos, los turnos ya vienen adentro: tú haces el gesto, él lo hace, y para saber cuándo sigue, su mirada va de tus manos a tu cara y vuelve. Se empieza con una sola estrofa, la que ya conoce, y se agrega una nueva cada semana, no antes. Los estudios de música vieron que los turnos y las miradas se alargaban cuando la rutina era repetida y predecible.",
    guion: "«Este dedito compró un huevito…» (gesto, pausa, ojos en él) «…¡y este gordito se lo comió!»",
    actividad: {
      texto:
        "Una canción con gestos —«este dedito», «la araña», «abre y cierra»— de frente y a su altura. Solo la primera estrofa, tres veces, con los gestos grandes y una pausa corta antes de cada gesto para que él lo haga, o te mire para que lo hagas tú. La semana que viene, agrega la segunda estrofa. Si un día no quiere, una vez y listo.",
      duracion: "2–3 min",
      momentos: ["juego", "dormir"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No cantes la canción entera desde el primer día ni le muevas tú las manos para que haga el gesto: una estrofa, y el gesto es de él o es tuyo, no forzado.",
    fuente: "Kim, 2009 · Stephens, 2008",
  },
  {
    id: "la-cancion-de-siempre-al-vestirlo",
    dominio: "contacto-visual",
    tecnica: "canto-a-su-ritmo",
    nivel: "n6",
    titulo: "La canción de siempre, al vestirlo y en el baño",
    explicacion:
      "La canción que ya funciona jugando sirve igual en el baño, al vestirlo o en el carro: mismas palabras, mismo hueco antes de lo mejor. Lo nuevo es el momento, no la canción. Así la mirada empieza a aparecer en partes del día donde nadie la había preparado, que es a donde queremos llegar.",
    guion: "(al ponerle la camiseta) «Las ruedas del bus van… (pausa)… ¡ruedan y ruedan!»",
    actividad: {
      texto:
        "Escoge la canción que mejor le funciona jugando. Cántala tal cual en un momento distinto: mientras le pones la ropa, en la tina, caminando a la tienda. Con su hueco de siempre antes de lo mejor. Si te mira o hace la señal, sigues; si no, sigues igual. Un momento nuevo por semana, no todos a la vez.",
      duracion: "1–2 min",
      momentos: ["vestirse", "baño", "calle"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "No estrenes canción y momento a la vez: la canción de siempre en un lugar nuevo. Y si en ese momento está incómodo (el agua, la ropa), ese día no hay canción.",
    fuente: "Stephens, 2008 · Stokes, 1977, J Appl Behav Anal",
  },

  // ── La misma rutina con otra persona ────────────────────────────────────────────────────
  {
    id: "papa-al-lado-un-turno-cada-uno",
    dominio: "contacto-visual",
    tecnica: "misma-rutina-otra-persona",
    nivel: "n3",
    titulo: "Papá al lado: un turno tú, un turno papá",
    explicacion:
      "Antes de que otra persona haga la rutina sola, hay un paso intermedio: los dos juntos. Tú haces una ronda del juego de siempre; papá, la siguiente, con tus mismas palabras; tú otra vez. Él ve el mismo juego salir de dos caras, y su mirada empieza a ir también hacia la otra. En los estudios, lo que se aprendió con una persona no pasó solo a otra: hubo que hacerlo así, a propósito.",
    guion: "«Ahora mamá… ¡cosquillas!… Ahora papá… ¡cosquillas!»",
    actividad: {
      texto:
        "El juego que mejor le funciona contigo (cosquillas, «alto y ya», la canción). Papá se sienta a tu lado, a su altura. Tú haces una ronda completa con su pausa; papá hace la siguiente, calcada; tú otra. Cuatro o cinco rondas. Si él solo te mira a ti, no pasa nada: papá sigue haciendo su ronda igual.",
      duracion: "3–5 min",
      momentos: ["juego"],
      conPantalla: false,
    },
    conQuien: "otra-persona",
    queNoHacer:
      "No cambien el juego ni las palabras entre uno y otro: la gracia es que sea exactamente el mismo. Y no le pidan que mire a papá.",
    fuente: "Stokes, 1977, J Appl Behav Anal · Whalen, 2003, J Child Psychol Psychiatry",
  },
  {
    id: "le-lleva-el-juego-a-papa",
    dominio: "contacto-visual",
    tecnica: "misma-rutina-otra-persona",
    nivel: "n4",
    titulo: "Le lleva el juego a papá: arrancó él con otra persona",
    explicacion:
      "Cuando papá ya hace la rutina y él la acepta, queda el paso que de verdad muestra que la mirada es suya: que sea él quien la arranque con papá. Le trae las manos, le pone el carro en la mano, se le planta enfrente con cara de «¿y?». En los estudios, lo que el niño empieza solo con otra persona es lo que dura después de que la práctica termina; y no llega solo: hay que dejarle el hueco.",
    guion: "Para papá: «Si te trae las manos o el carro, ahí mismo arrancas, sin preguntarle nada.»",
    actividad: {
      texto:
        "Papá cerca, sin proponer nada, en un rato en que él ya jugó esa rutina contigo hoy. Si él le lleva las manos, el juguete, o se le planta enfrente, papá responde al instante con la rutina completa y su pausa de siempre. Si no pasa, papá hace una ronda normal y lo deja ahí: mañana otra vez. Tú miras desde lejos.",
      duracion: "3–5 min",
      momentos: ["juego", "transiciones"],
      conPantalla: false,
    },
    conQuien: "otra-persona",
    queNoHacer:
      "Papá no le pregunta «¿quieres jugar?» ni lo persigue con el juego: el hueco es de él. Y no lo mandes tú («ve donde papá»): si lo mandas, no arrancó él.",
    fuente: "Stokes, 1977, J Appl Behav Anal · Kasari, 2006, J Child Psychol Psychiatry",
  },
  {
    id: "las-mismas-cosquillas-con-papa",
    dominio: "contacto-visual",
    tecnica: "misma-rutina-otra-persona",
    nivel: "n5",
    titulo: "Las mismas cosquillas, ahora con papá",
    explicacion:
      "Lo que ya funciona contigo no pasa solo a otras personas: hay que llevarlo. La regla de oro es cambiar UNA sola cosa a la vez: la persona nueva hace exactamente el mismo juego, con las mismas palabras y la misma pausa que tú. Persona nueva o juego nuevo, nunca los dos juntos. Y sirve con papá, con la abuela, con el hermano, y después con alguien que conozca menos.",
    guion: "Para papá: «Igualito que yo: dos rondas, y en la tercera te detienes antes de lo mejor».",
    actividad: {
      texto:
        "Elige la rutina que mejor le funciona contigo. Hazla tú primero una vez, con papá al lado mirando. Luego papá la hace igual, con tus mismas palabras y tu misma pausa, mientras tú te quedas cerca. Si él busca tu cara en la pausa, no pasa nada: papá sigue. Cuando con papá ya salga la mayoría de las veces, la siguiente persona.",
      duracion: "5 min",
      momentos: ["juego", "dormir"],
      conPantalla: false,
    },
    conQuien: "otra-persona",
    queNoHacer:
      "No estrenes un juego nuevo con una persona nueva el mismo día: una sola cosa cambia a la vez.",
    fuente: "Stokes, 1977, J Appl Behav Anal · Kasari, 2015, J Consult Clin Psychol",
  },
  {
    id: "la-locion-despues-del-bano",
    dominio: "contacto-visual",
    tecnica: "misma-rutina-otra-persona",
    nivel: "n6",
    titulo: "La loción después del baño",
    explicacion:
      "El baño trae su propia rutina cara a cara: la loción. Frotas las manos, «¡frío, frío!», y antes de tocarle la barriga te detienes con las manos en el aire y la cara de espera. Es la pausa de siempre, en un momento del día que no se preparó: por eso vale como peldaño seis. Lo mismo sirve con la toalla al secarlo o con el agua al enjuagarlo.",
    guion: "«Loción… frío, frío… (manos en el aire, cara de espera)… ¡en la barriga!»",
    actividad: {
      texto:
        "Después del baño, con él de frente. Ponte loción en las manos y hazlo dos veces seguidas, con las mismas palabras. A la tercera, manos en el aire y pausa de tres segundos mirándolo. Cuando te mire, se ría o se acerque, sigues. Dos o tres rondas: la loción se acaba y la rutina también: «se acabó la loción».",
      duracion: "2–3 min",
      momentos: ["baño"],
      conPantalla: false,
    },
    conQuien: "mama",
    queNoHacer:
      "Si el baño ya es un momento tenso, no le agregues nada: ese día solo baño. Y no alargues la pausa con él mojado y con frío.",
    fuente: "Rogers, 2012, J Am Acad Child Adolesc Psychiatry · Halle, 1981, J Appl Behav Anal",
  },
];
