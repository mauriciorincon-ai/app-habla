"use client";

// La voz del ADULTO para un cuento (S9, ADR-019): graba página por página en el banco de voz LOCAL
// (IndexedDB, regla 2-bis), con ids `cuento:<id>:<página>` / `cuento-en:…`. No hay red ni export
// (ADR-011). Al salir, el desmontaje suelta el micrófono.

import { useCallback, useEffect, useState } from "react";
import { useGrabadora, type Captura } from "@/components/estudio/use-grabadora";
import { useReproductor } from "@/components/use-reproductor";
import { guardarGrabacion, pedirPersistencia } from "@/lib/banco-voz/almacen";
import { idCuento } from "@/lib/banco-voz/catalogo";
import type { CuentoLeible } from "@/lib/cuentos/estado";
import { fechaHoy } from "@/lib/fecha";
import type { Idioma } from "@/lib/idioma";
import { useT } from "@/lib/idioma/estado";
import { cuentos } from "@/lib/idioma/textos/cuentos";

const BOTON = "border-borde text-tinta min-h-11 rounded-lg border px-4 text-sm";
const PRIMARIO =
  "bg-acento text-fondo min-h-11 rounded-lg px-4 text-sm font-medium";

export function NarrarCuento({
  cuento,
  idioma,
  grabadas,
  onGrabada,
  onListo,
}: {
  cuento: CuentoLeible;
  idioma: Idioma;
  grabadas: ReadonlySet<string>;
  onGrabada: (id: string) => void;
  onListo: () => void;
}) {
  const tx = useT();
  const { estado, empezar, detener, cancelar } = useGrabadora();
  const { reproducir } = useReproductor();
  const [idx, setIdx] = useState(0);
  const [captura, setCaptura] = useState<Captura | null>(null);
  useEffect(() => () => cancelar(), [cancelar]);

  const pagina = cuento.paginas[idx];
  const id = idCuento(cuento.id, idx + 1, idioma);

  const ir = (n: number) => {
    cancelar();
    setCaptura(null);
    setIdx(n);
  };

  const parar = useCallback(async () => {
    const c = await detener();
    if (c) setCaptura(c);
  }, [detener]);

  const guardar = async () => {
    if (!captura) return;
    try {
      await guardarGrabacion(id, {
        blob: captura.blob,
        mimeType: captura.mimeType,
        duracionMs: captura.duracionMs,
        fecha: fechaHoy(),
      });
      void pedirPersistencia();
      onGrabada(id);
      setCaptura(null);
    } catch {
      // Banco inaccesible: la página queda sin grabar y se puede leer en vivo.
    }
  };

  return (
    <div
      className="border-borde mt-4 rounded-xl border p-4"
      data-testid="narrar-cuento"
    >
      <p className="text-tinta-suave text-sm">
        {tx(cuentos.narrar.pagina, {
          n: idx + 1,
          total: cuento.paginas.length,
        })}
        {grabadas.has(id) ? (
          <span className="text-tinta ml-2 font-medium">
            {tx(cuentos.narrar.grabada)}
          </span>
        ) : null}
      </p>
      <p className="mt-2 text-xl" lang={idioma}>
        {pagina.texto}
      </p>
      <p className="text-tinta-suave mt-2 text-xs">
        {tx(cuentos.narrar.soloAdulto)}
      </p>
      {estado === "denegado" || estado === "error" ? (
        <p className="mt-3 text-sm" role="status">
          {tx(cuentos.narrar.denegado)}
        </p>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        {estado === "grabando" ? (
          <button
            type="button"
            className={PRIMARIO}
            onClick={() => void parar()}
            data-testid="narrar-parar"
          >
            {tx(cuentos.narrar.detener)}
          </button>
        ) : captura ? (
          <>
            <button
              type="button"
              className={BOTON}
              onClick={() =>
                reproducir(captura.blob, {
                  clave: id,
                  duracionMs: captura.duracionMs,
                })
              }
            >
              {tx(cuentos.narrar.escuchar)}
            </button>
            <button
              type="button"
              className={PRIMARIO}
              onClick={() => void guardar()}
              data-testid="narrar-guardar"
            >
              {tx(cuentos.narrar.guardar)}
            </button>
            <button
              type="button"
              className={BOTON}
              onClick={() => setCaptura(null)}
            >
              {tx(cuentos.narrar.otraVez)}
            </button>
          </>
        ) : (
          <button
            type="button"
            className={PRIMARIO}
            onClick={() => void empezar()}
            disabled={estado === "pidiendo-permiso"}
            data-testid="narrar-grabar"
          >
            {tx(cuentos.narrar.grabar)}
          </button>
        )}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className={BOTON}
          onClick={() => ir(idx - 1)}
          disabled={idx === 0}
        >
          {tx(cuentos.narrar.anterior)}
        </button>
        <button
          type="button"
          className={BOTON}
          onClick={() => ir(idx + 1)}
          disabled={idx === cuento.paginas.length - 1}
          data-testid="narrar-siguiente"
        >
          {tx(cuentos.narrar.siguiente)}
        </button>
        <button
          type="button"
          className={BOTON}
          onClick={onListo}
          data-testid="narrar-listo"
        >
          {tx(cuentos.narrar.listo)}
        </button>
      </div>
    </div>
  );
}
