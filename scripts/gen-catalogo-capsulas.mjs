// Genera docs/CATALOGO-CAPSULAS.html — las 50 cápsulas COMPLETAS, para el veredicto de contenido
// del padre (bloque I del gate ⭐). Nació de una pregunta real del gate S4: "¿cómo pruebo esto si
// la cápsula va apareciendo día a día?" — la app no tiene (aún) histórico navegable, así que el
// instrumento de revisión es este documento del repo (regla 11: entregables = archivos del repo).
//
// La fuente de verdad es content/capsulas.ts (se importa DIRECTO — cero copias a mano): si el
// contenido cambia, regenerar con `node scripts/gen-catalogo-capsulas.mjs`.
// Dos idiomas (S8): cada texto sale como pareja data-l="es" / data-l="en" y un conmutador (patrón de /conoce).

import { writeFileSync } from "node:fs";
import { DESCRIPCION_ETAPA_EN, NOMBRE_ETAPA_EN, NOMBRE_TECNICA_EN } from "../content/chrome-documentos-en.ts";
import { IDIOMA_CONMUTADOR, IDIOMA_CSS, IDIOMA_HEAD, idiomaScript, par, parHtml } from "./lib/bilingue.mjs";
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
  "sonidos-e-intentos": {
    es: "¿Te servirían los días difíciles, o si algún día él retrocede? No son para su nivel de hoy: son la red de abajo.",
    en: "Would they help on hard days, or if one day your child steps back? They are not for today's level: they are the safety net underneath.",
  },
  "primeras-frases": {
    es: "¿Te parecen bien guardadas para cuando junte dos palabras? Recuerda: esta etapa nunca se activa sola.",
    en: "Do they seem well kept for when your child joins two words? Remember: this stage never turns on by itself.",
  },
};
const JUZGAR_TECNICA_PALABRAS = {
  modelado: {
    es: "¿Reconoces tu día real en ellas — el carro, vestirse, el mercado, la hora de dormir? Pediste «más novedosas»: ¿lo son?",
    en: "Do you recognize your real day in them — the car, getting dressed, the market, bedtime? You asked for “more novel”: are they?",
  },
  "espera-estructurada": {
    es: "¿Son hacibles sin que se te vuelva una tortura la comida o el juego?",
    en: "Can you do them without mealtime or play turning into torture?",
  },
  "expansion-recast": {
    es: "¿Te queda claro qué decir EXACTAMENTE en el momento? (esa es la prueba: que no tengas que pensarlo).",
    en: "Is it clear what to say EXACTLY in the moment? (that is the test: you should not have to think about it).",
  },
  "seguir-interes": {
    es: "¿Te suenan a jugar con él y no a darle una lección?",
    en: "Do they sound like playing with your child, and not like giving a lesson?",
  },
  "estimulacion-focalizada": {
    es: "¿Te parecen repetibles sin volverse machaconas?",
    en: "Can they be repeated without becoming nagging?",
  },
};

let cuerpo = "";
for (const etapa of ETAPAS) {
  const deEtapa = CAPSULAS.filter((c) => c.etapa === etapa);
  if (deEtapa.length === 0) continue;
  cuerpo += `
  <section class="etapa">
    <h2>${par(NOMBRE_ETAPA[etapa], NOMBRE_ETAPA_EN[etapa])} <span class="conteo">(${par(`${deEtapa.length} cápsulas`, `${deEtapa.length} tips`)})</span></h2>
    <p class="descripcion">${par(DESCRIPCION_ETAPA[etapa], DESCRIPCION_ETAPA_EN[etapa])}</p>`;
  if (JUZGAR_ETAPA[etapa]) {
    cuerpo += `
    <p class="juzgar">${parHtml("<strong>Qué juzgar aquí:</strong> ", "<strong>What to judge here:</strong> ")}${par(JUZGAR_ETAPA[etapa].es, JUZGAR_ETAPA[etapa].en)}</p>`;
  }
  for (const tecnica of TECNICAS) {
    const grupo = deEtapa.filter((c) => c.tecnica === tecnica);
    if (grupo.length === 0) continue;
    cuerpo += `
    <h3>${par(NOMBRE_TECNICA[tecnica], NOMBRE_TECNICA_EN[tecnica])} <span class="conteo">(${grupo.length})</span></h3>`;
    if (etapa === "palabras-sueltas" && JUZGAR_TECNICA_PALABRAS[tecnica]) {
      cuerpo += `
    <p class="juzgar">${parHtml("<strong>Qué juzgar aquí:</strong> ", "<strong>What to judge here:</strong> ")}${par(JUZGAR_TECNICA_PALABRAS[tecnica].es, JUZGAR_TECNICA_PALABRAS[tecnica].en)}</p>`;
    }
    for (const c of grupo) {
      cuerpo += `
    <article class="capsula" id="${esc(c.id)}">
      <label class="revision"><input type="checkbox" data-id="${esc(c.id)}"> ${par("Revisada", "Reviewed")}</label>
      <h4>${par(c.titulo.es, c.titulo.en)}</h4>
      <p class="chips"><span class="chip">${par(NOMBRE_TECNICA[c.tecnica], NOMBRE_TECNICA_EN[c.tecnica])}</span><span class="chip">${
        c.actividad.conPantalla ? par("con pantalla", "with screen") : par("sin pantalla", "no screen")
      }</span>${c.etiquetas.map((e) => `<span class="chip suave">${esc(e)}</span>`).join("")}</p>
      <p class="explicacion">${par(c.explicacion.es, c.explicacion.en)}</p>
      <blockquote>${parHtml("<strong>Tu línea:</strong> ", "<strong>Your line:</strong> ")}${par(c.guion.es, c.guion.en)}</blockquote>
      <p class="actividad">${parHtml("<strong>La actividad:</strong> ", "<strong>The activity:</strong> ")}${par(c.actividad.texto.es, c.actividad.texto.en)}</p>
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
${IDIOMA_HEAD}
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hablemos San — Catálogo de las cápsulas</title>
<style>
  :root { --fondo:#fbf8f2; --superficie:#f5f0e5; --borde:#ece4d2; --tinta:#1f2420; --suave:#5a615c; --acento:#527947; --acento-suave:#eef2ec; }
${IDIOMA_CSS}
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
${IDIOMA_CONMUTADOR}
  <h1>${par(`Las ${CAPSULAS.length} cápsulas, completas — tu veredicto (bloque I)`, `All ${CAPSULAS.length} tips, in full — your verdict (block I)`)}</h1>
  <p class="aviso">${parHtml(
    `Instrumento de revisión del gate ⭐ (S4): la app entrega la cápsula <strong>una por día</strong> y todavía no
  tiene histórico navegable (está en el backlog) — este catálogo existe para que puedas leerlas <strong>todas, de corrido</strong>,
  tal cual viven en la app (generado directo de <code>content/capsulas.ts</code> el ${fecha}; se regenera con
  <code>node scripts/gen-catalogo-capsulas.mjs</code>). La pregunta de siempre por cada una: ¿la línea la dirías tal cual
  en tu casa? ¿La actividad se puede hacer hoy? ¿Reconoces tu día real en ella? Si una no cumple, dime cuál y por qué — se reemplaza.
  Las <strong>14 originales del S1</strong> siguen vivas dentro de las 50 (las aprobaste el 2026-07-12 y ninguna se botó):
  confirma que las reconoces cuando te las cruces.`,
    `Review instrument for the ⭐ gate (S4): the app delivers the tip <strong>one per day</strong> and does not yet have a
  browsable history (it is in the backlog) — this catalog exists so you can read <strong>all of them, straight through</strong>,
  exactly as they live in the app (generated directly from <code>content/capsulas.ts</code> on ${fecha}; regenerate with
  <code>node scripts/gen-catalogo-capsulas.mjs</code>). The usual question for each one: would you say the line as written
  at home? Can the activity be done today? Do you recognize your real day in it? If one does not work, tell me which and why — it gets replaced.
  The <strong>14 originals from S1</strong> are still alive inside the 50 (you approved them on 2026-07-12 and none was dropped):
  confirm you recognize them when you come across them.`,
  )}</p>
  <p class="progreso"><span id="hechas">0</span> ${par(`de ${CAPSULAS.length} revisadas · tu avance queda guardado en este navegador`, `of ${CAPSULAS.length} reviewed · your progress is saved in this browser`)}</p>
  ${cuerpo}
  <footer>${par(
    "Hablemos San — catálogo de contenido para el gate del padre. Las fuentes citadas son las mismas que la app guarda con cada cápsula (§A.3 de la investigación). Este documento no es la app: es el contenido, desnudo, para tu juicio.",
    "Hablemos San — content catalog for the parent's gate. The cited sources are the same ones the app keeps with each tip (§A.3 of the research). This document is not the app: it is the bare content, for your judgment.",
  )}</footer>
</main>
${idiomaScript({ es: "Hablemos San — Catálogo de las cápsulas", en: "Hablemos San — Tip catalog" })}
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
