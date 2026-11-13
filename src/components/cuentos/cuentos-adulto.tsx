"use client";

// «CUENTOS DE CASA», el lado del ADULTO (S9, ADR-019). Tres cosas, en orden:
// 1. Lo que le gusta y las palabras que practican: llenan la biblioteca y son TODO lo que lleva el pedido
//    (decisión «1a»). El pedido se descarga; la app no envía nada (no hay red aquí).
// 2. Traer el lote que dejó `/bandeja`: `JSON.parse` + `validarLote` (esquema, plazos y puntajes, texto
//    dirigido a un agente, gate de sensibilidad). Lo que entra, entra `pendiente`.
// 3. Leer y aprobar o rechazar cada cuento; y poner la voz propia, página por página (banco local).

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CUENTOS } from "@content/cuentos";
import { NarrarCuento } from "@/components/cuentos/narrar-cuento";
import { cuentosActuales, guardarCuentosEnStore, useCuentos } from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { listarIds } from "@/lib/banco-voz/almacen";
import { esDeCuento } from "@/lib/banco-voz/catalogo";
import {
  armarPedido,
  separarLista,
  validarLote,
  type MotivoCuento,
} from "@/lib/bandeja/cuentos-del-mes";
import {
  conEstado,
  cuentosDelNino,
  CuentosGuardadosSchema,
  CUENTOS_VACIO,
  decidir,
  importar,
} from "@/lib/cuentos/estado";
import { fechaHoy } from "@/lib/fecha";
import { useIdioma, useT } from "@/lib/idioma/estado";
import { cuentos } from "@/lib/idioma/textos/cuentos";

const CHIP_SALIDA =
  "text-tinta-suave border-borde inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm";
const BOTON = "border-borde text-tinta min-h-11 rounded-lg border px-4 text-sm";
const PRIMARIO =
  "bg-acento text-fondo min-h-11 rounded-lg px-4 text-sm font-medium";
const TARJETA = "bg-superficie shadow-tarjeta rounded-2xl p-5";
const MAX_BYTES_LOTE = 256 * 1024;

type Resultado =
  | { tipo: "invalido" }
  | {
      tipo: "ok";
      nuevos: number;
      repetidos: number;
      rechazados: { indice: number; id: string | null; motivo: MotivoCuento }[];
    };

export function CuentosAdulto() {
  const tx = useT();
  const idioma = useIdioma();
  const hidratado = useHidratado();
  const estado = useCuentos() ?? CUENTOS_VACIO;
  // null = el adulto aún no escribió: se muestra lo guardado.
  const [editIntereses, setTextoIntereses] = useState<string | null>(null);
  const [editPalabras, setTextoPalabras] = useState<string | null>(null);
  const textoIntereses = editIntereses ?? estado.intereses.join(", ");
  const textoPalabras = editPalabras ?? estado.palabrasMeta.join(", ");
  const [aviso, setAviso] = useState<"guardado" | "error" | "falta" | null>(
    null,
  );
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [grabadas, setGrabadas] = useState<Set<string>>(new Set());
  const [narrando, setNarrando] = useState<string | null>(null);
  const entrada = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listarIds()
      .then((ids) => setGrabadas(new Set(ids.filter(esDeCuento))))
      .catch(() => setGrabadas(new Set()));
  }, []);

  const cambiar = guardarCuentosEnStore;

  const guardarGustos = () => {
    const r = CuentosGuardadosSchema.safeParse({
      ...estado,
      intereses: separarLista(textoIntereses),
      palabrasMeta: separarLista(textoPalabras),
    });
    if (!r.success) {
      setAviso("error");
      return;
    }
    cambiar(r.data);
    setAviso("guardado");
  };

  const descargarPedido = () => {
    const pedido = armarPedido(
      { intereses: estado.intereses, palabrasMeta: estado.palabrasMeta },
      fechaHoy(),
    );
    if (!pedido) {
      setAviso("falta");
      return;
    }
    // Una descarga local por acción explícita del adulto: el archivo lo guarda él donde quiera.
    const blob = new Blob([`${JSON.stringify(pedido, null, 2)}\n`], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pedido.id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const elegido = async (archivo: File | undefined) => {
    setResultado(null);
    if (!archivo) return;
    try {
      if (archivo.size > MAX_BYTES_LOTE) throw new Error("grande");
      const json: unknown = JSON.parse(await archivo.text());
      const { hashes } =
        await import("../../../tests/fixtures/sensibilidad-hashes.json");
      const r = await validarLote(json, {
        huellas: new Set(hashes),
        idsReservados: CUENTOS.map((c) => c.id),
      });
      if (!r.ok) {
        setResultado({ tipo: "invalido" });
        return;
      }
      const imp = importar(cuentosActuales(), r.aceptados, r.lote, fechaHoy());
      cambiar(imp.estado);
      setResultado({
        tipo: "ok",
        nuevos: imp.nuevos,
        repetidos: imp.repetidos,
        rechazados: r.rechazados,
      });
    } catch {
      setResultado({ tipo: "invalido" });
    } finally {
      if (entrada.current) entrada.current.value = "";
    }
  };

  const pendientes = conEstado(estado, "pendiente");
  const delNino = cuentosDelNino(estado, CUENTOS, idioma);

  return (
    <div className="flex flex-col gap-6" data-testid="cuentos-adulto">
      <header className="flex flex-col gap-3">
        <Link
          href="/estudio"
          prefetch={false}
          className={CHIP_SALIDA + " w-fit"}
        >
          {tx(cuentos.adulto.salida)}
        </Link>
        <h1 className="font-display text-3xl">{tx(cuentos.adulto.titulo)}</h1>
        <p className="text-tinta-suave">{tx(cuentos.adulto.intro)}</p>
        <Link
          href="/cuentos"
          prefetch={false}
          className={BOTON + " inline-flex w-fit items-center"}
          data-testid="ir-a-cuentos-nino"
        >
          {tx(cuentos.adulto.verLado)}
        </Link>
      </header>

      <section className={TARJETA} aria-labelledby="gustos-titulo">
        <h2 id="gustos-titulo" className="font-medium">
          {tx(cuentos.pedido.titulo)}
        </h2>
        <p className="text-tinta-suave mt-2 text-sm">
          {tx(cuentos.pedido.ayuda)}
        </p>
        <label
          className="mt-4 block text-sm font-medium"
          htmlFor="cuentos-intereses"
        >
          {tx(cuentos.pedido.intereses)}
        </label>
        <input
          id="cuentos-intereses"
          className="border-borde bg-fondo mt-1 min-h-11 w-full rounded-lg border px-3"
          value={textoIntereses}
          maxLength={140}
          autoComplete="off"
          onChange={(e) => {
            setTextoIntereses(e.target.value);
            setAviso(null);
          }}
          data-testid="cuentos-intereses"
        />
        <label
          className="mt-3 block text-sm font-medium"
          htmlFor="cuentos-palabras"
        >
          {tx(cuentos.pedido.palabras)}
        </label>
        <input
          id="cuentos-palabras"
          className="border-borde bg-fondo mt-1 min-h-11 w-full rounded-lg border px-3"
          value={textoPalabras}
          maxLength={180}
          autoComplete="off"
          onChange={(e) => {
            setTextoPalabras(e.target.value);
            setAviso(null);
          }}
          data-testid="cuentos-palabras"
        />
        <button
          type="button"
          className={PRIMARIO + " mt-4"}
          onClick={guardarGustos}
          disabled={!hidratado}
          data-testid="cuentos-guardar-gustos"
        >
          {tx(cuentos.pedido.guardar)}
        </button>
        <p className="mt-2 text-sm" role="status" data-testid="cuentos-aviso">
          {aviso === "guardado" ? tx(cuentos.pedido.guardado) : null}
          {aviso === "error" ? tx(cuentos.pedido.error) : null}
          {aviso === "falta" ? tx(cuentos.pedido.faltaGusto) : null}
        </p>

        <h3 className="mt-6 font-medium">{tx(cuentos.pedido.pedirTitulo)}</h3>
        <p className="text-tinta-suave mt-2 text-sm">
          {tx(cuentos.pedido.pedirAyuda)}
        </p>
        <button
          type="button"
          className={BOTON + " mt-3"}
          onClick={descargarPedido}
          disabled={!hidratado}
          data-testid="cuentos-descargar-pedido"
        >
          {tx(cuentos.pedido.descargar)}
        </button>
      </section>

      <section className={TARJETA} aria-labelledby="importar-titulo">
        <h2 id="importar-titulo" className="font-medium">
          {tx(cuentos.importar.titulo)}
        </h2>
        <p className="text-tinta-suave mt-2 text-sm">
          {tx(cuentos.importar.ayuda)}
        </p>
        <label
          className={BOTON + " mt-3 inline-flex cursor-pointer items-center"}
        >
          {tx(cuentos.importar.elegir)}
          <input
            ref={entrada}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            onChange={(e) => void elegido(e.target.files?.[0])}
            disabled={!hidratado}
            data-testid="cuentos-importar"
          />
        </label>
        <div
          className="mt-3 text-sm"
          role="status"
          data-testid="cuentos-resultado"
        >
          {resultado?.tipo === "invalido" ? (
            <p>{tx(cuentos.importar.invalido)}</p>
          ) : null}
          {resultado?.tipo === "ok" ? (
            <>
              <p>{tx(cuentos.importar.nuevos, { n: resultado.nuevos })}</p>
              {resultado.repetidos > 0 ? (
                <p>
                  {tx(cuentos.importar.repetidos, { n: resultado.repetidos })}
                </p>
              ) : null}
              {resultado.rechazados.length > 0 ? (
                <>
                  <p>
                    {tx(cuentos.importar.rechazados, {
                      n: resultado.rechazados.length,
                    })}
                  </p>
                  <ul className="mt-1 list-disc pl-5">
                    {resultado.rechazados.map((r) => (
                      <li key={r.indice}>
                        {r.id ?? `#${r.indice + 1}`}:{" "}
                        {tx(cuentos.importar.motivo[r.motivo])}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </section>

      <section
        className={TARJETA}
        aria-labelledby="revision-titulo"
        data-testid="cuentos-pendientes"
      >
        <h2 id="revision-titulo" className="font-medium">
          {tx(cuentos.revision.titulo)}
        </h2>
        <p className="text-tinta-suave mt-2 text-sm">
          {tx(cuentos.revision.ayuda)}
        </p>
        <p className="text-tinta-suave mt-1 text-sm">
          {tx(cuentos.revision.aprobados, {
            n: conEstado(estado, "aprobado").length,
          })}{" "}
          ·{" "}
          {tx(cuentos.revision.rechazadosCuenta, {
            n: conEstado(estado, "rechazado").length,
          })}
        </p>
        {pendientes.length === 0 ? (
          <p className="mt-3 text-sm">{tx(cuentos.revision.vacio)}</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-4">
            {pendientes.map(({ cuento }) => (
              <li
                key={cuento.id}
                className="border-borde rounded-xl border p-4"
                data-testid="cuento-pendiente"
                data-cuento-id={cuento.id}
              >
                <h3 className="font-medium" lang={idioma}>
                  {cuento.titulo[idioma]}
                </h3>
                <ol className="mt-2 list-decimal pl-5 text-sm" lang={idioma}>
                  {cuento.paginas.map((p, i) => (
                    <li key={i} className="mt-1">
                      {p.texto[idioma]}{" "}
                      <span className="text-tinta-suave">
                        ({tx(cuentos.revision.palabra)}{" "}
                        <strong>{p.palabra[idioma]}</strong>)
                      </span>
                    </li>
                  ))}
                </ol>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className={PRIMARIO}
                    onClick={() =>
                      cambiar(decidir(estado, cuento.id, "aprobado"))
                    }
                    data-testid="cuento-aprobar"
                  >
                    {tx(cuentos.revision.aprobar)}
                  </button>
                  <button
                    type="button"
                    className={BOTON}
                    onClick={() =>
                      cambiar(decidir(estado, cuento.id, "rechazado"))
                    }
                    data-testid="cuento-rechazar"
                  >
                    {tx(cuentos.revision.rechazar)}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={TARJETA} aria-labelledby="narrar-titulo">
        <h2 id="narrar-titulo" className="font-medium">
          {tx(cuentos.narrar.titulo)}
        </h2>
        <p className="text-tinta-suave mt-2 text-sm">
          {tx(cuentos.narrar.ayuda)}
        </p>
        <ul className="mt-3 flex flex-col gap-3">
          {delNino.map((c) => (
            <li
              key={c.id}
              className="border-borde rounded-xl border p-3"
              data-testid="cuento-narrable"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium" lang={idioma}>
                  {c.titulo}
                </span>
                {narrando === c.id ? null : (
                  <button
                    type="button"
                    className={BOTON}
                    onClick={() => setNarrando(c.id)}
                    data-testid="cuento-grabar-voz"
                  >
                    {tx(cuentos.narrar.grabarCuento)}
                  </button>
                )}
              </div>
              {narrando === c.id ? (
                <NarrarCuento
                  cuento={c}
                  idioma={idioma}
                  grabadas={grabadas}
                  onGrabada={(id) => setGrabadas((s) => new Set(s).add(id))}
                  onListo={() => setNarrando(null)}
                />
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
