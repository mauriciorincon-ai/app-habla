// Dibujo de cada vocal del mapa (S10): letra + forma + color. El color nunca va solo (regla 5): la
// forma y la letra dicen la vocal aunque no se distingan los colores. Sin estado ni efectos.

import type { Vocal } from "@/lib/voice/vocales";

const COLOR: Record<Vocal, string> = {
  a: "var(--color-fiesta-coral)",
  e: "var(--color-fiesta-sol)",
  i: "var(--color-fiesta-cielo)",
  o: "var(--color-fiesta-verde)",
  u: "var(--color-fiesta-uva)",
};

const RECORTE: Record<Vocal, string | undefined> = {
  a: undefined,
  e: "polygon(50% 4%, 97% 94%, 3% 94%)",
  i: "polygon(50% 0, 100% 50%, 50% 100%, 0 50%)",
  o: undefined,
  u: "polygon(50% 0, 62% 35%, 98% 38%, 69% 59%, 79% 95%, 50% 74%, 21% 95%, 31% 59%, 2% 38%, 38% 35%)",
};

const REDONDEO: Record<Vocal, string> = {
  a: "9999px",
  e: "0",
  i: "0",
  o: "16%",
  u: "0",
};

export function FormaVocal({
  vocal,
  letra,
  className = "size-20",
  encendida = false,
}: {
  vocal: Vocal;
  letra: string;
  className?: string;
  encendida?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex items-center justify-center font-bold ${className}`}
      style={{
        backgroundColor: COLOR[vocal],
        color: "var(--color-ink-900)",
        clipPath: RECORTE[vocal],
        borderRadius: REDONDEO[vocal],
        transform: encendida ? "scale(1.15)" : "scale(1)",
        opacity: encendida ? 1 : 0.8,
        transition: "transform 200ms, opacity 200ms",
        paddingTop: vocal === "e" ? "22%" : undefined,
      }}
    >
      <span className="text-3xl leading-none">{letra}</span>
    </span>
  );
}
