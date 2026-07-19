import Link from "next/link";
import { HoyCliente } from "@/components/hoy/hoy-cliente";
import { IconoAjustes, IconoBrujula, IconoDiana } from "@/components/iconos";

// Patrón lcp-nace-estatico: el bloque grande de la mitad superior (el saludo) se renderiza
// ESTÁTICO en el servidor — sin envolturas que arranquen en opacity 0. La cápsula, que depende
// del almacenamiento local, llega tras hidratar dentro de un espacio ya reservado.

export default function HoyPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <header>
        {/* Los cuartos del PADRE viven ARRIBA, visibles sin bajar la página. Hallazgo del gate
            (2026-07-12): Ajustes era un texto gris al pie y el usuario no lo encontró en dos
            sprints. Desde el S4 se le suman El rumbo (cómo van) y el Objetivo de la semana —
            entradas del padre, la vista del niño no cambia. */}
        <p className="text-tinta-suave font-mono text-[11px] tracking-[0.08em] uppercase">
          Hablemos San
        </p>
        <nav className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/rumbo"
            className="text-tinta-suave border-borde flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
            data-testid="ir-a-rumbo"
          >
            <IconoBrujula className="h-4 w-4 shrink-0" />
            El rumbo
          </Link>
          <Link
            href="/objetivo"
            className="text-tinta-suave border-borde flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
            data-testid="ir-a-objetivo"
          >
            <IconoDiana className="h-4 w-4 shrink-0" />
            Objetivo
          </Link>
          <Link
            href="/ajustes"
            className="text-tinta-suave border-borde flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
            data-testid="ir-a-ajustes"
          >
            <IconoAjustes className="h-4 w-4 shrink-0" />
            Ajustes
          </Link>
        </nav>
        <h1 className="font-display mt-4 text-4xl sm:text-5xl">
          ¿Y hoy qué puedo hacer por mi hijo?
        </h1>
        <p className="text-tinta-suave mt-3 max-w-prose">
          Esto es lo de hoy: una técnica con evidencia, explicada en 30
          segundos, con una línea que puedes decirle y una actividad concreta.
          Práctica en casa para acompañar —nunca reemplazar— la fonoaudiología
          de su hijo.
        </p>
      </header>

      <HoyCliente />
      {/* Sin enlace repetido al pie: la puerta a Ajustes es una sola, arriba y visible. Dos
          entradas a lo mismo en la misma pantalla es ruido (gate del usuario, 2026-07-12). */}
    </main>
  );
}
