"use client";

// El formulario de apodo + temas, compartido entre el onboarding (primera vez, en Hoy)
// y Ajustes (cambiarlos después sin borrar nada — hallazgo del gate 2026-07-12: la única
// forma de volver a esta pantalla era borrar todos los datos o una ventana de incógnito).

import { useState } from "react";
import { InteresSchema } from "@/lib/bandeja/cuentos-del-mes";
import { tocaLaLista } from "@/lib/bandeja/sensibilidad";
import { useT } from "@/lib/idioma/estado";
import { nombreTema } from "@/lib/idioma/textos/nombres";
import { suMundo } from "@/lib/idioma/textos/su-mundo";
import { primerUso } from "@/lib/idioma/textos/primer-uso";
import { unirSinRepetir } from "@/lib/su-mundo/intereses";
import {
  MAX_OTRAS_COSAS,
  TEMAS,
  type Perfil,
  type Tema,
} from "@/lib/storage/schemas";

/** Las huellas del gate de sensibilidad (datos públicos, se cargan solo al guardar). */
async function cargarHuellas(): Promise<Set<string>> {
  const { hashes } = await import("../../tests/fixtures/sensibilidad-hashes.json");
  return new Set(hashes);
}

export function PerfilForm({
  inicial,
  textoGuardar,
  testIdGuardar,
  onGuardar,
  onCancelar,
}: {
  /** Valores actuales al editar; `null` en el onboarding (formulario vacío). */
  inicial: Perfil | null;
  textoGuardar: string;
  testIdGuardar: string;
  onGuardar: (perfil: Perfil) => void;
  /** Si existe, se muestra un botón secundario para salir sin guardar. */
  onCancelar?: () => void;
}) {
  const tx = useT();
  const [apodo, setApodo] = useState(inicial?.apodo ?? "");
  const [temas, setTemas] = useState<Tema[]>(inicial?.temas ?? []);
  // «Otras cosas que le encantan» (S14, ADR-026): la única casa de sus intereses fuera de los temas.
  const [otras, setOtras] = useState<string[]>(inicial?.otrasCosas ?? []);
  const [nueva, setNueva] = useState("");
  const [aviso, setAviso] = useState<"error" | "sensible" | "noComprobado" | "tope" | null>(null);

  function anadir() {
    const r = InteresSchema.safeParse(nueva);
    if (!r.success) {
      setAviso("error");
      return;
    }
    setOtras((a) => unirSinRepetir(a, [r.data]).slice(0, MAX_OTRAS_COSAS));
    setNueva("");
    setAviso(null);
  }

  function alternarTema(tema: Tema) {
    setTemas((actuales) =>
      actuales.includes(tema)
        ? actuales.filter((t) => t !== tema)
        : actuales.length < 3
          ? [...actuales, tema]
          : actuales,
    );
  }

  async function guardar() {
    const limpio = apodo.trim();
    // Lo escrito y no añadido todavía no se pierde en silencio: o entra, o se dice por qué no.
    const escrito = nueva.trim();
    if (escrito && !InteresSchema.safeParse(nueva).success) {
      setAviso("error");
      return;
    }
    if (escrito && otras.length >= MAX_OTRAS_COSAS && !otras.includes(escrito)) {
      setAviso("tope");
      return;
    }
    const todas = unirSinRepetir(otras, escrito ? [escrito] : []).slice(0, MAX_OTRAS_COSAS);
    // El gate de sensibilidad corre ANTES de escribir sobre lo que se escribe como «otras cosas»; el apodo
    // es de la familia y se queda en el aparato (regla 2-bis), así que no pasa por la lista.
    if (todas.length > 0) {
      try {
        if (await tocaLaLista(todas.join("\n"), await cargarHuellas())) {
          setAviso("sensible");
          return;
        }
      } catch {
        // Sin poder comprobar, no se guarda: se dice y se puede reintentar (el primer uso no se traba mudo).
        setAviso("noComprobado");
        return;
      }
    }
    onGuardar({
      ...(limpio ? { apodo: limpio } : {}),
      temas: temas.length > 0 ? temas : ["animales"],
      ...(todas.length > 0 ? { otrasCosas: todas } : {}),
    });
  }

  return (
    <div>
      <div className="mt-6">
        <label htmlFor="apodo" className="block text-sm font-medium">
          {tx(primerUso.form.apodoEtiqueta)}{" "}
          <span className="text-tinta-suave">{tx(primerUso.form.opcional)}</span>
        </label>
        <input
          id="apodo"
          type="text"
          value={apodo}
          onChange={(e) => setApodo(e.target.value)}
          maxLength={30}
          placeholder={tx(primerUso.form.apodoPlaceholder)}
          className="border-borde bg-fondo text-tinta mt-2 min-h-11 w-full rounded-xl border px-4"
        />
      </div>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium">
          {tx(primerUso.form.temasLeyenda)}
        </legend>
        <p className="text-tinta-suave mt-1 text-sm">
          {tx(primerUso.form.temasAyuda)}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TEMAS.map((tema) => {
            const activo = temas.includes(tema);
            return (
              <button
                key={tema}
                type="button"
                onClick={() => alternarTema(tema)}
                aria-pressed={activo}
                className={[
                  "min-h-11 rounded-full border px-4 text-sm",
                  activo
                    ? "bg-acento text-sobre-acento border-transparent"
                    : "border-borde text-tinta bg-fondo",
                ].join(" ")}
              >
                {tx(nombreTema[tema])}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <label htmlFor="otras-cosas" className="block text-sm font-medium">
          {tx(suMundo.perfil.etiqueta)}{" "}
          <span className="text-tinta-suave">{tx(primerUso.form.opcional)}</span>
        </label>
        <p className="text-tinta-suave mt-1 text-sm">{tx(suMundo.perfil.ayuda)}</p>
        <div className="mt-2 flex gap-2">
          <input
            id="otras-cosas"
            type="text"
            value={nueva}
            maxLength={24}
            autoComplete="off"
            onChange={(e) => {
              setNueva(e.target.value);
              setAviso(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                anadir();
              }
            }}
            placeholder={tx(suMundo.perfil.marcador)}
            className="border-borde bg-fondo text-tinta min-h-11 min-w-0 flex-1 rounded-xl border px-4"
            data-testid="otras-cosas-entrada"
          />
          <button
            type="button"
            onClick={anadir}
            disabled={otras.length >= MAX_OTRAS_COSAS}
            className="border-borde text-tinta min-h-11 rounded-xl border px-4 text-sm font-medium disabled:opacity-50"
            data-testid="otras-cosas-anadir"
          >
            {tx(suMundo.perfil.anadir)}
          </button>
        </div>
        {otras.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2" data-testid="otras-cosas">
            {otras.map((o) => (
              <li key={o}>
                <button
                  type="button"
                  onClick={() => setOtras((a) => a.filter((x) => x !== o))}
                  aria-label={tx(suMundo.perfil.quitar, { valor: o })}
                  className="bg-acento text-sobre-acento min-h-11 rounded-full px-4 text-sm"
                >
                  {o} <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <p className="mt-2 text-sm" role="status" data-testid="otras-cosas-aviso">
          {aviso === "sensible" ? tx(suMundo.perfil.sensible) : null}
          {aviso === "error" ? tx(suMundo.perfil.error) : null}
          {aviso === "noComprobado" ? tx(suMundo.perfil.noComprobado) : null}
          {aviso === "tope" || (aviso === null && otras.length >= MAX_OTRAS_COSAS)
            ? tx(suMundo.perfil.tope)
            : null}
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => void guardar()}
          className="bg-acento text-sobre-acento min-h-12 flex-1 rounded-xl px-6 font-medium"
          data-testid={testIdGuardar}
        >
          {textoGuardar}
        </button>
        {onCancelar ? (
          <button
            type="button"
            onClick={onCancelar}
            className="border-borde text-tinta min-h-12 flex-1 rounded-xl border px-6 font-medium"
          >
            {tx(primerUso.form.mejorNo)}
          </button>
        ) : null}
      </div>
    </div>
  );
}
