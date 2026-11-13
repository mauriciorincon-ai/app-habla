// Genera docs/LA-PIRAMIDE.html — EL DOCUMENTO DE LA MAMÁ (Sprint 006, «La pirámide»).
//
// Reemplaza al documento del S5: las fichas de actividad de content/fichas.ts organizadas por
// los seis grupos de la pirámide (señalar · imitación · comprender · atención conjunta ·
// intención comunicativa · juego), que se trabajan todos a la vez. Cada ficha en instrucción
// directa: Ten a la mano · Haz · Tu línea · Espera ver · Funcionó si · Si no pasa.
//
// Sin registro (decisión del usuario, S6): la medida vive dentro de cada ficha («Funcionó si»).
// Sin pantalla para el niño: la mamá lo lee en su teléfono o impreso. La app lo sirve en
// /mirada (scripts/copiar-documentos.mjs + rewrite). Autocontenido: cero CDNs, cero peticiones.
// La fuente de verdad es content/fichas.ts — cero copias a mano: `pnpm gen:piramide`.
//
// Regla de la casa: solo COMPORTAMIENTO OBSERVABLE; el gate de sensibilidad lo vigila.
// Dos idiomas (S8): cada texto sale como pareja `data-l="es"` / `data-l="en"` (mismo patrón que /conoce);
// el dato viene de content/fichas.ts ({es, en}) y los rótulos de content/chrome-documentos-en.ts.
// Modo revisión (para el papá, G-Contenido): `?revision` muestra las preguntas de juicio, de
// dónde viene cada ficha y la casilla «Revisada». La mamá no lo ve.

import { writeFileSync } from "node:fs";
import { CAEN_DEL_DOCUMENTO, FICHAS } from "../content/fichas.ts";
import {
  BibliotecaFichasSchema,
  DESCRIPCION_GRUPO,
  FichaSchema,
  GRUPOS,
  NOMBRE_GRUPO,
  NOMBRE_MOMENTO,
  NOMBRE_TECNICA_FICHA,
  ORDEN_DOCUMENTO,
  PROGRESIONES,
} from "../content/schema.ts";
import {
  DESCRIPCION_GRUPO_EN,
  NOMBRE_GRUPO_EN,
  NOMBRE_MOMENTO_EN,
  NOMBRE_TECNICA_FICHA_EN,
  PROGRESIONES_EN,
} from "../content/chrome-documentos-en.ts";
import { PALETA_CSS, esc, fechaHoy } from "./lib/catalogo-comun.mjs";
import { IDIOMA_CONMUTADOR, IDIOMA_CSS, IDIOMA_HEAD, idiomaScript, par, parHtml } from "./lib/bilingue.mjs";

const fecha = fechaHoy();
for (const f of FICHAS) {
  const r = FichaSchema.safeParse(f);
  if (!r.success) throw new Error(`Ficha inválida «${f.id}»: ${JSON.stringify(r.error.issues)}`);
}
// Una biblioteca que no cumple su contrato completo no se publica: el generador falla.
const biblioteca = BibliotecaFichasSchema.safeParse(FICHAS);
if (!biblioteca.success) throw new Error(`La biblioteca no cumple la pirámide: ${JSON.stringify(biblioteca.error.issues)}`);
const deGrupo = (g) => FICHAS.filter((f) => f.grupo === g);
// La prioridad sale de las fichas mismas (el schema garantiza que coincide con GRUPOS_PRIORITARIOS).
const esPrioritario = (g) => deGrupo(g).length > 0 && deGrupo(g).every((f) => f.prioridad === "alta");

// ── Lo que le gusta (en observable: sin nombres, edades ni lugares) ──────────────────────────
const FAVORITOS = [
  { es: "Marchar y copiar movimientos grandes de brazos y piernas.", en: "Marching and copying big arm and leg movements." },
  { es: "«Corre que te atrapo»: voltea a ver si lo sigues, sonríe y corre.", en: "“Run, I'll catch you”: they turn to see if you are following, smile and run." },
  { es: "Las cosquillas, con su propio sonido — y ya te las hace a ti.", en: "Tickles, with their own sound — and they already tickle you back." },
  { es: "Seguir tu dedo cuando señalas, y señalar diciendo «tú».", en: "Following your finger when you point, and pointing while saying “you.”" },
  { es: "«Hola» y «chao» con la mano y la voz juntas.", en: "“Hi” and “bye” with the hand and the voice together." },
  { es: "Repetir las vocales.", en: "Repeating the vowel sounds." },
];

// ── Qué no hacer (reglas transversales de la investigación del S6, en observable) ─────────────
const QUE_NO_HACER = [
  {
    es: "Primero lo copias tú; después le muestras algo nuevo. Comenta lo que hace en vez de preguntarle. Y al final dale siempre lo que quería: la pausa dura segundos, nunca «hasta que lo pida bien».",
    en: "First you copy them; then you show them something new. Comment on what they do instead of asking questions. And in the end always give them what they wanted: the pause lasts seconds, never “until they ask properly.”",
  },
  {
    es: "Cuando te muestre algo, te lo señale o te diga «tú»: mira lo que te muestra, vuelve a su cara con emoción y ponle la palabra. Una respuesta a medias apaga el gesto.",
    en: "When they show you something, point it out or say “you”: look at what they show you, come back to their face with excitement and put the word to it. A half-hearted answer switches the gesture off.",
  },
  {
    es: "El objeto entra dentro del juego que ya le gusta —la marcha, la persecución, las cosquillas—, nunca en frío en una mesa. Y un cambio a la vez: persona nueva o juego nuevo, nunca los dos.",
    en: "The object comes inside a game they already like — marching, chasing, tickles — never cold at a table. And one change at a time: a new person or a new game, never both.",
  },
  {
    es: "Ni más rápido ni más lento que él: sigue su ritmo.",
    en: "Not faster and not slower than your child: follow their pace.",
  },
  {
    es: "Sin examen: ni «¿qué es?», ni «¿dónde está?», ni «¿cómo se dice?», ni «haz esto» sentados en una mesa. Nómbrale las cosas en vez de preguntarle por ellas. Las preguntas que respondes tú enseguida («¿Más?… ¡más!», «¿Dónde está mamá?… ¡Aquí está!») son parte del juego. Y «Funcionó si» vale solo cuando pasó dentro de un juego de verdad, nunca armado para ver si entiende.",
    en: "No quizzing: no “what is it?”, no “where is it?”, no “how do you say it?”, no “do this” at a table. Name things for them instead of asking about them. Questions you answer yourself right away (“More?… more!”, “Where is Mom?… Here she is!”) are part of the game. And “It worked if” only counts when it happened inside a real game, never set up to see if they understand.",
  },
  {
    es: "Ningún premio por hacerlo, nunca le pidas que te mire, y no le exijas decirlo de una forma: vale el gesto, el sonido o la palabra.",
    en: "No reward for doing it, never ask them to look at you, and never demand a particular way of saying it: a gesture, a sound or a word all count.",
  },
  {
    es: "El hermano juega con él; no le enseña. Sus reglas de siempre: una cosa a la vez, esperar cinco segundos, copiarlo. Si una ficha le da otras, son solo para ese juego.",
    en: "The sibling plays with them; the sibling does not teach. The usual rules: one thing at a time, wait five seconds, copy them. If a card gives other rules, they are only for that game.",
  },
  {
    es: "Si aparta la vista, se tapa la cara o se irrita para salirse del juego: se para. «Se acabó» cierra el juego; no lo persigas para seguir.",
    en: "If they look away, cover their face or get upset to get out of the game: stop. “All done” closes the game; do not chase them to keep going.",
  },
  {
    es: "Sin contar, sin plazos, sin metas con número. Nada de esto promete que hable en una fecha: cada ficha dice qué ver, y ya.",
    en: "No counting, no deadlines, no goals with numbers. None of this promises they will talk by a date: each card says what to look for, and that is all.",
  },
  {
    es: "Momentos cortos, nunca sesiones. Un mal día no borra nada. Y tú también descansas.",
    en: "Short moments, never sessions. A bad day erases nothing. And you get to rest too.",
  },
];

// ── Preguntas de juicio (modo revisión — G-Contenido del papá) ───────────────────────────────
const JUICIO = [
  { es: "¿Lo puede hacer la mamá tal cual, en un momento corto, sin preparar nada?", en: "Can Mom do it exactly as written, in a short moment, with nothing to prepare?" },
  { es: "¿Se entiende sin ti? ¿Cada paso es una sola acción?", en: "Does it make sense without you explaining it? Is each step a single action?" },
  { es: "¿Hay algo que no es él — algo que no le gusta, que no hace o que no va con su casa?", en: "Is there anything that is not them — something they do not like, do not do, or that does not fit their home?" },
  { es: "¿Alguna ficha le pediría forzarlo, aunque sea un poco?", en: "Would any card ask you to push them, even a little?" },
];

// ── Piezas ──────────────────────────────────────────────────────────────────────────────────
const RAZON_LEGIBLE = {
  "necesita-la-app": { es: "necesita la pantalla", en: "needs the screen" },
  "etapa-siguiente": { es: "es de la etapa siguiente", en: "belongs to the next stage" },
  "va-a-que-no-hacer": { es: "quedó como regla del «Qué no hacer»", en: "became a rule in “What not to do”" },
};
const ORIGEN_LEGIBLE = {
  mirada: { es: "del documento anterior", en: "from the previous document" },
  habla: { es: "de la app", en: "from the app" },
  nueva: { es: "nueva", en: "new" },
  fusion: { es: "fusión", en: "merged" },
};
const refLegible = (r) =>
  r.replace(/^mirada:/, "mirada · ").replace(/^habla:/, "app · ").replace(/^anexo:/, "investigación · ");

const lis = (items) => items.map((t) => `<li>${par(t.es, t.en)}</li>`).join("");
const chipRefs = (refs) => refs.map((r) => esc(refLegible(r))).join(" + ");

function fichaHtml(f) {
  const paso = f.progresion ? { es: PROGRESIONES[f.grupo][f.progresion], en: PROGRESIONES_EN[f.grupo][f.progresion] } : null;
  return `
    <article class="ficha" id="${esc(f.id)}">
      <label class="casilla-revision solo-revision"><input type="checkbox" data-revision="${esc(f.id)}" aria-label="Revisada: ${esc(f.titulo.es)}" data-aria-en="Reviewed: ${esc(f.titulo.en)}"> ${par("Revisada", "Reviewed")}</label>
      <p class="eyebrow grupo-ficha">${par(NOMBRE_GRUPO[f.grupo], NOMBRE_GRUPO_EN[f.grupo])}</p>
      <h3>${par(f.titulo.es, f.titulo.en)}</h3>
      <p class="chips">
        <span class="chip">${par(NOMBRE_TECNICA_FICHA[f.tecnica], NOMBRE_TECNICA_FICHA_EN[f.tecnica])}</span>
        <span class="chip suave">${esc(f.duracion)}</span>
        ${f.momentos.map((m) => `<span class="chip suave">${par(NOMBRE_MOMENTO[m], NOMBRE_MOMENTO_EN[m])}</span>`).join("")}
        ${f.conQuien === "hermano" ? `<span class="chip chip-hermano">${par("con el hermano", "with the sibling")}</span>` : ""}
        ${paso ? `<span class="chip chip-paso">${par("Paso: " + paso.es, "Step: " + paso.en)}</span>` : ""}
      </p>
      <div class="parte">
        <p class="rotulo">${par("Ten a la mano", "Have ready")}</p>
        <ul>${lis(f.tenALaMano)}</ul>
      </div>
      <div class="parte">
        <p class="rotulo">${par("Haz", "Do")}</p>
        <ol>${lis(f.haz)}</ol>
      </div>
      <blockquote><span class="rotulo">${par("Tu línea", "Your line")}</span> ${par(f.tuLinea.es, f.tuLinea.en)}</blockquote>
      <div class="parte">
        <p class="rotulo">${par("Espera ver", "What you may see")}</p>
        <p>${par(f.esperaVer.es, f.esperaVer.en)}</p>
      </div>
      <div class="parte funciono">
        <p class="rotulo">${par("Funcionó si", "It worked if")}</p>
        <p>${par(f.funcionoSi.es, f.funcionoSi.en)}</p>
      </div>
      <div class="parte si-no">
        <p class="rotulo">${par("Si no pasa", "If it doesn't happen")}</p>
        <p>${par(f.siNoPasa.es, f.siNoPasa.en)}</p>
      </div>
      <p class="fuente">${esc(f.fuente)}</p>
      <p class="origen solo-revision">${par("Viene de", "Comes from")} (${par(ORIGEN_LEGIBLE[f.origen.de].es, ORIGEN_LEGIBLE[f.origen.de].en)}): ${chipRefs(f.origen.refs)}</p>
    </article>`;
}

const nFichas = (n) => par(`${n} ${n === 1 ? "ficha" : "fichas"}`, `${n} ${n === 1 ? "card" : "cards"}`);
const prio = par("prioridad ahora", "priority now");

const piramideHtml = GRUPOS.map(
  (g) => `
      <li>
        <p class="grupo-nombre"><a href="#grupo-${g}">${par(NOMBRE_GRUPO[g], NOMBRE_GRUPO_EN[g])}</a>
          ${esPrioritario(g) ? `<span class="chip chip-prioridad">${prio}</span>` : ""}
          <span class="conteo">${nFichas(deGrupo(g).length)}</span></p>
        <p class="suave">${par(DESCRIPCION_GRUPO[g], DESCRIPCION_GRUPO_EN[g])}</p>
      </li>`,
).join("");

const indiceHtml = ORDEN_DOCUMENTO.map(
  (g) =>
    `<a href="#grupo-${g}"${esPrioritario(g) ? ` class="prioritario"` : ""}>${par(NOMBRE_GRUPO[g], NOMBRE_GRUPO_EN[g])} · ${deGrupo(g).length}${
      esPrioritario(g) ? `<span class="solo-lector"> · ${prio}</span>` : ""
    }</a>`,
).join("\n      ");

const gruposHtml = ORDEN_DOCUMENTO.map(
  (g) => `
  <section class="grupo" id="grupo-${g}" aria-labelledby="titulo-${g}">
    <h2 id="titulo-${g}">${par(NOMBRE_GRUPO[g], NOMBRE_GRUPO_EN[g])}
      ${esPrioritario(g) ? `<span class="chip chip-prioridad">${prio}</span>` : ""}
      <span class="conteo">(${nFichas(deGrupo(g).length)})</span></h2>
    <p class="suave">${par(DESCRIPCION_GRUPO[g], DESCRIPCION_GRUPO_EN[g])}</p>
    ${deGrupo(g).map(fichaHtml).join("")}
  </section>`,
).join("");

const html = `<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
${IDIOMA_HEAD}
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Hablemos San — La pirámide, en casa</title>
<style>
${PALETA_CSS}
${IDIOMA_CSS}
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body { margin: 0; padding: 1.25rem 1rem 4rem; background: var(--fondo); color: var(--tinta);
    font: 17px/1.55 Georgia, "Times New Roman", serif; overflow-wrap: break-word; }
  main { max-width: 42rem; margin: 0 auto; }
  h1 { font-size: 2rem; line-height: 1.12; margin: .3rem 0 .6rem; }
  h2 { font-size: 1.75rem; line-height: 1.2; margin: 2.8rem 0 .5rem; padding-bottom: .35rem; border-bottom: 2px solid var(--borde);
    display: flex; align-items: baseline; flex-wrap: wrap; gap: .1rem .5rem; }
  h3 { margin: .1rem 0 .4rem; font-size: 1.12rem; line-height: 1.3; }
  /* El título de cada ficha manda: se ve dónde empieza una y dónde termina la otra. */
  .ficha h3 { font-size: 1.45rem; line-height: 1.2; margin: .15rem 0 .55rem; text-wrap: balance; }
  .ficha .grupo-ficha { color: var(--acento); }
  p { margin: .45rem 0; }
  .eyebrow { font: 600 .72rem/1.35 system-ui, sans-serif; letter-spacing: .08em; text-transform: uppercase; color: var(--suave); margin: 0; }
  .suave { color: var(--suave); }
  .conteo { font: 400 .85rem system-ui, sans-serif; color: var(--suave); }
  .aviso { background: var(--superficie); border: 1px solid var(--borde); border-radius: 14px; padding: .9rem 1rem; margin: .9rem 0; }
  .encuadre { border-left: 4px solid var(--acento); }
  .semaforo { border-left: 4px solid var(--peligro); }
  .favoritos { border-left: 4px solid var(--celebracion); }
  .favoritos ul, ul.lista { padding-left: 1.2rem; margin: .4rem 0; } .favoritos li, ul.lista li { margin: .3rem 0; }
  .indice { display: flex; flex-wrap: wrap; gap: .5rem; margin: .8rem 0 1rem; }
  .indice a { font: 600 .82rem/1.2 system-ui, sans-serif; text-decoration: none; color: var(--acento); border: 1px solid var(--borde);
    border-radius: 999px; padding: .55rem .8rem; min-height: 44px; display: inline-flex; align-items: center; }
  .indice a.prioritario { border: 2px solid var(--acento); }
  .solo-lector { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .piramide { list-style: none; padding: 0; margin: .5rem 0; }
  .piramide li { padding: .6rem 0; border-bottom: 1px dashed var(--borde); }
  .grupo-nombre { margin: 0; font-weight: 700; display: flex; align-items: baseline; flex-wrap: wrap; gap: .1rem .5rem; }
  .grupo-nombre a { color: var(--tinta); }
  .piramide .suave { margin: .2rem 0 0; font-size: .95rem; }
  .lectura { list-style: none; padding: 0; margin: .5rem 0; display: grid; gap: .35rem; }
  .lectura li { font-size: .97rem; }
  .chips { margin: .2rem 0 .7rem; line-height: 1.9; }
  .chip { display: inline-block; font: 600 .72rem/1.2 system-ui, sans-serif; letter-spacing: .03em; background: var(--acento-suave);
    color: var(--acento); border-radius: 999px; padding: .3rem .62rem; margin: 0 .3rem .3rem 0; vertical-align: middle; }
  .chip.suave { background: transparent; border: 1px solid var(--borde); color: var(--suave); }
  .chip-prioridad { background: var(--acento); color: var(--fondo); }
  .chip-hermano { background: var(--aviso-suave); color: var(--tinta); }
  .chip-paso { background: transparent; border: 1px dashed var(--acento); color: var(--acento); }
  .ficha { background: var(--superficie); border: 1px solid var(--borde); border-top: 6px solid var(--acento); border-radius: 16px;
    padding: 1rem 1.1rem 1.1rem; margin: 2rem 0; position: relative; }
  .ficha.lista { opacity: .55; }
  .parte { margin: .7rem 0; }
  .parte ul, .parte ol { margin: .25rem 0 0; padding-left: 1.3rem; }
  .parte li { margin: .25rem 0; }
  .parte p:not(.rotulo) { margin: .2rem 0 0; }
  .rotulo { font: 700 .74rem/1.2 system-ui, sans-serif; letter-spacing: .07em; text-transform: uppercase; color: var(--suave); margin: 0; }
  blockquote { margin: .7rem 0; padding: .55rem .9rem; border-left: 4px solid var(--acento); background: var(--fondo); border-radius: 0 10px 10px 0; font-style: italic; }
  blockquote .rotulo { display: block; font-style: normal; margin-bottom: .15rem; }
  .funciono { padding: .55rem .8rem; background: var(--fondo); border-radius: 10px; border: 2px solid var(--acento-suave); }
  .funciono .rotulo { color: var(--acento); }
  .si-no { padding: .55rem .8rem; background: var(--fondo); border-radius: 10px; border: 1px dashed var(--borde); font-size: .96rem; }
  .fuente { font: .78rem system-ui, sans-serif; color: var(--suave); margin: .7rem 0 0; }
  .origen { font: .76rem system-ui, sans-serif; color: var(--info); margin: .3rem 0 0; }
  .casilla-revision { position: absolute; top: .9rem; right: 1rem; font: .8rem system-ui, sans-serif; color: var(--suave); user-select: none; }
  .solo-revision { display: none; }
  body.revision .solo-revision { display: block; }
  body.revision .ficha h3, body.revision .ficha .grupo-ficha { margin-right: 6rem; }
  a:focus-visible, input:focus-visible { outline: 3px solid var(--info); outline-offset: 2px; }
  footer { margin-top: 3rem; font-size: .8rem; color: var(--suave); border-top: 1px solid var(--borde); padding-top: 1rem; }
  @media (prefers-reduced-motion: no-preference) { .ficha { transition: opacity .2s; } }
  @media print {
    body { padding: 0; font-size: 11pt; background: #fff; color: #000; }
    .solo-revision, .indice { display: none !important; }
    .ficha { break-inside: avoid; border: 1px solid #999; border-top: 4px solid #000; background: #fff; margin: 1.2rem 0; }
    .grupo h2 { break-after: avoid; }
  }
</style>
</head>
<body>
<main>
${IDIOMA_CONMUTADOR}
  <header>
    <p class="eyebrow">${par("Hablemos San · Para la mamá · sin pantallas", "Hablemos San · For Mom · no screens")}</p>
    <h1>${par("La pirámide, en casa", "The pyramid, at home")}</h1>
    <p>${parHtml(
      `La pirámide tiene seis piezas: <strong>señalar, imitar, comprender, atención conjunta, intención comunicativa y
    juego</strong>. No son pisos que se suben uno por uno: <strong>se construyen todas a la vez</strong>, en los mismos juegos. Aquí
    cada una está convertida en actividades cortas, hechas con lo que a él ya le gusta.`,
      `The pyramid has six pieces: <strong>pointing, imitation, understanding, joint attention, reasons to communicate and
    play</strong>. They are not floors you climb one at a time: <strong>they are all built at once</strong>, in the same games. Here
    each one is turned into short activities, made with what your child already likes.`,
    )}</p>
    <nav class="indice" aria-label="Grupos de fichas" data-aria-en="Card groups">
      ${indiceHtml}
      <a href="#que-no-hacer">${par("Qué no hacer", "What not to do")}</a>
    </nav>
    <div class="aviso favoritos">
      <p>${parHtml("<strong>Lo que ya le gusta</strong> — las fichas entran por aquí a propósito:", "<strong>What they already like</strong> — the cards come in through here on purpose:")}</p>
      <ul>${lis(FAVORITOS)}</ul>
    </div>
    <div class="aviso encuadre">
      <p>${parHtml(
        "<strong>Esto no es una prueba.</strong> Ni para él ni para ti. No hay puntajes, ni metas con número, ni plazos.",
        "<strong>This is not a test.</strong> Not for your child and not for you. There are no scores, no goals with numbers, no deadlines.",
      )}</p>
      <p>${parHtml(
        `<strong>Momentos cortos</strong> — de 5 a 30 minutos repartidos en el día: jugando, en el baño, en la mesa, al vestirlo. Nunca
      sesiones. Y <strong>descansar también cuenta</strong>.`,
        `<strong>Short moments</strong> — from 5 to 30 minutes spread through the day: playing, in the bath, at the table, getting dressed. Never
      sessions. And <strong>resting counts too</strong>.`,
      )}</p>
    </div>
    <div class="aviso semaforo">
      <p>${parHtml(
        `<strong>El único semáforo:</strong> si aparta la vista, se tapa la cara o se irrita <strong>para salirse del juego</strong>,
      <strong>se para</strong>. Se vuelve a intentar más tarde, o mañana. (En el cucú, taparse es el juego, no el semáforo.)`,
        `<strong>The only traffic light:</strong> if they look away, cover their face or get upset <strong>to get out of the game</strong>,
      <strong>you stop</strong>. You try again later, or tomorrow. (In peekaboo, covering the face is the game, not the signal.)`,
      )}</p>
    </div>
  </header>

  <h2>${par("La pirámide: un mapa, no una escalera", "The pyramid: a map, not a ladder")}</h2>
  <p>${par(
    "Las seis, en una frase cada una. Las marcadas «prioridad ahora» son las que más trabajo necesitan ahora; las demás también van, todos los días.",
    "All six, in one sentence each. The ones marked “priority now” need the most work right now; the others go in too, every day.",
  )}</p>
  <ul class="piramide">${piramideHtml}
  </ul>
  <p>${parHtml(
    `Lo único que tiene orden es lo que pasa <strong>dentro de un mismo rato de juego</strong>: primero lo copias tú y después le
  muestras algo nuevo; primero un juego que dure y después mostrar o señalar; y el objeto entra dentro del juego de moverse, nunca en
  frío en una mesa. Cada ficha ya trae ese orden en sus pasos.`,
    `The only thing with an order is what happens <strong>within a single stretch of play</strong>: first you copy them and then you
  show them something new; first a game that lasts and then showing or pointing; and the object comes inside a moving game, never cold
  at a table. Each card already brings that order in its steps.`,
  )}</p>

  <h2>${par("Cómo se lee una ficha", "How to read a card")}</h2>
  <ul class="lectura">
    <li>${parHtml("<strong>Ten a la mano</strong> — lo que necesitas listo.", "<strong>Have ready</strong> — what you need on hand.")}</li>
    <li>${parHtml("<strong>Haz</strong> — los pasos, uno por acción.", "<strong>Do</strong> — the steps, one action each.")}</li>
    <li>${parHtml("<strong>Tu línea</strong> — lo que dices, tal cual.", "<strong>Your line</strong> — what you say, word for word.")}</li>
    <li>${parHtml("<strong>Espera ver</strong> — lo que es probable que pase.", "<strong>What you may see</strong> — what is likely to happen.")}</li>
    <li>${parHtml("<strong>Funcionó si</strong> — la señal de que sirvió. No hay que contar nada.", "<strong>It worked if</strong> — the sign that it helped. There is nothing to count.")}</li>
    <li>${parHtml("<strong>Si no pasa</strong> — cómo hacerlo más fácil. Nunca es insistir.", "<strong>If it doesn't happen</strong> — how to make it easier. Never by insisting.")}</li>
  </ul>
  <p class="suave">${parHtml(
    `Algunas fichas dicen en qué <strong>paso</strong> sirven. Es para ubicarte, no una meta: cada cosa puede ir en un
  paso distinto el mismo día, y un mal día no baja ningún paso.`,
    `Some cards say which <strong>step</strong> they fit. It is to help you find your place, not a goal: each thing can sit at a
  different step on the same day, and a bad day does not move anything down a step.`,
  )}</p>

  <h2 id="que-no-hacer">${par("Qué no hacer", "What not to do")}</h2>
  <ul class="lista">${QUE_NO_HACER.map((q) => `
    <li>${par(q.es, q.en)}</li>`).join("")}
  </ul>

  <section class="solo-revision aviso" aria-label="Preguntas de juicio para la revisión" data-aria-en="Review questions">
    <p class="eyebrow">${par("Modo revisión · para el papá, antes de que llegue a la mamá", "Review mode · for Dad, before it reaches Mom")}</p>
    <ul class="lista">${JUICIO.map((q) => `
      <li>${par(q.es, q.en)}</li>`).join("")}
    </ul>
    <p class="suave"><span id="revisadas">0</span> ${par(`de ${FICHAS.length} revisadas · tu avance queda guardado en este navegador.`, `of ${FICHAS.length} reviewed · your progress is saved in this browser.`)}</p>
    <p class="suave">${par(`Quedaron fuera del documento (${CAEN_DEL_DOCUMENTO.length}); siguen en la app:`, `Left out of the document (${CAEN_DEL_DOCUMENTO.length}); they stay in the app:`)}</p>
    <ul class="lista">${CAEN_DEL_DOCUMENTO.map((c) => `
      <li>${par("app · ", "app · ")}${esc(c.id)} — ${par(RAZON_LEGIBLE[c.razon].es, RAZON_LEGIBLE[c.razon].en)}</li>`).join("")}
    </ul>
  </section>
${gruposHtml}

  <footer>${par(
    `Hablemos San — el documento de la mamá: ${FICHAS.length} fichas de actividad, generadas del contenido real el ${fecha}. Cada ficha cita la investigación que la respalda (autor, año y revista). Esto es juego en casa: acompaña, nunca reemplaza, las terapias del niño.`,
    `Hablemos San — the document for Mom: ${FICHAS.length} activity cards, generated from the real content on ${fecha}. Each card cites the research behind it (author, year and journal). This is play at home: it accompanies, and never replaces, the child's therapies.`,
  )}</footer>
</main>
${idiomaScript({ es: "Hablemos San — La pirámide, en casa", en: "Hablemos San — The pyramid, at home" })}
<script>
(function () {
  // Modo revisión (?revision): casillas «Revisada» para el papá, guardadas aparte en su navegador.
  if (!/[?&]revision/.test(location.search)) return;
  document.body.classList.add("revision");
  var CLAVE = "piramide-revision:";
  var cajas = document.querySelectorAll("[data-revision]");
  var contador = document.getElementById("revisadas");
  function pintar() {
    var n = 0;
    cajas.forEach(function (c) { if (c.checked) n++; c.closest(".ficha").classList.toggle("lista", c.checked); });
    contador.textContent = n;
  }
  cajas.forEach(function (c) {
    try { c.checked = localStorage.getItem(CLAVE + c.dataset.revision) === "1"; } catch (e) {}
    c.addEventListener("change", function () {
      try { if (c.checked) localStorage.setItem(CLAVE + c.dataset.revision, "1"); else localStorage.removeItem(CLAVE + c.dataset.revision); } catch (e) {}
      pintar();
    });
  });
  pintar();
})();
</script>
</body>
</html>
`;

writeFileSync(new URL("../docs/LA-PIRAMIDE.html", import.meta.url), html);
console.log(
  `docs/LA-PIRAMIDE.html generado — ${FICHAS.length} fichas.`,
);
