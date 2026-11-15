import type { Catalogo } from "../index";

// «Soplar» y «Fuerte y suave» (S12, ADR-024), y el aviso del tope diario. Cada texto nace {es, en},
// redactado en cada idioma. Los juegos no exigen palabras (regla 7) y la celebración solo afirma lo
// medido: cuántos soplos, cuántos cambios — jamás un volumen «correcto» ni un «muy bien» suelto.

export const soplar = {
  tituloPestana: { es: "Soplar · Hablemos San", en: "Blowing · Hablemos San" },
  titulo: { es: "Soplar", en: "Blowing" },
  intro: {
    antes: { es: "Un juego de aire, sin palabras: el niño", en: "A game of air, no words: your child" },
    enfasis: { es: "sopla", en: "blows" },
    despues: {
      es: " como al apagar una vela o mover una pluma, y cada soplo hace girar el molino. La app cuenta los soplos que oyó; no pide ningún sonido de voz.",
      en: " as if blowing out a candle or moving a feather, and every blow turns the pinwheel. The app counts the blows it heard; it asks for no voice sound.",
    },
  },
  etiqueta: { es: "Soplar", en: "Blowing" },
  guion: {
    es: "“Toma aire y sopla despacito, como a una vela: fuuuu… ¡Mira cómo gira el molino!”",
    en: "“Take a breath and blow gently, like at a candle: fooo… Look how the pinwheel spins!”",
  },
  nota: {
    es: "Hágalo usted primero, con los labios en «o» chiquita y el aire largo. Un soplo suave cuenta igual que uno fuerte. Si en vez de soplar hace un sonido de voz, el molino no cuenta ese rato: sigan jugando, sin prisa. Si hoy solo quiere mirar, también está bien.",
    en: "Go first, with your lips in a small “o” and a long breath. A soft blow counts the same as a strong one. If they make a voice sound instead of blowing, the pinwheel doesn't count that moment: keep playing, no rush. If they'd rather just watch today, that's fine too.",
  },
  invitacion: { es: "Sopla, fuuuu…", en: "Blow, fooo…" },
  soplando: { es: "El molino gira…", en: "The pinwheel is spinning…" },
  molinoEtiqueta: { es: "Molino que gira con cada soplo", en: "Pinwheel that spins with every blow" },
  conteoAntes: { es: "Soplos que oí:", en: "Blows I heard:" },
  soplo: { es: "{n} soplo", en: "{n} blow" },
  soplos: { es: "{n} soplos", en: "{n} blows" },
  oir: { es: "Oír la invitación", en: "Hear the invitation" },
  celebracion: {
    antes: { es: "¡Sopló", en: "They blew" },
    uno: { es: "{n} vez", en: "{n} time" },
    varios: { es: "{n} veces", en: "{n} times" },
    cuerpo: {
      es: "Eso es lo que el medidor oyó: aire sin voz. Si fue un soplo bonito o uno fuerte, eso lo ves tú; la app solo cuenta.",
      en: "That is what the meter heard: air without voice. Whether it was a gentle blow or a strong one is for you to see; the app only counts.",
    },
    sinSoplo: { es: "Hoy el molino se quedó esperando", en: "Today the pinwheel stayed waiting" },
  },
} satisfies Catalogo;

export const fuerteSuave = {
  tituloPestana: { es: "Fuerte y suave · Hablemos San", en: "Loud and soft · Hablemos San" },
  titulo: { es: "Fuerte y suave", en: "Loud and soft" },
  intro: {
    antes: { es: "Un juego de volumen, sin palabras: la voz del niño pasa de", en: "A game of volume, no words: your child's voice goes from" },
    enfasis: { es: "suave a fuerte", en: "soft to loud" },
    despues: {
      es: " y de vuelta. No hay un volumen «correcto»: la app celebra cada vez que cambia. Sirve cualquier sonido de voz — aaaa, un animal, una risa.",
      en: " and back again. There is no “right” volume: the app celebrates every time it changes. Any voice sound works — ahhh, an animal, a laugh.",
    },
  },
  etiqueta: { es: "Fuerte y suave", en: "Loud and soft" },
  guion: {
    es: "“Hagamos la voz chiquita, aaa… y ahora grandota, AAA. ¡Chiquita… y grandota!”",
    en: "“Let's make a tiny voice, ahh… and now a big one, AHH. Tiny… and big!”",
  },
  nota: {
    es: "Hágalo usted primero y exagere el contraste con el cuerpo: manos juntas para la voz suave, brazos abiertos para la fuerte. El juego mide contra el ruido de este cuarto, no contra un volumen ideal; lo que cuenta es el cambio. Nunca le pida más fuerte de lo cómodo.",
    en: "Go first and exaggerate the contrast with your body: hands together for the soft voice, arms wide for the loud one. The game measures against this room's noise, not against an ideal volume; what counts is the change. Never ask for louder than is comfortable.",
  },
  invitacion: { es: "Voz chiquita… voz grandota…", en: "Tiny voice… big voice…" },
  escuchando: { es: "La barra escucha…", en: "The bar is listening…" },
  barraEtiqueta: { es: "Barra del volumen de la voz", en: "Bar showing the voice's volume" },
  suave: { es: "suave", en: "soft" },
  fuerte: { es: "fuerte", en: "loud" },
  silencio: { es: "en silencio", en: "quiet" },
  conteoAntes: { es: "Cambios entre suave y fuerte:", en: "Changes between soft and loud:" },
  cambio: { es: "{n} cambio", en: "{n} change" },
  cambios: { es: "{n} cambios", en: "{n} changes" },
  oir: { es: "Oír la invitación", en: "Hear the invitation" },
  celebracion: {
    antes: { es: "¡Su voz cambió", en: "Their voice changed" },
    uno: { es: "{n} vez", en: "{n} time" },
    varios: { es: "{n} veces", en: "{n} times" },
    despues: { es: "entre suave y fuerte!", en: "between soft and loud!" },
    cuerpo: {
      es: "Eso es lo que el medidor oyó, contra el ruido de su cuarto. Ningún volumen es el correcto; la app solo cuenta los cambios.",
      en: "That is what the meter heard, against the noise in your room. No volume is the right one; the app only counts the changes.",
    },
    sinCambios: { es: "Hoy la barra se quedó esperando", en: "Today the bar stayed waiting" },
  },
} satisfies Catalogo;

// El tope diario de juego (ADR-024): un aviso al adulto, jamás al niño, y jamás un bloqueo.
export const tope = {
  aviso: {
    titulo: { es: "Ya jugaron lo que habían pensado hoy", en: "You've played as much as you planned today" },
    cuerpo: {
      es: "Llevan {n} min de juego en este dispositivo hoy. Cerré el juego con calma, como si hubieran tocado «Salir». Pueden seguir si quieren: no vuelvo a cortarlo hoy. Es su decisión, y usted conoce mejor que nadie cómo está hoy el niño.",
      en: "You've played {n} min on this device today. I closed the game calmly, as if you had tapped “Exit”. You can keep going if you like: I won't cut it again today. It's your call, and you know best how your child is today.",
    },
  },
  hoy: {
    es: "Hoy ya jugaron {n} min. Pueden seguir cuando quieran.",
    en: "You've played {n} min today. You can keep going whenever you like.",
  },
  ajustes: {
    titulo: { es: "Sesiones cortas", en: "Short sessions" },
    cuerpo: {
      es: "Los juegos de voz cuentan los minutos de juego de hoy en este dispositivo. Al llegar al tope le aviso a usted una vez al día y el juego se cierra con calma, como «Salir». Nunca bloquea nada: si quieren seguir, siguen. El contador es local, de hoy, y no viaja al archivo de la otra casa.",
      en: "Voice games count today's minutes of play on this device. When the cap is reached I tell you once a day and the game closes calmly, like “Exit”. It never blocks anything: if you want to keep going, you do. The counter is local, for today, and does not travel in the other-home file.",
    },
    etiqueta: { es: "Tope de juego por día", en: "Daily play cap" },
    opcion: { es: "{n} minutos", en: "{n} minutes" },
  },
} satisfies Catalogo;
