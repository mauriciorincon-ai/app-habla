"use client";

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
import { ajustes as textos } from "@/lib/idioma/textos/ajustes";
import { EtapaDelHabla } from "./etapa-del-habla";
import {
  AJUSTES_DEFECTO,
  type Apariencia,
  type Perfil,
} from "@/lib/storage/schemas";

export function AjustesSesion() {
  const tx = useT();
  const guardados = useAjustes();
  const [confirmandoBorrado, setConfirmandoBorrado] = useState(false);

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

      <SeccionVozFamiliar
        vozFamiliar={ajustes.vozFamiliar}
        listo={listo}
        onCambiar={(vozFamiliar) =>
          guardarAjustesEnStore({ ...ajustes, vozFamiliar })
        }
      />

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
    ]).then(([{ listarIds }, { catalogoGrabable }]) => {
      // El banco guarda las grabaciones de los dos idiomas: el total cuenta las posibles en ambos.
      setTotal(catalogoGrabable("es").length + catalogoGrabable("en").length);
      // Banco inaccesible (IndexedDB roto) = banco vacío: la sección no se rompe (M-1).
      listarIds()
        .then((ids) => setGrabados(ids.length))
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
  onCambiar,
}: {
  id: string;
  titulo: Texto;
  descripcion: Texto;
  activo: boolean;
  /** false hasta que hidrata: aún no sabemos el valor guardado, así que no se puede tocar. */
  listo: boolean;
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
