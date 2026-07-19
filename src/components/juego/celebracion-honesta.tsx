"use client";

// CELEBRACIÓN HONESTA (mecánica ⭐⭐ del brief).
//
// La app SOLO afirma lo que su medidor midió de verdad: que hubo voz, cuánto duró, cuántas veces
// subió y bajó, cuántos dibujos activó. No dice "¡muy bien!" pase lo que pase (ese es el error de
// la competencia: felicitar aunque el niño no haya dicho nada). Si no hubo voz, lo dice sin drama
// y sin culpa — y nadie perdió nada.
//
// Quien juzga si la PALABRA estuvo bien es el padre, nunca la app.

import { useEffect, useRef } from "react";
import {
  Cohete,
  Globo,
  IconoBrote,
  IconoGemelas,
  IconoPictograma,
} from "@/components/iconos";
import { valorDeMetrica, type Metrica } from "@/lib/session-flow";
import { construirSesion } from "@/lib/rumbo/sesion";
import { fechaHoy } from "@/lib/fecha";
import { registrarSesion } from "@/lib/storage/local";

type Props = {
  metrica: Metrica;
  onOtraVez: () => void;
  onTerminar: () => void;
  etiquetaTerminar: string;
  /** Solo palabra↔objeto: las palabras (dibujos) que su voz encendió, para el Rumbo. */
  palabrasEncendidas?: readonly string[];
};

function segundos(ms: number): string {
  const s = ms / 1000;
  return s >= 10 ? s.toFixed(0) : s.toFixed(1).replace(".", ",");
}

/** ¿El medidor alcanzó a escuchar algo de verdad? Es lo único que decide qué se puede afirmar. */
function huboAlgoQueContar(metrica: Metrica): boolean {
  if (metrica.tipo === "sostenido") return metrica.ms >= 300;
  // Gemelas no tiene micrófono: "hubo algo" es que se jugó al menos una ronda.
  if (metrica.tipo === "gemelas") return metrica.rondas >= 1;
  return valorDeMetrica(metrica) >= 1;
}

/** Lo que SÍ pasó, dicho con el número real. Nada más — y nada menos. */
function Logro({ metrica }: { metrica: Metrica }) {
  const cifra = (texto: string) => (
    <span
      className="text-celebracion-fuerte font-sans font-semibold tabular-nums"
      data-testid="metrica-real"
    >
      {texto}
    </span>
  );

  switch (metrica.tipo) {
    case "sostenido":
      return (
        <>
          <Globo className="h-24 w-16" />
          <h2 className="font-display text-4xl">
            {/* "Sonó" (total), NO "la sostuviste" (continuidad): el medidor suma todos los ratos
                de voz del intento, y decir "sostuviste" de tres soplidos sueltos sería mentir.
                La continuidad —lo que de verdad se está entrenando— va abajo, con su número real.
                La métrica va en sans con cifras tabulares, no en mono: la coma decimal
                monoespaciada se lee como "3 , 1". Mono queda para etiquetas y datos en bloque. */}
            ¡Su voz sonó {cifra(`${segundos(metrica.ms)} segundos`)}!
          </h2>
          <p className="text-tinta-suave">
            {metrica.rachaMs >= 1000 ? (
              <>
                Y la vez más larga la sostuvo{" "}
                <strong className="text-tinta">
                  {segundos(metrica.rachaMs)} segundos
                </strong>{" "}
                seguidos, sin cortarse.{" "}
              </>
            ) : null}
            Eso es lo que el medidor escuchó: hubo voz y duró ese tiempo. Si
            además dijo la palabra, el que lo sabe eres tú — celébraselo con tus
            propias palabras.
          </p>
        </>
      );

    case "inversiones":
      return (
        <>
          <Cohete className="h-24 w-16" />
          <h2 className="font-display text-4xl">
            ¡Tu voz subió y bajó{" "}
            {cifra(`${metrica.veces} ${metrica.veces === 1 ? "vez" : "veces"}`)}
            !
          </h2>
          <p className="text-tinta-suave">
            Eso es lo que el medidor escuchó: el tono de su voz cambió de
            dirección esas veces. Jugar con la voz —subirla, bajarla, estirarla—
            es exactamente lo que queríamos.
          </p>
        </>
      );

    case "activaciones":
      return (
        <>
          <IconoPictograma className="text-acento h-20 w-20" />
          <h2 className="font-display text-4xl">
            ¡Encendió{" "}
            {cifra(
              `${metrica.veces} ${metrica.veces === 1 ? "dibujo" : "dibujos"}`,
            )}{" "}
            con su voz!
          </h2>
          <p className="text-tinta-suave">
            Eso es lo que el medidor escuchó: su voz sonó y encendió esos
            dibujos. Si dijo la palabra o se acercó a ella, el que lo sabe eres
            tú — la app no juzga eso, y no va a fingir que sí.
          </p>

          {/* Lo que dijo el PADRE, dicho como suyo. La app no se cuelga esta medalla. */}
          {metrica.reconocidas > 0 ? (
            <p className="text-exito font-medium" data-testid="reconocidas">
              Y tú oíste{" "}
              {metrica.reconocidas === 1
                ? "1 palabra"
                : `${metrica.reconocidas} palabras`}
              . Eso lo sabes tú, que estabas ahí — celébraselo con tus propias
              palabras.
            </p>
          ) : null}
        </>
      );

    case "gemelas":
      return (
        <>
          <IconoGemelas className="text-acento h-20 w-24" />
          <h2 className="font-display text-4xl">
            ¡Jugaron{" "}
            {cifra(
              `${metrica.rondas} ${metrica.rondas === 1 ? "ronda" : "rondas"}`,
            )}{" "}
            de gemelas!
          </h2>
          <p className="text-tinta-suave">
            {metrica.participadas > 0 ? (
              <>
                Tú marcaste lo que oíste en{" "}
                <strong className="text-exito">{metrica.participadas}</strong>.
                Eso lo sabes tú, que estabas ahí — la app no juzga qué palabra
                dijo, y no va a fingir que sí.
              </>
            ) : (
              <>
                Estar juntos frente al juego ya cuenta. Cuando quiera intentar
                una palabra, tú marcas la que oigas — sin apuros.
              </>
            )}
          </p>
        </>
      );
  }
}

/** Lo que NO pasó, dicho sin culpa (COGA: nunca hay derrota, y estar juntos ya cuenta). */
function SinVoz({ metrica }: { metrica: Metrica }) {
  const titulo =
    metrica.tipo === "inversiones"
      ? "Hoy el cohete casi no despegó"
      : metrica.tipo === "activaciones"
        ? "Hoy los dibujos se quedaron esperando"
        : "Hoy el globo casi no voló";

  return (
    <>
      <IconoBrote className="text-acento h-16 w-16" />
      <h2 className="font-display text-3xl">{titulo}</h2>
      <p className="text-tinta-suave">
        El micrófono no alcanzó a escuchar su voz. No pasa nada y no se perdió
        nada: estar juntos frente al juego ya cuenta. Mañana lo intentamos otra
        vez.
      </p>
    </>
  );
}

export function CelebracionHonesta({
  metrica,
  onOtraVez,
  onTerminar,
  etiquetaTerminar,
  palabrasEncendidas = [],
}: Props) {
  // R1: un intento = una sesión registrada. Es el ÚNICO punto de escritura del Rumbo (compartido
  // por los 4 juegos). Se escribe al montar la celebración; el ref evita el doble registro del
  // doble-efecto de StrictMode. Solo números —los mismos que se muestran arriba— jamás audio.
  const registrado = useRef(false);
  useEffect(() => {
    if (registrado.current) return;
    registrado.current = true;
    registrarSesion(construirSesion(metrica, fechaHoy(), palabrasEncendidas));
    // deps vacías a propósito: se registra la métrica del montaje, una sola vez por intento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      className="mx-auto flex w-full max-w-xl flex-col items-center gap-6 text-center"
      data-testid="celebracion"
      aria-live="polite"
    >
      {huboAlgoQueContar(metrica) ? (
        <Logro metrica={metrica} />
      ) : (
        <SinVoz metrica={metrica} />
      )}

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onOtraVez}
          className="bg-acento text-sobre-acento min-h-16 flex-1 rounded-2xl px-6 text-lg font-medium"
          data-testid="otra-vez"
        >
          Otra vez
        </button>
        <button
          type="button"
          onClick={onTerminar}
          className="border-borde text-tinta min-h-16 flex-1 rounded-2xl border px-6 text-lg font-medium"
          data-testid="terminar-sesion"
        >
          {etiquetaTerminar}
        </button>
      </div>
    </section>
  );
}
