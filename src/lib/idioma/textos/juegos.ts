import type { Catalogo } from "../index";

// Los juegos de voz: lo que comparten (marco, guion, calibración, celebración) y lo propio del globo
// y del cohete. «Palabra y dibujo» y «gemelas» se juegan con palabras en español (regla dura 7 y 20):
// en inglés muestran una tarjeta honesta y no montan el juego, así que su cuerpo no está aquí.
export const juegos = {
  comun: {
    salir: { es: "Salir", en: "Exit" },
    modoCalma: { es: "Modo calma", en: "Calm mode" },
    modoCalmaActivado: { es: "Modo calma activado", en: "Calm mode on" },
    yaJugamos: { es: "Ya jugamos", en: "We're done playing" },
    volverAMedir: { es: "Volver a medir el ruido", en: "Measure the noise again" },
    elegirOtroJuego: { es: "Elegir otro juego", en: "Pick another game" },
    otraVez: { es: "Otra vez", en: "Again" },
  },
  marco: {
    pidiendoMic: {
      titulo: { es: "Necesito escuchar su voz", en: "I need to listen to their voice" },
      antes: {
        es: "El navegador va a preguntar si puede usar el micrófono. El sonido se analiza aquí mismo, en este dispositivo, para saber si hay voz y cómo suena.",
        en: "Your browser will ask if it can use the microphone. The sound is analyzed right here, on this device, to tell whether there is a voice and how it sounds.",
      },
      enfasis: {
        es: "No se graba nada, no se guarda nada y nada sale de aquí.",
        en: "Nothing is recorded, nothing is saved and nothing leaves this device.",
      },
    },
    micDenegado: {
      titulo: { es: "No pude abrir el micrófono", en: "I couldn't open the microphone" },
      intro: {
        es: "Sin micrófono, este juego no puede escuchar su voz. Para habilitarlo:",
        en: "Without the microphone, this game can't listen to their voice. To turn it on:",
      },
      paso1: {
        es: "Toca el candado (o el ícono de la izquierda) en la barra de direcciones.",
        en: "Tap the padlock (or the icon on the left) in the address bar.",
      },
      paso2: {
        es: "Busca “Micrófono” y elige “Permitir”.",
        en: "Find “Microphone” and choose “Allow”.",
      },
      paso3: {
        es: "Vuelve aquí y toca “Intentar de nuevo”.",
        en: "Come back here and tap “Try again”.",
      },
      sinMic: {
        es: "Si prefieres no dar el micrófono, no pasa nada: la actividad de hoy también se puede hacer sin pantalla.",
        en: "If you'd rather not allow the microphone, that's fine: today's activity can also be done without a screen.",
      },
      reintentar: { es: "Intentar de nuevo", en: "Try again" },
      volverAHoy: { es: "Volver a Hoy", en: "Back to Today" },
    },
    ruidoAlto: {
      titulo: { es: "Hay bastante ruido por ahí", en: "It's quite noisy in there" },
      cuerpo: {
        es: "Con este ruido de fondo me cuesta distinguir su voz. Si pueden, apaguen la tele o acérquense un poco al dispositivo. Igual podemos jugar así: solo tendrá que hablar más fuerte.",
        en: "With this background noise it's hard for me to pick out their voice. If you can, turn off the TV or move a little closer to the device. We can still play like this: they'll just need a louder voice.",
      },
      volverAMedir: { es: "Volver a medir", en: "Measure again" },
      jugarAsi: { es: "Jugar así", en: "Play anyway" },
    },
  },
  calibracion: {
    titulo: { es: "Shhh… un momentico de silencio", en: "Shhh… a quiet moment" },
    cuerpo: {
      es: "Estoy escuchando cómo suena su casa (el ventilador, la tele, la calle) para no confundir ese ruido con su voz. Dos segundos y ya.",
      en: "I'm listening to how your home sounds (the fan, the TV, the street) so I don't mistake that noise for their voice. Two seconds and we're done.",
    },
  },
  guion: {
    volverAJuegos: { es: "← Juegos", en: "← Games" },
    antesDeJugar: { es: "Antes de jugar", en: "Before playing" },
    tuLinea: { es: "Tu línea de hoy", en: "Your line for today" },
    listos: { es: "Estamos listos", en: "We're ready" },
  },
  globo: {
    tituloPestana: { es: "El globo de la voz · Hablemos San", en: "The voice balloon · Hablemos San" },
    titulo: { es: "Su voz mueve el mundo", en: "Their voice moves the world" },
    intro: {
      es: "Siéntese al lado de su hijo: usted dirige el juego. Le vamos a mostrar la línea que puede decirle, después medimos el ruido de la casa y entonces el globo empieza a volar mientras él sostiene la voz. Nada de lo que él diga se graba ni sale de este dispositivo.",
      en: "Sit next to your child: you lead the game. We'll show you a line you can say to them, then we'll measure the noise in your home, and then the balloon starts to float while they hold their voice. Nothing they say is recorded or leaves this device.",
    },
    nota: {
      es: "Muéstrale cómo suena tú primero. Si hoy prefiere solo mirar, también está bien.",
      en: "Show them how it sounds first. If they'd rather just watch today, that's fine too.",
    },
    volando: { es: "¡El globo está volando!", en: "The balloon is flying!" },
    invitacion: { es: "Haz sonar tu voz: aaaaah", en: "Make your voice sound: aaaaah" },
    vueltaYa: { es: "¡Ya dio", en: "It has gone around" },
    vuelta: { es: "{n} vuelta", en: "{n} time" },
    vueltas: { es: "{n} vueltas", en: "{n} times" },
    oir: { es: "Oír “Haz sonar tu voz: aaaaah”", en: "Hear “Make your voice sound: aaaaah”" },
    marcarHecho: { es: "Marcar el día como hecho", en: "Mark the day as done" },
    espera: {
      antes: { es: "El globo espera tu voz… ¿le hacemos", en: "The balloon is waiting for your voice… shall we do" },
      despues: { es: "juntos?", en: "together?" },
    },
  },
  cohete: {
    tituloPestana: { es: "El cohete del tono · Hablemos San", en: "The pitch rocket · Hablemos San" },
    titulo: { es: "Su voz sube el cohete", en: "Their voice lifts the rocket" },
    intro: {
      antes: { es: "Este juego escucha el", en: "This game listens to the" },
      enfasis: { es: "tono", en: "pitch" },
      despues: {
        es: "de su voz: cuando sube, el cohete sube; cuando baja, baja. No hay que decir ninguna palabra — una vocal estirada como una sirena es justo lo que buscamos. Hágalo usted primero, exagerado. Nada de lo que él diga se graba ni sale de este dispositivo.",
        en: "of their voice: when it goes up, the rocket goes up; when it goes down, it comes down. No words needed — a stretched-out vowel, like a siren, is exactly what we're after. You go first, nice and exaggerated. Nothing they say is recorded or leaves this device.",
      },
    },
    etiqueta: { es: "El cohete del tono", en: "The pitch rocket" },
    guion: {
      es: "“Haz la voz como una sirena: aaaAAAaaa… ¡mira cómo sube el cohete!”",
      en: "“Make your voice like a siren: aaaAAAaaa… look how the rocket goes up!”",
    },
    nota: {
      es: "Hazlo tú primero, exagerado y riéndote: sube la voz y bájala. El cohete responde al TONO, no a las palabras — cualquier sonido estirado sirve. Si hoy solo quiere mirar, también está bien.",
      en: "Go first, exaggerated and laughing: raise your voice and lower it. The rocket responds to PITCH, not words — any stretched-out sound works. If they'd rather just watch today, that's fine too.",
    },
    volando: { es: "¡El cohete está volando!", en: "The rocket is flying!" },
    invitacion: { es: "Haz la voz de sirena: aaaAAAaaa", en: "Make a siren voice: aaaAAAaaa" },
    subioYBajo: { es: "¡Ya subió y bajó", en: "It has gone up and down" },
    vez: { es: "{n} vez", en: "{n} time" },
    veces: { es: "{n} veces", en: "{n} times" },
    oir: { es: "Oír “Haz la voz de sirena: aaaAAAaaa”", en: "Hear “Make a siren voice: aaaAAAaaa”" },
    espera: {
      antes: { es: "El cohete espera tu voz… ¿hacemos", en: "The rocket is waiting for your voice… shall we do" },
      despues: { es: "juntos?", en: "together?" },
    },
  },
  // En inglés estos dos juegos practican palabras en español: una tarjeta honesta en su lugar.
  soloEspanol: {
    titulo: { es: "Juegos de palabras", en: "Word games" },
    mensaje: {
      es: "Los juegos de palabras practican palabras en español. El globo y el cohete funcionan en cualquier idioma.",
      en: "Word games practise Spanish words. The balloon and rocket games work in any language.",
    },
    volver: { es: "← Jugar", en: "← Play" },
  },
  celebracion: {
    segundos: { es: "{n} segundos", en: "{n} seconds" },
    globo: {
      sono: { es: "¡Su voz sonó", en: "Their voice sounded for" },
      vueltasAntes: { es: "Con esa voz el globo dio", en: "With that voice the balloon went around" },
      vuelta: { es: "{n} vuelta completa", en: "{n} full turn" },
      vueltas: { es: "{n} vueltas completas", en: "{n} full turns" },
      rachaAntes: { es: "Y la vez más larga la sostuvo", en: "And the longest stretch, they held it for" },
      rachaDespues: { es: "seguidos, sin cortarse.", en: "in a row, without breaking." },
      medidor: {
        es: "Eso es lo que el medidor escuchó: hubo voz y duró ese tiempo. Si además dijo la palabra, el que lo sabe eres tú — celébraselo con tus propias palabras.",
        en: "That is what the meter heard: there was voice, and it lasted that long. If they also said a word, you're the one who knows — celebrate it in your own words.",
      },
    },
    cohete: {
      antes: { es: "¡Tu voz subió y bajó", en: "Your voice went up and down" },
      vez: { es: "{n} vez", en: "{n} time" },
      veces: { es: "{n} veces", en: "{n} times" },
      cuerpo: {
        es: "Eso es lo que el medidor escuchó: el tono de su voz cambió de dirección esas veces. Jugar con la voz —subirla, bajarla, estirarla— es exactamente lo que queríamos.",
        en: "That is what the meter heard: the pitch of their voice changed direction that many times. Playing with the voice — raising it, lowering it, stretching it — is exactly what we wanted.",
      },
    },
    dibujos: {
      antes: { es: "¡Encendió", en: "They lit up" },
      uno: { es: "{n} dibujo", en: "{n} picture" },
      varios: { es: "{n} dibujos", en: "{n} pictures" },
      despues: { es: "con su voz!", en: "with their voice!" },
      cuerpo: {
        es: "Eso es lo que el medidor escuchó: su voz sonó y encendió esos dibujos. Si dijo la palabra o se acercó a ella, el que lo sabe eres tú — la app no juzga eso, y no va a fingir que sí.",
        en: "That is what the meter heard: their voice sounded and lit up those pictures. If they said the word or came close to it, you're the one who knows — the app doesn't judge that, and won't pretend to.",
      },
      oiste: { es: "Y tú oíste", en: "And you heard" },
      palabra: { es: "1 palabra", en: "1 word" },
      palabras: { es: "{n} palabras", en: "{n} words" },
      oisteFin: {
        es: ". Eso lo sabes tú, que estabas ahí — celébraselo con tus propias palabras.",
        en: ". You're the one who knows, you were there — celebrate it in your own words.",
      },
    },
    gemelas: {
      antes: { es: "¡Jugaron", en: "You played" },
      una: { es: "{n} ronda", en: "{n} round" },
      varias: { es: "{n} rondas", en: "{n} rounds" },
      despues: { es: "de gemelas!", en: "of twin words!" },
      marcasteAntes: { es: "Tú marcaste lo que oíste en", en: "You marked what you heard in" },
      marcasteDespues: {
        es: ". Eso lo sabes tú, que estabas ahí — la app no juzga qué palabra dijo, y no va a fingir que sí.",
        en: ". You're the one who knows, you were there — the app doesn't judge which word they said, and won't pretend to.",
      },
      sinMarcas: {
        es: "Estar juntos frente al juego ya cuenta. Cuando quiera intentar una palabra, tú marcas la que oigas — sin apuros.",
        en: "Being together at the game already counts. When they want to try a word, you mark the one you hear — no rush.",
      },
    },
    sinVoz: {
      cohete: { es: "Hoy el cohete casi no despegó", en: "Today the rocket hardly took off" },
      dibujos: { es: "Hoy los dibujos se quedaron esperando", en: "Today the pictures stayed waiting" },
      globo: { es: "Hoy el globo casi no voló", en: "Today the balloon hardly flew" },
      cuerpo: {
        es: "El micrófono no alcanzó a escuchar su voz. No pasa nada y no se perdió nada: estar juntos frente al juego ya cuenta. Mañana lo intentamos otra vez.",
        en: "The microphone couldn't pick up their voice. That's okay, and nothing was lost: being together at the game already counts. We'll try again tomorrow.",
      },
    },
  },
} satisfies Catalogo;
