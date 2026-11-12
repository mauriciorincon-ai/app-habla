// Setup global de Vitest (referenciado por vitest.config.ts).
// Matchers de Testing Library (toBeInTheDocument, toHaveAccessibleName, ...).
import "@testing-library/jest-dom/vitest";

// Desmonta lo renderizado entre tests: sin esto los renders se acumulan en el DOM y las consultas
// por testid encuentran múltiples elementos (lo cazó el test de componente del estudio, S4).
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(cleanup);

// El idioma del dispositivo en las pruebas: español (como el de la familia). jsdom trae `en-US`,
// y la capa de idioma (ADR-017) lo respetaría; los tests buscan el español literal.
Object.defineProperty(window.navigator, "languages", { value: ["es-CO", "es"], configurable: true });
Object.defineProperty(window.navigator, "language", { value: "es-CO", configurable: true });
