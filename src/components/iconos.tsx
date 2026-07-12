// Iconografía propia. Los emojis están PROHIBIDOS como iconos (anti-patrón del pipeline: es la
// firma del "look de IA con prisa" y además cada sistema operativo los dibuja distinto — para un
// niño con perfil neurodivergente, un icono que cambia de forma entre dispositivos es ruido).
//
// Estilo (design-system.md): trazo de 1.5, viewBox 24, `currentColor`, sin relleno.
// El globo es la excepción: no es un icono, es EL personaje — lleva la paleta del niño.

type IconoProps = {
  className?: string;
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

/**
 * EL GLOBO — el personaje que la voz del niño mueve.
 * No es un icono: lleva color propio (paleta del niño) y por eso no usa `currentColor`.
 */
export function Globo({ className }: IconoProps) {
  return (
    <svg
      viewBox="0 0 64 96"
      className={className}
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
        fill="var(--color-kid-peach)"
        stroke="var(--color-kid-ink)"
        strokeWidth="1.5"
      />
      {/* Brillo */}
      <ellipse cx="23" cy="21" rx="6" ry="9" fill="#FFFFFF" opacity="0.4" />
    </svg>
  );
}
