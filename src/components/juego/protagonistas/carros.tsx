// Protagonista «carros» (S14, ADR-026): dibujo propio, colores del niño (tokens), forma distinta por tema.
// Decorado de la escena: jamás cambia lo que se mide. Se carga solo cuando es SU tema (import dinámico).

export default function Dibujo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="6"
        y="28"
        width="52"
        height="18"
        rx="6"
        className="fill-kid-sky stroke-kid-ink"
        strokeWidth="2"
      />
      <path
        d="M16 28l7-12h18l8 12Z"
        className="fill-kid-yellow stroke-kid-ink"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="19" cy="48" r="7" className="fill-kid-ink" />
      <circle cx="45" cy="48" r="7" className="fill-kid-ink" />
      <circle cx="19" cy="48" r="2.5" className="fill-kid-bg" />
      <circle cx="45" cy="48" r="2.5" className="fill-kid-bg" />
    </svg>
  );
}
