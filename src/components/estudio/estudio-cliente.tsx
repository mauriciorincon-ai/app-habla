"use client";

// EL ESTUDIO DE GRABACIÓN (Outcome 1). Dos vistas: "mi banco de voz" (cobertura + escuchar/borrar)
// y el "lote guiado" (grabar ítem a ítem). Graba SOLO al adulto — el copy lo deja explícito.
// El banco vive en IndexedDB (ADR-010), SOLO en este dispositivo: nunca a la red, nunca al repo.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePerfil } from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { catalogoGrabable, type ItemGrabable } from "@/lib/banco-voz/catalogo";
import { calcularCobertura, type Cobertura } from "@/lib/banco-voz/cobertura";
import { siguienteLote } from "@/lib/banco-voz/lotes";
import type { Tema } from "@/lib/storage/temas";
import {
  borrarGrabacion,
  guardarGrabacion,
  listarIds,
  obtenerGrabacion,
  pedirPersistencia,
} from "@/lib/banco-voz/almacen";
import { useGrabadora, type Captura } from "./use-grabadora";

const NOMBRE_CATEGORIA: Record<ItemGrabable["categoria"], string> = {
  palabra: "Palabras",
  consigna: "Consignas del juego",
  celebracion: "Celebraciones",
};

function fechaHoy(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${dia}`;
}

/** Reproduce un Blob una vez y libera la URL. (La voz familiar, para escuchar lo grabado.) */
function reproducir(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  void audio.play().catch(() => URL.revokeObjectURL(url));
}

export function EstudioCliente() {
  const hidratado = useHidratado();
  const perfil = usePerfil();
  const [grabados, setGrabados] = useState<Set<string>>(new Set());
  const [cargando, setCargando] = useState(true);
  const [modo, setModo] = useState<"gestion" | "lote">("gestion");

  useEffect(() => {
    void listarIds().then((ids) => {
      setGrabados(new Set(ids));
      setCargando(false);
    });
  }, []);

  if (!hidratado || cargando) {
    return <div className="min-h-[20rem]" aria-hidden="true" />;
  }

  const catalogo = catalogoGrabable();
  const cobertura = calcularCobertura(grabados, catalogo);

  return modo === "gestion" ? (
    <Gestion
      cobertura={cobertura}
      catalogo={catalogo}
      grabados={grabados}
      onGrabar={() => setModo("lote")}
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
      grabados={grabados}
      onGrabado={(id) => setGrabados((s) => new Set(s).add(id))}
      onSalir={() => setModo("gestion")}
    />
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
  onGrabar: () => void;
  onBorrado: (id: string) => void;
}) {
  const grabadosItems = catalogo.filter((i) => grabados.has(i.id));

  return (
    <div className="flex flex-col gap-6">
      <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
        <h2 className="font-medium">Con tu voz vas</h2>
        <div className="mt-4 flex flex-col gap-3" data-testid="cobertura">
          {cobertura.porCategoria.map((c) => (
            <div key={c.categoria}>
              <div className="flex justify-between text-sm">
                <span>{NOMBRE_CATEGORIA[c.categoria]}</span>
                <span
                  className="font-mono tabular-nums"
                  data-testid={`cobertura-${c.categoria}`}
                >
                  {c.grabados}/{c.total}
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
          Estas grabaciones viven <strong>SOLO en este dispositivo</strong>. No
          se suben a ningún lado ni salen de aquí. La voz que grabas es la{" "}
          <strong>tuya</strong> —la de los adultos—: la de tu hijo nunca se
          graba.
        </p>
      </section>

      <button
        type="button"
        onClick={onGrabar}
        className="bg-acento text-sobre-acento min-h-14 rounded-xl px-6 text-lg font-medium"
        data-testid="ir-al-lote"
      >
        {grabados.size === 0 ? "Grabar mi voz" : "Grabar más"}
      </button>

      {grabadosItems.length > 0 ? (
        <section className="flex flex-col gap-2">
          <h2 className="font-medium">Lo que ya grabaste</h2>
          <ul className="flex flex-col gap-2" data-testid="lista-grabados">
            {grabadosItems.map((item) => (
              <FilaGrabada key={item.id} item={item} onBorrado={onBorrado} />
            ))}
          </ul>
        </section>
      ) : null}

      <nav className="text-tinta-suave text-center text-sm">
        <Link
          href="/ajustes"
          className="min-h-11 underline-offset-4 hover:underline"
        >
          Volver a Ajustes
        </Link>
      </nav>
    </div>
  );
}

function FilaGrabada({
  item,
  onBorrado,
}: {
  item: ItemGrabable;
  onBorrado: (id: string) => void;
}) {
  return (
    <li className="bg-superficie border-borde flex items-center justify-between gap-3 rounded-xl border p-3">
      <span className="truncate">{item.texto}</span>
      <span className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() =>
            void obtenerGrabacion(item.id).then((g) => g && reproducir(g.blob))
          }
          className="border-borde text-tinta min-h-11 rounded-lg border px-3 text-sm"
          data-testid={`escuchar-${item.id}`}
        >
          Escuchar
        </button>
        <button
          type="button"
          onClick={() =>
            void borrarGrabacion(item.id).then(() => onBorrado(item.id))
          }
          className="text-alerta min-h-11 rounded-lg px-3 text-sm"
          data-testid={`borrar-${item.id}`}
        >
          Borrar
        </button>
      </span>
    </li>
  );
}

// ─── Vista: lote guiado (grabar ítem a ítem) ───────────────────────────────────────────────────

function Lote({
  temas,
  grabados,
  onGrabado,
  onSalir,
}: {
  temas: readonly Tema[];
  grabados: Set<string>;
  onGrabado: (id: string) => void;
  onSalir: () => void;
}) {
  // El lote se fija al entrar (no se re-baraja al grabar cada ítem): useMemo con deps vacías
  // captura temas/grabados del montaje a propósito (React 19: no leer refs en render).
  const lote = useMemo(
    () => siguienteLote({ temas, grabados, tamano: 20 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [idx, setIdx] = useState(0);
  const [captura, setCaptura] = useState<Captura | null>(null);
  const [sinEspacio, setSinEspacio] = useState(false);
  const { estado, empezar, detener, cancelar } = useGrabadora();

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
        titulo="Se llenó el espacio del dispositivo"
        cuerpo="El banco de voz no cabe más en este dispositivo. Puedes borrar algunas grabaciones que ya no uses y seguir."
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
            ? "No pude abrir el micrófono"
            : "Algo salió mal con el micrófono"
        }
        cuerpo={
          estado === "denegado"
            ? "Para grabar tu voz, dale permiso al micrófono desde el candado de la barra de direcciones y vuelve a intentar."
            : "No pude usar el micrófono. Revisa que ningún otro programa lo esté usando y vuelve a intentar."
        }
        onSalir={onSalir}
      />
    );
  }

  // Estado: éxito (se acabó el lote).
  if (idx >= lote.length) {
    return (
      <Aviso
        titulo="¡Listo por ahora!"
        cuerpo="Grabaste todo lo que había pendiente en este lote. Tu voz ya suena en los juegos. Puedes volver cuando quieras a grabar más."
        onSalir={onSalir}
        etiquetaSalir="Ver mi banco de voz"
      />
    );
  }

  return (
    <section className="flex flex-col gap-6" data-testid="lote">
      <p
        className="text-tinta-suave text-center text-sm"
        data-testid="progreso-lote"
      >
        <span className="font-sans font-semibold tabular-nums">{idx + 1}</span>{" "}
        de {lote.length}
      </p>

      <div className="bg-superficie shadow-tarjeta rounded-2xl p-6 text-center">
        <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
          Grábate diciendo
        </p>
        <p className="font-display mt-3 text-4xl" data-testid="item-texto">
          {item.texto}
        </p>
      </div>

      {captura ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => reproducir(captura.blob)}
            className="border-borde text-tinta min-h-14 rounded-xl border px-6 text-lg font-medium"
            data-testid="escuchar-captura"
          >
            Escuchar cómo quedó
          </button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => void aceptar()}
              className="bg-acento text-sobre-acento min-h-14 flex-1 rounded-xl px-6 text-lg font-medium"
              data-testid="aceptar"
            >
              Está bien, guardar
            </button>
            <button
              type="button"
              onClick={() => setCaptura(null)}
              className="border-borde text-tinta min-h-14 flex-1 rounded-xl border px-6 text-lg font-medium"
              data-testid="regrabar"
            >
              Regrabar
            </button>
          </div>
        </div>
      ) : estado === "grabando" ? (
        <button
          type="button"
          onClick={() => void detener().then((c) => c && setCaptura(c))}
          className="bg-alerta text-sobre-peligro min-h-16 rounded-2xl px-6 text-lg font-medium"
          data-testid="detener"
        >
          ● Grabando… toca para parar
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void empezar()}
          disabled={estado === "pidiendo-permiso"}
          className="bg-acento text-sobre-acento min-h-16 rounded-2xl px-6 text-lg font-medium disabled:opacity-50"
          data-testid="grabar"
        >
          {estado === "pidiendo-permiso" ? "Abriendo el micrófono…" : "Grabar"}
        </button>
      )}

      <button
        type="button"
        onClick={() => {
          cancelar();
          onSalir();
        }}
        className="text-tinta-suave mx-auto min-h-11 text-sm underline-offset-4 hover:underline"
        data-testid="salir-lote"
      >
        Terminar por ahora
      </button>
    </section>
  );
}

function Aviso({
  titulo,
  cuerpo,
  onSalir,
  etiquetaSalir = "Volver",
}: {
  titulo: string;
  cuerpo: string;
  onSalir: () => void;
  etiquetaSalir?: string;
}) {
  return (
    <section
      className="mx-auto flex max-w-md flex-col items-center gap-4 text-center"
      data-testid="aviso-estudio"
    >
      <h2 className="font-display text-3xl">{titulo}</h2>
      <p className="text-tinta-suave">{cuerpo}</p>
      <button
        type="button"
        onClick={onSalir}
        className="bg-acento text-sobre-acento min-h-14 rounded-xl px-6 font-medium"
      >
        {etiquetaSalir}
      </button>
    </section>
  );
}
