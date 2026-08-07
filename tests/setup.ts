// Setup global de Vitest (referenciado por vitest.config.ts).
// Matchers de Testing Library (toBeInTheDocument, toHaveAccessibleName, ...).
import "@testing-library/jest-dom/vitest";

// Desmonta lo renderizado entre tests: sin esto los renders se acumulan en el DOM y las consultas
// por testid encuentran múltiples elementos (lo cazó el test de componente del estudio, S4).
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(cleanup);
