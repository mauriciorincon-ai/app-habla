import { describe, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";
import { CSP, cabecerasSeguridad } from "@/lib/seguridad/csp";

const directiva = (nombre: string): string[] => {
  const d = CSP.split("; ").find((x) => x.startsWith(`${nombre} `));
  if (!d) throw new Error(`directive ${nombre} missing`);
  return d.split(" ").slice(1);
};

describe("Content-Security-Policy (S11)", () => {
  it("is sent in production on every route, and only there", async () => {
    expect(cabecerasSeguridad("development")).toEqual([]);
    expect(cabecerasSeguridad(undefined)).toEqual([]);
    const prod = cabecerasSeguridad("production");
    expect(prod).toHaveLength(1);
    expect(prod[0]!.source).toBe("/:path*");
    expect(prod[0]!.headers).toEqual([
      { key: "Content-Security-Policy", value: CSP },
    ]);
  });

  it("next.config wires it through headers() from NODE_ENV", async () => {
    const previo = process.env.NODE_ENV;
    try {
      vi.stubEnv("NODE_ENV", "production");
      expect(await nextConfig.headers!()).toEqual(
        cabecerasSeguridad("production"),
      );
      vi.stubEnv("NODE_ENV", "development");
      expect(await nextConfig.headers!()).toEqual([]);
    } finally {
      vi.unstubAllEnvs();
      expect(process.env.NODE_ENV).toBe(previo);
    }
  });

  it("the Worker can reach only this origin and blob: URLs — never another origin", () => {
    expect(directiva("connect-src")).toEqual(["'self'", "blob:"]);
    expect(directiva("worker-src")).toEqual(["'self'", "blob:"]);
    expect(directiva("default-src")).toEqual(["'self'"]);
  });

  it("allows the wasm to compile and vosk's embind eval, and no foreign origin anywhere", () => {
    const scripts = directiva("script-src");
    expect(scripts).toContain("'wasm-unsafe-eval'");
    // vosk-browser builds its invokers with `new Function` inside the Worker (see src/lib/seguridad/csp.ts).
    expect(scripts).toContain("'unsafe-eval'");
    expect(scripts.filter((x) => /^(https?:|\*)/.test(x))).toEqual([]);
    expect(CSP).not.toMatch(/https?:/);
    expect(CSP).not.toContain("*");
  });

  it("closes the doors the app never uses", () => {
    expect(directiva("object-src")).toEqual(["'none'"]);
    expect(directiva("base-uri")).toEqual(["'self'"]);
    expect(directiva("form-action")).toEqual(["'self'"]);
    expect(directiva("frame-ancestors")).toEqual(["'none'"]);
  });
});
