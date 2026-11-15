// Protagonista «animales» (S14, ADR-026): dibujo propio, colores del niño (tokens), forma distinta por tema.
// Decorado de la escena: jamás cambia lo que se mide. Se carga solo cuando es SU tema (import dinámico).

export default function Dibujo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <ellipse
        cx="32"
        cy="40"
        rx="18"
        ry="15"
        className="fill-kid-peach stroke-kid-ink"
        strokeWidth="2"
      />
      <circle
        cx="32"
        cy="26"
        r="13"
        className="fill-kid-peach stroke-kid-ink"
        strokeWidth="2"
      />
      <path
        d="M21 18 17 6l12 7ZM43 18l4-12-12 7Z"
        className="fill-kid-peach stroke-kid-ink"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="27" cy="25" r="1.8" className="fill-kid-ink" />
      <circle cx="37" cy="25" r="1.8" className="fill-kid-ink" />
      <path
        d="M29 31q3 3 6 0"
        fill="none"
        className="stroke-kid-ink"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
