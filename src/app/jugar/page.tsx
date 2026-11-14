import type { Metadata } from "next";
import Link from "next/link";
import {
  Cohete,
  Globo,
  IconoGemelas,
  IconoPictograma,
} from "@/components/iconos";
import { FormaVocal } from "@/components/juego/forma-vocal";
import { Tx, TituloDePagina } from "@/components/idioma/tx";
import { comunes } from "@/lib/idioma/textos/comunes";
import { jugar } from "@/lib/idioma/textos/jugar";

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
    ...jugar.globo,
    icono: <Globo className="h-24 w-16" />,
  },
  {
    href: "/jugar/cohete",
    testid: "juego-cohete",
    ...jugar.cohete,
    icono: <Cohete className="h-24 w-16" />,
  },
  {
    href: "/jugar/palabras",
    testid: "juego-palabras",
    ...jugar.palabras,
    icono: <IconoPictograma className="text-acento h-20 w-20" />,
  },
  {
    href: "/jugar/gemelas",
    testid: "juego-gemelas",
    ...jugar.gemelas,
    icono: <IconoGemelas className="text-acento h-20 w-24" />,
  },
  {
    href: "/jugar/vocales",
    testid: "juego-vocales",
    ...jugar.vocales,
    icono: (
      <span className="flex items-end gap-1">
        <FormaVocal vocal="a" letra="A" className="size-9" encendida />
        <FormaVocal vocal="i" letra="I" className="size-9" encendida />
        <FormaVocal vocal="u" letra="U" className="size-9" encendida />
      </span>
    ),
  },
];

export default function JugarPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-8">
      <TituloDePagina t={jugar.tituloPestana} />
      {/* El "← Hoy" arriba, igual que en Rumbo, Objetivo y Ajustes: la salida de toda pantalla
          del padre tiene la misma forma y el mismo sitio (gate S4). */}
      <header className="flex flex-col gap-3">
        <Link
          href="/"
          prefetch={false}
          className="text-tinta-suave border-borde inline-flex min-h-11 items-center gap-2 self-start rounded-xl border px-3 text-sm"
          data-testid="volver-a-hoy"
        >
          <Tx t={comunes.volverAHoy} />
        </Link>
        <h1 className="font-display mt-1 text-center text-4xl sm:text-5xl">
          <Tx t={jugar.titulo} />
        </h1>
        <p className="text-tinta-suave mx-auto max-w-prose text-center">
          <Tx t={jugar.intro.antes} /> <strong><Tx t={jugar.intro.enfasis} /></strong>
          <Tx t={jugar.intro.despues} />
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
                <span className="font-display text-2xl"><Tx t={juego.nombre} /></span>
                <span className="text-tinta-suave text-sm"><Tx t={juego.que} /></span>
                <span className="text-tinta-suave mt-1 font-mono text-[11px] tracking-[0.04em] uppercase">
                  <Tx t={juego.mide} />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
