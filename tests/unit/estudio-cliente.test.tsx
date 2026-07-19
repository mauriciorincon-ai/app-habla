import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { EstudioCliente } from "@/components/estudio/estudio-cliente";
import { idPalabra } from "@/lib/banco-voz/catalogo";

// Tests de componente del estudio (deuda del remate S3: solo tenía e2e). Cubren la vista de gestión
// —cobertura, lista de grabados, escuchar y borrar— sin tocar MediaRecorder ni IndexedDB reales.

const reproducir = vi.fn();
vi.mock("@/components/use-reproductor", () => ({
  useReproductor: () => reproducir,
}));

const listarIds = vi.fn();
const obtenerGrabacion = vi.fn();
const borrarGrabacion = vi.fn();
vi.mock("@/lib/banco-voz/almacen", () => ({
  listarIds: () => listarIds(),
  obtenerGrabacion: (id: string) => obtenerGrabacion(id),
  borrarGrabacion: (id: string) => borrarGrabacion(id),
  guardarGrabacion: vi.fn(),
  pedirPersistencia: vi.fn(),
}));

const PERRO = idPalabra("perro");

describe("EstudioCliente — vista de gestión (banco de voz)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.clear();
    listarIds.mockResolvedValue([PERRO, "consigna:aaah"]);
    obtenerGrabacion.mockResolvedValue({
      blob: new Blob(["x"]),
      mimeType: "audio/webm",
      duracionMs: 500,
      fecha: "2026-07-19",
    });
    borrarGrabacion.mockResolvedValue(undefined);
  });

  it("muestra la cobertura y lo que ya se grabó", async () => {
    render(<EstudioCliente />);
    // "perro" (palabra) aparece en la lista de grabados.
    expect(await screen.findByText("perro")).toBeInTheDocument();
    expect(screen.getByTestId("cobertura")).toBeInTheDocument();
    // La consigna grabada también.
    expect(screen.getByText("Haz sonar tu voz: aaaaah")).toBeInTheDocument();
  });

  it("«Escuchar» reproduce el blob de esa grabación (voz familiar)", async () => {
    render(<EstudioCliente />);
    const escuchar = await screen.findByTestId(`escuchar-${PERRO}`);
    fireEvent.click(escuchar);
    await waitFor(() => {
      expect(obtenerGrabacion).toHaveBeenCalledWith(PERRO);
      expect(reproducir).toHaveBeenCalledTimes(1);
    });
  });

  it("«Borrar» quita la grabación del banco y de la lista", async () => {
    render(<EstudioCliente />);
    const borrar = await screen.findByTestId(`borrar-${PERRO}`);
    fireEvent.click(borrar);
    await waitFor(() => expect(borrarGrabacion).toHaveBeenCalledWith(PERRO));
    // La fila desaparece (onBorrado actualiza el estado).
    await waitFor(() =>
      expect(screen.queryByText("perro")).not.toBeInTheDocument(),
    );
  });

  it("con el banco vacío, invita a grabar y no muestra lista", async () => {
    listarIds.mockResolvedValue([]);
    render(<EstudioCliente />);
    expect(await screen.findByText("Grabar mi voz")).toBeInTheDocument();
    expect(screen.queryByTestId("lista-grabados")).not.toBeInTheDocument();
  });

  it("si el banco no abre (IndexedDB roto), no se queda en esqueleto: banco vacío", async () => {
    listarIds.mockRejectedValue(new Error("indexeddb caído"));
    render(<EstudioCliente />);
    // Cae al estado vacío honesto (auditoría S3, M-1), sin colgarse.
    expect(await screen.findByText("Grabar mi voz")).toBeInTheDocument();
  });
});
