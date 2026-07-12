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
import { EtapaDelHabla } from "./etapa-del-habla";
import {
  AJUSTES_DEFECTO,
  NOMBRE_TEMA,
  type Perfil,
} from "@/lib/storage/schemas";

export function AjustesSesion() {
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
        titulo="Modo calma"
        descripcion="Colores de atardecer, sin medidor y sin meta. El globo sube mientras suena su voz y baja despacio en el silencio. Se puede activar también dentro del juego, en un toque."
        activo={ajustes.modoCalma}
        listo={listo}
        onCambiar={(activo) =>
          guardarAjustesEnStore({ ...ajustes, modoCalma: activo })
        }
      />

      <Interruptor
        id="reducir-animaciones"
        titulo="Reducir animaciones"
        descripcion="Quita los movimientos que no son parte del juego. (Si el sistema ya pide menos movimiento, la app lo respeta sin que toques nada.)"
        activo={ajustes.reducirAnimaciones}
        listo={listo}
        onCambiar={(activo) =>
          guardarAjustesEnStore({ ...ajustes, reducirAnimaciones: activo })
        }
      />

      <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
        <h2 className="font-medium">Borrar todos los datos</h2>
        <p className="text-tinta-suave mt-2 text-sm">
          Borra el apodo, los temas, los ajustes y el progreso de este
          dispositivo. No hay copia en ningún otro lado: cuando se borran, se
          van de verdad. (La voz de su hijo nunca se guardó, así que no hay nada
          de audio que borrar.)
        </p>

        {confirmandoBorrado ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={borrarTodoYRecargar}
              className="bg-peligro text-sobre-peligro min-h-12 flex-1 rounded-xl px-6 font-medium"
              data-testid="confirmar-borrado"
            >
              Sí, borrar todo
            </button>
            <button
              type="button"
              onClick={() => setConfirmandoBorrado(false)}
              className="border-borde text-tinta min-h-12 flex-1 rounded-xl border px-6 font-medium"
            >
              Mejor no
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmandoBorrado(true)}
            className="border-peligro text-peligro mt-4 min-h-12 rounded-xl border px-6 font-medium"
            data-testid="borrar-datos"
          >
            Borrar mis datos
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
  const hidratado = useHidratado();
  const perfil = usePerfil();
  const [editando, setEditando] = useState(false);

  function guardar(nuevo: Perfil) {
    guardarPerfilEnStore(nuevo);
    setEditando(false);
  }

  return (
    <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
      <h2 className="font-medium">Apodo y temas</h2>

      {!hidratado ? (
        <div className="mt-2 min-h-11" aria-hidden="true" />
      ) : !perfil ? (
        <p className="text-tinta-suave mt-2 text-sm">
          Aún no han empezado en este dispositivo. El apodo y los temas se
          eligen{" "}
          <Link href="/" className="underline underline-offset-4">
            en la pantalla de Hoy
          </Link>
          , la primera vez.
        </p>
      ) : editando ? (
        <PerfilForm
          inicial={perfil}
          textoGuardar="Guardar cambios"
          testIdGuardar="guardar-perfil"
          onGuardar={guardar}
          onCancelar={() => setEditando(false)}
        />
      ) : (
        <>
          <dl className="mt-2 space-y-2 text-sm">
            <div className="flex gap-2">
              <dt className="text-tinta-suave">Apodo:</dt>
              <dd data-testid="perfil-apodo">{perfil.apodo ?? "sin apodo"}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="text-tinta-suave">Temas:</dt>
              <dd data-testid="perfil-temas">
                {perfil.temas.map((tema) => NOMBRE_TEMA[tema]).join(" · ")}
              </dd>
            </div>
          </dl>
          <p className="text-tinta-suave mt-3 text-sm">
            Cambiarlos no borra nada: el progreso y los días practicados se
            quedan como están.
          </p>
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="border-borde text-tinta mt-4 min-h-12 rounded-xl border px-6 font-medium"
            data-testid="editar-perfil"
          >
            Cambiar apodo y temas
          </button>
        </>
      )}
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
  titulo: string;
  descripcion: string;
  activo: boolean;
  /** false hasta que hidrata: aún no sabemos el valor guardado, así que no se puede tocar. */
  listo: boolean;
  onCambiar: (activo: boolean) => void;
}) {
  return (
    <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium" id={`${id}-titulo`}>
            {titulo}
          </h2>
          <p className="text-tinta-suave mt-2 text-sm">{descripcion}</p>
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
