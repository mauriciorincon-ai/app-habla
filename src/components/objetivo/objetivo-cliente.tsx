"use client";

// OBJETIVO DE LA SEMANA (Outcome 2) — la sintonía con la fonoaudióloga. El padre escribe qué
// trabajar; la app lo alinea de forma DETERMINISTA (sin IA). Honestidad: el preview dice exactamente
// cuánto coincide, y si no coincide con nada ("colores") lo dice de frente. Al guardar o quitar, la
// cápsula de hoy se re-alinea si aún no está hecha (aplicarObjetivoAHoy).

import { useMemo, useState } from "react";
import { CAPSULAS } from "@content/capsulas";
import { PICTOGRAMAS } from "@content/pictogramas";
import { PARES_GEMELOS } from "@content/pares-gemelos";
import { useHidratado } from "@/components/use-hidratado";
import {
  borrarObjetivoEnStore,
  guardarObjetivoEnStore,
  useObjetivo,
} from "@/components/estado-local";
import { aplicarObjetivoAHoy } from "@/components/estado-capsulas";
import { IconoDiana, IconoHecho } from "@/components/iconos";
import { alinear, contarAlineacion } from "@/lib/objetivo/alinear";
import { fechaLarga } from "@/lib/fecha";

const CONTENIDO = {
  capsulas: CAPSULAS,
  pictos: PICTOGRAMAS,
  pares: PARES_GEMELOS,
};

// Sugerencias que SÍ alinean (nacen de las etiquetas reales): el padre elige una y garantiza
// coincidencia. Escribir libre también vale — y "colores" enseña el caso honesto sin matches.
const SUGERENCIAS = [
  "animales",
  "la comida",
  "el baño",
  "acciones",
  "pedir cosas",
  "los sonidos",
];

export function ObjetivoCliente() {
  const hidratado = useHidratado();
  const activo = useObjetivo();
  const [texto, setTexto] = useState("");
  const [guardado, setGuardado] = useState(false);

  const resumen = useMemo(
    () => contarAlineacion(alinear(texto), CONTENIDO),
    [texto],
  );

  if (!hidratado) {
    return <div className="min-h-[20rem]" aria-hidden="true" />;
  }

  const limpio = texto.trim();

  function guardar() {
    guardarObjetivoEnStore(texto);
    aplicarObjetivoAHoy();
    setTexto("");
    setGuardado(true);
  }

  function quitar() {
    borrarObjetivoEnStore();
    aplicarObjetivoAHoy();
    setTexto("");
    setGuardado(false);
  }

  return (
    <div className="flex flex-col gap-6">
      {activo ? (
        <section
          className="bg-acento-suave/40 border-acento flex flex-col gap-3 rounded-2xl border-l-4 p-5"
          data-testid="objetivo-activo"
        >
          <div className="flex items-start gap-3">
            <IconoDiana className="text-acento mt-0.5 h-6 w-6 shrink-0" />
            <div>
              <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
                Objetivo activo
              </p>
              <p className="font-display mt-1 text-2xl italic">
                «{activo.texto}»
              </p>
              <p className="text-tinta-suave text-sm">
                Activo desde el {fechaLarga(activo.desde)}. Se queda hasta que
                lo cambies o lo quites.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={quitar}
            className="border-borde text-tinta min-h-11 self-start rounded-xl border px-4 text-sm font-medium"
            data-testid="quitar-objetivo"
          >
            Quitar el objetivo
          </button>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <label htmlFor="objetivo-texto" className="font-medium">
          {activo
            ? "¿Cambiarlo? Escribe uno nuevo:"
            : "¿Qué quieren trabajar esta semana?"}
        </label>
        <input
          id="objetivo-texto"
          type="text"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setGuardado(false);
          }}
          placeholder="animales, la comida, el baño…"
          maxLength={80}
          autoComplete="off"
          className="border-borde bg-superficie text-tinta min-h-14 rounded-xl border px-4 text-lg"
          data-testid="objetivo-input"
        />

        <div className="flex flex-wrap gap-2" aria-label="Sugerencias">
          {SUGERENCIAS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setTexto(s);
                setGuardado(false);
              }}
              className="border-borde text-tinta-suave min-h-11 rounded-full border px-4 text-sm"
              data-testid={`sugerencia-${s.replace(/\s+/g, "-")}`}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Preview honesto: cambia mientras escribe. */}
      <div aria-live="polite" className="min-h-[3rem]">
        {limpio === "" ? (
          <p className="text-tinta-suave text-sm">
            Escribe una palabra o dos. La app buscará eso en las cápsulas, en
            los dibujos y en las gemelas, y lo pondrá primero.
          </p>
        ) : resumen.vacio ? (
          <p
            className="text-tinta-suave bg-superficie rounded-xl p-4 text-sm"
            data-testid="objetivo-sin-matches"
          >
            «{limpio}» todavía no está en el contenido de la app, así que no hay
            nada que priorizar. No pasa nada: puedes guardarlo igual y no cambia
            nada, o probar con otra palabra (animales, la comida, acciones…).
          </p>
        ) : (
          <p
            className="text-tinta bg-superficie rounded-xl p-4 text-sm"
            data-testid="objetivo-preview"
          >
            Con «{limpio}», la app pone primero{" "}
            {[
              resumen.capsulas > 0
                ? `${resumen.capsulas} ${resumen.capsulas === 1 ? "cápsula" : "cápsulas"}`
                : null,
              resumen.palabras > 0
                ? `${resumen.palabras} ${resumen.palabras === 1 ? "dibujo" : "dibujos"}`
                : null,
              resumen.pares > 0
                ? `${resumen.pares} ${resumen.pares === 1 ? "par de gemelas" : "pares de gemelas"}`
                : null,
            ]
              .filter(Boolean)
              .join(" · ")}
            .
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={guardar}
          disabled={limpio === ""}
          className="bg-acento text-sobre-acento min-h-14 rounded-xl px-6 text-lg font-medium disabled:opacity-50"
          data-testid="guardar-objetivo"
        >
          Guardar el objetivo
        </button>
        {guardado ? (
          <p
            className="text-exito flex items-center justify-center gap-2 text-sm font-medium"
            data-testid="objetivo-guardado"
          >
            <IconoHecho className="h-4 w-4 shrink-0" /> Listo. La cápsula de hoy
            y los juegos ya lo tienen en cuenta.
          </p>
        ) : null}
      </div>
    </div>
  );
}
