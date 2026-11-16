"use client";

// «CUENTOS DE CASA», el lado del NIÑO (S9, ADR-019): la biblioteca de la app y SOLO los cuentos que el
// adulto aprobó. Co-uso (regla 5): el guion del adulto va primero; el adulto lee, el niño mira la palabra
// grande. La narración es la voz del adulto grabada en este dispositivo o su lectura en vivo: nunca una
// voz sintética. Sin límite de tiempo, sin puntaje (regla 6).

import { useEffect, useState } from "react";
import Link from "next/link";
import { CUENTOS } from "@content/cuentos";
import { useReproductor } from "@/components/use-reproductor";
import { useHidratado } from "@/components/use-hidratado";
import { listarIds, obtenerGrabacion } from "@/lib/banco-voz/almacen";
import { esDeCuento, idCuento } from "@/lib/banco-voz/catalogo";
import { useAjustes, useCuentos, usePerfil } from "@/components/estado-local";
import { AvisoTope, LineaHoy } from "@/components/juego/aviso-tope";
import {
  hayLineaHoy,
  minutosDeHoy,
  useTopeAlTerminar,
} from "@/components/juego/use-tope-pantalla";
import { topeValido } from "@/lib/pantalla/tope";
import { interesesParaCuentos } from "@/lib/su-mundo/intereses";
import { CUENTOS_VACIO, cuentosDelNino } from "@/lib/cuentos/estado";
import { useIdioma, useT } from "@/lib/idioma/estado";
import { cuentos } from "@/lib/idioma/textos/cuentos";

const CHIP_SALIDA =
  "text-tinta-suave border-borde inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm";
const PASO =
  "border-borde text-tinta min-h-16 rounded-2xl border px-5 text-lg disabled:opacity-40";

export function CuentosNino() {
  const tx = useT();
  const idioma = useIdioma();
  const guardado = useCuentos() ?? CUENTOS_VACIO;
  const perfil = usePerfil();
  // Sus intereses viven en el perfil (S14, ADR-026); Cuentos solo los lee.
  const estado = { ...guardado, intereses: interesesParaCuentos(perfil, guardado.intereses) };
  const [grabadas, setGrabadas] = useState<Set<string>>(new Set());
  const [abierto, setAbierto] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [conVoz, setConVoz] = useState(false);
  const { reproducir } = useReproductor();
  // The daily screen cap counts what the child watches too (S15, ADR-027); the notice waits for
  // the page to end, never cuts it.
  const topeMinutos = topeValido(useAjustes()?.topeMinutos);
  const hidratado = useHidratado();
  const { avisoMinutos, alTerminar, olvidarAviso } = useTopeAlTerminar({
    viendo: abierto !== null,
    topeMinutos,
  });

  useEffect(() => {
    listarIds()
      .then((ids) => setGrabadas(new Set(ids.filter(esDeCuento))))
      .catch(() => setGrabadas(new Set()));
  }, []);

  const lista = cuentosDelNino(estado, CUENTOS, idioma);
  const cuento = lista.find((c) => c.id === abierto) ?? null;

  const sonar = (n: number) => {
    if (!cuento) return;
    const id = idCuento(cuento.id, n + 1, idioma, cuento.paginas[n].texto);
    if (!grabadas.has(id)) return;
    void obtenerGrabacion(id)
      .then((g) => {
        if (g) reproducir(g.blob, { clave: id, duracionMs: g.duracionMs });
      })
      .catch(() => undefined);
  };

  const ir = (n: number) => {
    // The page just ended: if the cap arrived while reading, the story closes here, with calm.
    if (alTerminar()) {
      setAbierto(null);
      return;
    }
    setPagina(n);
    if (conVoz) sonar(n);
  };

  const guion = (
    <p
      className="bg-superficie shadow-tarjeta rounded-xl px-4 py-3 text-sm"
      data-testid="cuentos-guion"
    >
      {tx(cuentos.nino.guion)}
    </p>
  );

  if (!cuento) {
    return (
      <div className="flex flex-col gap-5" data-testid="cuentos-nino">
        <Link href="/" prefetch={false} className={CHIP_SALIDA + " w-fit"}>
          {tx(cuentos.nino.salida)}
        </Link>
        <h1 className="font-display text-3xl">{tx(cuentos.nino.titulo)}</h1>
        {avisoMinutos !== null ? (
          <AvisoTope minutos={avisoMinutos} />
        ) : hidratado && hayLineaHoy(topeMinutos) ? (
          <LineaHoy minutos={minutosDeHoy()} />
        ) : null}
        {guion}
        <ul className="grid gap-3 sm:grid-cols-2">
          {lista.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className="bg-superficie shadow-tarjeta flex min-h-20 w-full flex-col items-start justify-center rounded-2xl px-5 py-3 text-left"
                onClick={() => {
                  olvidarAviso();
                  setAbierto(c.id);
                  setPagina(0);
                  setConVoz(false);
                }}
                data-testid="cuento-tarjeta"
                data-cuento-id={c.id}
              >
                <span className="text-xl font-medium" lang={idioma}>
                  {c.titulo}
                </span>
                <span className="text-tinta-suave text-sm">
                  {c.origen === "lote"
                    ? tx(cuentos.nino.aprobado)
                    : tx(cuentos.nino.deLaApp)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const p = cuento.paginas[pagina];
  const idPagina = idCuento(cuento.id, pagina + 1, idioma, p.texto);
  const hayVoz = cuento.paginas.some((_, i) =>
    grabadas.has(idCuento(cuento.id, i + 1, idioma, cuento.paginas[i].texto)),
  );
  const ultima = pagina === cuento.paginas.length - 1;

  return (
    <div
      className="flex flex-col gap-5"
      data-testid="cuento-lector"
      data-cuento-id={cuento.id}
    >
      <button
        type="button"
        className={CHIP_SALIDA + " w-fit"}
        onClick={() => setAbierto(null)}
      >
        {tx(cuentos.nino.volver)}
      </button>
      {guion}
      {hayVoz ? (
        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label={tx(cuentos.narrar.titulo)}
        >
          {[false, true].map((v) => (
            <button
              key={String(v)}
              type="button"
              aria-pressed={conVoz === v}
              className={
                "min-h-11 rounded-lg border px-4 text-sm " +
                (conVoz === v
                  ? "bg-acento text-fondo border-transparent font-medium"
                  : "border-borde text-tinta")
              }
              onClick={() => {
                setConVoz(v);
                if (v) sonar(pagina);
              }}
              data-testid={v ? "modo-con-mi-voz" : "modo-leer-yo"}
            >
              {conVoz === v ? "✓ " : ""}
              {tx(v ? cuentos.nino.conMiVoz : cuentos.nino.leerYo)}
            </button>
          ))}
        </div>
      ) : null}
      <article
        className="bg-superficie shadow-tarjeta rounded-3xl p-6"
        lang={idioma}
      >
        <h1 className="font-display text-2xl">{cuento.titulo}</h1>
        <p className="text-tinta-suave mt-1 text-sm">
          {tx(cuentos.nino.pagina, {
            n: pagina + 1,
            total: cuento.paginas.length,
          })}
        </p>
        <p className="mt-5 text-3xl leading-snug" data-testid="cuento-texto">
          {p.texto}
        </p>
        <p
          className="text-acento mt-6 text-center text-6xl font-semibold"
          data-testid="cuento-palabra"
        >
          {p.palabra}
        </p>
        {conVoz ? (
          grabadas.has(idPagina) ? (
            <button
              type="button"
              className="border-borde text-tinta mx-auto mt-6 flex min-h-16 items-center rounded-2xl border px-6 text-lg"
              onClick={() => sonar(pagina)}
              data-testid="cuento-tu-voz"
            >
              {tx(cuentos.nino.tuVoz)}
            </button>
          ) : (
            <p className="text-tinta-suave mt-6 text-center text-sm">
              {tx(cuentos.nino.sinGrabar)}
            </p>
          )
        ) : null}
      </article>
      <div className="flex justify-between gap-3">
        <button
          type="button"
          className={PASO}
          onClick={() => ir(pagina - 1)}
          disabled={pagina === 0}
        >
          {tx(cuentos.nino.anterior)}
        </button>
        {ultima ? (
          <button
            type="button"
            className={PASO}
            onClick={() => {
              alTerminar();
              setAbierto(null);
            }}
            data-testid="cuento-fin"
          >
            {tx(cuentos.nino.otro)}
          </button>
        ) : (
          <button
            type="button"
            className={PASO}
            onClick={() => ir(pagina + 1)}
            data-testid="cuento-siguiente"
          >
            {tx(cuentos.nino.siguiente)}
          </button>
        )}
      </div>
    </div>
  );
}
