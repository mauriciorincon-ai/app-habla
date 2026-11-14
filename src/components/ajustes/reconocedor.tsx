"use client";

// «¿Dijo la palabra?» en Ajustes (S11, ADR-023). Todo es acción del adulto: el reconocedor viene APAGADO;
// encenderlo descarga el modelo del idioma actual (≈ 40 MB, con aviso previo, desde la propia app) y se
// puede borrar. El segundo interruptor (la luz suave para el niño) solo existe con el reconocedor
// encendido. Abajo, el conteo local 2×2: cuatro números de este aparato, jamás en el archivo de la otra casa.

import { useEffect, useState } from "react";
import { guardarAjustesEnStore, useAjustes } from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { useIdioma, useT } from "@/lib/idioma/estado";
import { reconocedor as txr } from "@/lib/idioma/textos/reconocedor";
import {
  borrar,
  descargar,
  estaDescargado,
  IDIOMAS_RECONOCEDOR,
  type IdiomaReconocedor,
} from "@/lib/reconocer/modelo";
import {
  acuerdo,
  CONTEO_VACIO,
  leerConteo,
  MINIMO_PARA_DECIR,
  totalConteo,
  type Conteo,
} from "@/lib/reconocer/conteo";
import { AJUSTES_DEFECTO } from "@/lib/storage/schemas";

type Estado = "reposo" | "descargando" | "error";

export function Reconocedor() {
  const tx = useT();
  const idioma = useIdioma();
  const hidratado = useHidratado();
  const guardados = useAjustes();
  const ajustes = guardados ?? AJUSTES_DEFECTO;
  const listo = hidratado && guardados !== null;
  const [estado, setEstado] = useState<Estado>("reposo");
  const [pct, setPct] = useState(0);
  const [bajados, setBajados] = useState<Record<IdiomaReconocedor, boolean>>({
    es: false,
    en: false,
  });
  const [conteo, setConteo] = useState<Conteo>(CONTEO_VACIO);
  const [borrado, setBorrado] = useState(false);

  async function refrescar() {
    setBajados({
      es: await estaDescargado("es"),
      en: await estaDescargado("en"),
    });
    setConteo(leerConteo());
  }
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads the device's cache once on mount
    if (hidratado) void refrescar();
  }, [hidratado]);

  async function bajar(i: IdiomaReconocedor): Promise<boolean> {
    setEstado("descargando");
    setPct(0);
    try {
      await descargar(i, (p) =>
        setPct(Math.min(100, Math.round((p.bytes / Math.max(1, p.total)) * 100))),
      );
      setEstado("reposo");
      await refrescar();
      return true;
    } catch {
      setEstado("error");
      return false;
    }
  }

  async function alternar() {
    setBorrado(false);
    if (ajustes.reconocedor) {
      guardarAjustesEnStore({ ...ajustes, reconocedor: false });
      return;
    }
    // Turning it on downloads this language's model first; if it fails the switch stays off.
    if (!bajados[idioma] && !(await bajar(idioma))) return;
    guardarAjustesEnStore({ ...ajustes, reconocedor: true });
  }

  async function borrarTodoElReconocedor() {
    guardarAjustesEnStore({
      ...ajustes,
      reconocedor: false,
      animacionReconocedor: false,
    });
    await borrar();
    await refrescar();
    setBorrado(true);
  }

  const otro: IdiomaReconocedor = IDIOMAS_RECONOCEDOR.find((i) => i !== idioma)!;
  const hayAlgo = bajados.es || bajados.en;
  const total = totalConteo(conteo);
  const a = acuerdo(conteo);

  return (
    <section
      className="bg-superficie shadow-tarjeta rounded-2xl p-5"
      data-testid="seccion-reconocedor"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium" id="reconocedor-titulo">
            {tx(txr.ajustes.titulo)}
          </h2>
          <p className="text-tinta-suave mt-2 text-sm">
            {tx(txr.ajustes.descripcion)}
          </p>
          <p className="text-tinta-suave mt-2 text-sm">
            {tx(txr.ajustes.aviso)}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={ajustes.reconocedor}
          aria-labelledby="reconocedor-titulo"
          onClick={() => void alternar()}
          disabled={!listo || estado === "descargando"}
          data-testid="reconocedor"
          className={[
            "relative min-h-11 w-20 shrink-0 rounded-full border transition-colors",
            ajustes.reconocedor
              ? "bg-acento border-transparent"
              : "bg-fondo border-borde",
          ].join(" ")}
        >
          <span
            className={[
              "bg-fondo absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border shadow-suave transition-all",
              ajustes.reconocedor
                ? "border-acento left-[calc(100%-2.25rem)]"
                : "border-borde left-1",
            ].join(" ")}
            aria-hidden="true"
          />
        </button>
      </div>

      <p
        className="text-tinta-suave mt-3 text-sm"
        aria-live="polite"
        data-testid="reconocedor-estado"
      >
        {estado === "descargando"
          ? tx(txr.ajustes.descargando, { pct })
          : estado === "error"
            ? tx(txr.ajustes.error)
            : ajustes.reconocedor && bajados[idioma]
              ? tx(txr.ajustes.listo)
              : borrado
                ? tx(txr.ajustes.borrado)
                : ""}
      </p>

      {ajustes.reconocedor ? (
        <div className="mt-4 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-sm font-medium" id="animacion-titulo">
                {tx(txr.ajustes.animacion.titulo)}
              </h3>
              <p className="text-tinta-suave mt-1 text-sm">
                {tx(txr.ajustes.animacion.descripcion)}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={ajustes.animacionReconocedor}
              aria-labelledby="animacion-titulo"
              onClick={() =>
                guardarAjustesEnStore({
                  ...ajustes,
                  animacionReconocedor: !ajustes.animacionReconocedor,
                })
              }
              data-testid="animacion-reconocedor"
              className={[
                "relative min-h-11 w-20 shrink-0 rounded-full border transition-colors",
                ajustes.animacionReconocedor
                  ? "bg-acento border-transparent"
                  : "bg-fondo border-borde",
              ].join(" ")}
            >
              <span
                className={[
                  "bg-fondo absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border shadow-suave transition-all",
                  ajustes.animacionReconocedor
                    ? "border-acento left-[calc(100%-2.25rem)]"
                    : "border-borde left-1",
                ].join(" ")}
                aria-hidden="true"
              />
            </button>
          </div>

          {!bajados[otro] ? (
            <button
              type="button"
              onClick={() => void bajar(otro)}
              disabled={estado === "descargando"}
              data-testid="bajar-otro-idioma"
              className="border-borde text-tinta min-h-11 self-start rounded-xl border px-4 text-sm"
            >
              {tx(txr.ajustes.otroIdioma, {
                idioma: tx(txr.ajustes.idiomaNombre[otro]),
              })}
            </button>
          ) : null}

          <div data-testid="conteo-reconocedor">
            <h3 className="text-sm font-medium">
              {tx(txr.ajustes.conteo.titulo)}
            </h3>
            <p className="text-tinta-suave mt-1 text-sm">
              {tx(txr.ajustes.conteo.intro)}
            </p>
            <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 text-sm">
              {(["siSi", "siNo", "noSi", "noNo"] as const).map((k) => (
                <div key={k} className="contents">
                  <dt className="text-tinta-suave">
                    {tx(txr.ajustes.conteo[k])}
                  </dt>
                  <dd
                    className="font-sans font-semibold tabular-nums"
                    data-testid={`conteo-${k}`}
                  >
                    {conteo[k]}
                  </dd>
                </div>
              ))}
            </dl>
            <p
              className="text-tinta-suave mt-2 text-sm"
              data-testid="conteo-lectura"
            >
              {a === null
                ? tx(txr.ajustes.conteo.pocos, {
                    n: MINIMO_PARA_DECIR - total,
                  })
                : tx(txr.ajustes.conteo.acuerdo, { pct: Math.round(a * 100) })}
            </p>
          </div>
        </div>
      ) : null}

      {hayAlgo ? (
        <button
          type="button"
          onClick={() => void borrarTodoElReconocedor()}
          data-testid="borrar-reconocedor"
          className="border-peligro text-peligro mt-4 min-h-11 rounded-xl border px-4 text-sm font-medium"
        >
          {tx(txr.ajustes.borrar)}
        </button>
      ) : null}
    </section>
  );
}
