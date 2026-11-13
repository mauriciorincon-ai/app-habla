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
import {
  IconoAlerta,
  IconoDiana,
  IconoHecho,
  IconoInfo,
} from "@/components/iconos";
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
import { useIdioma, useT } from "@/lib/idioma/estado";
import type { Idioma, Texto } from "@/lib/idioma";
import { objetivo as txt } from "@/lib/idioma/textos/objetivo";

/** La fecha larga en el idioma de ahora (`fechaLarga` es solo español). */
function fechaEnIdioma(clave: string, idioma: "es" | "en"): string {
  if (idioma === "es") return fechaLarga(clave);
  const [anio, mes, dia] = clave.split("-").map(Number);
  return new Date(anio, mes - 1, dia).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
  });
}

/** "3 capsules · 2 pictures", con singular y plural de cada idioma. */
function listaDeAlcance(
  tx: (t: Texto, d?: Record<string, string | number>) => string,
  a: { capsulas: number; palabras: number; pares: number },
): string {
  const parte = (n: number, uno: Texto, varios: Texto) =>
    n > 0 ? `${n} ${n === 1 ? tx(uno) : tx(varios)}` : null;
  return [
    parte(a.capsulas, txt.unidades.capsulaUna, txt.unidades.capsulaVarias),
    parte(a.palabras, txt.unidades.dibujoUno, txt.unidades.dibujoVarios),
    parte(a.pares, txt.unidades.parUno, txt.unidades.parVarios),
  ]
    .filter(Boolean)
    .join(" · ");
}

type Bancos = {
  idioma: Idioma;
  capsulas: readonly Capsula[];
  pictos: readonly Pictograma[];
  pares: readonly ParGemelo[];
  parJugableEn: (par: ParGemelo, etapa: Etapa) => boolean;
  grabables: readonly ItemGrabable[];
  coincideGrabable: (objetivo: Alineacion, i: ItemGrabable) => boolean;
  /** Diccionario de ortografía general del IDIOMA activo (gate S4, bloque O; S8: uno por idioma). */
  palabras: readonly string[];
};

// Cache a nivel de módulo, uno por idioma: los bancos se cargan UNA vez por visita, y solo si el padre
// escribe. El diccionario del otro idioma jamás se descarga (cada uno pesa ≈ 200 KB).
const promesasBancos: Partial<Record<Idioma, Promise<Bancos>>> = {};
function cargarBancos(idioma: Idioma): Promise<Bancos> {
  promesasBancos[idioma] ??= Promise.all([
    import("@content/capsulas"),
    import("@content/pictogramas"),
    import("@content/pares-gemelos"),
    import("@/lib/banco-voz/catalogo"),
    import("@/lib/banco-voz/lotes"),
    idioma === "en"
      ? import("@/lib/objetivo/palabras-en").then((m) => m.PALABRAS_EN)
      : import("@/lib/objetivo/palabras-es").then((m) => m.PALABRAS_ES),
  ]).then(([capsulas, pictos, pares, catalogo, lotes, palabras]) => ({
    idioma,
    capsulas: capsulas.CAPSULAS,
    // En inglés se alinea contra la etiqueta inglesa del dibujo (`en`), no contra la española.
    pictos: idioma === "en" ? pictos.PICTOGRAMAS.map((p) => ({ ...p, palabra: p.en })) : pictos.PICTOGRAMAS,
    pares: pares.paresDe(idioma),
    parJugableEn: pares.parJugableEn,
    grabables: catalogo.catalogoGrabable(idioma),
    coincideGrabable: (objetivo, i) => lotes.coincideConObjetivo(objetivo, i),
    palabras,
  }));
  return promesasBancos[idioma]!;
}

// Sugerencias que SÍ alinean (nacen de las etiquetas reales): el padre elige una y garantiza
// coincidencia. Escribir libre también vale — y "colores" enseña el caso honesto sin matches.
// El testid sale de la clave en español (estable en los dos idiomas); lo que se escribe en el
// campo es la forma del idioma activo (S8: el alineador y el diccionario entienden los dos).
const SUGERENCIAS: readonly { testid: string; texto: Texto }[] = [
  { testid: "animales", texto: txt.sugerencias.animales },
  { testid: "la-comida", texto: txt.sugerencias.comida },
  { testid: "el-baño", texto: txt.sugerencias.bano },
  { testid: "acciones", texto: txt.sugerencias.acciones },
  { testid: "pedir-cosas", texto: txt.sugerencias.pedir },
  { testid: "los-sonidos", texto: txt.sugerencias.sonidos },
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
  const tx = useT();
  // Un parecido pregunta ("¿Quisiste decir…?"); un prefijo solo se ofrece (vas escribiendo).
  const pregunta = (s: Sugerencia) => s.tipo === "parecido";
  return (
    <>
      {app.length > 0 ? (
        <div className="mt-2">
          <p className="text-tinta-suave text-xs">
            {tx(txt.chips.estanEnLaApp)}
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
                {pregunta(s)
                  ? tx(txt.chips.quisisteDecir, { termino: s.termino })
                  : s.termino}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {orto.length > 0 ? (
        <div className="mt-2">
          <p className="text-tinta-suave text-xs">
            {tx(txt.chips.bienEscritas)}
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
                {pregunta(s)
                  ? tx(txt.chips.quisisteDecir, { termino: s.termino })
                  : s.termino}
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
  const tx = useT();
  const idioma = useIdioma();
  const hidratado = useHidratado();
  const activo = useObjetivo();
  const ajustes = useAjustes();
  const perfil = usePerfil();
  const [texto, setTexto] = useState("");
  const [guardado, setGuardado] = useState(false);
  // Paso de ortografía (gate S4, O1): si lo escrito no coincide con NADA pero se parece a un
  // término real, guardar pide un segundo vistazo — "¿quisiste decir…?" — antes de grabar.
  const [confirmando, setConfirmando] = useState(false);
  const [cargados, setBancos] = useState<Bancos | null>(null);
  // Los bancos de OTRO idioma (si el padre cambió de idioma a media pantalla) no valen: se recargan.
  const bancos = cargados?.idioma === idioma ? cargados : null;
  const inputRef = useRef<HTMLInputElement>(null);

  const limpio = texto.trim();
  const etapa = ajustes?.etapa ?? ETAPA_DEFECTO;
  const temas = perfil?.temas ?? null;

  // Carga perezosa: los bancos entran cuando hay algo que contar — el primer teclazo o un
  // objetivo YA activo (su tarjeta ahora dice su estado de alineación) — nunca antes.
  useEffect(() => {
    if ((limpio === "" && !activo) || bancos) return;
    let vivo = true;
    void cargarBancos(idioma).then((b) => {
      if (vivo) setBancos(b);
    });
    return () => {
      vivo = false;
    };
  }, [limpio, activo, bancos, idioma]);

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
    return sugerir(limpio, vocabularioDe(bancos, idioma));
  }, [bancos, limpio, idioma]);

  // Ortografía GENERAL (gate S4, bloque O — segundo remate): el diccionario embebido sugiere la
  // palabra bien escrita AUNQUE la app no la tenga («medi» → medio, media…), en su propio grupo.
  const indice = useMemo(
    () => (bancos ? indexarDiccionario(bancos.palabras) : null),
    [bancos],
  );
  const clavesApp = useMemo(
    () =>
      bancos
        ? new Set(vocabularioDe(bancos, idioma).flatMap((crudo) => normalizar(crudo)))
        : new Set<string>(),
    [bancos, idioma],
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
        /* La tarjeta dice su ESTADO (hallazgos O3+O5 del gate). Tres familias visuales pensadas
           para daltonismo (pedido del usuario): VERDE + diana (los juegos cambian), AZUL + círculo
           de info (atención con explicación: a medias o fuera de su alcance), ROJO + triángulo
           (sin contenido aún). Color + FORMA del icono + texto — nada comunica solo con color. */
        <section
          className={`flex flex-col gap-3 rounded-2xl border-l-4 p-5 ${
            estadoActivo === "sin-contenido"
              ? "bg-peligro/10 border-peligro"
              : estadoActivo === "sin-juegos" ||
                  estadoActivo === "fuera-de-alcance"
                ? "bg-info/10 border-info"
                : "bg-acento-suave/40 border-acento"
          }`}
          data-testid="objetivo-activo"
          data-estado={estadoActivo ?? undefined}
        >
          <div className="flex items-start gap-3">
            {estadoActivo === "sin-contenido" ? (
              <IconoAlerta className="text-peligro mt-0.5 h-6 w-6 shrink-0" />
            ) : estadoActivo === "sin-juegos" ||
              estadoActivo === "fuera-de-alcance" ? (
              <IconoInfo className="text-info mt-0.5 h-6 w-6 shrink-0" />
            ) : (
              <IconoDiana className="text-acento mt-0.5 h-6 w-6 shrink-0" />
            )}
            <div className="min-w-0">
              <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
                {tx(txt.activo.etiqueta)}
              </p>
              <p className="font-display mt-1 text-2xl break-words italic">
                «{activo.texto}»
              </p>
              <p className="text-tinta-suave text-sm">
                {tx(txt.activo.desde, {
                  fecha: fechaEnIdioma(activo.desde, idioma),
                })}
              </p>
              {estadoActivo === "alineado" && conteosActivo ? (
                <p
                  className="text-tinta mt-2 text-sm font-medium"
                  data-testid="objetivo-activo-alineando"
                >
                  {tx(txt.activo.alineando)}{" "}
                  {listaDeAlcance(tx, conteosActivo.alcance)}
                  .
                </p>
              ) : estadoActivo === "sin-juegos" ? (
                <p
                  className="text-tinta mt-2 text-sm font-medium"
                  data-testid="objetivo-activo-sin-juegos"
                >
                  {tx(txt.activo.sinJuegos.a)}
                  {conteosActivo && conteosActivo.estudio > 0
                    ? tx(txt.activo.sinJuegos.estudio)
                    : ""}{" "}
                  {tx(txt.activo.sinJuegos.b)}
                  <Link href="/ajustes" className="underline">
                    {tx(txt.activo.sinJuegos.enlace)}
                  </Link>
                  .
                </p>
              ) : estadoActivo === "sin-contenido" ? (
                <p
                  className="text-tinta mt-2 text-sm font-medium"
                  data-testid="objetivo-activo-sin-contenido"
                >
                  {tx(txt.activo.sinContenido)}
                </p>
              ) : estadoActivo === "fuera-de-alcance" ? (
                <p
                  className="text-tinta mt-2 text-sm font-medium"
                  data-testid="objetivo-activo-fuera"
                >
                  {tx(txt.activo.fuera.a)}
                  {conteosActivo && conteosActivo.estudio > 0
                    ? tx(txt.activo.sinJuegos.estudio)
                    : ""}{" "}
                  {tx(txt.activo.sinJuegos.b)}
                  <Link href="/ajustes" className="underline">
                    {tx(txt.activo.sinJuegos.enlace)}
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
            {tx(txt.activo.quitar)}
          </button>
        </section>
      ) : null}

      {/* UNA sola tarjeta para escribir → ver → guardar (gate S4, O1: el botón se sentía
          desconectado del campo). El preview vive ENTRE el campo y el botón, y el botón nombra
          exactamente lo que va a guardar. */}
      <section className="bg-superficie shadow-tarjeta flex flex-col gap-3 rounded-2xl p-5">
        <label htmlFor="objetivo-texto" className="font-medium">
          {activo ? tx(txt.editor.cambiarlo) : tx(txt.editor.queTrabajar)}
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
          placeholder={tx(txt.editor.placeholder)}
          maxLength={80}
          autoComplete="off"
          lang={idioma}
          spellCheck
          className="border-borde bg-fondo text-tinta min-h-14 rounded-xl border px-4 text-lg"
          data-testid="objetivo-input"
        />

        <div
          role="group"
          aria-label={tx(txt.sugerencias.grupo)}
          className="flex flex-wrap gap-2"
        >
          {SUGERENCIAS.map((s) => (
            <button
              key={s.testid}
              type="button"
              onClick={() => elegir(tx(s.texto))}
              className="border-borde text-tinta-suave min-h-11 rounded-full border px-4 text-sm"
              data-testid={`sugerencia-${s.testid}`}
            >
              {tx(s.texto)}
            </button>
          ))}
        </div>

        {/* Preview honesto: cambia mientras escribe, y cuenta SOLO lo que él verá. Con texto a
            medio camino (prefijo de un término real) NO se regaña: se acompaña con sugerencias
            vivas — el mensaje de "no está" queda para cuando de verdad está lejos (O1). */}
        <div aria-live="polite" className="min-h-[3rem]">
          {limpio === "" ? (
            <p className="text-tinta-suave text-sm">
              {tx(txt.preview.vacio)}
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
                {tx(txt.preview.vasHacia)}
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
                {tx(txt.preview.sinMatches, { limpio })}
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
              {tx(txt.preview.fuera, { limpio })}
              {conteos.estudio > 0 ? tx(txt.preview.fueraEstudio) : ""}
            </p>
          ) : (
            <p
              className="text-tinta bg-fondo rounded-xl p-4 text-sm"
              data-testid="objetivo-preview"
            >
              {tx(txt.preview.conPonePrimero, { limpio })}
              {listaDeAlcance(tx, conteos.alcance)}
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
                {tx(txt.confirmar.pregunta, { candidata })}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => void guardarTexto(candidata)}
                  className="bg-acento text-sobre-acento min-h-12 flex-1 rounded-xl px-4 font-medium"
                  data-testid="guardar-candidata"
                >
                  {tx(txt.confirmar.si, { candidata })}
                </button>
                <button
                  type="button"
                  onClick={() => void guardarTexto(texto)}
                  className="border-borde text-tinta min-h-12 flex-1 rounded-xl border px-4 font-medium"
                  data-testid="guardar-tal-cual"
                >
                  {tx(txt.confirmar.no, { limpio })}
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
                ? tx(txt.guardar.vacio)
                : tx(txt.guardar.con, {
                    texto:
                      limpio.length > 28 ? `${limpio.slice(0, 28)}…` : limpio,
                  })}
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
                <IconoHecho className="h-4 w-4 shrink-0" />
                {tx(txt.guardar.listo)}
              </>
            ) : null}
          </p>
        </div>
      </section>
    </div>
  );
}
