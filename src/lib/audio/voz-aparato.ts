// LA VOZ DEL APARATO (S15, ADR-027, G-Plan «1 a»): el ÚNICO archivo de la app que toca `speechSynthesis`
// (tests/unit/privacidad-voz-aparato.test.ts lo vigila). Dice en voz alta una palabra que nadie grabó.
//
// PRIVACIDAD: solo voces que corren en el propio aparato (`localService === true`); una voz de red jamás
// se elige, así que el texto no sale del dispositivo. Habla SOLO texto de la app (la palabra del
// pictograma), nunca nada del niño, y no escucha el micrófono.

import {
  duracionEstimadaMs,
  vozLocalPara,
  type VozAparato,
} from "./sonido-palabra";

function sintesis(): SpeechSynthesis | null {
  return typeof window !== "undefined" && "speechSynthesis" in window
    ? window.speechSynthesis
    : null;
}

/** Las voces del sistema, reducidas a lo que decide la app (nombre, idioma, si es local). */
export function vocesDelAparato(): VozAparato[] {
  const s = sintesis();
  if (!s) return [];
  return s
    .getVoices()
    .map((v) => ({ name: v.name, lang: v.lang, localService: v.localService }));
}

/** Avisa cuando el sistema termina de cargar sus voces (llegan tarde en Chrome). Devuelve el desuscriptor. */
export function alCambiarVoces(cb: () => void): () => void {
  const s = sintesis();
  if (!s) return () => undefined;
  s.addEventListener("voiceschanged", cb);
  return () => s.removeEventListener("voiceschanged", cb);
}

/**
 * Dice `texto` con la primera voz LOCAL del idioma. Devuelve false (y no suena nada) si no hay una.
 * `alSonar` recibe la duración estimada ANTES de sonar y 0 al terminar: la guarda del medidor (ADR-010).
 */
export function decirConVozDelAparato(
  texto: string,
  idioma: "es" | "en",
  volumen: number,
  alSonar?: (duracionMs: number) => void,
): boolean {
  const s = sintesis();
  if (!s || volumen <= 0) return false;
  const elegida = vozLocalPara(vocesDelAparato(), idioma);
  if (!elegida) return false;
  const voz = s
    .getVoices()
    .find((v) => v.name === elegida.name && v.localService === true);
  if (!voz) return false;
  const frase = new SpeechSynthesisUtterance(texto);
  frase.voice = voz;
  frase.lang = voz.lang;
  frase.volume = volumen;
  frase.rate = 0.9;
  const fin = () => alSonar?.(0);
  frase.addEventListener("end", fin);
  frase.addEventListener("error", fin);
  alSonar?.(duracionEstimadaMs(texto));
  s.cancel();
  s.speak(frase);
  // Señal observable para el e2e: qué voz dijo qué palabra (solo texto de la app, nada del niño).
  window.dispatchEvent(
    new CustomEvent("voz-aparato:sono", { detail: { texto, voz: voz.name } }),
  );
  return true;
}
