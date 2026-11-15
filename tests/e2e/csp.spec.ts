import { expect, test } from "./base";

// The CSP only exists under `next start` (CI). Locally the dev server sends none.
test.skip(
  !process.env.CI,
  "the production CSP is only served by next start (CI=1)",
);
test.use({ serviceWorkers: "block" });

test("the served pages carry the production CSP and its companions", async ({
  page,
  request,
}) => {
  for (const ruta of ["/", "/conoce", "/jugar/palabras", "/sw.js"]) {
    const r = ruta === "/" ? await page.goto(ruta) : await request.get(ruta);
    const h = r!.headers();
    expect(h["content-security-policy"], ruta).toContain(
      "connect-src 'self' blob:",
    );
    expect(h["content-security-policy"], ruta).toContain(
      "worker-src 'self' blob:",
    );
    expect(h["permissions-policy"], ruta).toContain("camera=()");
    expect(h["x-content-type-options"], ruta).toBe("nosniff");
  }
});

test("a blob Worker cannot reach another origin: the browser reports connect-src", async ({
  page,
}) => {
  await page.goto("/ajustes");
  const resultado = await page.evaluate(
    () =>
      new Promise<string>((resolver) => {
        const fuente = `
          self.addEventListener("securitypolicyviolation", (e) => postMessage("violation:" + e.violatedDirective));
          fetch("https://example.invalid/x").catch(() => postMessage("rejected"));`;
        const w = new Worker(
          URL.createObjectURL(new Blob([fuente], { type: "text/javascript" })),
        );
        const vistos: string[] = [];
        w.onmessage = (m) => {
          vistos.push(String(m.data));
          if (vistos.some((v) => v.startsWith("violation:")))
            resolver(vistos.join(","));
        };
        setTimeout(() => resolver(vistos.join(",") || "silence"), 4000);
      }),
  );
  expect(resultado).toContain("violation:connect-src");
});
