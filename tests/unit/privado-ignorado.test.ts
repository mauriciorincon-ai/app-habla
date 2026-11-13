import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// La bandeja de IA (S9, ADR-019): los pedidos y los lotes de cuentos son de la familia y viven en
// `privado/`. Este test falla si la carpeta deja de estar ignorada o si algo de ahí llega a versionarse.

const RAIZ = join(__dirname, "../..");
const git = (...args: string[]) => execFileSync("git", args, { cwd: RAIZ, encoding: "utf8" });

describe("privado/ jamás se versiona", () => {
  it("git no tiene ningún archivo bajo privado/", () => {
    expect(git("ls-files", "--", "privado").trim()).toBe("");
  });

  it.each(["privado/bandeja/pedido-2026-11-12.json", "privado/bandeja/lote-2026-11-12.json", "privado/x"])(
    "%s está ignorado",
    (ruta) => {
      expect(git("check-ignore", "--no-index", ruta).trim()).toBe(ruta);
    },
  );
});
