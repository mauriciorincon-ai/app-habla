import type { CapsulaContactoVisualEn } from "../schema";
import { CONTACTO_VISUAL_EN_A } from "./a.ts";
import { CONTACTO_VISUAL_EN_B } from "./b.ts";

/** Las 24 cápsulas de contacto visual en inglés, por id (S8). Redactadas, no traducidas. */
export const CONTACTO_VISUAL_EN: Record<string, CapsulaContactoVisualEn> = {
  ...CONTACTO_VISUAL_EN_A,
  ...CONTACTO_VISUAL_EN_B,
};
