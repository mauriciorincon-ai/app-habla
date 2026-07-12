"use client";

// Onboarding local mínimo: apodo (opcional) + hasta 3 temas que le gusten.
// TODO se queda en este dispositivo. Sin cuentas, sin correo, sin nube.

import { useState } from "react";
import { guardarPerfilEnStore } from "@/components/estado-local";
import { NOMBRE_TEMA, TEMAS, type Tema } from "@/lib/storage/schemas";

export function Onboarding() {
  const [apodo, setApodo] = useState("");
  const [temas, setTemas] = useState<Tema[]>([]);

  function alternarTema(tema: Tema) {
    setTemas((actuales) =>
      actuales.includes(tema)
        ? actuales.filter((t) => t !== tema)
        : actuales.length < 3
          ? [...actuales, tema]
          : actuales,
    );
  }

  function guardar() {
    const limpio = apodo.trim();
    guardarPerfilEnStore({
      ...(limpio ? { apodo: limpio } : {}),
      temas: temas.length > 0 ? temas : ["animales"],
    });
  }

  return (
    <section
      className="bg-superficie shadow-tarjeta rounded-2xl p-6"
      data-testid="onboarding"
    >
      <h2 className="text-xl font-medium">Antes de empezar, dos cositas</h2>

      <p className="text-tinta-suave mt-3 text-sm">
        Todo lo que escribas aquí se queda <strong>en este dispositivo</strong>:
        no hay cuentas ni servidores. Y la voz de su hijo nunca se graba ni sale
        de aquí — solo se analiza en el momento para saber si hay voz y cuánto
        dura.
      </p>

      <div className="mt-6">
        <label htmlFor="apodo" className="block text-sm font-medium">
          ¿Cómo le dicen en casa?{" "}
          <span className="text-tinta-suave">(opcional)</span>
        </label>
        <input
          id="apodo"
          type="text"
          value={apodo}
          onChange={(e) => setApodo(e.target.value)}
          maxLength={30}
          placeholder="Su apodo"
          className="border-borde bg-fondo text-tinta mt-2 min-h-11 w-full rounded-xl border px-4"
        />
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium">
          ¿Qué le gusta? Elige hasta tres
        </legend>
        <p className="text-tinta-suave mt-1 text-sm">
          Las actividades usan lo que a él ya le interesa: seguir su interés es
          una de las técnicas con mejor respaldo.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TEMAS.map((tema) => {
            const activo = temas.includes(tema);
            return (
              <button
                key={tema}
                type="button"
                onClick={() => alternarTema(tema)}
                aria-pressed={activo}
                className={[
                  "min-h-11 rounded-full border px-4 text-sm",
                  activo
                    ? "bg-acento text-sobre-acento border-transparent"
                    : "border-borde text-tinta bg-fondo",
                ].join(" ")}
              >
                {NOMBRE_TEMA[tema]}
              </button>
            );
          })}
        </div>
      </fieldset>

      <button
        type="button"
        onClick={guardar}
        className="bg-acento text-sobre-acento mt-6 min-h-12 w-full rounded-xl px-6 font-medium"
        data-testid="terminar-onboarding"
      >
        Empezar
      </button>
    </section>
  );
}
