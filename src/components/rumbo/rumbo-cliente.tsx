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

function segundos(ms: number): string {
  const s = ms / 1000;
  return (s >= 10 ? s.toFixed(0) : s.toFixed(1)).replace(".", ",");
}

/** Un dato de la semana, solo si tiene algo que decir (los ceros no se muestran: no hay "malo"). */
function Dato({ n, children }: { n: number; children: React.ReactNode }) {
  if (n <= 0) return null;
  return (
    <li className="flex items-baseline gap-2">
      <span className="text-acento font-sans text-2xl font-semibold tabular-nums">
        {n}
      </span>
      <span className="text-tinta-suave text-sm">{children}</span>
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
  return (
    <article
      className="bg-superficie shadow-tarjeta rounded-2xl p-5"
      data-testid="rumbo-semana"
    >
      <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
        {esActual ? "Esta semana" : `Semana del ${fechaLarga(semana.semana)}`}
      </p>
      <ul className="mt-3 flex flex-col gap-2">
        <Dato n={semana.diasConPractica}>
          {semana.diasConPractica === 1
            ? "día que practicaron juntos"
            : "días que practicaron juntos"}
        </Dato>
        <Dato n={semana.palabrasDistintas}>
          palabras distintas que practicaron
        </Dato>
        <Dato n={semana.dibujosEncendidos}>
          dibujos que encendió con su voz
        </Dato>
        <Dato n={semana.subidasYBajadas}>veces que su voz subió y bajó</Dato>
        <Dato n={semana.rondasGemelas}>rondas de gemelas</Dato>
        <Dato n={semana.marcadasPorTi}>palabras que TÚ le oíste</Dato>
        {semana.vozMsMax >= 1000 ? (
          <li className="flex items-baseline gap-2">
            <span className="text-acento font-sans text-2xl font-semibold tabular-nums">
              {segundos(semana.vozMsMax)}
            </span>
            <span className="text-tinta-suave text-sm">
              segundos fue su voz más larga sin cortarse
            </span>
          </li>
        ) : null}
      </ul>
    </article>
  );
}

export function RumboCliente() {
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
          Todavía no hay nada que contar
        </h2>
        <p className="text-tinta-suave max-w-prose">
          Jueguen unos días —el globo, el cohete, los dibujos— o marquen la
          cápsula de hoy, y aquí va a aparecer cómo van. Sin puntajes ni notas:
          solo lo que de verdad pasó.
        </p>
        <Link
          href="/jugar"
          className="bg-acento text-sobre-acento min-h-12 rounded-xl px-6 font-medium"
        >
          Ir a los juegos
        </Link>
      </section>
    );
  }

  return (
    <div className="flex flex-col gap-8" data-testid="rumbo-contenido">
      {hitos.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-2xl">Lo que ya lograron</h2>
          <ul className="flex flex-col gap-2" data-testid="rumbo-hitos">
            {hitos.map((h) => (
              <li
                key={h.id}
                className="bg-acento-suave/40 border-acento flex items-start gap-3 rounded-xl border-l-4 p-4"
              >
                <IconoHecho className="text-acento mt-0.5 h-5 w-5 shrink-0" />
                <span>
                  <span className="block font-medium">{h.titulo}</span>
                  <span className="text-tinta-suave text-sm">
                    desde el {fechaLarga(h.fecha)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">Semana a semana</h2>
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
        Esto no es una nota ni un diagnóstico: es el registro de lo que hicieron
        juntos. Lo que mueve el habla es volver, sin prisa.
      </p>
    </div>
  );
}
