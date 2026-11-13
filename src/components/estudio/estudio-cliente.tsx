"use client";

// EL ESTUDIO DE GRABACIÓN (Outcome 1). Dos vistas: "mi banco de voz" (cobertura + escuchar/borrar)
// y el "lote guiado" (grabar ítem a ítem). Graba SOLO al adulto — el copy lo deja explícito.
// El banco vive en IndexedDB (ADR-010), SOLO en este dispositivo: nunca a la red, nunca al repo.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAjustes, usePerfil } from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { useReproductor } from "@/components/use-reproductor";
import { fechaHoy } from "@/lib/fecha";
import { alinear } from "@/lib/objetivo/alinear";
import { leerObjetivo } from "@/lib/storage/local";
import {
  catalogoGrabable,
  type CategoriaGrabable,
  type ItemGrabable,
} from "@/lib/banco-voz/catalogo";
import { calcularCobertura, type Cobertura } from "@/lib/banco-voz/cobertura";
import { coincideConObjetivo, siguienteLote } from "@/lib/banco-voz/lotes";
import type { Etapa } from "@content/schema";
import type { Tema } from "@/lib/storage/temas";
import {
  borrarGrabacion,
  guardarGrabacion,
  listarIds,
  obtenerGrabacion,
  pedirPersistencia,
} from "@/lib/banco-voz/almacen";
import {
  IconoAltavoz,
  IconoBorrar,
  IconoDiana,
  IconoHecho,
  IconoMicrofono,
  IconoRegrabar,
} from "@/components/iconos";
import { useIdioma, useT } from "@/lib/idioma/estado";
import type { Texto } from "@/lib/idioma";
import { estudio } from "@/lib/idioma/textos/estudio";
import { videoteca } from "@/lib/idioma/textos/videoteca";
import { useGrabadora, type Captura } from "./use-grabadora";

const NOMBRE_CATEGORIA: Record<ItemGrabable["categoria"], Texto> =
  estudio.categoria;

const CHIP_SALIDA =
  "text-tinta-suave border-borde inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm";

export function EstudioCliente() {
  const tx = useT();
  const idioma = useIdioma();
  const hidratado = useHidratado();
  const perfil = usePerfil();
  const ajustes = useAjustes();
  const [grabados, setGrabados] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [modo, setModo] = useState<"gestion" | "lote">("gestion");
  // Acotar el lote a UN grupo (gate S4, K5): null = el lote guiado de siempre (todo pendiente).
  const [categoriaLote, setCategoriaLote] = useState<CategoriaGrabable | null>(
    null,
  );

  useEffect(() => {
    // Si IndexedDB falla al abrir (modo privado viejo, storage roto), el estudio NO se queda en
    // esqueleto eterno: se muestra como banco vacío (auditoría S3, M-1).
    listarIds()
      .then((ids) => setGrabados(new Set(ids)))
      .catch(() => setGrabados(new Set()))
      .finally(() => setCargando(false));
  }, []);

  // La salida estándar, ARRIBA y una sola — pero "atrás" es la pantalla ANTERIOR (gate S4):
  // desde el banco se vuelve a Ajustes; desde el lote se vuelve AL BANCO (cobertura + lista),
  // no dos niveles de un salto. Al salir del lote, su desmontaje suelta el micrófono solo.
  const encabezado = (
    <header>
      {modo === "gestion" ? (
        <Link
          href="/ajustes"
          prefetch={false}
          className={CHIP_SALIDA}
          data-testid="volver-a-ajustes"
        >
          {tx(estudio.salida.ajustes)}
        </Link>
      ) : (
        <button
          type="button"
          onClick={() => setModo("gestion")}
          className={CHIP_SALIDA}
          data-testid="volver-al-banco"
        >
          {tx(estudio.salida.banco)}
        </button>
      )}
      <h1 className="font-display mt-4 text-4xl">{tx(estudio.titulo)}</h1>
      <p className="text-tinta-suave mt-3 max-w-prose">
        {tx(estudio.promesa.a)}
        <strong>{tx(estudio.promesa.negrita1)}</strong>
        {tx(estudio.promesa.b)}
        <strong>{tx(estudio.promesa.negrita2)}</strong>
        {tx(estudio.promesa.c)}
      </p>
    </header>
  );

  if (!hidratado || cargando) {
    return (
      <>
        {encabezado}
        <div className="min-h-[20rem]" aria-hidden="true" />
      </>
    );
  }

  // El catálogo es el del idioma de la pantalla (S8): en inglés se graban las palabras y consignas inglesas.
  const catalogo = catalogoGrabable(idioma);
  const cobertura = calcularCobertura(grabados, catalogo);

  const vista =
    modo === "gestion" ? (
      <Gestion
        cobertura={cobertura}
        catalogo={catalogo}
        grabados={grabados}
        onGrabar={(categoria) => {
          setCategoriaLote(categoria ?? null);
          setModo("lote");
        }}
        onBorrado={(id) =>
          setGrabados((s) => {
            const n = new Set(s);
            n.delete(id);
            return n;
          })
        }
      />
    ) : (
      <Lote
        temas={perfil?.temas ?? []}
        etapa={ajustes?.etapa ?? "palabras-sueltas"}
        grabados={grabados}
        categoria={categoriaLote}
        onGrabado={(id) => setGrabados((s) => new Set(s).add(id))}
        onSalir={() => setModo("gestion")}
      />
    );

  return (
    <>
      {encabezado}
      {vista}
    </>
  );
}

// ─── Vista: mi banco de voz (gestión) ──────────────────────────────────────────────────────────

function Gestion({
  cobertura,
  catalogo,
  grabados,
  onGrabar,
  onBorrado,
}: {
  cobertura: Cobertura;
  catalogo: ItemGrabable[];
  grabados: Set<string>;
  onGrabar: (categoria?: CategoriaGrabable) => void;
  onBorrado: (id: string) => void;
}) {
  const tx = useT();
  const grabadosItems = catalogo.filter((i) => grabados.has(i.id));

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
        <h2 className="font-medium">{tx(estudio.gestion.conTuVozVas)}</h2>
        <div className="mt-4 flex flex-col gap-4" data-testid="cobertura">
          {cobertura.porCategoria.map((c) => (
            <div key={c.categoria}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span>{tx(NOMBRE_CATEGORIA[c.categoria])}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span
                    className="font-mono tabular-nums"
                    data-testid={`cobertura-${c.categoria}`}
                  >
                    {c.grabados}/{c.total}
                  </span>
                  {/* Cada grupo con su propia puerta al lote (gate S4, K5): llegar a las
                      consignas no puede exigir atravesar las 50 palabras. */}
                  {c.grabados < c.total ? (
                    <button
                      type="button"
                      onClick={() => onGrabar(c.categoria)}
                      className="border-borde text-tinta min-h-11 rounded-lg border px-3 text-sm"
                      data-testid={`grabar-${c.categoria}`}
                      aria-label={tx(estudio.gestion.grabarGrupo, {
                        grupo: tx(NOMBRE_CATEGORIA[c.categoria]).toLowerCase(),
                      })}
                    >
                      {tx(estudio.gestion.grabar)}
                    </button>
                  ) : null}
                </span>
              </div>
              <div className="bg-acento-suave mt-1 h-2 overflow-hidden rounded-full">
                <div
                  className="bg-acento h-full rounded-full"
                  style={{
                    width: `${c.total ? (c.grabados / c.total) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-tinta-suave mt-4 text-sm">
          {tx(estudio.gestion.privacidad.a)}
          <strong>{tx(estudio.gestion.privacidad.negrita1)}</strong>
          {tx(estudio.gestion.privacidad.b)}
          <strong>{tx(estudio.gestion.privacidad.negrita2)}</strong>
          {tx(estudio.gestion.privacidad.c)}
        </p>
      </section>

      <button
        type="button"
        onClick={() => onGrabar()}
        className="bg-acento text-sobre-acento min-h-14 rounded-xl px-6 text-lg font-medium"
        data-testid="ir-al-lote"
      >
        {grabados.size === 0
          ? tx(estudio.gestion.grabarMiVoz)
          : tx(estudio.gestion.grabarMas)}
      </button>

      {grabadosItems.length > 0 ? (
        <ListaGrabados grabadosItems={grabadosItems} onBorrado={onBorrado} />
      ) : null}

      <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
        <h2 className="font-medium">{tx(videoteca.entrada.titulo)}</h2>
        <p className="text-tinta-suave mt-2 text-sm">{tx(videoteca.entrada.texto)}</p>
        <Link
          href="/estudio/videos"
          prefetch={false}
          className="border-borde text-tinta mt-4 inline-flex min-h-12 items-center rounded-xl border px-6 font-medium"
          data-testid="ir-a-videos"
        >
          {tx(videoteca.entrada.abrir)}
        </Link>
      </section>
    </div>
  );
}

/** Orden fijo de los grupos en la lista — el mismo de la cobertura, para que se lean en espejo. */
const GRUPOS: readonly CategoriaGrabable[] = [
  "palabra",
  "consigna",
  "celebracion",
];

/**
 * "Lo que ya grabaste" (gate S4, J4+J5+K5): agrupada por los tres grupos de la cobertura, filas
 * numeradas dentro de cada grupo (al borrar se NOTA que el conteo bajó), UN solo reproductor para
 * toda la lista (empezar un clip corta el anterior y la barrita de avance vive en la fila que
 * suena), y borrar en dos toques con efecto de despedida.
 */
function ListaGrabados({
  grabadosItems,
  onBorrado,
}: {
  grabadosItems: ItemGrabable[];
  onBorrado: (id: string) => void;
}) {
  const tx = useT();
  const { reproducir, sonando, progreso } = useReproductor();
  // La diana del objetivo (gate S4, O2): las grabadas que sirven al objetivo de la semana se
  // marcan — mismo predicado del lote, así la insignia y el orden jamás divergen.
  const objetivo = useMemo(() => alinear(leerObjetivo()?.texto), []);
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-medium">{tx(estudio.lista.titulo)}</h2>
      <div className="flex flex-col gap-4" data-testid="lista-grabados">
        {GRUPOS.map((grupo) => {
          const delGrupo = grabadosItems.filter((i) => i.categoria === grupo);
          if (delGrupo.length === 0) return null;
          return (
            <div key={grupo}>
              <h3
                className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase"
                data-testid={`grupo-${grupo}`}
              >
                {tx(NOMBRE_CATEGORIA[grupo])} · {delGrupo.length}
              </h3>
              <ul className="mt-2 flex flex-col gap-2">
                {delGrupo.map((item, indice) => (
                  <FilaGrabada
                    key={item.id}
                    indice={indice}
                    item={item}
                    delObjetivo={coincideConObjetivo(objetivo, item)}
                    sonando={sonando === item.id}
                    progreso={progreso}
                    onEscuchar={() =>
                      void obtenerGrabacion(item.id).then(
                        (g) =>
                          g &&
                          reproducir(g.blob, {
                            clave: item.id,
                            duracionMs: g.duracionMs,
                          }),
                      )
                    }
                    onBorrado={onBorrado}
                  />
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/** Cuánto dura el efecto de despedida de una fila borrada antes de quitarla de verdad. */
const DESPEDIDA_MS = 240;
/** Cuánto espera el "¿Seguro?" armado antes de desarmarse solo (toque accidental olvidado). */
const DESARME_MS = 4000;

function FilaGrabada({
  indice,
  item,
  delObjetivo,
  sonando,
  progreso,
  onEscuchar,
  onBorrado,
}: {
  indice: number;
  item: ItemGrabable;
  /** ¿Esta grabación sirve al objetivo de la semana? (gate S4, O2: lleva su diana.) */
  delObjetivo: boolean;
  sonando: boolean;
  progreso: () => number;
  onEscuchar: () => void;
  onBorrado: (id: string) => void;
}) {
  const tx = useT();
  // Borrar pide un segundo toque (gate S4, J5): el primero arma "¿Seguro?" y se desarma solo;
  // el segundo dispara el efecto de despedida y AHÍ SÍ borra del banco.
  const [confirmando, setConfirmando] = useState(false);
  const [despidiendose, setDespidiendose] = useState(false);
  const desarmeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (desarmeRef.current) clearTimeout(desarmeRef.current);
    },
    [],
  );

  const alTocarBorrar = () => {
    if (despidiendose) return;
    if (!confirmando) {
      setConfirmando(true);
      desarmeRef.current = setTimeout(() => setConfirmando(false), DESARME_MS);
      return;
    }
    if (desarmeRef.current) clearTimeout(desarmeRef.current);
    setDespidiendose(true);
    setTimeout(() => {
      void borrarGrabacion(item.id).then(() => onBorrado(item.id));
    }, DESPEDIDA_MS);
  };

  return (
    <li
      className={`bg-superficie border-borde flex flex-col gap-2 rounded-xl border p-3${
        despidiendose ? " fila-se-va" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-tinta-suave font-mono text-sm tabular-nums">
            {indice + 1}.
          </span>
          <span className="truncate">{item.texto}</span>
          {delObjetivo ? (
            <span
              className="text-acento inline-flex shrink-0 items-center"
              data-testid={`del-objetivo-${item.id}`}
            >
              <IconoDiana className="h-4 w-4" />
              <span className="sr-only">{tx(estudio.lista.delObjetivo)}</span>
            </span>
          ) : null}
        </span>
        <span className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onEscuchar}
            className="border-borde text-tinta flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-sm"
            data-testid={`escuchar-${item.id}`}
          >
            <IconoAltavoz className="h-4 w-4 shrink-0" />
            {tx(estudio.lista.escuchar)}
          </button>
          <button
            type="button"
            onClick={alTocarBorrar}
            className={`flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm ${
              confirmando
                ? "bg-peligro text-sobre-peligro font-medium"
                : "text-peligro"
            }`}
            data-testid={`borrar-${item.id}`}
          >
            <IconoBorrar className="h-4 w-4 shrink-0" />
            {confirmando ? tx(estudio.lista.seguro) : tx(estudio.lista.borrar)}
          </button>
        </span>
      </div>
      {sonando ? <BarraReproduccion progreso={progreso} /> : null}
    </li>
  );
}

// ─── Vista: lote guiado (grabar ítem a ítem) ───────────────────────────────────────────────────

function Lote({
  temas,
  etapa,
  grabados,
  categoria,
  onGrabado,
  onSalir,
}: {
  temas: readonly Tema[];
  etapa: Etapa;
  grabados: Set<string>;
  /** Grupo al que se acota la tanda (gate S4, K5), o null para el lote guiado completo. */
  categoria: CategoriaGrabable | null;
  onGrabado: (id: string) => void;
  onSalir: () => void;
}) {
  const tx = useT();
  const idioma = useIdioma();
  // El lote se fija al entrar (no se re-baraja al grabar cada ítem): useMemo con deps vacías
  // captura temas/grabados/objetivo del montaje a propósito (React 19: no leer refs en render).
  // S4: el objetivo de la semana pone sus palabras primero; la etapa baja las de gemelas cuando
  // aún no son jugables. Un objetivo escrito a mitad de lote aplica al SIGUIENTE lote (R5).
  const lote = useMemo(
    () =>
      siguienteLote({
        temas,
        etapa,
        grabados,
        objetivo: alinear(leerObjetivo()?.texto),
        catalogo: catalogoGrabable(idioma),
        tamano: 20,
        categoria: categoria ?? undefined,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [idx, setIdx] = useState(0);
  const [captura, setCaptura] = useState<Captura | null>(null);
  const [sinEspacio, setSinEspacio] = useState(false);
  const { estado, empezar, detener, cancelar, nivel } = useGrabadora();

  // El lote ya no tiene botón de salida propio (gate S4: la ÚNICA salida es "← Ajustes", arriba),
  // así que debe soltar el micrófono SOLO: si el padre navega en plena grabación, el desmontaje
  // cancela y libera los tracks — jamás un micrófono abierto huérfano.
  useEffect(() => () => cancelar(), [cancelar]);
  const { reproducir, sonando, progreso } = useReproductor();

  const item = lote[idx];

  const aceptar = useCallback(async () => {
    if (!captura || !item) return;
    try {
      await guardarGrabacion(item.id, {
        blob: captura.blob,
        mimeType: captura.mimeType,
        duracionMs: captura.duracionMs,
        fecha: fechaHoy(),
      });
      void pedirPersistencia();
      onGrabado(item.id);
      setCaptura(null);
      setIdx((i) => i + 1);
    } catch (e) {
      if (e instanceof DOMException && e.name === "QuotaExceededError") {
        setSinEspacio(true);
      }
    }
  }, [captura, item, onGrabado]);

  // Estado: sin espacio.
  if (sinEspacio) {
    return (
      <Aviso
        titulo={estudio.aviso.sinEspacio.titulo}
        cuerpo={estudio.aviso.sinEspacio.cuerpo}
        onSalir={onSalir}
      />
    );
  }

  // Estado: micrófono denegado / error.
  if (estado === "denegado" || estado === "error") {
    return (
      <Aviso
        titulo={
          estado === "denegado"
            ? estudio.aviso.denegado.titulo
            : estudio.aviso.error.titulo
        }
        cuerpo={
          estado === "denegado"
            ? estudio.aviso.denegado.cuerpo
            : estudio.aviso.error.cuerpo
        }
        onSalir={onSalir}
      />
    );
  }

  // Estado: éxito (se acabó el lote).
  if (idx >= lote.length) {
    return (
      <Aviso
        titulo={estudio.aviso.listo.titulo}
        cuerpo={estudio.aviso.listo.cuerpo}
        onSalir={onSalir}
        etiquetaSalir={estudio.aviso.listo.salir}
      />
    );
  }

  return (
    <section className="flex flex-col gap-6" data-testid="lote">
      <p
        className="text-tinta-suave text-center text-sm"
        data-testid="progreso-lote"
      >
        {/* "de esta tanda" (gate S4): sin el apellido, el "de 20" parecía el reto completo —
            el total real (50 palabras y más) vive en la cobertura del banco. Si la tanda está
            acotada a un grupo (K5), lo dice. */}
        <span className="font-sans font-semibold tabular-nums">{idx + 1}</span>{" "}
        {tx(estudio.lote.deEstaTanda, { n: lote.length })}
        {categoria ? ` · ${tx(NOMBRE_CATEGORIA[categoria])}` : null}
      </p>

      <div className="bg-superficie shadow-tarjeta rounded-2xl p-6 text-center">
        <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
          {tx(estudio.lote.grabateDiciendo)}
        </p>
        <p className="font-display mt-3 text-4xl" data-testid="item-texto">
          {item.texto}
        </p>
      </div>

      {captura ? (
        <div className="flex flex-col gap-3">
          {/* Cada acción con su icono a la IZQUIERDA (regla de la casa): oír → altavoz,
              guardar → check, regrabar → la flecha que da la vuelta. Pedido del gate S4 (J3). */}
          <button
            type="button"
            onClick={() =>
              reproducir(captura.blob, {
                clave: "captura",
                duracionMs: captura.duracionMs,
              })
            }
            className="border-borde text-tinta flex min-h-14 items-center justify-center gap-2 rounded-xl border px-6 text-lg font-medium"
            data-testid="escuchar-captura"
          >
            <IconoAltavoz className="h-5 w-5 shrink-0" />
            {tx(estudio.lote.escucharCaptura)}
          </button>
          {/* La señal de que SUENA (gate S4, J3): la barrita se llena con el avance del clip —
              sin ella, "Escuchar" era un acto de fe. */}
          {sonando === "captura" ? (
            <BarraReproduccion progreso={progreso} />
          ) : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void aceptar()}
              className="bg-acento text-sobre-acento flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl px-6 text-lg font-medium"
              data-testid="aceptar"
            >
              <IconoHecho className="h-5 w-5 shrink-0" />
              {tx(estudio.lote.guardar)}
            </button>
            <button
              type="button"
              onClick={() => setCaptura(null)}
              className="border-borde text-tinta flex min-h-14 flex-1 items-center justify-center gap-2 rounded-xl border px-6 text-lg font-medium"
              data-testid="regrabar"
            >
              <IconoRegrabar className="h-5 w-5 shrink-0" />
              {tx(estudio.lote.regrabar)}
            </button>
          </div>
        </div>
      ) : estado === "grabando" ? (
        <div className="flex flex-col gap-3">
          {/* El estado ("Grabando…") va como TEXTO y la acción ("Parar") como BOTÓN con fondo:
              mezclarlos en un solo rótulo hacía que el botón leyera como un aviso (gate S4, J2).
              Ojo: el fondo es `bg-peligro` — `alerta` no es un token del tema y Tailwind
              descartaba la clase en silencio, dejando el botón sin fondo. */}
          <button
            type="button"
            onClick={() => void detener().then((c) => c && setCaptura(c))}
            className="bg-peligro text-sobre-peligro min-h-16 rounded-2xl px-6 text-lg font-medium"
            data-testid="detener"
          >
            <span aria-hidden="true">■</span> {tx(estudio.lote.parar)}
          </button>
          <p className="text-peligro text-center text-sm font-medium">
            <span aria-hidden="true" className="inline-block animate-pulse">
              ●
            </span>{" "}
            {tx(estudio.lote.grabando)}
          </p>
          {/* El medidor del estudio (gate S4, stopper J2): la barra baila con tu voz — así sabes
              que YA está grabando y que te está oyendo, sin adivinar. Solo se mira: el análisis
              vive en memoria y muere con la grabación. */}
          <MedidorGrabacion nivel={nivel} />
          <p className="text-tinta-suave text-center text-sm">
            {tx(estudio.lote.medidor)}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => void empezar()}
          disabled={estado === "pidiendo-permiso"}
          className="bg-acento text-sobre-acento flex min-h-16 items-center justify-center gap-2 rounded-2xl px-6 text-lg font-medium disabled:opacity-50"
          data-testid="grabar"
        >
          <IconoMicrofono className="h-5 w-5 shrink-0" />
          {estado === "pidiendo-permiso"
            ? tx(estudio.lote.abriendoMic)
            : tx(estudio.lote.grabar)}
        </button>
      )}
    </section>
  );
}

/**
 * La barra que baila con la voz mientras se graba (stopper J2 del gate). Se pinta a 60 fps desde
 * el getter `nivel` en un rAF — cero re-renders, el mismo patrón del medidor de los juegos.
 */
function MedidorGrabacion({ nivel }: { nivel: () => number }) {
  const barraRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let id = 0;
    const pintar = () => {
      if (barraRef.current) {
        barraRef.current.style.transform = `scaleX(${Math.max(0.02, nivel())})`;
      }
      id = requestAnimationFrame(pintar);
    };
    id = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(id);
  }, [nivel]);

  return (
    <div
      className="bg-acento-suave relative h-3 w-full overflow-hidden rounded-full"
      data-testid="medidor-grabacion"
      aria-hidden="true"
    >
      <div
        ref={barraRef}
        className="bg-acento absolute inset-0 origin-left rounded-full"
        style={{ transform: "scaleX(0.02)" }}
      />
    </div>
  );
}

/**
 * La barrita que se llena con el avance del clip que suena (gate S4, J3): la señal visible de
 * "sí está reproduciendo". Mismo patrón rAF del medidor — lee el getter, cero re-renders.
 */
function BarraReproduccion({ progreso }: { progreso: () => number }) {
  const barraRef = useRef<HTMLDivElement | null>(null);
  const maxRef = useRef(0);

  useEffect(() => {
    let id = 0;
    const pintar = () => {
      if (barraRef.current) {
        // El avance solo camina hacia ADELANTE (gate S4): en los primeros instantes el reloj
        // del audio llega con jitter (retrocede mientras sincroniza) y la barra se veía saltar.
        // Un retroceso grande sí cuenta: es el clip volviendo a empezar.
        const p = progreso();
        maxRef.current =
          p < maxRef.current - 0.3 ? p : Math.max(maxRef.current, p);
        barraRef.current.style.transform = `scaleX(${maxRef.current})`;
      }
      id = requestAnimationFrame(pintar);
    };
    id = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(id);
  }, [progreso]);

  return (
    <div
      className="bg-acento-suave relative h-2 w-full overflow-hidden rounded-full"
      data-testid="progreso-escucha"
      aria-hidden="true"
    >
      <div
        ref={barraRef}
        className="bg-acento absolute inset-0 origin-left rounded-full"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}

function Aviso({
  titulo,
  cuerpo,
  onSalir,
  etiquetaSalir = estudio.aviso.volver,
}: {
  titulo: Texto;
  cuerpo: Texto;
  onSalir: () => void;
  etiquetaSalir?: Texto;
}) {
  const tx = useT();
  return (
    <section
      className="mx-auto flex max-w-md flex-col items-center gap-4 text-center"
      data-testid="aviso-estudio"
    >
      <h2 className="font-display text-3xl">{tx(titulo)}</h2>
      <p className="text-tinta-suave">{tx(cuerpo)}</p>
      <button
        type="button"
        onClick={onSalir}
        className="bg-acento text-sobre-acento min-h-14 rounded-xl px-6 font-medium"
      >
        {tx(etiquetaSalir)}
      </button>
    </section>
  );
}
