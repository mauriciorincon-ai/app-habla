import type { FichaEn } from "../schema";
import { FICHAS_EN_A } from "./a.ts";
import { FICHAS_EN_B } from "./b.ts";
import { FICHAS_EN_C } from "./c.ts";
import { FICHAS_EN_D } from "./d.ts";

/** Las 56 fichas en inglés, por id (S8). Redactadas, no traducidas; ver .claude/rules/contenido.md. */
export const FICHAS_EN: Record<string, FichaEn> = {
  ...FICHAS_EN_A,
  ...FICHAS_EN_B,
  ...FICHAS_EN_C,
  ...FICHAS_EN_D,
};
