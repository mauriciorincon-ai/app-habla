"use client";

import { useEffect } from "react";
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
