import type { Metadata } from "next";
import Link from "next/link";
import { AjustesSesion } from "@/components/ajustes/ajustes-sesion";
import { ConmutadorDeIdioma } from "@/components/idioma/conmutador-de-idioma";
import { Tx, TituloDePagina } from "@/components/idioma/tx";
import { ajustes } from "@/lib/idioma/textos/ajustes";
import { comunes } from "@/lib/idioma/textos/comunes";

export const metadata: Metadata = {
  title: "Ajustes y privacidad · Hablemos San",
};

export default function AjustesPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:py-12">
      <TituloDePagina t={ajustes.tituloPestana} />
      {/* El "← Hoy" va ARRIBA y con la misma forma que en Rumbo y Objetivo (gate S4): la salida
          de los cuartos del padre es la misma en todos, siempre a la vista. */}
      <header>
        <Link
          href="/"
          className="text-tinta-suave border-borde inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm"
          data-testid="volver-a-hoy"
        >
          <Tx t={comunes.volverAHoy} />
        </Link>
        <h1 className="font-display mt-4 text-4xl">
          <Tx t={ajustes.titulo} />
        </h1>
      </header>

      <ConmutadorDeIdioma />

      <AjustesSesion />

      {/* Estático: qué mide y qué NO mide la app. Es un contrato, no un adorno. */}
      <section className="bg-superficie shadow-tarjeta rounded-2xl p-5">
        <h2 className="font-medium">
          <Tx t={ajustes.mide.titulo} />
        </h2>

        <dl className="mt-4 space-y-4 text-sm">
          <div>
            <dt className="font-medium"><Tx t={ajustes.mide.si.titulo} /></dt>
            <dd className="text-tinta-suave mt-1">
              <Tx t={ajustes.mide.si.texto} />
            </dd>
          </div>

          <div>
            <dt className="font-medium"><Tx t={ajustes.mide.no.titulo} /></dt>
            <dd className="text-tinta-suave mt-1">
              <Tx t={ajustes.mide.no.texto} />
            </dd>
          </div>

          <div>
            <dt className="font-medium"><Tx t={ajustes.mide.voz.titulo} /></dt>
            <dd className="text-tinta-suave mt-1">
              <Tx t={ajustes.mide.voz.texto} />
            </dd>
          </div>

          <div>
            <dt className="font-medium"><Tx t={ajustes.mide.noEs.titulo} /></dt>
            <dd className="text-tinta-suave mt-1">
              <Tx t={ajustes.mide.noEs.texto} />
            </dd>
          </div>
        </dl>
      </section>

      {/* Atribución obligatoria de los pictogramas (CC BY-NC-SA — ADR 008). */}
      <section
        className="bg-superficie shadow-tarjeta rounded-2xl p-5"
        data-testid="acerca-de"
      >
        <h2 className="font-medium">
          <Tx t={ajustes.dibujos.titulo} />
        </h2>
        <p className="text-tinta-suave mt-2 text-sm">
          <Tx t={ajustes.dibujos.a} />
          <strong>Sergio Palao</strong>
          <Tx t={ajustes.dibujos.b} />
          <a
            href="https://arasaac.org"
            className="underline underline-offset-4"
            rel="noreferrer"
            target="_blank"
          >
            ARASAAC
          </a>
          <Tx t={ajustes.dibujos.c} />
          <strong>Creative Commons BY-NC-SA</strong>
          <Tx t={ajustes.dibujos.d} />
          <strong>
            <Tx t={ajustes.dibujos.gobierno} />
          </strong>
          <Tx t={ajustes.dibujos.e} />
        </p>
      </section>
    </main>
  );
}
