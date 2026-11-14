"use client";

// «Hojas para imprimir» (S10): tarjetas con pictograma y el tablero de turnos. La pantalla es solo
// la vista previa; lo que sale en papel son las `.hoja` (CSS `@media print`), cada una con su pie de
// ARASAAC (BY — atribución obligatoria, ADR-008) y SIN nombre ni edad (regla dura 8): se leen los
// pictogramas y sus palabras, jamás el perfil ni el apodo.

import Link from "next/link";
import { useState } from "react";
import { useCuentos } from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { rutaPictograma } from "@content/pictogramas";
import { t, type Idioma } from "@/lib/idioma";
import { useIdioma, useT } from "@/lib/idioma/estado";
import { imprimibles as textos } from "@/lib/idioma/textos/imprimibles";
import {
  elegirPictogramas,
  paginar,
  palabraDe,
} from "@/lib/imprimibles/hojas";

function Pie({ idioma, n, total }: { idioma: Idioma; n: number; total: number }) {
  return (
    <footer
      className="mt-6 border-t border-current pt-2 text-xs"
      data-testid="pie-arasaac"
    >
      <span className="font-medium">{t(textos.hoja, idioma, { n, total })}</span>
      {" · "}
      {t(textos.credito, idioma)}
    </footer>
  );
}

const hojaCss =
  "hoja bg-superficie text-tinta shadow-tarjeta flex flex-col rounded-2xl p-6";

export function ImprimiblesCliente() {
  const tx = useT();
  const idiomaApp = useIdioma();
  const [elegido, setElegido] = useState<Idioma | null>(null);
  const idioma = elegido ?? idiomaApp;
  const hidratado = useHidratado();
  const cuentos = useCuentos();

  if (!hidratado || !cuentos) {
    return <div className="min-h-[20rem]" aria-hidden="true" />;
  }

  const { pictos } = elegirPictogramas(
    cuentos.palabrasMeta,
    cuentos.intereses,
    idioma,
  );
  const hojasDeTarjetas = paginar(pictos);
  const total = hojasDeTarjetas.length + 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="no-imprimir flex flex-col gap-4">
        <Link
          href="/estudio"
          prefetch={false}
          className="text-tinta-suave border-borde inline-flex min-h-11 items-center self-start rounded-xl border px-3 text-sm"
          data-testid="volver-a-estudio"
        >
          {tx(textos.volver)}
        </Link>
        <p className="text-tinta-suave text-sm">{tx(textos.intro)}</p>
        <p className="text-tinta-suave text-sm">{tx(textos.origen.palabras)}</p>
        <fieldset className="flex flex-wrap items-center gap-3">
          <legend className="mb-1 text-sm font-medium">{tx(textos.idioma)}</legend>
          {(["es", "en"] as const).map((i) => (
            <label key={i} className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="radio"
                name="idioma-hojas"
                className="size-5"
                checked={idioma === i}
                onChange={() => setElegido(i)}
                data-testid={`idioma-hojas-${i}`}
              />
              {tx(i === "es" ? textos.idiomaEs : textos.idiomaEn)}
            </label>
          ))}
        </fieldset>
        <button
          type="button"
          onClick={() => window.print()}
          className="bg-acento text-sobre-acento min-h-12 self-start rounded-xl px-6 font-medium"
          data-testid="imprimir"
        >
          {tx(textos.imprimir)}
        </button>
      </div>

      <div className="zona-imprimible flex flex-col gap-6" data-testid="hojas">
        {hojasDeTarjetas.map((tarjetas, i) => (
          <section key={i} className={hojaCss} data-testid="hoja-tarjetas">
            <h2 className="text-xl font-medium">{t(textos.tarjetas, idioma)}</h2>
            <ul className="mt-4 grid grid-cols-2 gap-4">
              {tarjetas.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-current p-3 text-center"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- pictograma local para imprimir */}
                  <img
                    src={rutaPictograma(p)}
                    alt=""
                    className="h-28 w-28 bg-white object-contain"
                  />
                  <span className="text-2xl font-semibold">
                    {palabraDe(p, idioma)}
                  </span>
                </li>
              ))}
            </ul>
            <Pie idioma={idioma} n={i + 1} total={total} />
          </section>
        ))}

        <section className={hojaCss} data-testid="hoja-tablero">
          <h2 className="text-xl font-medium">{t(textos.tablero.titulo, idioma)}</h2>
          <p className="mt-2 text-sm">{t(textos.tablero.instruccion, idioma)}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {(
              [
                [textos.tablero.miTurno, textos.tablero.adulto, "◆"],
                [textos.tablero.tuTurno, textos.tablero.nino, "●"],
              ] as const
            ).map(([turno, quien, marca]) => (
              <div
                key={turno.es}
                className="rounded-xl border-2 border-current p-4"
              >
                <p className="text-2xl font-semibold">
                  <span aria-hidden="true">{marca}</span> {t(turno, idioma)}
                </p>
                <p className="text-sm">{t(quien, idioma)}</p>
                <ul className="mt-4 grid grid-cols-3 gap-3" aria-hidden="true">
                  {Array.from({ length: 6 }, (_, k) => (
                    <li
                      key={k}
                      className="aspect-square rounded-full border-2 border-current"
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Pie idioma={idioma} n={total} total={total} />
        </section>
      </div>
    </div>
  );
}
