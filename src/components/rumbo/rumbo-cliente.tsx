"use client";

// EL RUMBO (Outcome 1) — progreso HONESTO del padre. Muestra SOLO lo medido (voz, duración,
// inversiones, dibujos) o lo que él MARCÓ (palabras oídas, participación). Cero puntajes clínicos,
// cero %, cero plazos, cero culpa: una semana floja es un número pequeño, sin adjetivo. La lógica
// vive en lib/rumbo (motores puros); aquí solo se pinta.

import Link from "next/link";
import { useMemo } from "react";
import { useProgreso } from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { IconoBrote, IconoHecho } from "@/components/iconos";
import { leerSesiones } from "@/lib/storage/local";
import { fechaHoy, fechaLarga, lunesDeLaSemana } from "@/lib/fecha";
import {
  tendenciasPorSemana,
  type ResumenSemana,
} from "@/lib/rumbo/tendencias";
import { hitosAlcanzados } from "@/lib/rumbo/hitos";
import { useIdioma, useT } from "@/lib/idioma/estado";
import type { Idioma, Texto } from "@/lib/idioma";
import { rumbo } from "@/lib/idioma/textos/rumbo";

function segundos(ms: number, idioma: Idioma): string {
  const s = ms / 1000;
  const texto = s >= 10 ? s.toFixed(0) : s.toFixed(1);
  return idioma === "es" ? texto.replace(".", ",") : texto;
}

/**
 * Un dato de la semana, solo si tiene algo que decir (los ceros no se muestran: no hay "malo").
 * Lleva singular Y plural (auditoría de cierre: "1 palabras distintas" era un descuido en la
 * pantalla insignia del microcopy) y un testid propio, para que el e2e ate el número a SU frase.
 */
function Dato({
  n,
  id,
  singular,
  plural,
}: {
  n: number;
  id: string;
  singular: Texto;
  plural: Texto;
}) {
  const tx = useT();
  if (n <= 0) return null;
  return (
    <li className="flex items-baseline gap-2" data-testid={`dato-${id}`}>
      <span className="text-acento font-sans text-2xl font-semibold tabular-nums">
        {n}
      </span>
      <span className="text-tinta-suave text-sm">
        {tx(n === 1 ? singular : plural)}
      </span>
    </li>
  );
}

function Semana({
  semana,
  esActual,
}: {
  semana: ResumenSemana;
  esActual: boolean;
}) {
  const tx = useT();
  const idioma = useIdioma();
  return (
    <article
      className="bg-superficie shadow-tarjeta rounded-2xl p-5"
      data-testid="rumbo-semana"
    >
      <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
        {esActual
          ? tx(rumbo.semana.esta)
          : tx(rumbo.semana.del, { fecha: fechaLarga(semana.semana, idioma) })}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        <Dato
          n={semana.diasConPractica}
          id="dias"
          singular={rumbo.datos.dias.uno}
          plural={rumbo.datos.dias.otro}
        />
        <Dato
          n={semana.capsulasHechas}
          id="capsulas"
          singular={rumbo.datos.capsulas.uno}
          plural={rumbo.datos.capsulas.otro}
        />
        <Dato
          n={semana.palabrasDistintas}
          id="palabras"
          singular={rumbo.datos.palabras.uno}
          plural={rumbo.datos.palabras.otro}
        />
        <Dato
          n={semana.dibujosEncendidos}
          id="dibujos"
          singular={rumbo.datos.dibujos.uno}
          plural={rumbo.datos.dibujos.otro}
        />
        <Dato
          n={semana.vueltasGlobo}
          id="vueltas"
          singular={rumbo.datos.vueltas.uno}
          plural={rumbo.datos.vueltas.otro}
        />
        <Dato
          n={semana.subidasYBajadas}
          id="inversiones"
          singular={rumbo.datos.inversiones.uno}
          plural={rumbo.datos.inversiones.otro}
        />
        <Dato
          n={semana.rondasGemelas}
          id="rondas"
          singular={rumbo.datos.rondas.uno}
          plural={rumbo.datos.rondas.otro}
        />
        <Dato
          n={semana.marcadasPorTi}
          id="marcadas"
          singular={rumbo.datos.marcadas.uno}
          plural={rumbo.datos.marcadas.otro}
        />
        {/* Los segundos del globo (gate S4, N2: "si quiero ver el rumbo debería ver todo"):
            el total que sonó y, aparte, la más larga sin cortarse — las mismas dos verdades
            de la celebración, jamás sumadas en una sola. */}
        {semana.vozMsTotal >= 1000 ? (
          <li
            className="flex items-baseline gap-2"
            data-testid="dato-voz-total"
          >
            <span className="text-acento font-sans text-2xl font-semibold tabular-nums">
              {segundos(semana.vozMsTotal, idioma)}
            </span>
            <span className="text-tinta-suave text-sm">
              {tx(rumbo.datos.vozTotal)}
            </span>
          </li>
        ) : null}
        {semana.vozMsMax >= 1000 ? (
          <li className="flex items-baseline gap-2" data-testid="dato-voz-max">
            <span className="text-acento font-sans text-2xl font-semibold tabular-nums">
              {segundos(semana.vozMsMax, idioma)}
            </span>
            <span className="text-tinta-suave text-sm">
              {tx(rumbo.datos.vozMax)}
            </span>
          </li>
        ) : null}
      </ul>
    </article>
  );
}

export function RumboCliente() {
  const tx = useT();
  const idioma = useIdioma();
  const hidratado = useHidratado();
  const progreso = useProgreso();
  const sesiones = useMemo(
    () => (hidratado ? leerSesiones().sesiones : []),
    [hidratado],
  );

  if (!hidratado || !progreso) {
    return <div className="min-h-[20rem]" aria-hidden="true" />;
  }

  const historial = progreso.historial;
  const semanas = tendenciasPorSemana(sesiones, historial);
  const hitos = hitosAlcanzados(sesiones, historial);
  const semanaActual = lunesDeLaSemana(fechaHoy());

  if (semanas.length === 0) {
    return (
      <section
        className="bg-superficie shadow-tarjeta flex flex-col items-center gap-4 rounded-2xl p-8 text-center"
        data-testid="rumbo-vacio"
      >
        <IconoBrote className="text-acento h-14 w-14" />
        <h2 className="font-display text-2xl">
          {tx(rumbo.vacio.titulo)}
        </h2>
        <p className="text-tinta-suave max-w-prose">
          {tx(rumbo.vacio.texto)}
        </p>
        <Link
          href="/jugar"
          className="bg-acento text-sobre-acento inline-flex min-h-12 items-center justify-center rounded-xl px-6 font-medium"
        >
          {tx(rumbo.vacio.ir)}
        </Link>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8" data-testid="rumbo-contenido">
      {hitos.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl">{tx(rumbo.hitos.titulo)}</h2>
          <ul className="flex flex-col gap-2" data-testid="rumbo-hitos">
            {hitos.map((h) => (
              <li
                key={h.id}
                className="bg-acento-suave/40 border-acento flex items-start gap-3 rounded-xl border-l-4 p-4"
              >
                <IconoHecho className="text-acento mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  <span className="block font-medium">{tx(h.titulo)}</span>
                  <span className="text-tinta-suave text-sm">
                    {tx(rumbo.hitos.desde, { fecha: fechaLarga(h.fecha, idioma) })}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">{tx(rumbo.semanaASemana)}</h2>
        <div className="flex flex-col gap-3">
          {semanas.map((s) => (
            <Semana
              key={s.semana}
              semana={s}
              esActual={s.semana === semanaActual}
            />
          ))}
        </div>
      </section>

      <p className="text-tinta-suave text-center text-sm">
        {tx(rumbo.cierre)}
      </p>
    </div>
  );
}
