"use client";

// CELEBRACIÓN HONESTA (mecánica ⭐⭐ del brief).
//
// La app SOLO afirma lo que su medidor midió de verdad: que hubo voz y cuánto duró. No dice
// "¡muy bien!" pase lo que pase (ese es el error de la competencia: felicitar aunque el niño no
// haya dicho nada). Si no hubo voz, lo dice sin drama y sin culpa — y nadie perdió nada.
//
// Quien juzga si la PALABRA estuvo bien es el padre, nunca la app.

import { Globo, IconoBrote } from "@/components/iconos";

type Props = {
  sostenidoMs: number;
  onOtraVez: () => void;
  onTerminar: () => void;
  etiquetaTerminar: string;
};

function segundos(ms: number): string {
  const s = ms / 1000;
  return s >= 10 ? s.toFixed(0) : s.toFixed(1).replace(".", ",");
}

export function CelebracionHonesta({
  sostenidoMs,
  onOtraVez,
  onTerminar,
  etiquetaTerminar,
}: Props) {
  const huboVoz = sostenidoMs >= 300;

  return (
    <section
      className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 text-center"
      data-testid="celebracion"
      aria-live="polite"
    >
      {huboVoz ? (
        <>
          <Globo className="h-24 w-16" />
          <h2 className="font-display text-4xl">
            ¡La sostuviste{" "}
            {/* La métrica va en sans con cifras tabulares, no en mono: la coma decimal
                monoespaciada se lee como "3 , 1". Mono queda para etiquetas y datos en bloque. */}
            <span
              className="text-celebracion-fuerte font-sans font-semibold tabular-nums"
              data-testid="metrica-real"
            >
              {segundos(sostenidoMs)} segundos
            </span>
            !
          </h2>
          <p className="text-tinta-suave">
            Eso es lo que el medidor escuchó: hubo voz y duró ese tiempo. Si
            además dijo la palabra, el que lo sabe eres tú — celébraselo con tus
            propias palabras.
          </p>
        </>
      ) : (
        <>
          <IconoBrote className="text-acento h-16 w-16" />
          <h2 className="font-display text-3xl">Hoy el globo casi no voló</h2>
          <p className="text-tinta-suave">
            El micrófono no alcanzó a escuchar voz sostenida. No pasa nada y no
            se perdió nada: estar juntos frente al juego ya cuenta. Mañana lo
            intentamos otra vez.
          </p>
        </>
      )}

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onOtraVez}
          className="bg-acento text-sobre-acento min-h-16 flex-1 rounded-2xl px-6 text-lg font-medium"
          data-testid="otra-vez"
        >
          Otra vez
        </button>
        <button
          type="button"
          onClick={onTerminar}
          className="border-borde text-tinta min-h-16 flex-1 rounded-2xl border px-6 text-lg font-medium"
          data-testid="terminar-sesion"
        >
          {etiquetaTerminar}
        </button>
      </div>
    </section>
  );
}
