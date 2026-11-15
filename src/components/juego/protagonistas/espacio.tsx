// Protagonista «espacio» (S14, ADR-026): dibujo propio, colores del niño (tokens), forma distinta por tema.
// Decorado de la escena: jamás cambia lo que se mide. Se carga solo cuando es SU tema (import dinámico).

export default function Dibujo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="32"
        cy="32"
        r="13"
        className="fill-kid-yellow stroke-kid-ink"
        strokeWidth="2"
      />
      <ellipse
        cx="32"
        cy="32"
        rx="26"
        ry="7"
        transform="rotate(-20 32 32)"
        fill="none"
        className="stroke-kid-ink"
        strokeWidth="2.5"
      />
      <path
        d="M52 12l1.5 4 4 1.5-4 1.5L52 23l-1.5-4-4-1.5 4-1.5Z"
        className="fill-kid-sky stroke-kid-ink"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}
