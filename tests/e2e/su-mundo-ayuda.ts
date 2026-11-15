import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

// Ayudas del S14 («Su mundo en todo», ADR-026) compartidas por los e2e de cada juego. Perfiles INVENTADOS
// (regla dura 8): un tema por perfil, para que el protagonista no dependa del día.

export type Semilla = {
  temas?: string[];
  otrasCosas?: string[];
  objetivo?: string;
  cuentos?: unknown;
  ajustes?: Record<string, unknown>;
};

export async function sembrar(page: Page, s: Semilla): Promise<void> {
  await page.addInitScript((semilla) => {
    // Se siembra UNA vez por pestaña: si no, recargar pisaría lo que el test cambió en la pantalla.
    if (sessionStorage.getItem("sembrado")) return;
    sessionStorage.setItem("sembrado", "1");
    localStorage.setItem(
      "habla:v1:perfil",
      JSON.stringify({
        temas: semilla.temas ?? ["dinosaurios"],
        ...(semilla.otrasCosas ? { otrasCosas: semilla.otrasCosas } : {}),
      }),
    );
    if (semilla.objetivo) {
      localStorage.setItem(
        "habla:v1:objetivo",
        JSON.stringify({ texto: semilla.objetivo, desde: "2026-11-16" }),
      );
    }
    if (semilla.cuentos) {
      localStorage.setItem("habla:v1:cuentos", JSON.stringify(semilla.cuentos));
    }
    if (semilla.ajustes) {
      localStorage.setItem("habla:v1:ajustes", JSON.stringify(semilla.ajustes));
    }
  }, s);
}

/** axe en los dos temas: el estado nuevo no baja el listón. */
export async function axeLimpio(page: Page): Promise<void> {
  for (const esquema of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: esquema });
    const { violations } = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(violations, `${esquema}: ${JSON.stringify(violations, null, 2)}`).toEqual([]);
  }
}

/** Entra al juego por su guion y espera la fase «jugando». */
export async function jugar(page: Page, ruta: string): Promise<void> {
  await page.goto(ruta);
  await expect(page.getByTestId("empezar-juego")).toBeEnabled();
  await page.getByTestId("empezar-juego").click();
  await expect(page.getByTestId("juego")).toHaveAttribute("data-fase", "jugando", {
    timeout: 20_000,
  });
}
