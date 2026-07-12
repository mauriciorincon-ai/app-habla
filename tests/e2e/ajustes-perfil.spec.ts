import { expect, test } from "@playwright/test";

// Hallazgo del gate (2026-07-12): el onboarding solo aparece la primera vez y no había forma de
// volver a cambiar el apodo/los temas sin borrar todo. Ahora se cambian desde Ajustes, y la
// garantía bajo test es doble: los cambios persisten Y el progreso queda intacto.

test("apodo y temas se cambian desde Ajustes sin perder el progreso", async ({
  page,
}) => {
  // 1. Primera vez: onboarding con un perfil inicial.
  await page.goto("/");
  await page.getByRole("textbox", { name: /cómo le dicen/i }).fill("Peque");
  await page.getByRole("button", { name: "Animales" }).click();
  await page.getByTestId("terminar-onboarding").click();

  // 2. Deja huella de progreso: la cápsula de hoy marcada como hecha.
  await expect(page.getByTestId("capsula")).toBeVisible();
  await page.getByTestId("marcar-hecha").click();
  await expect(page.getByTestId("capsula-completada")).toBeVisible();

  // 3. En Ajustes se ve el perfil actual y se puede cambiar.
  await page.goto("/ajustes");
  await expect(page.getByTestId("perfil-apodo")).toHaveText("Peque");
  await expect(page.getByTestId("perfil-temas")).toHaveText("Animales");

  await page.getByTestId("editar-perfil").click();
  const apodo = page.getByRole("textbox", { name: /cómo le dicen/i });
  await apodo.fill("San");
  await page.getByRole("button", { name: "Dinosaurios" }).click();
  await page.getByTestId("guardar-perfil").click();

  // 4. El resumen refleja el cambio, y sobrevive a una recarga (persistió de verdad).
  await expect(page.getByTestId("perfil-apodo")).toHaveText("San");
  await expect(page.getByTestId("perfil-temas")).toHaveText(
    "Animales · Dinosaurios",
  );
  await page.reload();
  await expect(page.getByTestId("perfil-apodo")).toHaveText("San");

  // 5. La garantía: cambiar el perfil NO tocó el progreso ni reabrió el onboarding.
  await page.goto("/");
  await expect(page.getByTestId("onboarding")).not.toBeVisible();
  await expect(page.getByTestId("capsula-completada")).toBeVisible();
  await expect(page.getByTestId("historial")).toContainText("1 día");
});

test("cancelar la edición no guarda nada", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("textbox", { name: /cómo le dicen/i }).fill("Peque");
  await page.getByRole("button", { name: "Animales" }).click();
  await page.getByTestId("terminar-onboarding").click();
  await expect(page.getByTestId("capsula")).toBeVisible();

  await page.goto("/ajustes");
  await page.getByTestId("editar-perfil").click();
  await page.getByRole("textbox", { name: /cómo le dicen/i }).fill("Otro");
  await page.getByRole("button", { name: "Mejor no" }).click();

  await expect(page.getByTestId("perfil-apodo")).toHaveText("Peque");
});
