import type { Catalogo } from "../index";

// La primera vez (onboarding en Hoy) y el formulario de apodo + temas, que Ajustes reutiliza.
export const primerUso = {
  titulo: { es: "Antes de empezar, dos cositas", en: "Before we start, two quick things" },
  privacidad: {
    antes: { es: "Todo lo que escribas aquí se queda", en: "Everything you write here stays" },
    enfasis: { es: "en este dispositivo", en: "on this device" },
    despues: {
      es: ": no hay cuentas ni servidores. Y la voz de su hijo nunca se graba ni sale de aquí — solo se analiza en el momento para saber si hay voz y cuánto dura.",
      en: ": there are no accounts and no servers. And your child's voice is never recorded and never leaves here — it is only analyzed in the moment to tell whether there is voice and how long it lasts.",
    },
  },
  empezar: { es: "Empezar", en: "Start" },
  form: {
    apodoEtiqueta: { es: "¿Cómo le dicen en casa?", en: "What do you call your child at home?" },
    opcional: { es: "(opcional)", en: "(optional)" },
    apodoPlaceholder: { es: "Su apodo", en: "A nickname" },
    temasLeyenda: { es: "¿Qué le gusta? Elige hasta tres", en: "What do they like? Pick up to three" },
    temasAyuda: {
      es: "Las actividades usan lo que a él ya le interesa: seguir su interés es una de las técnicas con mejor respaldo.",
      en: "The activities use what already interests them: following their lead is one of the best-supported techniques.",
    },
    mejorNo: { es: "Mejor no", en: "Not now" },
  },
} satisfies Catalogo;
