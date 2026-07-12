"use client";

// EL SELECTOR DE ETAPA (ADR 006, extiende ADR 005).
//
// Las etapas se describen por COMPORTAMIENTO OBSERVABLE, jamás con jerga clínica: el padre
// reconoce a su hijo en la descripción, no lo diagnostica. "Palabras sueltas" es la recomendada
// y el DEFAULT PERMANENTE; "primeras frases" existe pero JAMÁS se activa sola — hay que elegirla.
//
// Cambiar de etapa cambia las cápsulas del día y NO BORRA NADA (el progreso de cada etapa se
// guarda por separado; el historial es uno solo y nunca se toca).

import {
  DESCRIPCION_ETAPA,
  ETAPAS,
  ETAPA_DEFECTO,
  NOMBRE_ETAPA,
  type Etapa,
} from "@content/schema";
import { guardarAjustesEnStore, useAjustes } from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { AJUSTES_DEFECTO } from "@/lib/storage/schemas";

export function EtapaDelHabla() {
  const hidratado = useHidratado();
  const guardados = useAjustes();
  const ajustes = guardados ?? AJUSTES_DEFECTO;

  function elegir(etapa: Etapa) {
    guardarAjustesEnStore({ ...ajustes, etapa });
  }

  return (
    <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
      <h2 className="font-medium">¿Cómo habla su hijo hoy?</h2>
      <p className="text-tinta-suave mt-2 text-sm">
        Elija lo que ve en casa, no lo que quisiera ver. Las cápsulas del día se
        ajustan a esa etapa. <strong>Cambiarla no borra nada:</strong> el
        progreso y los días practicados se quedan como están, y puede volver
        cuando quiera.
      </p>

      <fieldset className="mt-4" data-testid="etapa-del-habla">
        <legend className="sr-only">Etapa del habla</legend>
        <div className="flex flex-col gap-3">
          {ETAPAS.map((etapa) => {
            const activa = hidratado && ajustes.etapa === etapa;
            const recomendada = etapa === ETAPA_DEFECTO;
            return (
              <button
                key={etapa}
                type="button"
                onClick={() => elegir(etapa)}
                disabled={!hidratado}
                aria-pressed={activa}
                data-testid={`etapa-${etapa}`}
                className={[
                  "min-h-16 rounded-2xl border p-4 text-left transition-colors",
                  activa
                    ? "border-acento bg-acento-suave/50"
                    : "border-borde bg-fondo",
                ].join(" ")}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{NOMBRE_ETAPA[etapa]}</span>
                  {/* El estado activo no se comunica SOLO con color (a11y). */}
                  {activa ? (
                    <span className="text-acento font-mono text-[11px] tracking-[0.08em] uppercase">
                      Elegida
                    </span>
                  ) : recomendada ? (
                    <span className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
                      Recomendada
                    </span>
                  ) : null}
                </span>
                <span className="text-tinta-suave mt-1 block text-sm">
                  {DESCRIPCION_ETAPA[etapa]}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className="text-tinta-suave mt-4 text-sm">
        Si duda, quédese en <strong>palabras sueltas</strong>: es donde más
        trabajo hace esta app, y de donde nace todo lo demás.
      </p>
    </section>
  );
}
