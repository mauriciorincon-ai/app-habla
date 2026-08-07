// EL CONFETI DEL HITO (gate S4): cada logro MEDIDO merece verse — un estallido de confeti y
// serpentinas que cae una vez y se va mientras el juego sigue. Lo comparten el globo (cada
// vuelta, sobre la línea — ADR-012) y el cohete (cada subida-y-bajada, en el centro del cielo —
// ADR-013). El juego no se detiene.
//
// Misma familia que los globos de la palabra (fiesta, no discoteca): determinista (el azar no se
// puede testear), corre UNA vez (~1,6 s), sin bucle ni parpadeo. Con "reducir animaciones"
// (sistema o ajuste de la app) no se muestra (globals.css) y el contador "¡Ya dio N vueltas!"
// sigue contando el logro: la celebración jamás depende del movimiento.

/**
 * Estallido determinista: mismas piezas siempre. Nacen alrededor de la línea de vuelta (88 % del
 * ancho), saltan hacia arriba y llueven hacia la izquierda — hacia el cielo que el globo acaba
 * de recorrer. Las serpentinas son las piezas alargadas; el resto, confeti cuadrado.
 */
const PIEZAS = [
  {
    izquierda: 86,
    arriba: 26,
    deriva: -118,
    subida: -64,
    caida: 168,
    giro: -460,
    vuelo: 1750,
    espera: 0,
    serpentina: false,
  },
  {
    izquierda: 89,
    arriba: 22,
    deriva: -34,
    subida: -78,
    caida: 196,
    giro: 320,
    vuelo: 1900,
    espera: 60,
    serpentina: true,
  },
  {
    izquierda: 84,
    arriba: 30,
    deriva: -86,
    subida: -46,
    caida: 150,
    giro: 280,
    vuelo: 1500,
    espera: 120,
    serpentina: false,
  },
  {
    izquierda: 91,
    arriba: 28,
    deriva: 22,
    subida: -58,
    caida: 176,
    giro: -300,
    vuelo: 1650,
    espera: 30,
    serpentina: false,
  },
  {
    izquierda: 87,
    arriba: 18,
    deriva: -142,
    subida: -38,
    caida: 188,
    giro: 520,
    vuelo: 1850,
    espera: 90,
    serpentina: true,
  },
  {
    izquierda: 85,
    arriba: 24,
    deriva: -60,
    subida: -84,
    caida: 204,
    giro: -380,
    vuelo: 1950,
    espera: 0,
    serpentina: false,
  },
  {
    izquierda: 90,
    arriba: 32,
    deriva: -12,
    subida: -50,
    caida: 142,
    giro: 240,
    vuelo: 1450,
    espera: 150,
    serpentina: false,
  },
  {
    izquierda: 83,
    arriba: 20,
    deriva: -104,
    subida: -70,
    caida: 182,
    giro: -520,
    vuelo: 1800,
    espera: 45,
    serpentina: true,
  },
  {
    izquierda: 88,
    arriba: 34,
    deriva: -74,
    subida: -32,
    caida: 158,
    giro: 400,
    vuelo: 1550,
    espera: 105,
    serpentina: false,
  },
  {
    izquierda: 92,
    arriba: 24,
    deriva: 34,
    subida: -66,
    caida: 172,
    giro: -260,
    vuelo: 1700,
    espera: 75,
    serpentina: false,
  },
  {
    izquierda: 86,
    arriba: 36,
    deriva: -130,
    subida: -54,
    caida: 146,
    giro: 360,
    vuelo: 1600,
    espera: 135,
    serpentina: false,
  },
  {
    izquierda: 89,
    arriba: 16,
    deriva: -48,
    subida: -90,
    caida: 210,
    giro: -440,
    vuelo: 2000,
    espera: 15,
    serpentina: true,
  },
  {
    izquierda: 84,
    arriba: 28,
    deriva: -94,
    subida: -42,
    caida: 164,
    giro: 300,
    vuelo: 1500,
    espera: 165,
    serpentina: false,
  },
  {
    izquierda: 91,
    arriba: 20,
    deriva: 12,
    subida: -74,
    caida: 190,
    giro: -340,
    vuelo: 1750,
    espera: 55,
    serpentina: false,
  },
] as const;

const COLORES = [
  "var(--color-fiesta-coral)",
  "var(--color-fiesta-verde)",
  "var(--color-fiesta-cielo)",
  "var(--color-fiesta-sol)",
  "var(--color-fiesta-uva)",
];

type Props = {
  /** true = el estallido nace en el CENTRO del cielo (el cohete); false = sobre la línea de
   * vuelta del globo (88 % del ancho). Determinista en ambos casos. */
  centrado?: boolean;
};

export function ConfetiVuelta({ centrado = false }: Props) {
  const corrimiento = centrado ? -38 : 0;
  return (
    <div
      className="confeti-vuelta pointer-events-none absolute inset-0 z-10"
      aria-hidden="true"
      data-testid="confeti-vuelta"
    >
      {PIEZAS.map((pieza, i) => (
        <span
          key={`${pieza.izquierda}-${pieza.arriba}`}
          className={`confeti-pieza absolute ${
            pieza.serpentina
              ? "h-7 w-1.5 rounded-full"
              : "h-2.5 w-2.5 rounded-[2px]"
          }`}
          style={
            {
              left: `${pieza.izquierda + corrimiento}%`,
              top: `${pieza.arriba}%`,
              backgroundColor: COLORES[i % COLORES.length],
              "--deriva": `${pieza.deriva}px`,
              "--subida": `${pieza.subida}px`,
              "--caida": `${pieza.caida}px`,
              "--giro": `${pieza.giro}deg`,
              "--vuelo": `${pieza.vuelo}ms`,
              "--espera": `${pieza.espera}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
