"use client";

import { useEffect, type ReactNode } from "react";
import { LANG_HTML, type Datos, type Texto } from "@/lib/idioma";
import { useAjustes } from "@/components/estado-local";
import { useIdioma, useT } from "@/lib/idioma/estado";

/** Un texto del catálogo en el idioma de ahora. Permite que una página de servidor siga siéndolo. */
export function Tx({ t: texto, datos }: { t: Texto; datos?: Datos }) {
  const tx = useT();
  return <>{tx(texto, datos)}</>;
}

/** Mantiene `<html lang>` de acuerdo con el idioma elegido (el script previo a la pintura lo fija primero). */
export function ActualizarLang() {
  const idioma = useIdioma();
  const hidratado = useAjustes() !== null;
  useEffect(() => {
    // Antes de hidratar `useIdioma` dice español por defecto: escribirlo desmentiría al script previo
    // a la pintura (que ya fijó el idioma real) por un instante.
    if (!hidratado) return;
    document.documentElement.lang = LANG_HTML[idioma];
  }, [idioma, hidratado]);
  return null;
}

/** El título de la pestaña en el idioma de ahora (las `metadata` de Next son estáticas). */
export function TituloDePagina({ t: texto }: { t: Texto }) {
  const tx = useT();
  const titulo = tx(texto);
  const hidratado = useAjustes() !== null;
  useEffect(() => {
    if (!hidratado) return;
    document.title = titulo;
  }, [titulo, hidratado]);
  return null;
}

/**
 * Oculta (sin quitarle su sitio) lo que se pinta en español en el servidor hasta que se sabe el idioma
 * real. Así un dispositivo en inglés no ve el destello de español ni el salto de diseño cuando el texto
 * cambia de largo (un desplazamiento de elementos invisibles no cuenta como salto). Para pantallas
 * de ajustes largas; el contenido ya está en el HTML, solo no se ve ese instante.
 */
export function OcultoHastaHidratar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const hidratado = useAjustes() !== null;
  return (
    <div
      className={`${className ?? ""} ${hidratado ? "" : "invisible"}`.trim()}
    >
      {children}
    </div>
  );
}
