"use client";

import { useEffect } from "react";
import { LANG_HTML, type Datos, type Texto } from "@/lib/idioma";
import { useIdioma, useT } from "@/lib/idioma/estado";

/** Un texto del catálogo en el idioma de ahora. Permite que una página de servidor siga siéndolo. */
export function Tx({ t: texto, datos }: { t: Texto; datos?: Datos }) {
  const tx = useT();
  return <>{tx(texto, datos)}</>;
}

/** Mantiene `<html lang>` de acuerdo con el idioma elegido (el script previo a la pintura lo fija primero). */
export function ActualizarLang() {
  const idioma = useIdioma();
  useEffect(() => {
    document.documentElement.lang = LANG_HTML[idioma];
  }, [idioma]);
  return null;
}

/** El título de la pestaña en el idioma de ahora (las `metadata` de Next son estáticas). */
export function TituloDePagina({ t: texto }: { t: Texto }) {
  const tx = useT();
  const titulo = tx(texto);
  useEffect(() => {
    document.title = titulo;
  }, [titulo]);
  return null;
}
