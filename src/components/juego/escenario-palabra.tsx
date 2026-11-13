"use client";

// El escenario de palabra↔objeto: el dibujo grande + su palabra escrita.
//
// LA GARANTÍA (ADR 005): el dibujo se enciende con CUALQUIER vocalización sostenida ~250 ms.
// No se compara con nada, no se reconoce nada, no se evalúa nada. La app mide que hubo voz —
// punto. Si el niño dijo la palabra, quien lo sabe es el padre.
//
// El pictograma se sirve desde el repo (ARASAAC, CC BY-NC-SA) con lazy-loading: cero red en
// runtime (el e2e de tráfico lo vigila).

import Image from "next/image";
import { useEffect, useRef } from "react";
import { rutaPictograma, type Pictograma } from "@content/pictogramas";
import { IconoAltavoz } from "@/components/iconos";
import { idCelebracion, idPalabra } from "@/lib/banco-voz/catalogo";
import { useIdioma, useT } from "@/lib/idioma/estado";
import { palabras as txp } from "@/lib/idioma/textos/palabras";
import { GlobosCelebracion } from "./globos-celebracion";
import type { MedidasVivas } from "./use-voice-session";
import type { VozFamiliar } from "./use-voz-familiar";

/** Voz sostenida mínima para encender el dibujo. Corto a propósito: un intento basta. */
const MS_PARA_ENCENDER = 250;

type Props = {
  picto: Pictograma;
  medidas: MedidasVivas;
  encendido: boolean;
  /**
   * El PADRE oyó la palabra y lo dijo (no la app: la app no oye palabras — regla dura 3).
   * Solo llega true por un toque suyo; ningún camino automático la enciende.
   */
  reconocida: boolean;
  invitando: boolean;
  onVocalizar: () => void;
  /** La voz de la familia (O2): modela el nombre y la frase honesta si están grabados. */
  voz: VozFamiliar;
};

export function EscenarioPalabra({
  picto,
  medidas,
  encendido,
  reconocida,
  invitando,
  onVocalizar,
  voz,
}: Props) {
  const tx = useT();
  const idioma = useIdioma();
  /** La palabra que se ve y se nombra: en inglés, la etiqueta inglesa del mismo dibujo (S8). */
  const palabra = idioma === "en" ? picto.en : picto.palabra;
  const auraRef = useRef<HTMLDivElement | null>(null);
  const avisarRef = useRef(onVocalizar);
  useEffect(() => {
    avisarRef.current = onVocalizar;
  }, [onVocalizar]);

  // ANCLA DE VOZ NUEVA (regla dura 3, hallazgo de la auditoría S3): `sostenidoMs` acumula TODO el
  // intento, así que sin ancla el segundo dibujo se encendería SOLO — con la voz que encendió al
  // primero — y el contador de activaciones inflaría el logro. Cada dibujo exige sus propios
  // ~250 ms de voz NUEVA, medidos desde que apareció.
  const baseSostenidoRef = useRef(0);
  useEffect(() => {
    baseSostenidoRef.current = medidas.sostenidoMs();
  }, [picto.id, medidas]);

  const idNombre = idPalabra(palabra, idioma);
  const nombreDisponible = voz.disponible(idNombre);

  // La voz se lee de un ref en los efectos: su identidad cambia al cargar el banco, y no queremos
  // re-disparar el autoplay por eso (solo por un dibujo nuevo).
  const vozRef = useRef(voz);
  useEffect(() => {
    vozRef.current = voz;
  }, [voz]);

  // Autoplay: al aparecer un dibujo nuevo, suena su palabra en la voz de la familia (si está
  // grabada). Modela el nombre para el niño; el altavoz lo repite cuando él quiera ("el nombre
  // vive en la cosa"). No-op silencioso si no hay grabación.
  useEffect(() => {
    void vozRef.current.reproducir(idPalabra(palabra, idioma));
  }, [palabra, idioma]);

  // La frase honesta que ya se muestra en pantalla, dicha con la voz de la familia si está grabada.
  // Son EXACTAMENTE las celebraciones del catálogo (le-salio / dijo-palabra): la app solo dice en
  // voz alta lo que de verdad pasó (regla dura 3).
  useEffect(() => {
    if (reconocida) void vozRef.current.reproducir(idCelebracion("dijo-palabra", idioma));
  }, [reconocida, idioma]);
  useEffect(() => {
    if (encendido && !reconocida)
      void vozRef.current.reproducir(idCelebracion("le-salio", idioma));
  }, [encendido, reconocida, idioma]);

  useEffect(() => {
    let id = 0;
    const pintar = () => {
      // El aura crece con la voz: feedback inmediato, aunque todavía no alcance a "encender".
      if (auraRef.current) {
        const escala = 1 + medidas.nivel() * 0.12;
        auraRef.current.style.transform = `scale(${escala})`;
      }
      // Cualquier vocalización sostenida cuenta — sin importar QUÉ dijo — pero tiene que ser voz
      // NUEVA de ESTE dibujo (el ancla), no la acumulada del intento.
      const total = medidas.sostenidoMs();
      // El intento se reinició ("otra vez" / recalibrar): el ancla no puede quedar en el pasado.
      if (total < baseSostenidoRef.current) baseSostenidoRef.current = total;
      if (total - baseSostenidoRef.current >= MS_PARA_ENCENDER) {
        avisarRef.current();
      }
      id = requestAnimationFrame(pintar);
    };
    id = requestAnimationFrame(pintar);
    return () => cancelAnimationFrame(id);
  }, [medidas]);

  return (
    <div
      className="flex flex-col items-center gap-4"
      data-testid="escenario"
      data-encendido={encendido}
    >
      <div className="relative flex items-center justify-center">
        {/* La bandada sube POR ENCIMA del dibujo cuando el padre dice que sí dijo la palabra. */}
        {reconocida ? <GlobosCelebracion /> : null}

        {/* El aura responde a su voz en tiempo real (y se queda encendida al lograrlo). */}
        <div
          ref={auraRef}
          className={[
            "absolute inset-0 rounded-3xl transition-colors duration-[--dur-lenta] ease-suave",
            encendido ? "bg-celebracion/40" : "bg-acento-suave/60",
          ].join(" ")}
          aria-hidden="true"
        />
        <div
          className={[
            "bg-superficie ease-suave relative rounded-3xl border-4 p-4 transition-colors duration-[--dur-lenta] sm:p-6",
            // Tres estados, tres bordes: apagado · su voz lo encendió · el PADRE oyó la palabra.
            reconocida
              ? "border-exito"
              : encendido
                ? "border-celebracion-fuerte"
                : "border-borde",
            // El instante de encenderse SE SIENTE (gate S4, bloque G): un pop breve, una vez.
            encendido ? "encendido-pop" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-testid="picto"
          data-reconocida={reconocida}
        >
          {/* El halo que se expande UNA vez al encenderse (determinista; con movimiento reducido
              queda invisible y el borde + el texto siguen contando). */}
          {encendido ? (
            <span
              className="halo-encendido border-celebracion-fuerte pointer-events-none absolute inset-0 rounded-3xl border-4"
              aria-hidden="true"
            />
          ) : null}
          <Image
            src={rutaPictograma(picto)}
            alt={palabra}
            width={500}
            height={500}
            loading="lazy"
            className="h-40 w-40 object-contain sm:h-56 sm:w-56"
          />
        </div>
      </div>

      {/* La palabra escrita, grande: el nombre vive CON la cosa (asociación palabra↔objeto). */}
      <p
        className="font-display text-5xl sm:text-6xl"
        data-testid="palabra-del-picto"
      >
        {palabra}
      </p>

      {/* Altavoz de la voz familiar: el niño puede tocarlo para volver a oír el nombre (≥64 px).
          Solo aparece si esa palabra está grabada — si no, la app suena como antes (sin voz). */}
      {nombreDisponible ? (
        <button
          type="button"
          onClick={() => void voz.reproducir(idNombre)}
          className="border-acento text-acento bg-superficie ease-suave flex min-h-16 min-w-16 items-center justify-center rounded-full border-2 transition-transform duration-[--dur-rapida] active:scale-95 motion-reduce:transition-none"
          data-testid="altavoz-palabra"
          data-fuente-voz="familiar"
          aria-label={`Oír “${palabra}”`}
        >
          <IconoAltavoz className="h-8 w-8" />
        </button>
      ) : null}

      {reconocida ? (
        <p className="text-exito text-lg font-medium" role="status">
          {tx(txp.escenario.dijo)}
        </p>
      ) : encendido ? (
        <p
          className="text-celebracion-fuerte text-lg font-medium"
          role="status"
        >
          {tx(txp.escenario.salio)}
        </p>
      ) : invitando ? (
        <p
          className="bg-fondo/90 text-tinta rounded-2xl p-3 text-center text-lg"
          data-testid="invitacion"
        >
          {tx(txp.escenario.espera)}
        </p>
      ) : (
        <p className="text-tinta-suave text-lg">
          {tx(txp.escenario.cualquierSonido)}
        </p>
      )}
    </div>
  );
}
