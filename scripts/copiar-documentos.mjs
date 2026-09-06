// Copia los documentos canónicos de docs/ a public/ para que la app los sirva en ruta propia.
//
//   docs/BROCHURE.html                 → public/conoce.html  (ruta /conoce — el brochure)
//   docs/CATALOGO-CONTACTO-VISUAL.html → public/mirada.html  (ruta /mirada — el documento de la mamá)
//
// docs/ es la ÚNICA fuente (autocontenidos: abren con doble clic sin internet); las copias en
// public/ son artefactos de build y están gitignoradas — igual que public/worklets/. Nunca se
// edita la copia: se edita (o regenera) el canónico y se vuelve a correr esto.
//
// Corre encadenado en `pnpm dev` y `pnpm build` (build:documentos), así que la CI, los e2e y
// Vercel siempre sirven la última versión. Los rewrites viven en next.config.ts.

import { copyFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");

export const DOCUMENTOS = [
  { origen: "docs/BROCHURE.html", destino: "public/conoce.html", ruta: "/conoce" },
  {
    origen: "docs/CATALOGO-CONTACTO-VISUAL.html",
    destino: "public/mirada.html",
    ruta: "/mirada",
  },
];

mkdirSync(join(raiz, "public"), { recursive: true });
for (const d of DOCUMENTOS) {
  const origen = join(raiz, d.origen);
  if (!existsSync(origen)) {
    throw new Error(`Falta el documento canónico ${d.origen} (ruta ${d.ruta}).`);
  }
  copyFileSync(origen, join(raiz, d.destino));
  console.log(`${d.origen} → ${d.destino} (${d.ruta})`);
}
