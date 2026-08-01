import type { Metadata } from "next";
import Link from "next/link";
import {
  Cohete,
  Globo,
  IconoGemelas,
  IconoPictograma,
} from "@/components/iconos";

export const metadata: Metadata = {
  title: "A jugar con tu voz · Hablemos San",
};

// EL SELECTOR DE JUEGOS (COGA §C): opciones grandes, con iconografía propia y SIEMPRE en el mismo
// orden — la predictibilidad importa más que la variedad. El niño puede elegir por el dibujo, sin
// leer nada; el texto pequeño es para el padre. En el S3 pasa de 3 a 4 juegos (llega gemelas): el
// orden de los tres primeros NO cambia — el niño encuentra su juego donde siempre estuvo.
//
// LCP estático (patrón lcp-nace-estatico): esta página es 100% servidor. Nada nace en el cliente.

const JUEGOS = [
  {
    href: "/jugar/globo",
    testid: "juego-globo",
    nombre: "El globo",
    que: "Vuela mientras él sostiene la voz.",
    mide: "Mide cuánto dura su voz.",
    icono: <Globo className="h-24 w-16" />,
  },
  {
    href: "/jugar/cohete",
    testid: "juego-cohete",
    nombre: "El cohete",
    que: "Sube cuando su voz sube de tono.",
    mide: "Mide el tono de su voz.",
    icono: <Cohete className="h-24 w-16" />,
  },
  {
    href: "/jugar/palabras",
    testid: "juego-palabras",
    nombre: "Palabra y dibujo",
    que: "Cualquier sonido enciende el dibujo.",
    mide: "Mide que hubo voz — nunca qué palabra dijo.",
    icono: <IconoPictograma className="text-acento h-20 w-20" />,
  },
  {
    href: "/jugar/gemelas",
    testid: "juego-gemelas",
    nombre: "Palabras gemelas",
    que: "Dos dibujos que suenan casi igual: él dice, tú marcas.",
    mide: "No usa micrófono — el que oye la palabra eres tú.",
    icono: <IconoGemelas className="text-acento h-20 w-24" />,
  },
];

export default function JugarPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      {/* El "← Hoy" arriba, igual que en Rumbo, Objetivo y Ajustes: la salida de toda pantalla
          del padre tiene la misma forma y el mismo sitio (gate S4). */}
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          prefetch={false}
          className="text-tinta-suave border-borde inline-flex min-h-11 items-center gap-2 self-start rounded-xl border px-3 text-sm"
          data-testid="volver-a-hoy"
        >
          ← Hoy
        </Link>
        <h1 className="font-display mt-1 text-center text-4xl sm:text-5xl">
          ¿A qué jugamos hoy?
        </h1>
        <p className="text-tinta-suave mx-auto max-w-prose text-center">
          Todos se juegan <strong>juntos</strong>: usted dirige, la pantalla es
          la utilería. Ninguno le exige palabras al niño — y nada de lo que él
          diga se graba ni sale de este dispositivo.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2">
        {JUEGOS.map((juego) => (
          <li key={juego.href}>
            <Link
              href={juego.href}
              // Sin prefetch: entrar al selector descargaba de golpe el JS de los TRES juegos
              // (incluida la biblioteca entera de cápsulas). El niño abre uno, no tres — y el
              // salto entre pantallas es local e instantáneo igual. (Lo destapó el gate de
              // performance del S2: LCP 4.5 s y +130 KB de script en esta ruta.)
              prefetch={false}
              data-testid={juego.testid}
              className="bg-superficie shadow-tarjeta hover:shadow-flotante focus-visible:outline-acento flex min-h-64 flex-col items-center justify-center gap-4 rounded-3xl p-6 text-center transition-shadow duration-[--dur-media] ease-suave focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {juego.icono}
              <span className="flex flex-col gap-1">
                <span className="font-display text-2xl">{juego.nombre}</span>
                <span className="text-tinta-suave text-sm">{juego.que}</span>
                <span className="text-tinta-suave mt-1 font-mono text-[11px] tracking-[0.04em] uppercase">
                  {juego.mide}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
