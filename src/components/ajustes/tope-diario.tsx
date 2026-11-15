"use client";

// «Sesiones cortas» (S12, ADR-024): el adulto elige entre 5 y 10 minutos de juego por día (10 por
// defecto). Al llegar, el juego se cierra con calma y el adulto recibe un aviso; nunca bloquea nada.
// El contador es local y no viaja al archivo de la otra casa. La opción elegida no se marca solo con
// color: `aria-pressed` + una marca de verificación.

import { guardarAjustesEnStore, useAjustes } from "@/components/estado-local";
import { IconoHecho } from "@/components/iconos";
import { useHidratado } from "@/components/use-hidratado";
import { useT } from "@/lib/idioma/estado";
import { tope } from "@/lib/idioma/textos/voz-juegos";
import {
  TOPE_MAXIMO_MIN,
  TOPE_MINIMO_MIN,
  topeValido,
} from "@/lib/pantalla/tope";
import { AJUSTES_DEFECTO } from "@/lib/storage/schemas";

const OPCIONES = Array.from(
  { length: TOPE_MAXIMO_MIN - TOPE_MINIMO_MIN + 1 },
  (_, i) => TOPE_MINIMO_MIN + i,
);

export function TopeDiario() {
  const tx = useT();
  const hidratado = useHidratado();
  const guardados = useAjustes();
  const ajustes = guardados ?? AJUSTES_DEFECTO;
  const actual = topeValido(ajustes.topeMinutos);

  return (
    <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
      <h2 className="font-medium">{tx(tope.ajustes.titulo)}</h2>
      <p className="text-tinta-suave mt-2 text-sm">{tx(tope.ajustes.cuerpo)}</p>
      <fieldset className="mt-4" data-testid="tope-diario">
        <legend className="text-sm font-medium">{tx(tope.ajustes.etiqueta)}</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {OPCIONES.map((n) => {
            const activa = hidratado && actual === n;
            return (
              <button
                key={n}
                type="button"
                disabled={!hidratado}
                aria-pressed={activa}
                data-testid={`tope-${n}`}
                onClick={() => guardarAjustesEnStore({ ...ajustes, topeMinutos: n })}
                className={[
                  "flex min-h-11 items-center gap-1.5 rounded-xl border px-4 text-sm",
                  activa
                    ? "border-acento bg-acento-suave/50 font-medium"
                    : "border-borde bg-fondo",
                ].join(" ")}
              >
                {activa ? <IconoHecho className="text-acento size-4" /> : null}
                {tx(tope.ajustes.opcion, { n })}
              </button>
            );
          })}
        </div>
      </fieldset>
    </section>
  );
}
