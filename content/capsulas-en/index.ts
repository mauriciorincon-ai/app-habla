import type { CapsulaEn } from "../schema";
import { CAPSULAS_EN_A } from "./a.ts";
import { CAPSULAS_EN_B } from "./b.ts";
import { CAPSULAS_EN_C } from "./c.ts";

/** Las 50 cápsulas en inglés, por id (S7). Redactadas, no traducidas; ver el brief en .claude/rules/contenido.md. */
export const CAPSULAS_EN: Record<string, CapsulaEn> = {
  ...CAPSULAS_EN_A,
  ...CAPSULAS_EN_B,
  ...CAPSULAS_EN_C,
};
