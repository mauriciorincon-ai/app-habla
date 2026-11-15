import { createHash } from "node:crypto";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PerfilForm } from "@/components/perfil-form";

// El gate de sensibilidad del perfil (S14): corre sobre «otras cosas», no sobre el apodo (que es de la
// familia y se queda en el aparato); un fallo al comprobar no se traba mudo; lo escrito y no añadido no se
// pierde en silencio. La huella es de una palabra INVENTADA e inofensiva: ningún término real se escribe.

const huella = (t: string) => createHash("sha256").update(t).digest("hex");
const estado = { falla: false };
vi.mock("../fixtures/sensibilidad-hashes.json", () => ({
  get hashes(): string[] {
    if (estado.falla) throw new Error("sin red y sin caché");
    return [huella("zorzal")];
  },
}));

const guardar = vi.fn();
const montar = () =>
  render(
    <PerfilForm inicial={null} textoGuardar="Guardar" testIdGuardar="guardar" onGuardar={guardar} />,
  );
const escribirOtra = (v: string) =>
  fireEvent.change(screen.getByTestId("otras-cosas-entrada"), { target: { value: v } });

beforeEach(() => {
  guardar.mockReset();
  estado.falla = false;
});

describe("PerfilForm: el gate y los avisos de «otras cosas»", () => {
  it("una palabra de la lista en «otras cosas» no se guarda y dice por qué (con su propio texto)", async () => {
    montar();
    escribirOtra("zorzal");
    fireEvent.click(screen.getByTestId("guardar"));
    await waitFor(() =>
      expect(screen.getByTestId("otras-cosas-aviso")).toHaveTextContent("no puede guardarse"),
    );
    expect(guardar).not.toHaveBeenCalled();
  });

  it("el apodo NO pasa por la lista: la misma palabra como apodo sí se guarda", async () => {
    const { container } = montar();
    fireEvent.change(container.querySelector("#apodo")!, { target: { value: "zorzal" } });
    fireEvent.click(screen.getByTestId("guardar"));
    await waitFor(() => expect(guardar).toHaveBeenCalledTimes(1));
    expect(guardar.mock.calls[0]![0]).toMatchObject({ apodo: "zorzal" });
  });

  it("una palabra general en «otras cosas» entra al perfil, y sin nada escrito no hay gate", async () => {
    montar();
    escribirOtra("trenes");
    fireEvent.click(screen.getByTestId("guardar"));
    await waitFor(() => expect(guardar).toHaveBeenCalledTimes(1));
    expect(guardar.mock.calls[0]![0].otrasCosas).toEqual(["trenes"]);
  });

  it("si no se puede comprobar, no se guarda y avisa; sin «otras cosas» el primer uso sigue (no se traba)", async () => {
    estado.falla = true;
    montar();
    escribirOtra("trenes");
    fireEvent.click(screen.getByTestId("guardar"));
    await waitFor(() =>
      expect(screen.getByTestId("otras-cosas-aviso")).toHaveTextContent("No se pudo comprobar"),
    );
    expect(guardar).not.toHaveBeenCalled();
    escribirOtra("");
    fireEvent.click(screen.getByTestId("guardar"));
    await waitFor(() => expect(guardar).toHaveBeenCalledTimes(1));
  });

  it("lo escrito que no es válido no se descarta en silencio: avisa y no guarda", async () => {
    montar();
    escribirOtra("123");
    fireEvent.click(screen.getByTestId("guardar"));
    await waitFor(() =>
      expect(screen.getByTestId("otras-cosas-aviso")).toHaveTextContent("solo letras"),
    );
    expect(guardar).not.toHaveBeenCalled();
  });

  it("con ocho puestas, dice que ya hay ocho (el botón «Añadir» no se apaga mudo)", () => {
    render(
      <PerfilForm
        inicial={{ temas: ["mar"], otrasCosas: ["trenes", "nubes", "lluvia", "barcos", "pelotas", "flores", "luces", "gatos"] }}
        textoGuardar="Guardar"
        testIdGuardar="guardar"
        onGuardar={guardar}
      />,
    );
    expect(screen.getByTestId("otras-cosas-aviso")).toHaveTextContent("Ya hay ocho");
  });
});
