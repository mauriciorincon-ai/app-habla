"use client";

// OBJETIVO DE LA SEMANA (Outcome 2) — la sintonía con las terapias del niño. El padre escribe qué
// trabajar; la app lo alinea de forma DETERMINISTA (sin IA). Honestidad (auditoría de cierre S4):
// el preview cuenta contra lo que el niño DE VERDAD verá —su etapa y sus temas—, no contra los
// bancos completos; y si el objetivo existe en la app pero fuera de su alcance, lo dice de frente.
// Al guardar o quitar, la cápsula de hoy se re-alinea si aún no está hecha (aplicarObjetivoAHoy).
//
// Los bancos de contenido se cargan BAJO DEMANDA (import dinámico al primer teclazo): esta ruta
// del padre no arrastra las 50 cápsulas ni los pictogramas en su bundle inicial — la misma
// lección del gate de performance del S2 (ver estado-capsulas.ts), cazada aquí por el gate de
// Lighthouse del PR del S4.

import { useEffect, useMemo, useRef, useState } from "react";
import { ETAPA_DEFECTO, type Capsula, type Etapa } from "@content/schema";
import type { Pictograma } from "@content/pictogramas";
import type { ParGemelo } from "@content/pares-gemelos";
import type { ItemGrabable } from "@/lib/banco-voz/catalogo";
import type { Alineacion } from "@/lib/objetivo/alinear";
import { useHidratado } from "@/components/use-hidratado";
import {
  borrarObjetivoEnStore,
  guardarObjetivoEnStore,
  useAjustes,
  useObjetivo,
  usePerfil,
} from "@/components/estado-local";
import { IconoDiana, IconoHecho } from "@/components/iconos";
import { alinear, contarAlineacion } from "@/lib/objetivo/alinear";
import { acotarContenido } from "@/lib/objetivo/alcance";
import { fechaLarga } from "@/lib/fecha";

type Bancos = {
  capsulas: readonly Capsula[];
  pictos: readonly Pictograma[];
  pares: readonly ParGemelo[];
  parJugableEn: (par: ParGemelo, etapa: Etapa) => boolean;
  grabables: readonly ItemGrabable[];
  coincideGrabable: (objetivo: Alineacion, i: ItemGrabable) => boolean;
};

// Cache a nivel de módulo: los bancos se cargan UNA vez por visita, y solo si el padre escribe.
let promesaBancos: Promise<Bancos> | null = null;
function cargarBancos(): Promise<Bancos> {
  promesaBancos ??= Promise.all([
    import("@content/capsulas"),
    import("@content/pictogramas"),
    import("@content/pares-gemelos"),
    import("@/lib/banco-voz/catalogo"),
    import("@/lib/banco-voz/lotes"),
  ]).then(([capsulas, pictos, pares, catalogo, lotes]) => ({
    capsulas: capsulas.CAPSULAS,
    pictos: pictos.PICTOGRAMAS,
    pares: pares.PARES_GEMELOS,
    parJugableEn: pares.parJugableEn,
    grabables: catalogo.catalogoGrabable(),
    coincideGrabable: (objetivo, i) => lotes.coincideConObjetivo(objetivo, i),
  }));
  return promesaBancos;
}

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
  const ajustes = useAjustes();
  const perfil = usePerfil();
  const [texto, setTexto] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [bancos, setBancos] = useState<Bancos | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const limpio = texto.trim();
  const etapa = ajustes?.etapa ?? ETAPA_DEFECTO;
  const temas = perfil?.temas ?? null;

  // Carga perezosa: los bancos entran cuando hay algo que contar (primer teclazo), nunca antes.
  useEffect(() => {
    if (limpio === "" || bancos) return;
    let vivo = true;
    void cargarBancos().then((b) => {
      if (vivo) setBancos(b);
    });
    return () => {
      vivo = false;
    };
  }, [limpio, bancos]);

  const conteos = useMemo(() => {
    if (!bancos || limpio === "") return null;
    const alineacion = alinear(limpio);
    // Lo que el niño verá: cápsulas de SU etapa, pictos de SUS temas, pares jugables en su etapa.
    const alcance = contarAlineacion(
      alineacion,
      acotarContenido(bancos, {
        etapa,
        temas,
        parJugable: (p) => bancos.parJugableEn(p, etapa),
      }),
    );
    // Contra la app entera (para distinguir "no existe" de "existe pero fuera de su alcance").
    const global = contarAlineacion(alineacion, bancos);
    // El lote del estudio matchea el catálogo completo (mismo predicado que siguienteLote).
    const estudio = bancos.grabables.filter((i) =>
      bancos.coincideGrabable(alineacion, i),
    ).length;
    return { alcance, global, estudio };
  }, [bancos, limpio, etapa, temas]);

  if (!hidratado) {
    return <div className="min-h-[20rem]" aria-hidden="true" />;
  }

  async function guardar() {
    guardarObjetivoEnStore(texto);
    // estado-capsulas arrastra la biblioteca entera: se importa solo al usarla, no en el bundle.
    const { aplicarObjetivoAHoy } =
      await import("@/components/estado-capsulas");
    aplicarObjetivoAHoy();
    setTexto("");
    setGuardado(true);
    // El botón "Guardar" se deshabilita al vaciarse el campo: sin esto, el foco caería al body.
    inputRef.current?.focus();
  }

  async function quitar() {
    borrarObjetivoEnStore();
    const { aplicarObjetivoAHoy } =
      await import("@/components/estado-capsulas");
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
            <div className="min-w-0">
              <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
                Objetivo activo
              </p>
              <p className="font-display mt-1 text-2xl break-words italic">
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
            onClick={() => void quitar()}
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
          ref={inputRef}
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

        <div
          role="group"
          aria-label="Sugerencias"
          className="flex flex-wrap gap-2"
        >
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

      {/* Preview honesto: cambia mientras escribe, y cuenta SOLO lo que él verá. */}
      <div aria-live="polite" className="min-h-[3rem]">
        {limpio === "" ? (
          <p className="text-tinta-suave text-sm">
            Escribe una palabra o dos. La app buscará eso en las cápsulas, en
            los dibujos y en las gemelas, y lo pondrá primero.
          </p>
        ) : conteos === null ? null : conteos.alcance.vacio &&
          conteos.global.vacio &&
          conteos.estudio === 0 ? (
          <p
            className="text-tinta-suave bg-superficie rounded-xl p-4 text-sm"
            data-testid="objetivo-sin-matches"
          >
            «{limpio}» todavía no está en el contenido de la app, así que no hay
            nada que priorizar. No pasa nada: puedes guardarlo igual y no cambia
            nada, o probar con otra palabra (animales, la comida, acciones…).
          </p>
        ) : conteos.alcance.vacio ? (
          <p
            className="text-tinta-suave bg-superficie rounded-xl p-4 text-sm"
            data-testid="objetivo-fuera-de-alcance"
          >
            «{limpio}» sí está en la app, pero no en lo que él ve hoy (su etapa
            y sus temas), así que la cápsula y los juegos no cambian.
            {conteos.estudio > 0
              ? " En el estudio de grabación sí se pone primero al grabar."
              : ""}
          </p>
        ) : (
          <p
            className="text-tinta bg-superficie rounded-xl p-4 text-sm"
            data-testid="objetivo-preview"
          >
            Con «{limpio}», la app pone primero{" "}
            {[
              conteos.alcance.capsulas > 0
                ? `${conteos.alcance.capsulas} ${conteos.alcance.capsulas === 1 ? "cápsula" : "cápsulas"}`
                : null,
              conteos.alcance.palabras > 0
                ? `${conteos.alcance.palabras} ${conteos.alcance.palabras === 1 ? "dibujo" : "dibujos"}`
                : null,
              conteos.alcance.pares > 0
                ? `${conteos.alcance.pares} ${conteos.alcance.pares === 1 ? "par de gemelas" : "pares de gemelas"}`
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
          onClick={() => void guardar()}
          disabled={limpio === ""}
          className="bg-acento text-sobre-acento min-h-14 rounded-xl px-6 text-lg font-medium disabled:opacity-50"
          data-testid="guardar-objetivo"
        >
          Guardar el objetivo
        </button>
        {/* Región viva SIEMPRE montada: el contenido se inserta al guardar y el lector lo anuncia
            (una región recién insertada con texto adentro no se anuncia — hallazgo de auditoría). */}
        <p
          aria-live="polite"
          className="text-exito flex min-h-5 items-center justify-center gap-2 text-sm font-medium"
          data-testid="objetivo-guardado"
        >
          {guardado ? (
            <>
              <IconoHecho className="h-4 w-4 shrink-0" /> Listo. La cápsula de
              hoy y los juegos ya lo tienen en cuenta.
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
