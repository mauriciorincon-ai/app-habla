// Genera docs/CATALOGO-CAPSULAS.html — las 50 cápsulas COMPLETAS, para el veredicto de contenido
// del padre (bloque I del gate ⭐). Nació de una pregunta real del gate S4: "¿cómo pruebo esto si
// la cápsula va apareciendo día a día?" — la app no tiene (aún) histórico navegable, así que el
// instrumento de revisión es este documento del repo (regla 11: entregables = archivos del repo).
//
// La fuente de verdad es content/capsulas.ts (se importa DIRECTO — cero copias a mano): si el
// contenido cambia, regenerar con `node scripts/gen-catalogo-capsulas.mjs`.

import { writeFileSync } from "node:fs";
import { CAPSULAS } from "../content/capsulas.ts";
import {
  DESCRIPCION_ETAPA,
  ETAPAS,
  NOMBRE_ETAPA,
  NOMBRE_TECNICA,
  TECNICAS,
} from "../content/schema.ts";

const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

const fecha = new Date().toISOString().slice(0, 10);

// Las preguntas de juicio por grupo — vivían en las 8 casillas del bloque I de la guía y se
// MUDARON aquí cuando el bloque se consolidó en una sola casilla (pedido del usuario, gate S4):
// el juicio se hace donde se lee.
const JUZGAR_ETAPA = {
  "sonidos-e-intentos":
    "¿Te servirían los días difíciles, o si algún día él retrocede? No son para su nivel de hoy: son la red de abajo.",
  "primeras-frases":
    "¿Te parecen bien guardadas para cuando junte dos palabras? Recuerda: esta etapa nunca se activa sola.",
};
const JUZGAR_TECNICA_PALABRAS = {
  modelado:
    "¿Reconoces tu día real en ellas — el carro, vestirse, el mercado, la hora de dormir? Pediste «más novedosas»: ¿lo son?",
  "espera-estructurada":
    "¿Son hacibles sin que se te vuelva una tortura la comida o el juego?",
  "expansion-recast":
    "¿Te queda claro qué decir EXACTAMENTE en el momento? (esa es la prueba: que no tengas que pensarlo).",
  "seguir-interes": "¿Te suenan a jugar con él y no a darle una lección?",
  "estimulacion-focalizada":
    "¿Te parecen repetibles sin volverse machaconas?",
};

let cuerpo = "";
for (const etapa of ETAPAS) {
  const deEtapa = CAPSULAS.filter((c) => c.etapa === etapa);
  if (deEtapa.length === 0) continue;
  cuerpo += `
  <section class="etapa">
    <h2>${esc(NOMBRE_ETAPA[etapa])} <span class="conteo">(${deEtapa.length} cápsulas)</span></h2>
    <p class="descripcion">${esc(DESCRIPCION_ETAPA[etapa])}</p>`;
  if (JUZGAR_ETAPA[etapa]) {
    cuerpo += `
    <p class="juzgar"><strong>Qué juzgar aquí:</strong> ${esc(JUZGAR_ETAPA[etapa])}</p>`;
  }
  for (const tecnica of TECNICAS) {
    const grupo = deEtapa.filter((c) => c.tecnica === tecnica);
    if (grupo.length === 0) continue;
    cuerpo += `
    <h3>${esc(NOMBRE_TECNICA[tecnica])} <span class="conteo">(${grupo.length})</span></h3>`;
    if (etapa === "palabras-sueltas" && JUZGAR_TECNICA_PALABRAS[tecnica]) {
      cuerpo += `
    <p class="juzgar"><strong>Qué juzgar aquí:</strong> ${esc(JUZGAR_TECNICA_PALABRAS[tecnica])}</p>`;
    }
    for (const c of grupo) {
      cuerpo += `
    <article class="capsula" id="${esc(c.id)}">
      <label class="revision"><input type="checkbox" data-id="${esc(c.id)}"> Revisada</label>
      <h4>${esc(c.titulo)}</h4>
      <p class="chips"><span class="chip">${esc(NOMBRE_TECNICA[c.tecnica])}</span><span class="chip">${
        c.actividad.conPantalla ? "con pantalla" : "sin pantalla"
      }</span>${c.etiquetas.map((e) => `<span class="chip suave">${esc(e)}</span>`).join("")}</p>
      <p class="explicacion">${esc(c.explicacion)}</p>
      <blockquote><strong>Tu línea:</strong> ${esc(c.guion)}</blockquote>
      <p class="actividad"><strong>La actividad:</strong> ${esc(c.actividad.texto)}</p>
      <p class="fuente">${esc(c.fuente)}</p>
    </article>`;
    }
  }
  cuerpo += `
  </section>`;
}

const html = `<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hablemos San — Catálogo de las ${CAPSULAS.length} cápsulas (bloque I del gate)</title>
<style>
  :root { --fondo:#fbf8f2; --superficie:#f5f0e5; --borde:#ece4d2; --tinta:#1f2420; --suave:#5a615c; --acento:#527947; --acento-suave:#eef2ec; }
  * { box-sizing:border-box; }
  body { margin:0; padding:2rem 1rem 4rem; background:var(--fondo); color:var(--tinta); font:16px/1.55 Georgia,"Times New Roman",serif; }
  main { max-width:46rem; margin:0 auto; }
  h1 { font-size:1.7rem; line-height:1.25; }
  h2 { margin:2.5rem 0 .25rem; font-size:1.35rem; border-bottom:2px solid var(--borde); padding-bottom:.35rem; }
  h3 { margin:1.75rem 0 .5rem; font-size:1.05rem; color:var(--acento); }
  .aviso, .descripcion, .fuente, .conteo { color:var(--suave); }
  .aviso { font-size:.9rem; background:var(--superficie); border:1px solid var(--borde); border-radius:12px; padding: .75rem 1rem; }
  .conteo { font-weight:normal; font-size:.85em; }
  .capsula { background:var(--superficie); border:1px solid var(--borde); border-radius:14px; padding:1rem 1.15rem; margin:.8rem 0; position:relative; }
  .capsula h4 { margin:.1rem 8.5rem .4rem 0; font-size:1.05rem; }
  .capsula.lista { opacity:.55; }
  .revision { position:absolute; top: .9rem; right:1rem; font-size:.8rem; color:var(--suave); font-family:system-ui,sans-serif; user-select:none; }
  .chips { margin:.2rem 0 .6rem; }
  .chip { display:inline-block; font:600 .72rem/1 system-ui,sans-serif; letter-spacing:.03em; background:var(--acento-suave); color:var(--acento); border-radius:999px; padding:.3rem .6rem; margin:0 .3rem .3rem 0; }
  .chip.suave { background:transparent; border:1px solid var(--borde); color:var(--suave); }
  .explicacion { margin:.4rem 0; }
  blockquote { margin:.6rem 0; padding:.5rem .9rem; border-left:4px solid var(--acento); background:var(--fondo); border-radius:0 10px 10px 0; font-style:italic; }
  blockquote strong, .actividad strong { font-style:normal; }
  .fuente { font-size:.8rem; margin-bottom:.1rem; }
  .juzgar { font-family:system-ui,sans-serif; font-size:.85rem; color:var(--acento); background:var(--acento-suave); border-radius:10px; padding:.55rem .85rem; }
  .progreso { position:sticky; top:0; background:var(--fondo); padding:.5rem 0; font-family:system-ui,sans-serif; font-size:.85rem; color:var(--suave); }
  footer { margin-top:3rem; font-size:.8rem; color:var(--suave); border-top:1px solid var(--borde); padding-top:1rem; }
  @media (prefers-color-scheme: dark) {
    :root { --fondo:#1f2420; --superficie:#2a312b; --borde:#3a423b; --tinta:#f5f0e5; --suave:#9ca29c; --acento:#a8c9a0; --acento-suave:#2e4628; }
  }
</style>
</head>
<body>
<main>
  <h1>Las ${CAPSULAS.length} cápsulas, completas — tu veredicto (bloque I)</h1>
  <p class="aviso">Instrumento de revisión del gate ⭐ (S4): la app entrega la cápsula <strong>una por día</strong> y todavía no
  tiene histórico navegable (está en el backlog) — este catálogo existe para que puedas leerlas <strong>todas, de corrido</strong>,
  tal cual viven en la app (generado directo de <code>content/capsulas.ts</code> el ${fecha}; se regenera con
  <code>node scripts/gen-catalogo-capsulas.mjs</code>). La pregunta de siempre por cada una: ¿la línea la dirías tal cual
  en tu casa? ¿La actividad se puede hacer hoy? ¿Reconoces tu día real en ella? Si una no cumple, dime cuál y por qué — se reemplaza.
  Las <strong>14 originales del S1</strong> siguen vivas dentro de las 50 (las aprobaste el 2026-07-12 y ninguna se botó):
  confirma que las reconoces cuando te las cruces.</p>
  <p class="progreso"><span id="hechas">0</span> de ${CAPSULAS.length} revisadas · tu avance queda guardado en este navegador</p>
  ${cuerpo}
  <footer>Hablemos San — catálogo de contenido para el gate del padre. Las fuentes citadas son las mismas que la app
  guarda con cada cápsula (§A.3 de la investigación). Este documento no es la app: es el contenido, desnudo, para tu juicio.</footer>
</main>
<script>
  var CLAVE = "catalogo-capsulas-v1:";
  var cajas = document.querySelectorAll(".revision input");
  var contador = document.getElementById("hechas");
  function pintar() {
    var n = 0;
    cajas.forEach(function (c) { if (c.checked) n++; c.closest(".capsula").classList.toggle("lista", c.checked); });
    contador.textContent = n;
  }
  cajas.forEach(function (c) {
    c.checked = localStorage.getItem(CLAVE + c.dataset.id) === "1";
    c.addEventListener("change", function () {
      if (c.checked) localStorage.setItem(CLAVE + c.dataset.id, "1");
      else localStorage.removeItem(CLAVE + c.dataset.id);
      pintar();
    });
  });
  pintar();
</script>
</body>
</html>
`;

writeFileSync(new URL("../docs/CATALOGO-CAPSULAS.html", import.meta.url), html);
console.log(`docs/CATALOGO-CAPSULAS.html generado — ${CAPSULAS.length} cápsulas.`);
