// Protagonista «musica» (S14, ADR-026): dibujo propio, colores del niño (tokens), forma distinta por tema.
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
        d="M24 46V14l26-6v32"
        fill="none"
        className="stroke-kid-ink"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <ellipse
        cx="18"
        cy="47"
        rx="8"
        ry="6"
        className="fill-kid-peach stroke-kid-ink"
        strokeWidth="2"
      />
      <ellipse
        cx="44"
        cy="41"
        rx="8"
        ry="6"
        className="fill-kid-peach stroke-kid-ink"
        strokeWidth="2"
      />
      <path
        d="M24 22l26-6"
        className="stroke-kid-ink"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
