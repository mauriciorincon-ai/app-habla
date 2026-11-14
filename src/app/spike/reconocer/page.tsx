"use client";

// Measurement page for «¿Dijo la palabra?» (S11, ADR-023). It is a technical spike, like /spike/audio:
// it runs the real recognizer over the Lingua Libre test recordings (adult volunteers, licensed per
// file in tests/fixtures/palabras/LICENCIA.md — never the family) and prints how often it heard the
// right word. The e2e tests/e2e/reconocedor-medida.spec.ts serves the recordings and reads the table.
// No microphone here: the recordings are decoded to samples in memory and die there.

import { useState } from "react";
import { quizasDijo, UMBRAL_QUIZAS } from "@/lib/reconocer/coincidencia";
import {
  abrirMotor,
  cargar,
  descargar,
  type IdiomaReconocedor,
} from "@/lib/reconocer/modelo";
import { gramaticaDelJuego } from "@/lib/reconocer/vocabulario";
import { crearEscucha, type Oido } from "@/lib/voice/escucha";

const TASA = 16_000;
const BLOQUE = 4096;

type Fila = {
  archivo: string;
  esperada: string;
  oida: string | null;
  conf: number | null;
  quizas: boolean;
};
type Medida = {
  idioma: IdiomaReconocedor;
  n: number;
  aciertos: number;
  quizas: number;
  filas: Fila[];
  /** Wordless sounds (synthetic tone, sweep, vowels): did the recognizer still answer with a word? */
  controles: Fila[];
  controlesConPalabra: number;
};

const esperar = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function decodificar(datos: ArrayBuffer): Promise<Float32Array> {
  const ctx = new OfflineAudioContext(1, 1, TASA);
  const audio = await ctx.decodeAudioData(datos);
  return audio.getChannelData(0).slice();
}

async function medir(
  idioma: IdiomaReconocedor,
  lista: { archivo: string; palabra: string }[],
  controles: string[],
): Promise<Medida> {
  const archivos = await cargar(idioma);
  if (!archivos) throw new Error("sin-modelo");
  const motor = abrirMotor(idioma, archivos);
  let oidos: Oido[] = [];
  const escucha = crearEscucha({
    motor: motor.worker,
    modelUrl: motor.modelUrl,
    wasmUrl: motor.wasmUrl,
    gramatica: gramaticaDelJuego("palabras", idioma),
    sampleRate: TASA,
    alOir: (o) => oidos.push(o),
  });
  await escucha.lista;
  async function oirArchivo(url: string): Promise<Oido | null> {
    const r = await fetch(url);
    const muestras = await decodificar(await r.arrayBuffer());
    oidos = [];
    const todo = new Float32Array(muestras.length + TASA); // + 1 s of silence
    todo.set(muestras);
    for (let i = 0; i < todo.length; i += BLOQUE) escucha.oir(todo.slice(i, i + BLOQUE));
    escucha.cerrarFrase();
    await esperar(1500);
    return oidos.sort((a, b) => b.conf - a.conf)[0] ?? null;
  }
  const fila = (archivo: string, esperada: string, mejor: Oido | null): Fila => ({
    archivo,
    esperada,
    oida: mejor?.palabra ?? null,
    conf: mejor ? Math.round(mejor.conf * 100) / 100 : null,
    quizas: esperada ? quizasDijo(mejor, esperada) : !!mejor && mejor.conf >= UMBRAL_QUIZAS,
  });
  const filas: Fila[] = [];
  const filasControl: Fila[] = [];
  try {
    for (const { archivo, palabra } of lista)
      filas.push(fila(archivo, palabra, await oirArchivo(`/__medida/${idioma}/${archivo}`)));
    for (const archivo of controles)
      filasControl.push(fila(archivo, "", await oirArchivo(`/__medida/control/${archivo}`)));
  } finally {
    escucha.terminar();
    motor.soltar();
  }
  return {
    idioma,
    n: filas.length,
    aciertos: filas.filter((f) => f.oida === f.esperada).length,
    quizas: filas.filter((f) => f.quizas).length,
    filas,
    controles: filasControl,
    controlesConPalabra: filasControl.filter((f) => f.quizas).length,
  };
}

export default function SpikeReconocerPage() {
  const [estado, setEstado] = useState("inactivo");
  const [medida, setMedida] = useState<Medida | null>(null);

  async function correr(idioma: IdiomaReconocedor) {
    try {
      setEstado("descargando");
      await descargar(idioma);
      setEstado("midiendo");
      const lista = (await (
        await fetch(`/__medida/${idioma}/lista.json`)
      ).json()) as {
        archivo: string;
        palabra: string;
      }[];
      const controles = (await (await fetch("/__medida/controles.json")).json()) as string[];
      setMedida(await medir(idioma, lista, controles));
      setEstado("listo");
    } catch (e) {
      setEstado(`error: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-4 font-sans">
      <h1 className="text-xl font-semibold">
        Spike · ¿dijo la palabra? (ADR-023)
      </h1>
      <p className="mt-2 text-sm">
        Grabaciones de prueba de Lingua Libre, nunca de la familia. Umbral del
        «quizás»: {UMBRAL_QUIZAS}.
      </p>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          className="rounded border px-3 py-2"
          onClick={() => void correr("es")}
        >
          Medir en español
        </button>
        <button
          type="button"
          className="rounded border px-3 py-2"
          onClick={() => void correr("en")}
        >
          Measure in English
        </button>
      </div>
      <p className="mt-4" data-testid="estado-medida">
        {estado}
      </p>
      {medida && (
        <pre className="mt-4 overflow-x-auto text-xs" data-testid="medida">
          {JSON.stringify(medida, null, 1)}
        </pre>
      )}
    </main>
  );
}
