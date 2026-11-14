"use client";

// EL PASO DE CONTACTO VISUAL (S9): el adulto elige, por lo que ve en casa, dónde está hoy; la actividad
// de contacto visual de «Hoy» se calibra a él. Mismo patrón que la etapa del habla: cambiarlo no borra nada.

import { NIVELES_CONTACTO_VISUAL, type NivelContactoVisual } from "@content/schema";
import { guardarAjustesEnStore, useAjustes } from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { useT } from "@/lib/idioma/estado";
import { ajustes as textos } from "@/lib/idioma/textos/ajustes";
import { AJUSTES_DEFECTO } from "@/lib/storage/schemas";

export function NivelContactoVisual() {
  const tx = useT();
  const hidratado = useHidratado();
  const guardados = useAjustes();
  const ajustes = guardados ?? AJUSTES_DEFECTO;

  function elegir(nivelMirada: NivelContactoVisual) {
    guardarAjustesEnStore({ ...ajustes, nivelMirada });
  }

  return (
    <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
      <h2 className="font-medium">{tx(textos.nivelMirada.titulo)}</h2>
      <p className="text-tinta-suave mt-2 text-sm">{tx(textos.nivelMirada.ayuda)}</p>

      <fieldset className="mt-4" data-testid="nivel-mirada">
        <legend className="sr-only">{tx(textos.nivelMirada.leyenda)}</legend>
        <div className="flex flex-col gap-3">
          {NIVELES_CONTACTO_VISUAL.map((nivel) => {
            const activo = hidratado && ajustes.nivelMirada === nivel;
            return (
              <button
                key={nivel}
                type="button"
                onClick={() => elegir(nivel)}
                disabled={!hidratado}
                aria-pressed={activo}
                data-testid={`nivel-mirada-${nivel}`}
                className={[
                  "min-h-12 rounded-2xl border p-4 text-left transition-colors duration-[--dur-media] ease-suave",
                  activo ? "border-acento bg-acento-suave/50" : "border-borde bg-fondo",
                ].join(" ")}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{tx(textos.nivelMirada.nombre[nivel])}</span>
                  {/* El estado elegido no se comunica SOLO con color (a11y): lleva la palabra. */}
                  {activo ? (
                    <span className="text-acento font-mono text-[11px] tracking-[0.08em] uppercase">
                      ✓ {tx(textos.nivelMirada.elegido)}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
