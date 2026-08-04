import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { EstudioCliente } from "@/components/estudio/estudio-cliente";
import { idPalabra } from "@/lib/banco-voz/catalogo";

// Tests de componente del estudio (deuda del remate S3: solo tenía e2e). Cubren la vista de gestión
// —cobertura, lista de grabados, escuchar y borrar— sin tocar MediaRecorder ni IndexedDB reales.

const reproducir = vi.fn();
vi.mock("@/components/use-reproductor", () => ({
  useReproductor: () => ({
    reproducir,
    sonando: null,
    progreso: () => 0,
  }),
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

  it("la lista agrupa por los tres grupos de la cobertura (gate S4, K5)", async () => {
    render(<EstudioCliente />);
    // Con una palabra y una consigna grabadas, aparecen SUS encabezados (y solo esos).
    expect(await screen.findByTestId("grupo-palabra")).toHaveTextContent(
      "Palabras · 1",
    );
    expect(screen.getByTestId("grupo-consigna")).toHaveTextContent(
      "Consignas del juego · 1",
    );
    expect(screen.queryByTestId("grupo-celebracion")).not.toBeInTheDocument();
  });

  it("cada grupo pendiente tiene su puerta al lote: «Grabar» acota la tanda (gate S4, K5)", async () => {
    render(<EstudioCliente />);
    // La consigna "aaah" ya está grabada → el lote de consignas arranca en la de la sirena.
    fireEvent.click(await screen.findByTestId("grabar-consigna"));
    expect(await screen.findByTestId("lote")).toBeInTheDocument();
    expect(screen.getByTestId("progreso-lote")).toHaveTextContent(
      "Consignas del juego",
    );
    expect(screen.getByTestId("item-texto")).toHaveTextContent(/sirena/);
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

  it("«Borrar» pide un segundo toque: «¿Seguro?» primero, y solo entonces borra", async () => {
    render(<EstudioCliente />);
    const borrar = await screen.findByTestId(`borrar-${PERRO}`);
    // Primer toque: arma la confirmación — NADA se borra todavía (gate S4, J5).
    fireEvent.click(borrar);
    expect(borrar).toHaveTextContent("¿Seguro?");
    expect(borrarGrabacion).not.toHaveBeenCalled();
    // Segundo toque: efecto de despedida y borrado real.
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
