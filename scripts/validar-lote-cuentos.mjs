// Valida un lote de «Cuentos de casa» (S9, ADR-019) ANTES de entregarlo: el mismo validador que corre la
// app al importarlo (esquema, plazos y puntajes, texto dirigido a un agente, gate de sensibilidad). Lo
// usa la skill `/bandeja`. Jamás imprime un término: solo el id del cuento y el motivo.
//
//   node scripts/validar-lote-cuentos.mjs privado/bandeja/lote-AAAA-MM-DD.json
//   node scripts/validar-lote-cuentos.mjs --pedido privado/bandeja/pedido-AAAA-MM-DD.json

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";
import { tomarPedido, validarLote } from "../src/lib/bandeja/cuentos-del-mes.ts";
import { CUENTOS } from "../content/cuentos.ts";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const args = process.argv.slice(2);
const esPedido = args[0] === "--pedido";
const ruta = esPedido ? args[1] : args[0];
if (!ruta) {
  console.error("uso: node scripts/validar-lote-cuentos.mjs [--pedido] <archivo.json>");
  process.exit(2);
}
const abs = resolve(ruta);
if (!abs.startsWith(join(raiz, "privado") + "/")) {
  console.error("✗ el archivo tiene que vivir en privado/ (ignorado por git).");
  process.exit(1);
}
const json = JSON.parse(readFileSync(abs, "utf8"));
const hoy = new Date().toISOString().slice(0, 10);

if (esPedido) {
  const toma = tomarPedido(json, hoy);
  console.log(`pedido: ${toma.estado}${"motivo" in toma ? ` (${toma.motivo})` : ""}`);
  toma.anotaciones.forEach((a) => console.log(`  nota: ${a}`));
  process.exit(toma.estado === "tomado" ? 0 : 1);
}

const { hashes } = JSON.parse(readFileSync(join(raiz, "tests/fixtures/sensibilidad-hashes.json"), "utf8"));
const r = await validarLote(json, { huellas: new Set(hashes), idsReservados: CUENTOS.map((c) => c.id) });
if (!r.ok) {
  console.log("✗ lote-invalido: el sobre no cumple el esquema; no entra nada.");
  process.exit(1);
}
console.log(`lote ${r.lote}: ${r.aceptados.length} aceptados, ${r.rechazados.length} rechazados`);
r.rechazados.forEach((x) => console.log(`  ✗ ${x.id ?? `#${x.indice + 1}`}: ${x.motivo}`));
process.exit(r.rechazados.length === 0 ? 0 : 1);
