"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  borrarTodoYRecargar,
  guardarAjustesEnStore,
  guardarPerfilEnStore,
  useAjustes,
  usePerfil,
} from "@/components/estado-local";
import { PerfilForm } from "@/components/perfil-form";
import { useHidratado } from "@/components/use-hidratado";
import { useT } from "@/lib/idioma/estado";
import type { Texto } from "@/lib/idioma";
import { nombreTema } from "@/lib/idioma/textos/nombres";
import { suMundo } from "@/lib/idioma/textos/su-mundo";
import { ajustes as textos } from "@/lib/idioma/textos/ajustes";
import { EtapaDelHabla } from "./etapa-del-habla";
import { NivelContactoVisual } from "./nivel-contacto-visual";
import { TopeDiario } from "./tope-diario";
import {
  AJUSTES_DEFECTO,
  INTENSIDADES,
  SONIDOS,
  type Apariencia,
  type Perfil,
} from "@/lib/storage/schemas";

// Below the fold and heavy (the other-home package, the recognizer panel): their code is fetched a moment AFTER
// the first paint (see `useCercaDeLaVista`), so the settings page stays inside the performance budget.
const OtraCasa = dynamic(() => import("./otra-casa").then((m) => m.OtraCasa), { ssr: false });
const Reconocedor = dynamic(() => import("./reconocedor").then((m) => m.Reconocedor), { ssr: false });

/**
 * True once the placeholder is about to scroll into view, or a moment after the first paint.
 * The heavy panels wait for it, so their code is not fetched before the first paint; the placeholder keeps
 * its height, so «Borrar mis datos» below never jumps while they load.
 */
function useCercaDeLaVista(ms = 1500): [(el: HTMLElement | null) => void, boolean] {
  const [listo, setListo] = useState(false);
  const [el, setEl] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (listo || !el) return;
    // Whichever comes first: the placeholder nears the viewport, or a moment after the first paint. The
    // timer keeps the panels reachable without scrolling; the reserved height keeps the page from jumping.
    const id = window.setTimeout(() => setListo(true), ms);
    if (typeof IntersectionObserver === "undefined") return () => window.clearTimeout(id);
    const io = new IntersectionObserver(
      (e) => {
        if (e.some((x) => x.isIntersecting)) setListo(true);
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => {
      window.clearTimeout(id);
      io.disconnect();
    };
  }, [el, listo, ms]);
  return [setEl, listo];
}

export function AjustesSesion() {
  const tx = useT();
  const guardados = useAjustes();
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);
  const [anclaPaneles, tarde] = useCercaDeLaVista();

  // El ajuste de animaciones se aplica en el <html> (el CSS lo honra igual que reduced-motion).
  useEffect(() => {
    if (!guardados) return;
    document.documentElement.dataset.reducirAnimacion = String(
      guardados.reducirAnimaciones,
    );
  }, [guardados]);

  // Esta pantalla se renderiza COMPLETA desde el servidor con los valores por defecto (no un
  // esqueleto): así su texto es el candidato LCP estático y no hay salto de layout al hidratar
  // (el esqueleto vacío costaba CLS 0.156). Al hidratar, los interruptores toman el valor real.
  const ajustes = guardados ?? AJUSTES_DEFECTO;
  const listo = guardados !== null;

  return (
    <div className="flex flex-col gap-4">
      <EtapaDelHabla />

      <NivelContactoVisual />

      <SeccionPerfil />

      <Interruptor
        id="modo-calma"
        titulo={textos.modoCalma.titulo}
        descripcion={textos.modoCalma.descripcion}
        activo={ajustes.modoCalma}
        listo={listo}
        onCambiar={(activo) =>
          guardarAjustesEnStore({ ...ajustes, modoCalma: activo })
        }
      />

      <SelectorApariencia
        apariencia={ajustes.apariencia}
        listo={listo}
        onCambiar={(apariencia) =>
          guardarAjustesEnStore({ ...ajustes, apariencia })
        }
      />

      <SelectorSensorial
        id="sonidos"
        titulo={textos.sonidos.titulo}
        ayuda={textos.sonidos.ayuda}
        elegida={textos.sonidos.elegida}
        opciones={SONIDOS.map((v) => ({ valor: v, ...textos.sonidos.opciones[v] }))}
        valor={ajustes.sonidos}
        listo={listo}
        onCambiar={(sonidos) => guardarAjustesEnStore({ ...ajustes, sonidos })}
      />

      <SelectorSensorial
        id="intensidad"
        titulo={textos.intensidad.titulo}
        ayuda={textos.intensidad.ayuda}
        elegida={textos.intensidad.elegida}
        opciones={INTENSIDADES.map((v) => ({ valor: v, ...textos.intensidad.opciones[v] }))}
        valor={ajustes.intensidad}
        listo={listo}
        onCambiar={(intensidad) =>
          guardarAjustesEnStore({ ...ajustes, intensidad })
        }
      />

      <Interruptor
        id="reducir-animaciones"
        titulo={textos.reducirAnimaciones.titulo}
        descripcion={textos.reducirAnimaciones.descripcion}
        activo={ajustes.reducirAnimaciones}
        listo={listo}
        onCambiar={(activo) =>
          guardarAjustesEnStore({ ...ajustes, reducirAnimaciones: activo })
        }
      />

      <Interruptor
        id="apuntador"
        titulo={textos.apuntador.titulo}
        descripcion={textos.apuntador.descripcion}
        activo={ajustes.apuntador}
        listo={listo}
        onCambiar={(activo) =>
          guardarAjustesEnStore({ ...ajustes, apuntador: activo })
        }
      />

      <Interruptor
        id="interruptor-recordatorio"
        titulo={textos.recordatorioCuentos.titulo}
        descripcion={textos.recordatorioCuentos.descripcion}
        activo={ajustes.recordatorioCuentos}
        listo={listo}
        estado={{
          encendido: textos.recordatorioCuentos.encendido,
          apagado: textos.recordatorioCuentos.apagado,
        }}
        onCambiar={(activo) =>
          guardarAjustesEnStore({ ...ajustes, recordatorioCuentos: activo })
        }
      />

      <TopeDiario />

      <SeccionVozFamiliar
        vozFamiliar={ajustes.vozFamiliar}
        listo={listo}
        onCambiar={(vozFamiliar) =>
          guardarAjustesEnStore({ ...ajustes, vozFamiliar })
        }
      />

      {/* Reserved height while the two heavy panels are not loaded: nothing below moves. */}
      <div ref={anclaPaneles} className={tarde ? undefined : "min-h-[44rem]"}>
        {tarde ? (
          <div className="flex flex-col gap-4">
            <Reconocedor />
            <OtraCasa />
          </div>
        ) : null}
      </div>

      <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
        <h2 className="font-medium">{tx(textos.borrar.titulo)}</h2>
        <p className="text-tinta-suave mt-2 text-sm">
          {tx(textos.borrar.antes)}
          <strong>{tx(textos.borrar.fuerte)}</strong>
          {tx(textos.borrar.despues)}
        </p>

        {confirmandoBorrado ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={borrarTodoYRecargar}
              className="bg-peligro text-sobre-peligro min-h-12 flex-1 rounded-xl px-6 font-medium"
              data-testid="confirmar-borrado"
            >
              {tx(textos.borrar.si)}
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoBorrado(false)}
              className="border-borde text-tinta min-h-12 flex-1 rounded-xl border px-6 font-medium"
            >
              {tx(textos.borrar.mejorNo)}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmandoBorrado(true)}
            className="border-peligro text-peligro mt-4 min-h-12 rounded-xl border px-6 font-medium"
            data-testid="borrar-datos"
          >
            {tx(textos.borrar.boton)}
          </button>
        )}
      </section>
    </div>
  );
}

// Apodo y temas viven aquí desde el gate del 2026-07-12: el onboarding solo aparece la primera
// vez, y la única forma de volver a esa pantalla era borrar todos los datos. Cambiarlos no toca
// ni el progreso ni los ajustes.
function SeccionPerfil() {
  const tx = useT();
  const hidratado = useHidratado();
  const perfil = usePerfil();
  const [editando, setEditando] = useState(false);

  function guardar(nuevo: Perfil) {
    guardarPerfilEnStore(nuevo);
    setEditando(false);
  }

  return (
    <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
      <h2 className="font-medium">{tx(textos.perfil.titulo)}</h2>

      {!hidratado ? (
        <div className="mt-2 min-h-11" aria-hidden="true" />
      ) : !perfil ? (
        <p className="text-tinta-suave mt-2 text-sm">
          {tx(textos.perfil.aunNo.antes)}
          <Link href="/" className="underline underline-offset-4">
            {tx(textos.perfil.aunNo.enlace)}
          </Link>
          {tx(textos.perfil.aunNo.despues)}
        </p>
      ) : editando ? (
        <PerfilForm
          inicial={perfil}
          textoGuardar={tx(textos.perfil.guardarCambios)}
          testIdGuardar="guardar-perfil"
          onGuardar={guardar}
          onCancelar={() => setEditando(false)}
        />
      ) : (
        <>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-tinta-suave">{tx(textos.perfil.apodo)}</dt>
              <dd data-testid="perfil-apodo">{perfil.apodo ?? tx(textos.perfil.sinApodo)}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-tinta-suave">{tx(textos.perfil.temas)}</dt>
              <dd data-testid="perfil-temas">
                {perfil.temas.map((tema) => tx(nombreTema[tema])).join(" · ")}
              </dd>
            </div>
            {perfil.otrasCosas && perfil.otrasCosas.length > 0 ? (
              <div className="flex gap-2">
                <dt className="text-tinta-suave">{tx(suMundo.perfil.etiqueta)}</dt>
                <dd data-testid="perfil-otras-cosas">{perfil.otrasCosas.join(" · ")}</dd>
              </div>
            ) : null}
          </dl>
          <p className="text-tinta-suave mt-3 text-sm">
            {tx(textos.perfil.noBorra)}
          </p>
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="border-borde text-tinta mt-4 min-h-12 rounded-xl border px-6 font-medium"
            data-testid="editar-perfil"
          >
            {tx(textos.perfil.cambiar)}
          </button>
        </>
      )}
    </section>
  );
}

/**
 * Claro / oscuro / el del sistema — solo para la pantalla del padre.
 * El niño ve SIEMPRE la paleta clara (regla del design-system): su mundo no cambia con la hora.
 */
const APARIENCIAS: { valor: Apariencia; nombre: Texto; nota: Texto }[] = [
  { valor: "sistema", ...textos.apariencia.opciones.sistema },
  { valor: "claro", ...textos.apariencia.opciones.claro },
  { valor: "oscuro", ...textos.apariencia.opciones.oscuro },
];

function SelectorApariencia({
  apariencia,
  listo,
  onCambiar,
}: {
  apariencia: Apariencia;
  listo: boolean;
  onCambiar: (apariencia: Apariencia) => void;
}) {
  const tx = useT();
  // El tema se aplica al documento, no solo al estado: el <html> es quien lleva la paleta.
  useEffect(() => {
    if (!listo) return;
    if (apariencia === "sistema") delete document.documentElement.dataset.tema;
    else document.documentElement.dataset.tema = apariencia;
  }, [apariencia, listo]);

  return (
    <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
      <h2 className="font-medium" id="apariencia-titulo">
        {tx(textos.apariencia.titulo)}
      </h2>
      <p className="text-tinta-suave mt-2 text-sm">
        {tx(textos.apariencia.ayudaAntes)}
        <strong>{tx(textos.apariencia.ayudaFuerte)}</strong>
        {tx(textos.apariencia.ayudaDespues)}
      </p>

      <div
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        role="group"
        aria-labelledby="apariencia-titulo"
      >
        {APARIENCIAS.map((opcion) => {
          const elegida = apariencia === opcion.valor;
          return (
            <button
              key={opcion.valor}
              type="button"
              aria-pressed={elegida}
              disabled={!listo}
              onClick={() => onCambiar(opcion.valor)}
              data-testid={`apariencia-${opcion.valor}`}
              className={[
                "min-h-11 flex-1 rounded-xl border px-4 py-2 text-left text-sm",
                elegida
                  ? "border-acento bg-acento-suave"
                  : "border-borde bg-fondo",
              ].join(" ")}
            >
              {/* El estado NO se comunica solo con color: la elegida lo dice con palabras. */}
              <span className="block font-medium">{tx(opcion.nombre)}</span>
              <span className="text-tinta-suave block text-xs">
                {elegida ? tx(textos.apariencia.elegida) : tx(opcion.nota)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * Carga sensorial (S15): un selector de pocas opciones. El estado va con palabra («Elegido»), no solo
 * con el borde de color.
 */
function SelectorSensorial<V extends string>({
  id,
  titulo,
  ayuda,
  elegida,
  opciones,
  valor,
  listo,
  onCambiar,
}: {
  id: string;
  titulo: Texto;
  ayuda: Texto;
  elegida: Texto;
  opciones: { valor: V; nombre: Texto; nota: Texto }[];
  valor: V;
  listo: boolean;
  onCambiar: (valor: V) => void;
}) {
  const tx = useT();
  return (
    <section className="bg-superficie shadow-tarjeta rounded-2xl p-5" data-testid={`ajuste-${id}`}>
      <h2 className="font-medium" id={`${id}-titulo`}>
        {tx(titulo)}
      </h2>
      <p className="text-tinta-suave mt-2 text-sm">{tx(ayuda)}</p>
      <div
        className="mt-4 flex flex-col gap-2 sm:flex-row"
        role="group"
        aria-labelledby={`${id}-titulo`}
      >
        {opciones.map((opcion) => {
          const activa = valor === opcion.valor;
          return (
            <button
              key={opcion.valor}
              type="button"
              aria-pressed={activa}
              disabled={!listo}
              onClick={() => onCambiar(opcion.valor)}
              data-testid={`${id}-${opcion.valor}`}
              className={[
                "min-h-11 flex-1 rounded-xl border px-4 py-2 text-left text-sm",
                activa ? "border-acento bg-acento-suave" : "border-borde bg-fondo",
              ].join(" ")}
            >
              <span className="block font-medium">{tx(opcion.nombre)}</span>
              <span className="text-tinta-suave block text-xs">
                {activa ? tx(elegida) : tx(opcion.nota)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

/**
 * "La voz de la familia" (S3): puerta al estudio, el toggle usar-voz-familiar, y borrar el banco
 * (aparte de "borrar mis datos"). La cobertura se lee del banco (IndexedDB) al montar.
 */
function SeccionVozFamiliar({
  vozFamiliar,
  listo,
  onCambiar,
}: {
  vozFamiliar: boolean;
  listo: boolean;
  onCambiar: (activo: boolean) => void;
}) {
  const tx = useT();
  const [grabados, setGrabados] = useState<number | null>(null);
  const [total, setTotal] = useState(0);
  const [confirmando, setConfirmando] = useState(false);

  const cargar = () => {
    void Promise.all([
      import("@/lib/banco-voz/almacen"),
      import("@/lib/banco-voz/catalogo"),
    ]).then(([{ listarIds }, { catalogoGrabable, esDeCuento }]) => {
      // El banco guarda las grabaciones de los dos idiomas: el total cuenta las posibles en ambos.
      setTotal(catalogoGrabable("es").length + catalogoGrabable("en").length);
      // Banco inaccesible (IndexedDB roto) = banco vacío: la sección no se rompe (M-1).
      listarIds()
        // La narración de los cuentos (S9) vive en el banco pero no es del catálogo: no entra a la cuenta.
        .then((ids) => setGrabados(ids.filter((id) => !esDeCuento(id)).length))
        .catch(() => setGrabados(0));
    });
  };
  useEffect(cargar, []);

  const borrarBanco = () => {
    void import("@/lib/banco-voz/almacen").then(({ vaciarBanco }) =>
      vaciarBanco().then(() => {
        setGrabados(0);
        setConfirmando(false);
      }),
    );
  };

  return (
    <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
      <h2 className="font-medium">{tx(textos.voz.titulo)}</h2>
      <p className="text-tinta-suave mt-2 text-sm">
        {tx(textos.voz.texto)}{" "}
        {grabados !== null ? (
          <>
            {tx(textos.voz.vas)}{" "}
            <strong data-testid="cobertura-ajustes">
              {tx(textos.voz.deTotal, { grabados, total })}
            </strong>{" "}
            {tx(textos.voz.conTuVoz)}
          </>
        ) : null}{" "}
        {tx(textos.voz.soloAqui)}
      </p>

      <Link
        href="/estudio"
        className="bg-acento text-sobre-acento mt-4 inline-flex min-h-12 items-center rounded-xl px-6 font-medium"
        data-testid="ir-al-estudio"
      >
        {grabados ? tx(textos.voz.gestionar) : tx(textos.voz.grabar)}
      </Link>

      <div className="border-borde mt-5 border-t pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-medium" id="voz-familiar-titulo">
              {tx(textos.voz.usar)}
            </h3>
            <p className="text-tinta-suave mt-1 text-sm">
              {tx(textos.voz.usarAyuda)}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={vozFamiliar}
            aria-labelledby="voz-familiar-titulo"
            onClick={() => onCambiar(!vozFamiliar)}
            disabled={!listo}
            data-testid="toggle-voz-familiar"
            className={[
              "relative min-h-11 w-20 shrink-0 rounded-full border transition-colors",
              vozFamiliar
                ? "bg-acento border-transparent"
                : "bg-fondo border-borde",
            ].join(" ")}
          >
            <span
              className={[
                "bg-superficie absolute top-1 h-8 w-8 rounded-full transition-all",
                vozFamiliar ? "left-11" : "left-1",
              ].join(" ")}
            />
          </button>
        </div>
      </div>

      {grabados && grabados > 0 ? (
        <div className="border-borde mt-4 border-t pt-4">
          {confirmando ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={borrarBanco}
                className="bg-peligro text-sobre-peligro min-h-11 flex-1 rounded-xl px-4 text-sm font-medium"
                data-testid="confirmar-borrar-banco"
              >
                {tx(textos.voz.siBorrar)}
              </button>
              <button
                type="button"
                onClick={() => setConfirmando(false)}
                className="border-borde text-tinta min-h-11 flex-1 rounded-xl border px-4 text-sm font-medium"
              >
                {tx(textos.voz.mejorNo)}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmando(true)}
              className="text-peligro min-h-11 text-sm underline-offset-4 hover:underline"
              data-testid="borrar-banco"
            >
              {tx(textos.voz.borrarSolo)}
            </button>
          )}
        </div>
      ) : null}
    </section>
  );
}

function Interruptor({
  id,
  titulo,
  descripcion,
  activo,
  listo,
  estado,
  onCambiar,
}: {
  id: string;
  titulo: Texto;
  descripcion: Texto;
  activo: boolean;
  /** false hasta que hidrata: aún no sabemos el valor guardado, así que no se puede tocar. */
  listo: boolean;
  /** Si viene, el estado también se dice con símbolo + texto (el color nunca va solo). */
  estado?: { encendido: Texto; apagado: Texto };
  onCambiar: (activo: boolean) => void;
}) {
  const tx = useT();
  return (
    <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium" id={`${id}-titulo`}>
            {tx(titulo)}
          </h2>
          <p className="text-tinta-suave mt-2 text-sm">{tx(descripcion)}</p>
          {estado && listo ? (
            <p
              className="mt-2 text-sm font-medium"
              data-testid={`${id}-estado`}
            >
              <span aria-hidden="true">{activo ? "✓" : "–"}</span>{" "}
              {tx(activo ? estado.encendido : estado.apagado)}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={activo}
          aria-labelledby={`${id}-titulo`}
          onClick={() => onCambiar(!activo)}
          disabled={!listo}
          data-testid={id}
          className={[
            "relative min-h-11 w-20 shrink-0 rounded-full border transition-colors",
            activo ? "bg-acento border-transparent" : "bg-fondo border-borde",
          ].join(" ")}
        >
          <span
            className={[
              "bg-fondo absolute top-1/2 h-8 w-8 -translate-y-1/2 rounded-full border shadow-suave transition-all",
              activo
                ? "border-acento left-[calc(100%-2.25rem)]"
                : "border-borde left-1",
            ].join(" ")}
            aria-hidden="true"
          />
        </button>
      </div>
    </section>
  );
}
