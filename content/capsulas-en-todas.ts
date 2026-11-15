import { CAPSULAS_EN } from "./capsulas-en/index.ts";
import { CAPSULAS_SU_MUNDO_EN } from "./capsulas-su-mundo-en.ts";
import type { CapsulaEn } from "./schema";

/** Las 60 caras inglesas por id. Es el único módulo que Hoy carga con `import()` y solo en inglés. */
export const CAPSULAS_EN_TODAS: Record<string, CapsulaEn> = {
  ...CAPSULAS_EN,
  ...CAPSULAS_SU_MUNDO_EN,
};
