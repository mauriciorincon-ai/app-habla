// Protagonista «dinosaurios» (S14, ADR-026): dibujo propio, colores del niño (tokens), forma distinta por tema.
// Decorado de la escena: jamás cambia lo que se mide. Se carga solo cuando es SU tema (import dinámico).

export default function Dibujo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 44c0-12 8-18 18-18 4-8 14-10 22-4l8-2-4 8c4 8 0 18-8 18H14Z"
        className="fill-kid-sage stroke-kid-ink"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M20 26l3-8 4 7 5-9 4 9 5-5"
        fill="none"
        className="stroke-kid-ink"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="45" cy="28" r="1.8" className="fill-kid-ink" />
      <rect
        x="22"
        y="44"
        width="6"
        height="10"
        rx="2"
        className="fill-kid-sage stroke-kid-ink"
        strokeWidth="2"
      />
      <rect
        x="38"
        y="44"
        width="6"
        height="10"
        rx="2"
        className="fill-kid-sage stroke-kid-ink"
        strokeWidth="2"
      />
    </svg>
  );
}
