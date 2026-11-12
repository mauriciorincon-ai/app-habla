"use client";

// El idioma elegido. Vive en los ajustes locales (`habla:v1:ajustes`, campo `idioma`): una familia
// que lo cambia lo encuentra igual al volver. Mientras el campo es `null`, manda el navegador
// (`navigator.languages`). El servidor y el primer pintado dicen español (los ajustes son `null`
// hasta hidratar), y React repinta una vez si el dispositivo está en inglés: el mismo patrón de
// todos los ajustes, sin error de hidratación. Nada de esto toca audio ni red (regla dura 2).

import { useCallback } from "react";
import {
  ajustesActuales,
  guardarAjustesEnStore,
  useAjustes,
} from "@/components/estado-local";
import {
  detectarIdioma,
  IDIOMA_POR_DEFECTO,
  t,
  type Datos,
  type Idioma,
  type Texto,
} from "./index";

function delNavegador(): Idioma {
  if (typeof navigator === "undefined") return IDIOMA_POR_DEFECTO;
  const prefs = navigator.languages?.length ? navigator.languages : [navigator.language];
  return detectarIdioma(prefs);
}

/** El idioma de ahora, reactivo. `es` en el servidor y en el primer pintado. */
export function useIdioma(): Idioma {
  const ajustes = useAjustes();
  if (ajustes === null) return IDIOMA_POR_DEFECTO;
  return ajustes.idioma ?? delNavegador();
}

/** El idioma de ahora, fuera de React. */
export function idiomaActual(): Idioma {
  return ajustesActuales().idioma ?? delNavegador();
}

/** La elección del adulto: queda guardada y toda la interfaz cambia sin recargar. */
export function elegirIdioma(idioma: Idioma | null): void {
  guardarAjustesEnStore({ ...ajustesActuales(), idioma });
}

/** `t` ya atado al idioma de ahora: `const tx = useT(); tx(textos.hoy.titulo)`. */
export function useT(): (texto: Texto, datos?: Datos) => string {
  const idioma = useIdioma();
  return useCallback((texto: Texto, datos?: Datos) => t(texto, idioma, datos), [idioma]);
}
