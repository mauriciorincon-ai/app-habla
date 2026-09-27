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
import { PALETA_CSS, esc, fechaHoy } from "./lib/catalogo-comun.mjs";

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
  "Marchar y copiar movimientos grandes de brazos y piernas.",
  "«Corre que te atrapo»: voltea a ver si lo sigues, sonríe y corre.",
  "Las cosquillas, con su propio sonido — y ya te las hace a ti.",
  "Seguir tu dedo cuando señalas, y señalar diciendo «tú».",
  "«Hola» y «chao» con la mano y la voz juntas.",
  "Repetir las vocales.",
];

// ── Qué no hacer (reglas transversales de la investigación del S6, en observable) ─────────────
const QUE_NO_HACER = [
  "Primero lo copias tú; después le muestras algo nuevo. Comenta lo que hace en vez de preguntarle. Y al final dale siempre lo que quería: la pausa dura segundos, nunca «hasta que lo pida bien».",
  "Cuando te muestre algo, te lo señale o te diga «tú»: mira lo que te muestra, vuelve a su cara con emoción y ponle la palabra. Una respuesta a medias apaga el gesto.",
  "El objeto entra dentro del juego que ya le gusta —la marcha, la persecución, las cosquillas—, nunca en frío en una mesa. Y un cambio a la vez: persona nueva o juego nuevo, nunca los dos.",
  "Ni más rápido ni más lento que él: sigue su ritmo.",
  "Sin examen: ni «¿qué es?», ni «¿dónde está?», ni «¿cómo se dice?», ni «haz esto» sentados en una mesa. Nómbrale las cosas en vez de preguntarle por ellas. Las preguntas que respondes tú enseguida («¿Más?… ¡más!», «¿Dónde está mamá?… ¡Aquí está!») son parte del juego. Y «Funcionó si» vale solo cuando pasó dentro de un juego de verdad, nunca armado para ver si entiende.",
  "Ningún premio por hacerlo, nunca le pidas que te mire, y no le exijas decirlo de una forma: vale el gesto, el sonido o la palabra.",
  "El hermano juega con él; no le enseña. Sus reglas de siempre: una cosa a la vez, esperar cinco segundos, copiarlo. Si una ficha le da otras, son solo para ese juego.",
  "Si aparta la vista, se tapa la cara o se irrita para salirse del juego: se para. «Se acabó» cierra el juego; no lo persigas para seguir.",
  "Sin contar, sin plazos, sin metas con número. Nada de esto promete que hable en una fecha: cada ficha dice qué ver, y ya.",
  "Momentos cortos, nunca sesiones. Un mal día no borra nada. Y tú también descansas.",
];

// ── Preguntas de juicio (modo revisión — G-Contenido del papá) ───────────────────────────────
const JUICIO = [
  "¿Lo puede hacer la mamá tal cual, en un momento corto, sin preparar nada?",
  "¿Se entiende sin ti? ¿Cada paso es una sola acción?",
  "¿Hay algo que no es él — algo que no le gusta, que no hace o que no va con su casa?",
  "¿Alguna ficha le pediría forzarlo, aunque sea un poco?",
];

// ── Piezas ──────────────────────────────────────────────────────────────────────────────────
const RAZON_LEGIBLE = {
  "necesita-la-app": "necesita la pantalla",
  "etapa-siguiente": "es de la etapa siguiente",
  "va-a-que-no-hacer": "quedó como regla del «Qué no hacer»",
};
const ORIGEN_LEGIBLE = { mirada: "del documento anterior", habla: "de la app", nueva: "nueva", fusion: "fusión" };
const refLegible = (r) =>
  r.replace(/^mirada:/, "mirada · ").replace(/^habla:/, "app · ").replace(/^anexo:/, "investigación · ");

function fichaHtml(f) {
  const paso = f.progresion ? PROGRESIONES[f.grupo][f.progresion] : null;
  return `
    <article class="ficha" id="${esc(f.id)}">
      <label class="casilla-revision solo-revision"><input type="checkbox" data-revision="${esc(f.id)}" aria-label="Revisada: ${esc(f.titulo)}"> Revisada</label>
      <p class="eyebrow grupo-ficha">${esc(NOMBRE_GRUPO[f.grupo])}</p>
      <h3>${esc(f.titulo)}</h3>
      <p class="chips">
        <span class="chip">${esc(NOMBRE_TECNICA_FICHA[f.tecnica])}</span>
        <span class="chip suave">${esc(f.duracion)}</span>
        ${f.momentos.map((m) => `<span class="chip suave">${esc(NOMBRE_MOMENTO[m])}</span>`).join("")}
        ${f.conQuien === "hermano" ? `<span class="chip chip-hermano">con el hermano</span>` : ""}
        ${paso ? `<span class="chip chip-paso">Paso: ${esc(paso)}</span>` : ""}
      </p>
      <div class="parte">
        <p class="rotulo">Ten a la mano</p>
        <ul>${f.tenALaMano.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>
      </div>
      <div class="parte">
        <p class="rotulo">Haz</p>
        <ol>${f.haz.map((t) => `<li>${esc(t)}</li>`).join("")}</ol>
      </div>
      <blockquote><span class="rotulo">Tu línea</span> ${esc(f.tuLinea)}</blockquote>
      <div class="parte">
        <p class="rotulo">Espera ver</p>
        <p>${esc(f.esperaVer)}</p>
      </div>
      <div class="parte funciono">
        <p class="rotulo">Funcionó si</p>
        <p>${esc(f.funcionoSi)}</p>
      </div>
      <div class="parte si-no">
        <p class="rotulo">Si no pasa</p>
        <p>${esc(f.siNoPasa)}</p>
      </div>
      <p class="fuente">${esc(f.fuente)}</p>
      <p class="origen solo-revision">Viene de (${esc(ORIGEN_LEGIBLE[f.origen.de])}): ${f.origen.refs.map((r) => esc(refLegible(r))).join(" + ")}</p>
    </article>`;
}

const piramideHtml = GRUPOS.map(
  (g) => `
      <li>
        <p class="grupo-nombre"><a href="#grupo-${g}">${esc(NOMBRE_GRUPO[g])}</a>
          ${esPrioritario(g) ? `<span class="chip chip-prioridad">prioridad ahora</span>` : ""}
          <span class="conteo">${deGrupo(g).length} ${deGrupo(g).length === 1 ? "ficha" : "fichas"}</span></p>
        <p class="suave">${esc(DESCRIPCION_GRUPO[g])}</p>
      </li>`,
).join("");

const indiceHtml = ORDEN_DOCUMENTO.map(
  (g) =>
    `<a href="#grupo-${g}"${esPrioritario(g) ? ` class="prioritario"` : ""}>${esc(NOMBRE_GRUPO[g])} · ${deGrupo(g).length}${
      esPrioritario(g) ? `<span class="solo-lector"> · prioridad ahora</span>` : ""
    }</a>`,
).join("\n      ");

const gruposHtml = ORDEN_DOCUMENTO.map(
  (g) => `
  <section class="grupo" id="grupo-${g}" aria-labelledby="titulo-${g}">
    <h2 id="titulo-${g}">${esc(NOMBRE_GRUPO[g])}
      ${esPrioritario(g) ? `<span class="chip chip-prioridad">prioridad ahora</span>` : ""}
      <span class="conteo">(${deGrupo(g).length} ${deGrupo(g).length === 1 ? "ficha" : "fichas"})</span></h2>
    <p class="suave">${esc(DESCRIPCION_GRUPO[g])}</p>
    ${deGrupo(g).map(fichaHtml).join("")}
  </section>`,
).join("");

const html = `<!doctype html>
<html lang="es-CO">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<title>Hablemos San — La pirámide, en casa</title>
<style>
${PALETA_CSS}
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
  <header>
    <p class="eyebrow">Hablemos San · Para la mamá · sin pantallas</p>
    <h1>La pirámide, en casa</h1>
    <p>La pirámide tiene seis piezas: <strong>señalar, imitar, comprender, atención conjunta, intención comunicativa y
    juego</strong>. No son pisos que se suben uno por uno: <strong>se construyen todas a la vez</strong>, en los mismos juegos. Aquí
    cada una está convertida en actividades cortas, hechas con lo que a él ya le gusta.</p>
    <nav class="indice" aria-label="Grupos de fichas">
      ${indiceHtml}
      <a href="#que-no-hacer">Qué no hacer</a>
    </nav>
    <div class="aviso favoritos">
      <p><strong>Lo que ya le gusta</strong> — las fichas entran por aquí a propósito:</p>
      <ul>${FAVORITOS.map((f) => `<li>${esc(f)}</li>`).join("")}</ul>
    </div>
    <div class="aviso encuadre">
      <p><strong>Esto no es una prueba.</strong> Ni para él ni para ti. No hay puntajes, ni metas con número, ni plazos.</p>
      <p><strong>Momentos cortos</strong> — de 5 a 30 minutos repartidos en el día: jugando, en el baño, en la mesa, al vestirlo. Nunca
      sesiones. Y <strong>descansar también cuenta</strong>.</p>
    </div>
    <div class="aviso semaforo">
      <p><strong>El único semáforo:</strong> si aparta la vista, se tapa la cara o se irrita <strong>para salirse del juego</strong>,
      <strong>se para</strong>. Se vuelve a intentar más tarde, o mañana. (En el cucú, taparse es el juego, no el semáforo.)</p>
    </div>
  </header>

  <h2>La pirámide: un mapa, no una escalera</h2>
  <p>Las seis, en una frase cada una. Las marcadas «prioridad ahora» son las que más trabajo necesitan ahora; las demás también
  van, todos los días.</p>
  <ul class="piramide">${piramideHtml}
  </ul>
  <p>Lo único que tiene orden es lo que pasa <strong>dentro de un mismo rato de juego</strong>: primero lo copias tú y después le
  muestras algo nuevo; primero un juego que dure y después mostrar o señalar; y el objeto entra dentro del juego de moverse, nunca en
  frío en una mesa. Cada ficha ya trae ese orden en sus pasos.</p>

  <h2>Cómo se lee una ficha</h2>
  <ul class="lectura">
    <li><strong>Ten a la mano</strong> — lo que necesitas listo.</li>
    <li><strong>Haz</strong> — los pasos, uno por acción.</li>
    <li><strong>Tu línea</strong> — lo que dices, tal cual.</li>
    <li><strong>Espera ver</strong> — lo que es probable que pase.</li>
    <li><strong>Funcionó si</strong> — la señal de que sirvió. No hay que contar nada.</li>
    <li><strong>Si no pasa</strong> — cómo hacerlo más fácil. Nunca es insistir.</li>
  </ul>
  <p class="suave">Algunas fichas dicen en qué <strong>paso</strong> sirven. Es para ubicarte, no una meta: cada cosa puede ir en un
  paso distinto el mismo día, y un mal día no baja ningún paso.</p>

  <h2 id="que-no-hacer">Qué no hacer</h2>
  <ul class="lista">${QUE_NO_HACER.map((q) => `
    <li>${esc(q)}</li>`).join("")}
  </ul>

  <section class="solo-revision aviso" aria-label="Preguntas de juicio para la revisión">
    <p class="eyebrow">Modo revisión · para el papá, antes de que llegue a la mamá</p>
    <ul class="lista">${JUICIO.map((q) => `
      <li>${esc(q)}</li>`).join("")}
    </ul>
    <p class="suave"><span id="revisadas">0</span> de ${FICHAS.length} revisadas · tu avance queda guardado en este navegador.</p>
    <p class="suave">Quedaron fuera del documento (${CAEN_DEL_DOCUMENTO.length}); siguen en la app:</p>
    <ul class="lista">${CAEN_DEL_DOCUMENTO.map((c) => `
      <li>app · ${esc(c.id)} — ${esc(RAZON_LEGIBLE[c.razon])}</li>`).join("")}
    </ul>
  </section>
${gruposHtml}

  <footer>Hablemos San — el documento de la mamá: ${FICHAS.length} fichas de actividad, generadas del contenido real el ${fecha}.
  Cada ficha cita la investigación que la respalda (autor, año y revista). Esto es juego en casa: acompaña, nunca reemplaza,
  las terapias del niño.</footer>
</main>
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
