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
  BarrasVoz,
  Molino,
} from "@/components/iconos";
import { valorDeMetrica, type Metrica } from "@/lib/session-flow";
import { construirSesion } from "@/lib/rumbo/sesion";
import { fechaHoy } from "@/lib/fecha";
import { registrarSesion } from "@/lib/storage/local";
import type { Idioma } from "@/lib/idioma";
import { useIdioma, useT } from "@/lib/idioma/estado";
import { apuntador as apuntadorTextos } from "@/lib/idioma/textos/apuntador";
import { juegos } from "@/lib/idioma/textos/juegos";
import { vocales as vocalesTextos } from "@/lib/idioma/textos/vocales";
import { fuerteSuave, soplar } from "@/lib/idioma/textos/voz-juegos";
import { FormaVocal } from "./forma-vocal";

type Props = {
  metrica: Metrica;
  onOtraVez: () => void;
  onTerminar: () => void;
  etiquetaTerminar: string;
  /** Solo palabra↔objeto: las palabras (dibujos) que su voz encendió, para el Rumbo. */
  palabrasEncendidas?: readonly string[];
  /**
   * Solo el globo: vueltas completas del intento (re-mirada del gate S4). Derivadas del MISMO
   * total medido (ms / hito) — 0 las oculta, y en modo calma van en 0: allí no hay línea de
   * vuelta y la celebración no afirma lo que el juego no mostró.
   */
  vueltas?: number;
  /** Los turnos de él en que su voz se midió (S13, ADR-025): «N turnos de él». */
  turnosNino?: number;
};

function segundos(ms: number, idioma: Idioma): string {
  const s = ms / 1000;
  if (s >= 10) return s.toFixed(0);
  const un = s.toFixed(1);
  return idioma === "es" ? un.replace(".", ",") : un;
}

/** ¿El medidor alcanzó a escuchar algo de verdad? Es lo único que decide qué se puede afirmar. */
function huboAlgoQueContar(metrica: Metrica): boolean {
  if (metrica.tipo === "sostenido") return metrica.ms >= 300;
  // Gemelas no tiene micrófono: "hubo algo" es que se jugó al menos una ronda.
  if (metrica.tipo === "gemelas") return metrica.rondas >= 1;
  return valorDeMetrica(metrica) >= 1;
}

/** Lo que SÍ pasó, dicho con el número real. Nada más — y nada menos. */
function Logro({
  metrica,
  vueltas = 0,
}: {
  metrica: Metrica;
  vueltas?: number;
}) {
  const tx = useT();
  const idioma = useIdioma();
  const c = juegos.celebracion;
  const v = vocalesTextos.celebracion;
  const cifra = (texto: string) => (
    <span
      className="text-celebracion-texto font-sans font-semibold tabular-nums"
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
            {tx(c.globo.sono)}{" "}
            {cifra(tx(c.segundos, { n: segundos(metrica.ms, idioma) }))}!
          </h2>
          {vueltas > 0 ? (
            <p className="text-lg" data-testid="celebracion-vueltas">
              {tx(c.globo.vueltasAntes)}{" "}
              <strong className="text-celebracion-texto font-sans font-semibold tabular-nums">
                {tx(vueltas === 1 ? c.globo.vuelta : c.globo.vueltas, {
                  n: vueltas,
                })}
              </strong>
              .
            </p>
          ) : null}
          <p className="text-tinta-suave">
            {metrica.rachaMs >= 1000 ? (
              <>
                {tx(c.globo.rachaAntes)}{" "}
                <strong className="text-tinta">
                  {tx(c.segundos, { n: segundos(metrica.rachaMs, idioma) })}
                </strong>{" "}
                {tx(c.globo.rachaDespues)}{" "}
              </>
            ) : null}
            {tx(c.globo.medidor)}
          </p>
        </>
      );

    case "soplos":
      return (
        <>
          <Molino className="h-24 w-16" />
          <h2 className="font-display text-4xl">
            {tx(soplar.celebracion.antes)}{" "}
            {cifra(
              tx(
                metrica.soplos === 1
                  ? soplar.celebracion.uno
                  : soplar.celebracion.varios,
                { n: metrica.soplos },
              ),
            )}
            !
          </h2>
          <p className="text-tinta-suave">{tx(soplar.celebracion.cuerpo)}</p>
        </>
      );

    case "intensidad":
      return (
        <>
          <BarrasVoz className="size-20" />
          <h2 className="font-display text-4xl">
            {tx(fuerteSuave.celebracion.antes)}{" "}
            {cifra(
              tx(
                metrica.cambios === 1
                  ? fuerteSuave.celebracion.uno
                  : fuerteSuave.celebracion.varios,
                { n: metrica.cambios },
              ),
            )}{" "}
            {tx(fuerteSuave.celebracion.despues)}
          </h2>
          <p className="text-tinta-suave">{tx(fuerteSuave.celebracion.cuerpo)}</p>
        </>
      );

    case "inversiones":
      return (
        <>
          <Cohete className="h-24 w-16" />
          <h2 className="font-display text-4xl">
            {tx(c.cohete.antes)}{" "}
            {cifra(
              tx(metrica.veces === 1 ? c.cohete.vez : c.cohete.veces, {
                n: metrica.veces,
              }),
            )}
            !
          </h2>
          <p className="text-tinta-suave">{tx(c.cohete.cuerpo)}</p>
        </>
      );

    case "activaciones":
      return (
        <>
          <IconoPictograma className="text-acento h-20 w-20" />
          <h2 className="font-display text-4xl">
            {tx(c.dibujos.antes)}{" "}
            {cifra(
              tx(metrica.veces === 1 ? c.dibujos.uno : c.dibujos.varios, {
                n: metrica.veces,
              }),
            )}{" "}
            {tx(c.dibujos.despues)}
          </h2>
          <p className="text-tinta-suave">{tx(c.dibujos.cuerpo)}</p>

          {/* Lo que dijo el PADRE, dicho como suyo. La app no se cuelga esta medalla. */}
          {metrica.reconocidas > 0 ? (
            <p className="text-exito font-medium" data-testid="reconocidas">
              {tx(c.dibujos.oiste)}{" "}
              {metrica.reconocidas === 1
                ? tx(c.dibujos.palabra)
                : tx(c.dibujos.palabras, { n: metrica.reconocidas })}
              {tx(c.dibujos.oisteFin)}
            </p>
          ) : null}
        </>
      );

    case "vocales":
      return (
        <>
          <FormaVocal vocal="a" letra="A" className="size-20" encendida />
          <h2 className="font-display text-4xl">
            {tx(metrica.zonas === 1 ? v.antesUna : v.antes)}{" "}
            {cifra(
              tx(metrica.zonas === 1 ? v.una : v.varias, { n: metrica.zonas }),
            )}{" "}
            {tx(v.despues)}
          </h2>
          {metrica.cambios > 0 ? (
            <p className="text-lg" data-testid="celebracion-cambios">
              {tx(v.cambios)}{" "}
              <strong className="text-celebracion-texto font-sans font-semibold tabular-nums">
                {tx(
                  metrica.cambios === 1
                    ? vocalesTextos.vez
                    : vocalesTextos.veces,
                  { n: metrica.cambios },
                )}
              </strong>
              .
            </p>
          ) : null}
          <p className="text-tinta-suave">{tx(v.cuerpo)}</p>
        </>
      );

    case "gemelas":
      return (
        <>
          <IconoGemelas className="text-acento h-20 w-24" />
          <h2 className="font-display text-4xl">
            {tx(c.gemelas.antes)}{" "}
            {cifra(
              tx(metrica.rondas === 1 ? c.gemelas.una : c.gemelas.varias, {
                n: metrica.rondas,
              }),
            )}{" "}
            {tx(c.gemelas.despues)}
          </h2>
          <p className="text-tinta-suave">
            {metrica.participadas > 0 ? (
              <>
                {tx(c.gemelas.marcasteAntes)}{" "}
                <strong className="text-exito">{metrica.participadas}</strong>
                {tx(c.gemelas.marcasteDespues)}
              </>
            ) : (
              tx(c.gemelas.sinMarcas)
            )}
          </p>
        </>
      );
  }
}

/** Lo que NO pasó, dicho sin culpa (COGA: nunca hay derrota, y estar juntos ya cuenta). */
function SinVoz({ metrica }: { metrica: Metrica }) {
  const tx = useT();
  const c = juegos.celebracion.sinVoz;
  const titulo =
    metrica.tipo === "inversiones"
      ? c.cohete
      : metrica.tipo === "activaciones"
        ? c.dibujos
        : metrica.tipo === "vocales"
          ? vocalesTextos.celebracion.sinVoz
          : metrica.tipo === "soplos"
            ? soplar.celebracion.sinSoplo
            : metrica.tipo === "intensidad"
              ? fuerteSuave.celebracion.sinCambios
              : c.globo;

  return (
    <>
      <IconoBrote className="text-acento h-16 w-16" />
      <h2 className="font-display text-3xl">{tx(titulo)}</h2>
      <p className="text-tinta-suave">{tx(c.cuerpo)}</p>
    </>
  );
}

export function CelebracionHonesta({
  metrica,
  onOtraVez,
  onTerminar,
  etiquetaTerminar,
  palabrasEncendidas = [],
  vueltas = 0,
  turnosNino = 0,
}: Props) {
  const tx = useT();
  // R1: un intento = una sesión registrada. Es el ÚNICO punto de escritura del Rumbo (compartido
  // por los juegos). Se escribe al montar la celebración; el ref evita el doble registro del
  // doble-efecto de StrictMode. Solo números —los mismos que se muestran arriba— jamás audio.
  const registrado = useRef(false);
  useEffect(() => {
    if (registrado.current) return;
    registrado.current = true;
    registrarSesion(
      construirSesion(metrica, fechaHoy(), palabrasEncendidas, turnosNino),
    );
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
        <Logro metrica={metrica} vueltas={vueltas} />
      ) : (
        <SinVoz metrica={metrica} />
      )}

      {turnosNino > 0 ? (
        <p
          className="text-tinta-suave text-base font-medium"
          data-testid="celebracion-turnos"
        >
          {tx(
            turnosNino === 1
              ? apuntadorTextos.turnos.uno
              : apuntadorTextos.turnos.varios,
            { n: turnosNino },
          )}
        </p>
      ) : null}

      <div className="flex w-full flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onOtraVez}
          className="bg-acento text-sobre-acento min-h-16 flex-1 rounded-2xl px-6 text-lg font-medium"
          data-testid="otra-vez"
        >
          {tx(juegos.comun.otraVez)}
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
