import type { Metadata } from "next";
import Link from "next/link";
import { Cohete, Globo, IconoPictograma } from "@/components/iconos";

export const metadata: Metadata = {
  title: "A jugar con tu voz · Hablemos San",
};

// EL SELECTOR DE JUEGOS (COGA §C): exactamente 3 opciones, grandes, con iconografía propia y
// SIEMPRE en el mismo orden — la predictibilidad importa más que la variedad. El niño puede
// elegir por el dibujo, sin leer nada; el texto pequeño es para el padre.
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
];

export default function JugarPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-center text-4xl sm:text-5xl">
          ¿A qué jugamos hoy?
        </h1>
        <p className="text-tinta-suave mx-auto max-w-prose text-center">
          Los tres juegos se juegan <strong>juntos</strong>: usted dirige, la
          pantalla es la utilería. Ninguno le exige palabras al niño — miden su
          voz, no su vocabulario. Nada de lo que él diga se graba ni sale de
          este dispositivo.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-3">
        {JUEGOS.map((juego) => (
          <li key={juego.href}>
            <Link
              href={juego.href}
              data-testid={juego.testid}
              className="bg-superficie shadow-tarjeta focus-visible:outline-acento flex min-h-[16rem] flex-col items-center justify-center gap-4 rounded-3xl p-6 text-center focus-visible:outline-2 focus-visible:outline-offset-2"
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

      <nav className="text-tinta-suave text-center text-sm">
        <Link href="/" className="min-h-11 underline-offset-4 hover:underline">
          Volver a Hoy
        </Link>
      </nav>
    </main>
  );
}
