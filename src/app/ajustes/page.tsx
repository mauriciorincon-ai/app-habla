import type { Metadata } from "next";
import Link from "next/link";
import { AjustesSesion } from "@/components/ajustes/ajustes-sesion";

export const metadata: Metadata = {
  title: "Ajustes y privacidad · Hablemos San",
};

export default function AjustesPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <header>
        <h1 className="font-display text-4xl">Ajustes y privacidad</h1>
      </header>

      <AjustesSesion />

      {/* Estático: qué mide y qué NO mide la app. Es un contrato, no un adorno. */}
      <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
        <h2 className="font-medium">Qué mide y qué NO mide esta app</h2>

        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="font-medium">Sí mide</dt>
            <dd className="text-tinta-suave mt-1">
              Si hay voz (energía del sonido por encima del ruido de la casa) y
              cuánto tiempo se sostiene. Eso es todo lo que el juego sabe, y es
              lo único que la app va a afirmar.
            </dd>
          </div>

          <div>
            <dt className="font-medium">No mide</dt>
            <dd className="text-tinta-suave mt-1">
              No sabe qué palabra dijo su hijo, ni si la pronunció bien. Hoy
              ningún sistema evalúa con fiabilidad la pronunciación de un niño
              de 4 a 6 años en español. Por eso el juez del acierto es usted, no
              la app: aquí nadie felicita por felicitar.
            </dd>
          </div>

          <div>
            <dt className="font-medium">Qué pasa con su voz</dt>
            <dd className="text-tinta-suave mt-1">
              El sonido se analiza en el momento, dentro de este dispositivo, y
              se descarta. No se graba, no se guarda y no viaja a ningún
              servidor. La cámara no se usa nunca.
            </dd>
          </div>

          <div>
            <dt className="font-medium">Qué no es esta app</dt>
            <dd className="text-tinta-suave mt-1">
              No es terapia ni un diagnóstico, y no promete resultados en un
              plazo. Es práctica estructurada de estimulación en casa,
              complementaria a la fonoaudiología de su hijo.
            </dd>
          </div>
        </dl>
      </section>

      <nav className="text-tinta-suave text-center text-sm">
        <Link href="/" className="min-h-11 underline-offset-4 hover:underline">
          Volver a Hoy
        </Link>
      </nav>
    </main>
  );
}
