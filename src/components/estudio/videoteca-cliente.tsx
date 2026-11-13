"use client";

// LA VIDEOTECA DE LA FAMILIA (S8). El adulto ELIGE clips de su galería (<input type="file"> sin
// `capture`: la app NO abre la cámara, regla dura 2) y los mira con su hijo como utilería del
// juego. Los clips viven SOLO en este dispositivo (IndexedDB `habla-videoteca`); no hay red, ni
// exportación, ni descarga. Borrar es de un toque (dos, para confirmar), de uno o de todos.

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useHidratado } from "@/components/use-hidratado";
import { fechaHoy } from "@/lib/fecha";
import { pedirPersistencia } from "@/lib/banco-voz/almacen";
import { useT } from "@/lib/idioma/estado";
import { videoteca } from "@/lib/idioma/textos/videoteca";
import {
  borrarClip,
  eliminarVideoteca,
  guardarClip,
  listarClips,
  obtenerClip,
  type ClipMeta,
} from "@/lib/videoteca/almacen";
import { leerDuracion } from "@/lib/videoteca/duracion";
import {
  CONDUCTAS,
  MAX_BYTES,
  MAX_CLIPS,
  MAX_DURACION_S,
  limpiarQuien,
  revisarClip,
  type Conducta,
  type MotivoRechazo,
} from "@/lib/videoteca/reglas";

const CHIP_SALIDA =
  "text-tinta-suave border-borde inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm";
const BOTON = "border-borde text-tinta min-h-11 rounded-lg border px-4 text-sm";

export function VideotecaCliente() {
  const tx = useT();
  const hidratado = useHidratado();
  const [clips, setClips] = useState<ClipMeta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [conducta, setConducta] = useState<Conducta>("saludar");
  const [quien, setQuien] = useState("");
  const [error, setError] = useState<MotivoRechazo | "almacenamiento" | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [avisoBorrado, setAvisoBorrado] = useState(false);
  const [confirmandoTodos, setConfirmandoTodos] = useState(false);
  const entrada = useRef<HTMLInputElement>(null);

  const cargar = useCallback(() => {
    // IndexedDB roto = videoteca vacía: la pantalla nunca se queda en esqueleto.
    return listarClips()
      .then(setClips)
      .catch(() => setClips([]))
      .finally(() => setCargando(false));
  }, []);
  useEffect(() => {
    void cargar();
  }, [cargar]);

  const elegido = async (archivo: File | undefined) => {
    if (!archivo) return;
    setError(null);
    setAvisoBorrado(false);
    setGuardando(true);
    try {
      const duracion = await leerDuracion(archivo);
      const v = revisarClip(archivo, duracion, clips.length);
      if (!v.ok) {
        setError(v.motivo);
        return;
      }
      const meta: ClipMeta = {
        id: `clip-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        conducta,
        quien: limpiarQuien(quien),
        mimeType: archivo.type,
        duracionS: duracion === null ? 0 : Math.round(duracion),
        bytes: archivo.size,
        fecha: fechaHoy(),
      };
      await guardarClip(meta, archivo);
      void pedirPersistencia();
      setQuien("");
      await cargar();
    } catch {
      // Honesto: si el almacenamiento falló, no se guardó nada y se dice.
      setError("almacenamiento");
    } finally {
      setGuardando(false);
      if (entrada.current) entrada.current.value = "";
    }
  };

  const borrarTodos = () => {
    if (!confirmandoTodos) {
      setConfirmandoTodos(true);
      return;
    }
    void eliminarVideoteca().then(() => {
      setClips([]);
      setConfirmandoTodos(false);
      setAvisoBorrado(true);
    });
  };

  const encabezado = (
    <header>
      <Link href="/estudio" prefetch={false} className={CHIP_SALIDA} data-testid="volver-al-estudio">
        {tx(videoteca.salida)}
      </Link>
      <h1 className="font-display mt-4 text-4xl">{tx(videoteca.titulo)}</h1>
      <p className="text-tinta-suave mt-3 max-w-prose" data-testid="videoteca-promesa">
        {tx(videoteca.promesa.a)}
        <strong>{tx(videoteca.promesa.negrita1)}</strong>
        {tx(videoteca.promesa.b)}
        <strong>{tx(videoteca.promesa.negrita2)}</strong>
        {tx(videoteca.promesa.c)}
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

  return (
    <>
      {encabezado}

      <section className="bg-superficie shadow-tarjeta rounded-2xl p-5" aria-labelledby="anadir-titulo">
        <h2 className="font-medium" id="anadir-titulo">
          {tx(videoteca.anadir.titulo)}
        </h2>
        <fieldset className="mt-4">
          <legend className="text-sm">{tx(videoteca.anadir.queMuestra)}</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CONDUCTAS.map((c) => (
              <label
                key={c}
                className={`border-borde flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border px-4 text-sm ${
                  conducta === c ? "bg-acento-suave border-acento font-medium" : ""
                }`}
              >
                <input
                  type="radio"
                  name="conducta"
                  value={c}
                  checked={conducta === c}
                  onChange={() => setConducta(c)}
                  data-testid={`conducta-${c}`}
                />
                <span>{tx(videoteca.conducta[c])}</span>
                {conducta === c ? <span aria-hidden="true">✓</span> : null}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="mt-4 block text-sm">
          {tx(videoteca.anadir.quien)}
          <input
            type="text"
            value={quien}
            onChange={(e) => setQuien(e.target.value)}
            maxLength={40}
            placeholder={tx(videoteca.anadir.quienEjemplo)}
            className="border-borde bg-fondo mt-1 block min-h-11 w-full rounded-lg border px-3"
            data-testid="clip-quien"
          />
        </label>

        <label
          className="bg-acento text-sobre-acento mt-4 inline-flex min-h-12 cursor-pointer items-center rounded-xl px-6 font-medium"
          data-testid="clip-elegir"
        >
          {guardando ? tx(videoteca.anadir.guardando) : tx(videoteca.anadir.elegir)}
          {/* Sin `capture`: el selector abre la galería, jamás la cámara. */}
          <input
            ref={entrada}
            type="file"
            accept="video/*"
            className="sr-only"
            disabled={guardando}
            onChange={(e) => void elegido(e.target.files?.[0])}
            data-testid="clip-archivo"
          />
        </label>
        <p className="text-tinta-suave mt-3 text-sm">
          {tx(videoteca.anadir.limites, {
            segundos: MAX_DURACION_S,
            megas: Math.round(MAX_BYTES / (1024 * 1024)),
            clips: MAX_CLIPS,
          })}
        </p>
        {error ? (
          <p role="alert" className="text-peligro mt-3 text-sm font-medium" data-testid="clip-error">
            <span aria-hidden="true">⚠ </span>
            {tx(videoteca.error[error])}
          </p>
        ) : null}
      </section>

      <section aria-labelledby="clips-titulo" className="flex flex-col gap-4">
        <h2 className="font-medium" id="clips-titulo">
          {tx(videoteca.lista.titulo)}
        </h2>
        {avisoBorrado ? (
          <p role="status" className="text-tinta-suave text-sm" data-testid="clips-borrados">
            {tx(videoteca.lista.borradoTodos)}
          </p>
        ) : null}
        {clips.length === 0 ? (
          <p className="text-tinta-suave" data-testid="clips-vacio">
            {tx(videoteca.lista.vacio)}
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-4" data-testid="clips-lista">
              {clips.map((c) => (
                <Clip
                  key={c.id}
                  clip={c}
                  onBorrado={() => setClips((l) => l.filter((x) => x.id !== c.id))}
                />
              ))}
            </ul>
            <button
              type="button"
              onClick={borrarTodos}
              className={`${BOTON} self-start`}
              data-testid="clips-borrar-todos"
            >
              {confirmandoTodos ? tx(videoteca.lista.seguroTodos) : tx(videoteca.lista.borrarTodos)}
            </button>
          </>
        )}
      </section>
    </>
  );
}

function Clip({ clip, onBorrado }: { clip: ClipMeta; onBorrado: () => void }) {
  const tx = useT();
  const [url, setUrl] = useState<string | null>(null);
  const [sonido, setSonido] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const nombre = tx(videoteca.conducta[clip.conducta]);

  // El blob: es local; se suelta al cerrar o al desmontar.
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);

  const ver = async () => {
    if (url) {
      setUrl(null);
      return;
    }
    const blob = await obtenerClip(clip.id).catch(() => null);
    if (blob) setUrl(URL.createObjectURL(blob));
  };

  const borrar = () => {
    if (!confirmando) {
      setConfirmando(true);
      return;
    }
    void borrarClip(clip.id).then(onBorrado);
  };

  return (
    <li className="bg-superficie shadow-tarjeta rounded-2xl p-4" data-testid={`clip-${clip.id}`}>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="bg-acento-suave rounded-full px-3 py-1 text-sm font-medium">
          {tx(videoteca.lista.clipDe, { conducta: nombre })}
        </span>
        {clip.quien ? <span className="text-sm">{clip.quien}</span> : null}
        <span className="text-tinta-suave ml-auto font-mono text-sm tabular-nums">
          {clip.fecha}
          {clip.duracionS > 0 ? ` · ${tx(videoteca.lista.duracion, { s: clip.duracionS })}` : ""}
        </span>
      </div>
      {url ? (
        <video
          src={url}
          loop
          autoPlay
          playsInline
          controls
          muted={!sonido}
          className="mt-3 max-h-80 w-full rounded-xl bg-black"
          data-testid="clip-video"
        />
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => void ver()}
          className={BOTON}
          aria-label={url ? undefined : tx(videoteca.lista.verClip, { conducta: nombre })}
          data-testid={`clip-ver-${clip.id}`}
        >
          {url ? tx(videoteca.lista.cerrar) : tx(videoteca.lista.ver)}
        </button>
        {url ? (
          <button
            type="button"
            onClick={() => setSonido((s) => !s)}
            aria-pressed={sonido}
            className={BOTON}
            data-testid="clip-sonido"
          >
            {sonido ? tx(videoteca.lista.conSonido) : tx(videoteca.lista.sinSonido)}
          </button>
        ) : null}
        <button
          type="button"
          onClick={borrar}
          className={BOTON}
          aria-label={confirmando ? undefined : tx(videoteca.lista.borrarClip, { conducta: nombre })}
          data-testid={`clip-borrar-${clip.id}`}
        >
          {confirmando ? tx(videoteca.lista.seguro) : tx(videoteca.lista.borrar)}
        </button>
      </div>
    </li>
  );
}
