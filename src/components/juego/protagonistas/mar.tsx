// Protagonista «mar» (S14, ADR-026): dibujo propio, colores del niño (tokens), forma distinta por tema.
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
        d="M6 34c6-14 22-16 34-6l12-8v24l-12-8c-12 10-28 8-34-2Z"
        className="fill-kid-sky stroke-kid-ink"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="32" r="2" className="fill-kid-ink" />
      <path
        d="M26 28c2 4 2 8 0 12"
        fill="none"
        className="stroke-kid-ink"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M10 52q5-4 10 0t10 0 10 0 10 0"
        fill="none"
        className="stroke-kid-ink"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
