import { expect, test as base, type BrowserContext } from "@playwright/test";

export * from "@playwright/test";

/**
 * Every e2e imports `test` from here. Under `next start` (the CI mode, where the production
 * Content-Security-Policy is sent, src/lib/seguridad/csp.ts) ANY page or Worker console line that
 * reports a CSP violation fails the test that caused it — the model download and the recognizer
 * included. Under the dev server there is no CSP, so the guard has nothing to catch.
 */
const MARCA =
  /content security policy|violates the following|securitypolicyviolation/i;

function vigilar(context: BrowserContext, violaciones: string[]): void {
  const mirar = (page: import("@playwright/test").Page) => {
    page.on("console", (m) => {
      if (MARCA.test(m.text())) violaciones.push(m.text().slice(0, 300));
    });
    page.on("pageerror", (e) => {
      if (MARCA.test(e.message)) violaciones.push(e.message.slice(0, 300));
    });
  };
  context.pages().forEach(mirar);
  context.on("page", mirar);
}

export const test = base.extend<{ violacionesCsp: string[] }>({
  violacionesCsp: [
    async ({ browser }, entregar) => {
      const violaciones: string[] = [];
      // Contexts the specs open by hand (privacy, language, other-home flows) are watched too.
      const original = browser.newContext.bind(browser);
      browser.newContext = async (opciones) => {
        const c = await original(opciones);
        vigilar(c, violaciones);
        return c;
      };
      await entregar(violaciones);
      browser.newContext = original;
      expect(violaciones, "CSP violations in the console").toEqual([]);
    },
    { auto: true },
  ],
  context: async ({ context, violacionesCsp }, entregar) => {
    vigilar(context, violacionesCsp);
    await entregar(context);
  },
});

export { expect };
