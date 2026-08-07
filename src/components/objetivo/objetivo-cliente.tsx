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
import Link from "next/link";
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
import {
  alinear,
  contarAlineacion,
  estadoDeAlineacion,
  normalizar,
} from "@/lib/objetivo/alinear";
import { acotarContenido } from "@/lib/objetivo/alcance";
import {
  sugerir,
  vocabularioDe,
  type Sugerencia,
} from "@/lib/objetivo/sugerir";
import {
  conoceElDiccionario,
  indexarDiccionario,
  sugerirOrtografia,
  ultimaClave,
} from "@/lib/objetivo/diccionario";
import { fechaLarga } from "@/lib/fecha";

type Bancos = {
  capsulas: readonly Capsula[];
  pictos: readonly Pictograma[];
  pares: readonly ParGemelo[];
  parJugableEn: (par: ParGemelo, etapa: Etapa) => boolean;
  grabables: readonly ItemGrabable[];
  coincideGrabable: (objetivo: Alineacion, i: ItemGrabable) => boolean;
  /** Diccionario de ortografía general (gate S4, bloque O): 10 000 palabras curadas. */
  palabrasEs: readonly string[];
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
    import("@/lib/objetivo/palabras-es"),
  ]).then(([capsulas, pictos, pares, catalogo, lotes, palabras]) => ({
    capsulas: capsulas.CAPSULAS,
    pictos: pictos.PICTOGRAMAS,
    pares: pares.PARES_GEMELOS,
    parJugableEn: pares.parJugableEn,
    grabables: catalogo.catalogoGrabable(),
    coincideGrabable: (objetivo, i) => lotes.coincideConObjetivo(objetivo, i),
    palabrasEs: palabras.PALABRAS_ES,
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

/**
 * Los dos grupos de chips del gate (bloque O): en verde lo que ESTÁ en la app (tocarlo alinea
 * la cápsula y los juegos), en neutro la palabra bien escrita que la app aún no tiene (solo
 * ortografía). Cada grupo lleva su etiqueta en texto — nada comunica solo con color (regla 4).
 */
function GruposDeChips({
  app,
  orto,
  alElegir,
}: {
  app: readonly Sugerencia[];
  orto: readonly Sugerencia[];
  alElegir: (termino: string) => void;
}) {
  // Un parecido pregunta ("¿Quisiste decir…?"); un prefijo solo se ofrece (vas escribiendo).
  const pregunta = (s: Sugerencia) => s.tipo === "parecido";
  return (
    <>
      {app.length > 0 ? (
        <div className="mt-2">
          <p className="text-tinta-suave text-xs">
            Están en la app — alinean la cápsula y los juegos:
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {app.map((s) => (
              <button
                key={s.termino}
                type="button"
                onClick={() => alElegir(s.termino)}
                className="border-acento text-tinta min-h-11 rounded-full border px-4 text-sm font-medium"
                data-testid={`sugerencia-viva-${s.termino}`}
              >
                {pregunta(s) ? `¿Quisiste decir «${s.termino}»?` : s.termino}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {orto.length > 0 ? (
        <div className="mt-2">
          <p className="text-tinta-suave text-xs">
            Bien escritas, aunque aún no están en la app:
          </p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {orto.map((s) => (
              <button
                key={s.termino}
                type="button"
                onClick={() => alElegir(s.termino)}
                className="border-borde text-tinta-suave min-h-11 rounded-full border px-4 text-sm"
                data-testid={`ortografia-${s.termino}`}
              >
                {pregunta(s) ? `¿Quisiste decir «${s.termino}»?` : s.termino}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Cuenta un texto contra el contenido: el alcance del niño (su etapa y temas), la app entera
 *  y el estudio — compartido por el preview de lo que se escribe y por la tarjeta activa. */
function contarPara(
  bancos: Bancos,
  etapa: Etapa,
  temas: readonly string[] | null,
  texto: string,
) {
  const alineacion = alinear(texto);
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
}

export function ObjetivoCliente() {
  const hidratado = useHidratado();
  const activo = useObjetivo();
  const ajustes = useAjustes();
  const perfil = usePerfil();
  const [texto, setTexto] = useState("");
  const [guardado, setGuardado] = useState(false);
  // Paso de ortografía (gate S4, O1): si lo escrito no coincide con NADA pero se parece a un
  // término real, guardar pide un segundo vistazo — "¿quisiste decir…?" — antes de grabar.
  const [confirmando, setConfirmando] = useState(false);
  const [bancos, setBancos] = useState<Bancos | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const limpio = texto.trim();
  const etapa = ajustes?.etapa ?? ETAPA_DEFECTO;
  const temas = perfil?.temas ?? null;

  // Carga perezosa: los bancos entran cuando hay algo que contar — el primer teclazo o un
  // objetivo YA activo (su tarjeta ahora dice su estado de alineación) — nunca antes.
  useEffect(() => {
    if ((limpio === "" && !activo) || bancos) return;
    let vivo = true;
    void cargarBancos().then((b) => {
      if (vivo) setBancos(b);
    });
    return () => {
      vivo = false;
    };
  }, [limpio, activo, bancos]);

  const conteos = useMemo(
    () =>
      bancos && limpio !== "" ? contarPara(bancos, etapa, temas, limpio) : null,
    [bancos, limpio, etapa, temas],
  );

  // El estado del objetivo GUARDADO (hallazgo O5 + propuesta O3 del gate): la tarjeta activa
  // dice la verdad — verde si alinea, ámbar si está fuera de su alcance o sin contenido aún.
  const conteosActivo = useMemo(
    () =>
      bancos && activo ? contarPara(bancos, etapa, temas, activo.texto) : null,
    [bancos, activo, etapa, temas],
  );
  const estadoActivo = conteosActivo
    ? estadoDeAlineacion(
        conteosActivo.alcance,
        conteosActivo.global,
        conteosActivo.estudio,
      )
    : null;

  // Sugerencias en vivo (gate S4, O1): lo que escribe, contra el vocabulario REAL del contenido.
  const sugerencias = useMemo<Sugerencia[]>(() => {
    if (!bancos || limpio === "") return [];
    return sugerir(limpio, vocabularioDe(bancos));
  }, [bancos, limpio]);

  // Ortografía GENERAL (gate S4, bloque O — segundo remate): el diccionario embebido sugiere la
  // palabra bien escrita AUNQUE la app no la tenga («medi» → medio, media…), en su propio grupo.
  const indice = useMemo(
    () => (bancos ? indexarDiccionario(bancos.palabrasEs) : null),
    [bancos],
  );
  const clavesApp = useMemo(
    () =>
      bancos
        ? new Set(vocabularioDe(bancos).flatMap((crudo) => normalizar(crudo)))
        : new Set<string>(),
    [bancos],
  );
  const ortografia = useMemo<Sugerencia[]>(() => {
    if (!indice || limpio === "") return [];
    return sugerirOrtografia(limpio, indice, clavesApp);
  }, [indice, limpio, clavesApp]);

  // ¿Lo que teclea ya es una palabra bien escrita (de la app o del idioma)? Entonces el paso de
  // ortografía no pregunta: existir en el idioma ES estar bien escrito («medios», «colores»).
  const conocido = useMemo(() => {
    if (limpio === "") return false;
    const clave = ultimaClave(limpio);
    if (clave === null) return false;
    if (clavesApp.has(clave)) return true;
    return indice !== null && conoceElDiccionario(indice, limpio);
  }, [limpio, clavesApp, indice]);

  const sinNada =
    conteos !== null &&
    conteos.alcance.vacio &&
    conteos.global.vacio &&
    conteos.estudio === 0;

  // Cada grupo trae o solo prefijos o solo parecidos (regla de silencio de cada motor).
  const appSonPrefijos = sugerencias[0]?.tipo === "prefijo";
  const ortoSonPrefijos = ortografia[0]?.tipo === "prefijo";
  const hayPrefijos = appSonPrefijos || ortoSonPrefijos;

  /** La candidata del paso de ortografía: primero lo que alinea (la app), luego el idioma —
   *  y SOLO cuando lo escrito no coincide con nada Y no es una palabra bien escrita. */
  const candidata =
    sinNada && !conocido
      ? ([
          ...(appSonPrefijos ? sugerencias : []),
          ...(ortoSonPrefijos ? ortografia : []),
          ...(appSonPrefijos ? [] : sugerencias),
          ...(ortoSonPrefijos ? [] : ortografia),
        ][0]?.termino ?? null)
      : null;

  if (!hidratado) {
    return <div className="min-h-[20rem]" aria-hidden="true" />;
  }

  function elegir(termino: string) {
    setTexto(termino);
    setGuardado(false);
    setConfirmando(false);
  }

  async function guardarTexto(elegido: string) {
    guardarObjetivoEnStore(elegido);
    // estado-capsulas arrastra la biblioteca entera: se importa solo al usarla, no en el bundle.
    const { aplicarObjetivoAHoy } =
      await import("@/components/estado-capsulas");
    aplicarObjetivoAHoy();
    setTexto("");
    setConfirmando(false);
    setGuardado(true);
    // El botón "Guardar" se deshabilita al vaciarse el campo: sin esto, el foco caería al body.
    inputRef.current?.focus();
  }

  async function guardar() {
    // El paso de ortografía: con candidata a la vista, el primer toque pregunta, no graba.
    if (candidata && !confirmando) {
      setConfirmando(true);
      return;
    }
    await guardarTexto(texto);
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
        /* La tarjeta dice su ESTADO (hallazgo O5 + propuesta O3 del gate): verde cuando alinea;
           ámbar —con el porqué en palabras— cuando está fuera del alcance del niño o cuando la
           app aún no tiene ese contenido. Nada comunica solo con color (regla 4). */
        <section
          className={`flex flex-col gap-3 rounded-2xl border-l-4 p-5 ${
            estadoActivo === "fuera-de-alcance" ||
            estadoActivo === "sin-contenido"
              ? "bg-aviso/10 border-aviso"
              : "bg-acento-suave/40 border-acento"
          }`}
          data-testid="objetivo-activo"
          data-estado={estadoActivo ?? undefined}
        >
          <div className="flex items-start gap-3">
            <IconoDiana
              className={`mt-0.5 h-6 w-6 shrink-0 ${
                estadoActivo === "fuera-de-alcance" ||
                estadoActivo === "sin-contenido"
                  ? "text-aviso"
                  : "text-acento"
              }`}
            />
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
              {estadoActivo === "sin-contenido" ? (
                <p
                  className="text-tinta mt-2 text-sm font-medium"
                  data-testid="objetivo-activo-sin-contenido"
                >
                  Priorizado, pero la app aún no tiene contenido de esto: por
                  ahora la cápsula y los juegos no cambian.
                </p>
              ) : estadoActivo === "fuera-de-alcance" ? (
                <p
                  className="text-tinta mt-2 text-sm font-medium"
                  data-testid="objetivo-activo-fuera"
                >
                  Está en la app, pero no en lo que él ve hoy (su etapa y sus
                  temas): la cápsula y los juegos no cambian.
                  {conteosActivo && conteosActivo.estudio > 0
                    ? " En el estudio sí se pone primero al grabar."
                    : ""}{" "}
                  Si quieres que los juegos lo traigan,{" "}
                  <Link href="/ajustes" className="underline">
                    revisa sus temas en Ajustes
                  </Link>
                  .
                </p>
              ) : null}
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

      {/* UNA sola tarjeta para escribir → ver → guardar (gate S4, O1: el botón se sentía
          desconectado del campo). El preview vive ENTRE el campo y el botón, y el botón nombra
          exactamente lo que va a guardar. */}
      <section className="bg-superficie shadow-tarjeta flex flex-col gap-3 rounded-2xl p-5">
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
            setConfirmando(false);
          }}
          placeholder="animales, la comida, el baño…"
          maxLength={80}
          autoComplete="off"
          lang="es"
          spellCheck
          className="border-borde bg-fondo text-tinta min-h-14 rounded-xl border px-4 text-lg"
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
              onClick={() => elegir(s)}
              className="border-borde text-tinta-suave min-h-11 rounded-full border px-4 text-sm"
              data-testid={`sugerencia-${s.replace(/\s+/g, "-")}`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Preview honesto: cambia mientras escribe, y cuenta SOLO lo que él verá. Con texto a
            medio camino (prefijo de un término real) NO se regaña: se acompaña con sugerencias
            vivas — el mensaje de "no está" queda para cuando de verdad está lejos (O1). */}
        <div aria-live="polite" className="min-h-[3rem]">
          {limpio === "" ? (
            <p className="text-tinta-suave text-sm">
              Escribe una palabra o dos. La app buscará eso en las cápsulas, en
              los dibujos y en las gemelas, y lo pondrá primero.
            </p>
          ) : conteos === null ? null : sinNada && hayPrefijos && !conocido ? (
            /* Va a media palabra hacia algo real: se acompaña, sin regaño. Una palabra COMPLETA
               bien escrita que no alinea cae al estado de abajo — el mensaje honesto — aunque
               tenga continuaciones («medio» → medios): ahí sí hay que decir la verdad. */
            <div
              className="bg-fondo rounded-xl p-4"
              data-testid="objetivo-sugerencias-vivas"
            >
              <p className="text-tinta-suave text-sm">
                ¿Vas hacia alguna de estas? Tócala y listo:
              </p>
              <GruposDeChips
                app={appSonPrefijos ? sugerencias : []}
                orto={ortoSonPrefijos ? ortografia : []}
                alElegir={elegir}
              />
            </div>
          ) : sinNada ? (
            <div
              className="bg-fondo rounded-xl p-4"
              data-testid="objetivo-sin-matches"
            >
              <p className="text-tinta-suave text-sm">
                «{limpio}» todavía no está en el contenido de la app, así que no
                hay nada que priorizar. No pasa nada: puedes guardarlo igual y
                no cambia nada, o probar con otra palabra (animales, la comida,
                acciones…).
              </p>
              <GruposDeChips
                app={sugerencias}
                orto={ortografia}
                alElegir={elegir}
              />
            </div>
          ) : conteos.alcance.vacio ? (
            <p
              className="text-tinta-suave bg-fondo rounded-xl p-4 text-sm"
              data-testid="objetivo-fuera-de-alcance"
            >
              «{limpio}» sí está en la app, pero no en lo que él ve hoy (su
              etapa y sus temas), así que la cápsula y los juegos no cambian.
              {conteos.estudio > 0
                ? " En el estudio de grabación sí se pone primero al grabar."
                : ""}
            </p>
          ) : (
            <p
              className="text-tinta bg-fondo rounded-xl p-4 text-sm"
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
          {confirmando && candidata ? (
            /* El paso de ortografía (O1): antes de grabar algo que no coincide con nada pero se
               parece a un término real, la pregunta — con las dos salidas honestas. */
            <div
              className="border-acento flex flex-col gap-2 rounded-xl border p-4"
              data-testid="objetivo-confirmar"
            >
              <p className="text-sm font-medium">
                ¿Quisiste decir «{candidata}»?
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void guardarTexto(candidata)}
                  className="bg-acento text-sobre-acento min-h-12 flex-1 rounded-xl px-4 font-medium"
                  data-testid="guardar-candidata"
                >
                  Sí, guardar «{candidata}»
                </button>
                <button
                  type="button"
                  onClick={() => void guardarTexto(texto)}
                  className="border-borde text-tinta min-h-12 flex-1 rounded-xl border px-4 font-medium"
                  data-testid="guardar-tal-cual"
                >
                  No, guardar «{limpio}» tal cual
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => void guardar()}
              disabled={limpio === ""}
              className="bg-acento text-sobre-acento min-h-14 rounded-xl px-6 text-lg font-medium disabled:opacity-50"
              data-testid="guardar-objetivo"
            >
              {limpio === ""
                ? "Guardar el objetivo"
                : `Guardar «${limpio.length > 28 ? `${limpio.slice(0, 28)}…` : limpio}»`}
            </button>
          )}
          {/* Región viva SIEMPRE montada: el contenido se inserta al guardar y el lector lo
              anuncia (una región recién insertada con texto adentro no se anuncia — auditoría). */}
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
      </section>
    </div>
  );
}
