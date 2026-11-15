"use client";

// Los textos de una cápsula en el idioma de la pantalla. El español viene con la cápsula (es lo que
// "Hoy" y los juegos cargan siempre); la cara inglesa se descarga solo si la pantalla está en inglés,
// para que el script de Hoy no cargue 60 cápsulas que no se van a leer (presupuesto de Lighthouse).
// Mientras llega, devuelve `null` y la pantalla no pinta el texto en el idioma equivocado.

import type { CapsulaEn, CapsulaEs } from "@content/schema";
import { useEffect, useState } from "react";
import { useIdioma } from "@/lib/idioma/estado";

export type TextosCapsula = Pick<
  CapsulaEn,
  "titulo" | "explicacion" | "guion" | "actividad"
>;

export function useCapsulaTextos(capsula: CapsulaEs): TextosCapsula | null {
  const idioma = useIdioma();
  const [en, setEn] = useState<Record<string, CapsulaEn> | null>(null);
  useEffect(() => {
    if (idioma !== "en" || en) return;
    let vivo = true;
    void import("@content/capsulas-en-todas").then((m) => {
      if (vivo) setEn(m.CAPSULAS_EN_TODAS);
    });
    return () => {
      vivo = false;
    };
  }, [idioma, en]);
  if (idioma === "es") {
    return {
      titulo: capsula.titulo,
      explicacion: capsula.explicacion,
      guion: capsula.guion,
      actividad: capsula.actividad.texto,
    };
  }
  return en?.[capsula.id] ?? null;
}

/** Un campo de texto de la cápsula en el idioma de la pantalla (vacío mientras llega el inglés). */
export function TextoCapsula({
  capsula,
  campo,
}: {
  capsula: CapsulaEs;
  campo: keyof TextosCapsula;
}) {
  const textos = useCapsulaTextos(capsula);
  return textos ? textos[campo] : "";
}
