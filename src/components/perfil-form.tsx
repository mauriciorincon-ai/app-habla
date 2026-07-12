"use client";

// El formulario de apodo + temas, compartido entre el onboarding (primera vez, en Hoy)
// y Ajustes (cambiarlos después sin borrar nada — hallazgo del gate 2026-07-12: la única
// forma de volver a esta pantalla era borrar todos los datos o una ventana de incógnito).

import { useState } from "react";
import {
  NOMBRE_TEMA,
  TEMAS,
  type Perfil,
  type Tema,
} from "@/lib/storage/schemas";

export function PerfilForm({
  inicial,
  textoGuardar,
  testIdGuardar,
  onGuardar,
  onCancelar,
}: {
  /** Valores actuales al editar; `null` en el onboarding (formulario vacío). */
  inicial: Perfil | null;
  textoGuardar: string;
  testIdGuardar: string;
  onGuardar: (perfil: Perfil) => void;
  /** Si existe, se muestra un botón secundario para salir sin guardar. */
  onCancelar?: () => void;
}) {
  const [apodo, setApodo] = useState(inicial?.apodo ?? "");
  const [temas, setTemas] = useState<Tema[]>(inicial?.temas ?? []);

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
    onGuardar({
      ...(limpio ? { apodo: limpio } : {}),
      temas: temas.length > 0 ? temas : ["animales"],
    });
  }

  return (
    <div>
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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={guardar}
          className="bg-acento text-sobre-acento min-h-12 flex-1 rounded-xl px-6 font-medium"
          data-testid={testIdGuardar}
        >
          {textoGuardar}
        </button>
        {onCancelar ? (
          <button
            type="button"
            onClick={onCancelar}
            className="border-borde text-tinta min-h-12 flex-1 rounded-xl border px-6 font-medium"
          >
            Mejor no
          </button>
        ) : null}
      </div>
    </div>
  );
}
