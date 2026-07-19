// Iconografía propia. Los emojis están PROHIBIDOS como iconos (anti-patrón del pipeline: es la
// firma del "look de IA con prisa" y además cada sistema operativo los dibuja distinto — para un
// niño con perfil neurodivergente, un icono que cambia de forma entre dispositivos es ruido).
//
// Estilo (design-system.md): trazo de 1.5, viewBox 24, `currentColor`, sin relleno.
// El globo es la excepción: no es un icono, es EL personaje — lleva la paleta del niño.

type IconoProps = {
  className?: string;
  style?: React.CSSProperties;
};

const trazo = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function IconoMicrofono({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="9" y="2" width="6" height="11" rx="3" {...trazo} />
      <path d="M5 10a7 7 0 0 0 14 0" {...trazo} />
      <path d="M12 17v4M9 21h6" {...trazo} />
    </svg>
  );
}

export function IconoMicrofonoApagado({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M9 5a3 3 0 0 1 6 0v4M15 12.5a3 3 0 0 1-4.6 2.1" {...trazo} />
      <path d="M5 10a7 7 0 0 0 10.5 6M19 10v1" {...trazo} />
      <path d="M12 17v4M9 21h6" {...trazo} />
      <path d="M4 3l16 18" {...trazo} />
    </svg>
  );
}

/** Ruido de la casa: ondas que llegan de todos lados. */
export function IconoRuido({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 8v8M8.5 6v12M5 9.5v5M15.5 6v12M19 9.5v5" {...trazo} />
    </svg>
  );
}

/** Silencio para calibrar: la onda se aplana. */
export function IconoSilencio({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3 12h4l2.5-4 2.5 8 2-4h7" {...trazo} />
    </svg>
  );
}

/** La cápsula del día, hecha. */
export function IconoHecho({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 12.5l5 5L20 6.5" {...trazo} />
    </svg>
  );
}

/** Cuando no hubo voz: un brote. Nada se perdió; mañana se sigue. */
export function IconoBrote({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 21v-8" {...trazo} />
      <path d="M12 14c0-3 2-5 5-5 0 3-2 5-5 5Z" {...trazo} />
      <path d="M12 16c0-3-2-5-5-5 0 3 2 5 5 5Z" {...trazo} />
    </svg>
  );
}

/** El rumbo — una brújula: hacia dónde van, sin puntajes. */
export function IconoBrujula({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" {...trazo} />
      <path d="M15.5 8.5l-2 5-5 2 2-5 5-2Z" {...trazo} />
    </svg>
  );
}

/** El objetivo de la semana — una diana: hacia qué apuntan juntos. */
export function IconoDiana({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" {...trazo} />
      <circle cx="12" cy="12" r="5" {...trazo} />
      <circle cx="12" cy="12" r="1.5" {...trazo} />
    </svg>
  );
}

/** Ajustes — el cuarto del padre (etapa, apodo, privacidad, borrar datos). */
export function IconoAjustes({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="3" {...trazo} />
      <path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"
        {...trazo}
      />
    </svg>
  );
}

/**
 * EL GLOBO — el personaje que la voz del niño mueve.
 * No es un icono: lleva color propio (paleta del niño) y por eso no usa `currentColor`.
 */
/** El globo acepta color y tamaño: en la celebración de la palabra vuela toda una bandada. */
export function Globo({
  className,
  style,
  relleno = "var(--color-kid-peach)",
}: IconoProps & { relleno?: string }) {
  return (
    <svg
      viewBox="0 0 64 96"
      className={className}
      style={style}
      role="img"
      aria-label="globo"
      focusable="false"
    >
      {/* Cuerda */}
      <path
        d="M32 66c-4 6 4 10 0 16s2 10 2 14"
        fill="none"
        stroke="var(--color-kid-ink)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      {/* Nudo */}
      <path d="M28 62h8l-4 5z" fill="var(--color-kid-ink)" opacity="0.55" />
      {/* Cuerpo */}
      <ellipse
        cx="32"
        cy="32"
        rx="25"
        ry="31"
        fill={relleno}
        stroke="var(--color-kid-ink)"
        strokeWidth="1.5"
      />
      {/* Brillo */}
      <ellipse cx="23" cy="21" rx="6" ry="9" fill="#FFFFFF" opacity="0.4" />
    </svg>
  );
}

/**
 * EL COHETE — el segundo personaje: sube cuando la voz del niño sube de tono.
 * Como el globo, no es un icono: lleva la paleta del niño.
 */
export function Cohete({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 64 96"
      className={className}
      role="img"
      aria-label="cohete"
      focusable="false"
    >
      {/* Llama (abajo: el cohete "mira" hacia arriba) */}
      <path
        d="M26 74c0 8 3 14 6 18 3-4 6-10 6-18z"
        fill="var(--color-kid-yellow)"
        stroke="var(--color-kid-ink)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Aletas */}
      <path
        d="M20 68c-6 2-8 6-8 10 5 0 9-2 12-5zM44 68c6 2 8 6 8 10-5 0-9-2-12-5z"
        fill="var(--color-kid-sage)"
        stroke="var(--color-kid-ink)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Cuerpo */}
      <path
        d="M32 6c9 9 13 22 13 36v28H19V42C19 28 23 15 32 6z"
        fill="var(--color-kid-peach)"
        stroke="var(--color-kid-ink)"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Ventana */}
      <circle
        cx="32"
        cy="36"
        r="8"
        fill="var(--color-kid-sky)"
        stroke="var(--color-kid-ink)"
        strokeWidth="1.5"
      />
      <path
        d="M28 32a5 5 0 0 1 4-2"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

/** Dos pictos gemelos: la puerta al juego de palabras gemelas (pares mínimos). */
export function IconoGemelas({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 32 24"
      className={className}
      role="img"
      aria-label="dos dibujos parecidos"
      focusable="false"
    >
      <rect x="2" y="4" width="13" height="16" rx="2.5" {...trazo} />
      <rect x="17" y="4" width="13" height="16" rx="2.5" {...trazo} />
      {/* Un dibujito distinto en cada marco: casi iguales, no idénticos (la gracia del par). */}
      <circle cx="8.5" cy="11" r="2.2" {...trazo} />
      <path d="M23.5 9v4M21.5 11h4" {...trazo} />
    </svg>
  );
}

/** Altavoz: tócalo para oír la palabra en la voz de la familia (voz grabada, banco local). */
export function IconoAltavoz({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 9v6h4l5 4V5L8 9H4Z" {...trazo} />
      <path d="M16 9a3.5 3.5 0 0 1 0 6M18.5 6.5a7 7 0 0 1 0 11" {...trazo} />
    </svg>
  );
}

/** Un pictograma (marco con dibujo): la puerta al juego de palabra↔objeto. */
export function IconoPictograma({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="dibujo con su palabra"
      focusable="false"
    >
      <rect x="3" y="3" width="18" height="14" rx="2.5" {...trazo} />
      {/* El "dibujo" de adentro: una colina y un sol. */}
      <path d="M6 14l3.5-4 3 3.4L15 11l3 3" {...trazo} />
      <circle cx="9" cy="7.5" r="1.4" {...trazo} />
      {/* La palabra escrita debajo (dos renglones): el picto siempre viene con su nombre. */}
      <path d="M6 20h12" {...trazo} />
    </svg>
  );
}
