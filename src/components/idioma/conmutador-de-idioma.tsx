"use client";

import { IDIOMAS, NOMBRE_PROPIO, t, type Idioma } from "@/lib/idioma";
import { useAjustes } from "@/components/estado-local";
import { elegirIdioma, useIdioma } from "@/lib/idioma/estado";
import { idioma as textos } from "@/lib/idioma/textos/idioma";

/**
 * El conmutador de idioma de Ajustes: un botón por idioma, con su nombre escrito en su propio idioma
 * (jamás una bandera) y `aria-pressed`. El elegido se marca con texto («✓»/«Selected»), no solo con
 * color. Toque ≥ 44 px (pantalla del adulto).
 */
export function ConmutadorDeIdioma() {
  const actual = useIdioma();
  const siguiendo = useAjustes()?.idioma == null;
  return (
    <section
      className="bg-superficie shadow-tarjeta rounded-2xl p-5"
      data-testid="conmutador-de-idioma"
      aria-labelledby="titulo-idioma"
    >
      <h2 id="titulo-idioma" className="font-medium">
        {t(textos.titulo, actual)}
      </h2>
      <p className="text-tinta-suave mt-1 text-sm">{t(textos.ayuda, actual)}</p>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-labelledby="titulo-idioma">
        {IDIOMAS.map((i: Idioma) => {
          const elegido = i === actual;
          return (
            <button
              key={i}
              type="button"
              lang={i}
              aria-pressed={elegido}
              onClick={() => elegirIdioma(i)}
              data-testid={`idioma-${i}`}
              className={`min-h-11 min-w-28 rounded-xl border px-4 text-sm font-medium ${
                elegido ? "border-acento bg-acento-suave" : "border-borde bg-fondo text-tinta-suave"
              }`}
            >
              {elegido ? "✓ " : ""}
              {NOMBRE_PROPIO[i]}
            </button>
          );
        })}
        <button
          type="button"
          aria-pressed={siguiendo}
          onClick={() => elegirIdioma(null)}
          data-testid="idioma-dispositivo"
          className={`min-h-11 rounded-xl border px-4 text-sm font-medium ${
            siguiendo ? "border-acento bg-acento-suave" : "border-borde bg-fondo text-tinta-suave"
          }`}
        >
          {siguiendo ? "✓ " : ""}
          {t(textos.seguirNavegador, actual)}
        </button>
      </div>
    </section>
  );
}
