// Descarga UNA VEZ, en desarrollo, el lote curado de pictogramas ARASAAC (ADR 008).
// En runtime la app JAMÁS llama a ARASAAC: sirve los PNG del repo (el e2e cero-red lo vigila).
//
// Licencia: los pictogramas son propiedad del Gobierno de Aragón (España), creados por
// Sergio Palao para ARASAAC (https://arasaac.org), bajo CC BY-NC-SA. Esta app es personal y no
// comercial. La atribución vive en public/pictogramas/LICENCIA.md y en "Acerca de" de la app.
//
// La CURADURÍA es humana: la lista de abajo la elige una persona (palabras del nivel "palabras
// sueltas" — ADR 005: nombrables, concretas, útiles en la vida del niño). El script solo trae
// el mejor pictograma de ARASAAC para cada palabra.
//
// Uso: node scripts/descargar-pictos.mjs   (los PNG y el manifest resultante se commitean)

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const API = "https://api.arasaac.org/api/pictograms/es/bestsearch";
const ESTATICO = "https://static.arasaac.org/pictograms";
const RESOLUCION = 500;

/** Curaduría por los 6 temas de interés del onboarding. Palabras concretas y nombrables. */
const CURADURIA = {
  animales: [
    "perro",
    "gato",
    "pájaro",
    "caballo",
    "vaca",
    "pato",
    "conejo",
    "elefante",
  ],
  carros: [
    "coche",
    "camión",
    "autobús",
    "moto",
    "tren",
    "avión",
    "bicicleta",
    "barco",
  ],
  espacio: ["sol", "luna", "estrella", "cohete", "planeta", "nube", "cielo"],
  dinosaurios: ["dinosaurio", "huevo", "hueso", "volcán", "árbol", "roca"],
  musica: ["tambor", "guitarra", "piano", "flauta", "campana", "cantar"],
  mar: ["pez", "agua", "barco", "concha", "playa", "pulpo", "tortuga"],
};

const salida = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../public/pictogramas",
);
mkdirSync(salida, { recursive: true });

/** Slug de archivo estable y sin tildes (el nombre visible vive en el manifest). */
const slug = (palabra) =>
  palabra
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");

const lote = [];
const vistos = new Set();

for (const [tema, palabras] of Object.entries(CURADURIA)) {
  for (const palabra of palabras) {
    const clave = `${tema}:${slug(palabra)}`;
    if (vistos.has(clave)) continue;

    const res = await fetch(`${API}/${encodeURIComponent(palabra)}`);
    if (!res.ok) {
      console.warn(`⚠️  sin resultados para "${palabra}" (${res.status})`);
      continue;
    }
    const resultados = await res.json();
    const mejor = resultados[0];
    if (!mejor?._id) {
      console.warn(`⚠️  sin pictograma para "${palabra}"`);
      continue;
    }

    const url = `${ESTATICO}/${mejor._id}/${mejor._id}_${RESOLUCION}.png`;
    const png = await fetch(url);
    if (!png.ok) {
      console.warn(`⚠️  no se pudo descargar ${url} (${png.status})`);
      continue;
    }
    const archivo = `${slug(palabra)}.png`;
    writeFileSync(
      resolve(salida, archivo),
      Buffer.from(await png.arrayBuffer()),
    );

    vistos.add(clave);
    lote.push({
      id: `${tema}-${slug(palabra)}`,
      palabra,
      tema,
      archivo,
      arasaacId: mejor._id,
    });
    console.log(`✓ ${tema.padEnd(12)} ${palabra.padEnd(12)} → ${archivo}`);
  }
}

// Manifest CRUDO (trazabilidad: qué id de ARASAAC quedó en cada archivo). El manifest que la app
// consume es content/pictogramas.ts, curado a mano a partir de este.
writeFileSync(
  resolve(salida, "lote.json"),
  `${JSON.stringify(lote, null, 2)}\n`,
);

const LICENCIA = `# Pictogramas ARASAAC — licencia y atribución

Los pictogramas de esta carpeta **no son obra de esta app**. Se usan bajo licencia, y su
atribución es obligatoria.

- **Autor de los pictogramas:** Sergio Palao
- **Origen:** ARASAAC (https://arasaac.org)
- **Propiedad:** Gobierno de Aragón (España)
- **Licencia:** Creative Commons BY-NC-SA
  (https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es)

## Qué significa aquí (ADR 008)

- **BY** — la atribución de arriba aparece en la app, visible para el usuario, en
  *Ajustes → Acerca de*.
- **NC (no comercial)** — Hablemos San es una app **personal y no comercial**. Si algún día
  dejara de serlo, estos pictogramas deben **reemplazarse** (o relicenciarse) ANTES de ese
  cambio.
- **SA** — cualquier obra derivada de los pictogramas se comparte bajo la misma licencia.

## Cómo se generó este lote

\`node scripts/descargar-pictos.mjs\` — descarga única en desarrollo, con curaduría humana de las
palabras (nivel "palabras sueltas", ADR 005). **En runtime la app no llama a ARASAAC:** sirve
estos archivos desde el repo, y un test e2e verifica que no hay ninguna petición de red durante
los juegos. \`lote.json\` guarda la trazabilidad (qué id de ARASAAC quedó en cada archivo).
`;
writeFileSync(resolve(salida, "LICENCIA.md"), LICENCIA);

console.log(`\nOK → ${lote.length} pictogramas en ${salida}`);
console.log("Recuerda: la atribución CC BY-NC-SA es obligatoria (LICENCIA.md).");
