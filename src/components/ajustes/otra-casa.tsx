"use client";

// «Pasar a la otra casa» (S10, ADR-020), en Ajustes. Dos caminos del adulto:
// 1. Crear: marcar (o no) su voz grabada, escribir la frase dos veces y descargar el `.habla` cifrado.
// 2. Abrir: elegir el archivo, escribir la frase, VER qué cambia y confirmar. Hasta el «sí» no se
//    escribe nada; con la frase equivocada tampoco. Tras confirmar se recarga la página para que
//    ninguna pantalla se quede con lo de antes en memoria.

import { useEffect, useState } from "react";
import { useHidratado } from "@/components/use-hidratado";
import { listarIds } from "@/lib/banco-voz/almacen";
import { descargarArchivo } from "@/lib/descargar";
import { fechaHoy } from "@/lib/fecha";
import { useT } from "@/lib/idioma/estado";
import { otraCasa as textos } from "@/lib/idioma/textos/otra-casa";
import {
  abrirArchivo,
  aplicar,
  crearArchivo,
  puedeSonarAqui,
  type Apertura,
} from "@/lib/otra-casa/casa";
import { fraseValida } from "@/lib/otra-casa/cifrado";
import { nombreArchivo } from "@/lib/otra-casa/paquete";

const HECHO = "#otra-casa-hecho";
const MAX_BYTES = 200 * 1024 * 1024;

const campo =
  "border-borde bg-fondo text-tinta mt-1 min-h-11 w-full rounded-xl border px-3";
const botonPrincipal =
  "bg-acento text-sobre-acento min-h-12 rounded-xl px-6 font-medium disabled:opacity-60";
const botonSecundario =
  "border-borde text-tinta min-h-12 rounded-xl border px-6 font-medium";

export function OtraCasa() {
  const tx = useT();
  return (
    <section
      className="bg-superficie shadow-tarjeta rounded-2xl p-5"
      data-testid="otra-casa"
    >
      <h2 className="font-medium">{tx(textos.titulo)}</h2>
      <p className="text-tinta-suave mt-2 text-sm">{tx(textos.intro)}</p>
      <CrearArchivo />
      <AbrirArchivo />
    </section>
  );
}

function CrearArchivo() {
  const tx = useT();
  const [grabaciones, setGrabaciones] = useState(0);
  const [incluir, setIncluir] = useState(false);
  const [frase, setFrase] = useState("");
  const [repetida, setRepetida] = useState("");
  const [estado, setEstado] = useState<
    "" | "creando" | "listo" | "corta" | "distintas" | "error"
  >("");

  useEffect(() => {
    let vivo = true;
    listarIds()
      .then((ids) => vivo && setGrabaciones(ids.length))
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, []);

  const crear = async () => {
    if (!fraseValida(frase)) return setEstado("corta");
    if (frase !== repetida) return setEstado("distintas");
    setEstado("creando");
    try {
      const hoy = fechaHoy();
      const texto = await crearArchivo(incluir && grabaciones > 0, frase, hoy);
      descargarArchivo(texto, nombreArchivo(hoy), "application/octet-stream");
      setFrase("");
      setRepetida("");
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  };

  return (
    <div className="border-borde mt-5 border-t pt-4">
      <h3 className="font-medium">{tx(textos.crear.titulo)}</h3>
      <label className="mt-3 flex min-h-11 items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1 size-5"
          checked={incluir}
          disabled={grabaciones === 0}
          onChange={(e) => setIncluir(e.target.checked)}
          data-testid="otra-casa-incluir-banco"
        />
        <span>
          {tx(textos.crear.incluirBanco, { n: grabaciones })}
          <span className="text-tinta-suave mt-1 block">
            {tx(textos.crear.incluirBancoAyuda)}
          </span>
        </span>
      </label>
      <label className="mt-3 block text-sm">
        {tx(textos.crear.frase)}
        <input
          type="password"
          autoComplete="new-password"
          className={campo}
          value={frase}
          onChange={(e) => setFrase(e.target.value)}
          data-testid="otra-casa-frase"
        />
      </label>
      <p className="text-tinta-suave mt-1 text-sm">
        {tx(textos.crear.fraseAyuda)}
      </p>
      <label className="mt-3 block text-sm">
        {tx(textos.crear.repetir)}
        <input
          type="password"
          autoComplete="new-password"
          className={campo}
          value={repetida}
          onChange={(e) => setRepetida(e.target.value)}
          data-testid="otra-casa-frase-repetida"
        />
      </label>
      <button
        type="button"
        className={`${botonPrincipal} mt-4`}
        onClick={crear}
        disabled={estado === "creando"}
        data-testid="otra-casa-crear"
      >
        {tx(estado === "creando" ? textos.crear.creando : textos.crear.boton)}
      </button>
      {estado && estado !== "creando" ? (
        <p
          className="mt-3 text-sm"
          role="status"
          data-testid="otra-casa-crear-estado"
        >
          {tx(textos.crear[estado])}
        </p>
      ) : null}
    </div>
  );
}

function AbrirArchivo() {
  const tx = useT();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [frase, setFrase] = useState("");
  const [abriendo, setAbriendo] = useState(false);
  const [resultado, setResultado] = useState<Apertura | null>(null);
  const [aviso, setAviso] = useState<
    "" | "faltaArchivo" | "cancelado" | "hecho"
  >("");

  // Tras confirmar, la página se recarga con la marca en la dirección: se lee al hidratar (sin
  // setState en un efecto) y el efecto solo limpia la dirección.
  const hidratado = useHidratado();
  const recienHecho = hidratado && window.location.hash === HECHO;
  useEffect(() => {
    if (recienHecho) history.replaceState(null, "", window.location.pathname + window.location.search);
  }, [recienHecho]);
  const avisoVisible: typeof aviso = aviso || (recienHecho && !resultado ? "hecho" : "");

  const abrir = async () => {
    setResultado(null);
    setAviso("");
    if (!archivo) return setAviso("faltaArchivo");
    setAbriendo(true);
    try {
      if (archivo.size > MAX_BYTES) throw new Error("grande");
      setResultado(
        await abrirArchivo(await archivo.text(), frase, puedeSonarAqui),
      );
    } catch {
      setResultado({ ok: false, motivo: "formato" });
    } finally {
      setAbriendo(false);
    }
  };

  const confirmar = async () => {
    if (!resultado?.ok) return;
    await aplicar(resultado.fusion);
    window.location.hash = HECHO;
    window.location.reload();
  };

  const plan = resultado?.ok ? resultado.plan : null;
  const ninguno = tx(textos.plan.sinObjetivo);

  return (
    <div className="border-borde mt-5 border-t pt-4">
      <h3 className="font-medium">{tx(textos.abrir.titulo)}</h3>
      <label className="mt-3 block text-sm">
        {tx(textos.abrir.archivo)}
        <input
          type="file"
          accept=".habla"
          className="mt-1 block min-h-11 w-full text-sm"
          onChange={(e) => {
            setArchivo(e.target.files?.[0] ?? null);
            setResultado(null);
          }}
          data-testid="otra-casa-archivo"
        />
      </label>
      <label className="mt-3 block text-sm">
        {tx(textos.abrir.frase)}
        <input
          type="password"
          autoComplete="off"
          className={campo}
          value={frase}
          onChange={(e) => setFrase(e.target.value)}
          data-testid="otra-casa-frase-abrir"
        />
      </label>
      <button
        type="button"
        className={`${botonPrincipal} mt-4`}
        onClick={abrir}
        disabled={abriendo}
        data-testid="otra-casa-abrir"
      >
        {tx(abriendo ? textos.abrir.abriendo : textos.abrir.boton)}
      </button>

      {avisoVisible ? (
        <p className="mt-3 text-sm" role="status" data-testid="otra-casa-aviso">
          {tx(
            avisoVisible === "faltaArchivo"
              ? textos.abrir.faltaArchivo
              : textos.plan[avisoVisible],
          )}
        </p>
      ) : null}

      {resultado && !resultado.ok ? (
        <p
          className="text-peligro mt-3 text-sm"
          role="alert"
          data-testid="otra-casa-error"
        >
          {tx(
            resultado.motivo === "frase"
              ? textos.abrir.fraseMala
              : resultado.motivo === "contenido"
                ? textos.abrir.contenido
                : textos.abrir.formato,
          )}
        </p>
      ) : null}

      {plan ? (
        <div
          className="border-borde mt-4 rounded-xl border p-4"
          data-testid="otra-casa-plan"
        >
          <h4 className="font-medium">{tx(textos.plan.titulo)}</h4>
          {plan.nadaCambia ? (
            <p className="mt-2 text-sm">{tx(textos.plan.nada)}</p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
              {plan.objetivo.cambia ? (
                <li>
                  {tx(textos.plan.objetivo, {
                    antes: plan.objetivo.antes ?? ninguno,
                    despues: plan.objetivo.despues ?? ninguno,
                  })}
                </li>
              ) : null}
              {plan.sesionesNuevas ? (
                <li>{tx(textos.plan.sesiones, { n: plan.sesionesNuevas })}</li>
              ) : null}
              {plan.gemelasNuevas ? (
                <li>{tx(textos.plan.gemelas, { n: plan.gemelasNuevas })}</li>
              ) : null}
              {plan.capsulasNuevas ? (
                <li>{tx(textos.plan.capsulas, { n: plan.capsulasNuevas })}</li>
              ) : null}
              {plan.banco?.nuevas ? (
                <li>{tx(textos.plan.banco, { n: plan.banco.nuevas })}</li>
              ) : null}
              {plan.banco?.yaEstaban ? (
                <li>{tx(textos.plan.bancoYa, { n: plan.banco.yaEstaban })}</li>
              ) : null}
            </ul>
          )}
          {plan.banco?.noSuenanAqui ? (
            <p className="mt-2 text-sm" data-testid="otra-casa-no-suenan">
              {tx(textos.plan.bancoNoSuena, { n: plan.banco.noSuenanAqui })}
            </p>
          ) : null}
          <p className="text-tinta-suave mt-2 text-sm">
            {tx(textos.plan.nadaSeBorra)}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            {!plan.nadaCambia ? (
              <button
                type="button"
                className={`${botonPrincipal} flex-1`}
                onClick={confirmar}
                data-testid="otra-casa-confirmar"
              >
                {tx(textos.plan.confirmar)}
              </button>
            ) : null}
            <button
              type="button"
              className={`${botonSecundario} flex-1`}
              onClick={() => {
                setResultado(null);
                setAviso("cancelado");
              }}
              data-testid="otra-casa-cancelar"
            >
              {tx(textos.plan.cancelar)}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
