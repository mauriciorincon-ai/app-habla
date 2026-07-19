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
import { agregarJuiciosGemelas } from "@/lib/storage/local";
import { idPalabra } from "@/lib/banco-voz/catalogo";
import { NOMBRE_ETAPA, type Etapa } from "@content/schema";
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
  // Semilla estable por montaje: el orden no cambia al re-renderizar (sin Math.random en render).
  const rondas = useMemo(() => secuenciaDeRondas(etapa, 7919, 6), [etapa]);

  const [fase, setFase] = useState<Fase>("guion");
  const [indice, setIndice] = useState(0);
  const [marcas, setMarcas] = useState<Marca[]>([]);
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
          Las gemelas llegan un poquito después
        </h2>
        <p className="text-tinta-suave">
          Este juego es para cuando ya dice palabras sueltas. Ahora está en{" "}
          <strong>{NOMBRE_ETAPA[etapa]}</strong>. Lo puedes cambiar en Ajustes
          cuando sea el momento — sin apuros.
        </p>
        <Link
          href="/jugar"
          className="border-borde text-tinta min-h-12 rounded-xl border px-6 py-2 font-medium"
        >
          Elegir otro juego
        </Link>
      </section>
    );
  }

  const par = rondas[indice];

  function marcar(marca: Marca) {
    const nuevas = [...marcas, marca];
    setMarcas(nuevas);
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

  function otraVez() {
    setMarcas([]);
    setIndice(0);
    setFase("guion");
  }

  if (fase === "guion") {
    return (
      <GuionCard
        etiqueta="Palabras gemelas"
        guion="Señala los dos dibujos, pídele que diga UNO, y marca tú el que oíste."
        nota="No hay respuesta correcta ni incorrecta para él: cualquier intento vale. La app no oye la palabra — el que la oye eres tú. Si hoy solo quiere mirar, también está bien."
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
        etiquetaTerminar="Elegir otro juego"
      />
    );
  }

  return (
    <section className="flex flex-col gap-6" data-testid="gemelas-ronda">
      <p
        className="text-tinta-suave text-center text-sm"
        data-testid="progreso-rondas"
      >
        Ronda{" "}
        <span className="font-sans font-semibold tabular-nums">
          {indice + 1}
        </span>{" "}
        de {rondas.length}
      </p>

      <div className="flex items-stretch justify-center gap-3 sm:gap-6">
        {(["a", "b"] as const).map((lado) => {
          const palabra = par[lado];
          return (
            <div key={lado} className="flex flex-1 flex-col items-center gap-3">
              <div className="bg-superficie border-borde rounded-3xl border-4 p-3 sm:p-5">
                <Image
                  src={`/pictogramas/${palabra.archivo}`}
                  alt={palabra.palabra}
                  width={500}
                  height={500}
                  loading="lazy"
                  className="h-32 w-32 object-contain sm:h-44 sm:w-44"
                />
              </div>
              <p className="font-display text-3xl sm:text-4xl">
                {palabra.palabra}
              </p>
              {/* Altavoz de la voz familiar: modela la palabra para el niño (≥64 px, él lo puede
                  tocar). Solo aparece si esa palabra está grabada; si no, se juega en silencio. */}
              {voz.disponible(idPalabra(palabra.palabra)) ? (
                <button
                  type="button"
                  onClick={() =>
                    void voz.reproducir(idPalabra(palabra.palabra))
                  }
                  data-testid={`altavoz-${lado}`}
                  data-fuente-voz="familiar"
                  aria-label={`Oír «${palabra.palabra}»`}
                  className="border-acento text-acento bg-superficie ease-suave flex min-h-16 min-w-16 items-center justify-center rounded-full border-2 transition-transform duration-[--dur-rapida] active:scale-95 motion-reduce:transition-none"
                >
                  <IconoAltavoz className="h-7 w-7" />
                </button>
              ) : null}
              {/* Tecla del PADRE: marca cuál oyó (≥64 px — pero la maneja el adulto). */}
              <button
                type="button"
                onClick={() => marcar(lado)}
                data-testid={`marcar-${lado}`}
                className="border-acento text-tinta min-h-16 w-full rounded-2xl border-2 px-4 text-lg font-medium"
              >
                Oí «{palabra.palabra}»
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => marcar(null)}
        data-testid="saltar-ronda"
        className="text-tinta-suave mx-auto min-h-11 text-sm underline-offset-4 hover:underline"
      >
        Hoy solo miramos esta — siguiente
      </button>
    </section>
  );
}
