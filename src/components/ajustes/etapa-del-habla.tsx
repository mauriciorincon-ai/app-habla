"use client";

// EL SELECTOR DE ETAPA (ADR 006, extiende ADR 005).
//
// Las etapas se describen por COMPORTAMIENTO OBSERVABLE, jamás con jerga de especialista: el padre
// reconoce a su hijo en la descripción, no lo diagnostica. "Palabras sueltas" es la recomendada
// y el DEFAULT PERMANENTE; "primeras frases" existe pero JAMÁS se activa sola — hay que elegirla.
//
// Cambiar de etapa cambia las cápsulas del día y NO BORRA NADA (el progreso de cada etapa se
// guarda por separado; el historial es uno solo y nunca se toca).

import { ETAPAS, ETAPA_DEFECTO, type Etapa } from "@content/schema";
import { guardarAjustesEnStore, useAjustes } from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { useT } from "@/lib/idioma/estado";
import { ajustes as textos } from "@/lib/idioma/textos/ajustes";
import { AJUSTES_DEFECTO } from "@/lib/storage/schemas";

export function EtapaDelHabla() {
  const tx = useT();
  const hidratado = useHidratado();
  const guardados = useAjustes();
  const ajustes = guardados ?? AJUSTES_DEFECTO;

  function elegir(etapa: Etapa) {
    guardarAjustesEnStore({ ...ajustes, etapa });
  }

  return (
    <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
      <h2 className="font-medium">{tx(textos.etapa.titulo)}</h2>
      <p className="text-tinta-suave mt-2 text-sm">
        {tx(textos.etapa.ayuda.antes)}
        <strong>{tx(textos.etapa.ayuda.fuerte)}</strong>
        {tx(textos.etapa.ayuda.despues)}
      </p>

      <fieldset className="mt-4" data-testid="etapa-del-habla">
        <legend className="sr-only">{tx(textos.etapa.leyenda)}</legend>
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
                  "min-h-16 rounded-2xl border p-4 text-left transition-colors duration-[--dur-media] ease-suave",
                  activa
                    ? "border-acento bg-acento-suave/50"
                    : "border-borde bg-fondo",
                ].join(" ")}
              >
                <span className="flex items-baseline justify-between gap-3">
                  <span className="font-medium">{tx(textos.etapa.nombre[etapa])}</span>
                  {/* El estado activo no se comunica SOLO con color (a11y). */}
                  {activa ? (
                    <span className="text-acento font-mono text-[11px] tracking-[0.08em] uppercase">
                      {tx(textos.etapa.elegida)}
                    </span>
                  ) : recomendada ? (
                    <span className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
                      {tx(textos.etapa.recomendada)}
                    </span>
                  ) : null}
                </span>
                <span className="text-tinta-suave mt-1 block text-sm">
                  {tx(textos.etapa.descripcion[etapa])}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className="text-tinta-suave mt-4 text-sm">
        {tx(textos.etapa.sidudaAntes)}
        <strong>{tx(textos.etapa.sidudaFuerte)}</strong>
        {tx(textos.etapa.sidudaDespues)}
      </p>
    </section>
  );
}
