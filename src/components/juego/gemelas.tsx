"use client";

// PALABRAS GEMELAS (Outcome 3) — el juego SIN micrófono. El niño dice una de las dos palabras y el
// PADRE marca cuál oyó (ADR-009). No hay "correcto/incorrecto" para el niño, no se graba nada, no
// se analiza su voz: es co-uso puro. La app solo cuenta la participación (regla dura 3).
//
// Es del niño (paleta clara) pero las teclas de marcar son del padre — por eso conviven en la
// misma pantalla: gemelas ES co-uso. Motor puro en @/lib/gemelas/rondas.

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useAjustes } from "@/components/estado-local";
import { useHidratado } from "@/components/use-hidratado";
import { IconoAltavoz } from "@/components/iconos";
import { fechaHoy } from "@/lib/fecha";
import { fnv1a } from "@/lib/coach/daily";
import { alinear } from "@/lib/objetivo/alinear";
import { agregarJuiciosGemelas, leerObjetivo } from "@/lib/storage/local";
import { idPalabra } from "@/lib/banco-voz/catalogo";
import { type Etapa } from "@content/schema";
import { useIdioma, useT } from "@/lib/idioma/estado";
import { juegos } from "@/lib/idioma/textos/juegos";
import { palabras as txp } from "@/lib/idioma/textos/palabras";
import { ajustes as txa } from "@/lib/idioma/textos/ajustes";
import { paresDe } from "@content/pares-gemelos";
import {
  metricaGemelas,
  secuenciaDeRondas,
  type Marca,
} from "@/lib/gemelas/rondas";
import { CelebracionHonesta } from "./celebracion-honesta";
import { GuionCard } from "./guion-card";
import { useVozFamiliar } from "./use-voz-familiar";

type Fase = "guion" | "jugando" | "celebracion";

export function Gemelas() {
  const hidratado = useHidratado();
  const ajustes = useAjustes();

  if (!hidratado || !ajustes) {
    return <div className="min-h-[28rem]" aria-hidden="true" />;
  }
  return <GemelasListo etapa={ajustes.etapa} />;
}

function GemelasListo({ etapa }: { etapa: Etapa }) {
  const router = useRouter();
  const tx = useT();
  const idioma = useIdioma();
  const g = txp.gemelas;
  // Semilla DEL DÍA (gate S4: con 12 pares y semilla fija saldrían siempre los mismos 6): cada
  // día trae su mezcla de parejas, determinista y sin Math.random — el patrón de la cápsula
  // diaria. Estable por montaje: el orden no cambia al re-renderizar. Con objetivo de la semana,
  // los pares que coinciden entran primero; sin él, el orden es idéntico.
  const rondas = useMemo(() => {
    const objetivo = alinear(leerObjetivo()?.texto);
    return secuenciaDeRondas(
      etapa,
      fnv1a(fechaHoy()),
      6,
      paresDe(idioma),
      (par) =>
        objetivo.coincidePalabra(par.a.palabra) ||
        objetivo.coincidePalabra(par.b.palabra),
    );
  }, [etapa, idioma]);

  const [fase, setFase] = useState<Fase>("guion");
  const [indice, setIndice] = useState(0);
  const [marcas, setMarcas] = useState<Marca[]>([]);
  // El festejo de la ronda (gate S4, stopper L1): el lado que el padre marcó se ENCIENDE como en
  // palabra↔objeto — la palabra del niño tiene consecuencia visible. null = todavía eligiendo.
  const [festejo, setFestejo] = useState<"a" | "b" | null>(null);
  // La voz de la familia modela cada palabra del par. Gemelas no tiene micrófono → sin guarda.
  const voz = useVozFamiliar();

  // Gemelas exige que el niño intente palabras → no hay pares en "sonidos-e-intentos".
  if (rondas.length === 0) {
    return (
      <section
        className="mx-auto flex max-w-md flex-col items-center gap-4 text-center"
        data-testid="gemelas-sin-pares"
      >
        <h2 className="font-display text-3xl">
          {tx(g.sinPares.titulo)}
        </h2>
        <p className="text-tinta-suave">
          {tx(g.sinPares.antes)}{" "}
          <strong>{tx(txa.etapa.nombre[etapa])}</strong>
          {tx(g.sinPares.despues)}
        </p>
        <Link
          href="/jugar"
          className="border-borde text-tinta min-h-12 rounded-xl border px-6 py-2 font-medium"
        >
          {tx(juegos.comun.elegirOtroJuego)}
        </Link>
      </section>
    );
  }

  const par = rondas[indice];

  function avanzar(marca: Marca) {
    const nuevas = [...marcas, marca];
    setMarcas(nuevas);
    setFestejo(null);
    if (indice + 1 >= rondas.length) {
      // Registro local honesto (insumo del progreso del S4): qué marcó el padre por par.
      agregarJuiciosGemelas(
        rondas.map((p, i) => ({
          fecha: fechaHoy(),
          parId: p.id,
          marca: nuevas[i] === null ? ("saltada" as const) : nuevas[i]!,
        })),
      );
      setFase("celebracion");
    } else {
      setIndice(indice + 1);
    }
  }

  /** El padre marcó cuál oyó: el dibujo festeja (se enciende + suena) ANTES de avanzar. */
  function marcar(lado: "a" | "b") {
    setFestejo(lado);
    const id = idPalabra(par[lado].palabra, idioma);
    if (voz.disponible(id)) void voz.reproducir(id);
  }

  function otraVez() {
    setMarcas([]);
    setIndice(0);
    setFestejo(null);
    setFase("guion");
  }

  if (fase === "guion") {
    return (
      <GuionCard
        etiqueta={tx(g.guion.etiqueta)}
        guion={tx(g.guion.guion)}
        nota={tx(g.guion.nota)}
        onEmpezar={() => setFase("jugando")}
        listo
      />
    );
  }

  if (fase === "celebracion") {
    return (
      <CelebracionHonesta
        metrica={metricaGemelas(marcas)}
        onOtraVez={otraVez}
        onTerminar={() => router.push("/jugar")}
        etiquetaTerminar={tx(juegos.comun.elegirOtroJuego)}
      />
    );
  }

  const oidas = marcas.filter((m) => m !== null).length + (festejo ? 1 : 0);

  return (
    <section className="flex flex-col gap-6" data-testid="gemelas-ronda">
      {/* La salida de la ronda (gate S4: gemelas no usa el marco de los juegos de voz y se había
          quedado sin puerta): "Salir" vuelve al GUION y reinicia POR COMPLETO (regla del bloque
          G) — el guion tiene su propio "← Juegos" hacia el selector. */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={otraVez}
          data-testid="salir-al-guion"
          className="text-tinta-suave min-h-11 rounded-xl px-3 py-2 text-sm underline-offset-4 hover:underline"
        >
          {tx(g.salir)}
        </button>
      </div>
      <div className="text-center">
        <p className="text-tinta-suave text-sm" data-testid="progreso-rondas">
          {tx(g.ronda, { n: indice + 1, total: rondas.length })}
        </p>
        {/* El contador honesto de la sesión (patrón de palabra↔objeto): cuenta lo que el PADRE
            marcó, jamás "aciertos". */}
        <p className="text-tinta-suave mt-1 text-sm" data-testid="oidas">
          {tx(g.oidas)}{" "}
          <span className="font-sans font-semibold tabular-nums">{oidas}</span>
        </p>
      </div>

      <div className="flex items-stretch justify-center gap-3 sm:gap-6">
        {(["a", "b"] as const).map((lado) => {
          const palabra = par[lado];
          const grabada = voz.disponible(idPalabra(palabra.palabra, idioma));
          const encendida = festejo === lado;
          // La tarjeta del dibujo ES el botón de oírla (gate S4, L1): el niño toca el dibujo y
          // suena con la voz de su familia — mismo lenguaje que palabra↔objeto. Tocar = oír,
          // JAMÁS marca: el juicio sigue siendo solo del padre. Sin grabación, tarjeta quieta.
          const tarjeta = (
            <div
              className={[
                "bg-superficie ease-suave relative rounded-3xl border-4 p-3 transition-colors duration-[--dur-lenta] sm:p-5",
                encendida
                  ? "border-celebracion-fuerte encendido-pop"
                  : "border-borde",
              ].join(" ")}
            >
              <Image
                src={`/pictogramas/${palabra.archivo}`}
                alt={palabra.palabra}
                width={500}
                height={500}
                loading="lazy"
                className="h-32 w-32 object-contain sm:h-44 sm:w-44"
              />
              {grabada ? (
                <span
                  aria-hidden="true"
                  className="border-acento text-acento bg-superficie absolute right-2 bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-2"
                >
                  <IconoAltavoz className="h-4 w-4" />
                </span>
              ) : null}
              {encendida ? (
                <span className="halo-encendido border-celebracion-fuerte pointer-events-none absolute inset-0 rounded-3xl border-4" />
              ) : null}
            </div>
          );
          return (
            <div key={lado} className="flex flex-1 flex-col items-center gap-3">
              {grabada ? (
                <button
                  type="button"
                  onClick={() =>
                    void voz.reproducir(idPalabra(palabra.palabra, idioma))
                  }
                  data-testid={`altavoz-${lado}`}
                  data-fuente-voz="familiar"
                  aria-label={tx(g.oir, { palabra: palabra.palabra })}
                  className="ease-suave transition-transform duration-[--dur-rapida] active:scale-95 motion-reduce:transition-none"
                >
                  {tarjeta}
                </button>
              ) : (
                tarjeta
              )}
              <p className="font-display text-3xl sm:text-4xl">
                {palabra.palabra}
              </p>
            </div>
          );
        })}
      </div>

      {festejo === null ? (
        <div className="flex flex-col items-center gap-2">
          {/* La zona del PADRE, discreta (patrón del juez de palabra↔objeto, bloque G: el niño
              es perspicaz — su fiesta está en los dibujos, no en estas teclas). */}
          <p className="text-tinta-suave text-sm">{tx(g.cual)}</p>
          <div className="flex items-center gap-6">
            {(["a", "b"] as const).map((lado) => (
              <button
                key={lado}
                type="button"
                onClick={() => marcar(lado)}
                data-testid={`marcar-${lado}`}
                className="text-tinta-suave min-h-11 rounded-xl px-3 text-sm underline decoration-dotted underline-offset-4"
              >
                «{par[lado].palabra}»
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => avanzar(null)}
            data-testid="saltar-ronda"
            className="text-tinta-suave mx-auto min-h-11 text-sm underline-offset-4 hover:underline"
          >
            {tx(g.saltar)}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          {/* La noticia honesta: lo que TÚ marcaste, celebrado sin veredicto de la app. */}
          <p
            aria-live="polite"
            data-testid="dijo"
            className="font-display text-center text-2xl"
          >
            {tx(g.dijo, { palabra: par[festejo].palabra })}
          </p>
          <button
            type="button"
            onClick={() => avanzar(festejo)}
            data-testid="siguiente-pareja"
            className="bg-acento text-sobre-acento min-h-14 rounded-xl px-8 text-lg font-medium"
          >
            {tx(g.siguiente)}
          </button>
        </div>
      )}
    </section>
  );
}
