import { expect, test } from "@playwright/test";

// SPIKE DE SUPUESTOS — Sprint 003 F0 (se puede borrar tras validar; documenta el ADR-010).
// Verifica en el MISMO Chromium que usa la CI que el banco de voz es construible ANTES de
// construirlo: MediaRecorder captura el micrófono fake, produce un blob reproducible, hay un
// formato nativo, persist() es concedible, e IndexedDB hace round-trip de un Blob.
// Corre solo en desktop-chromium (getUserMedia necesita contexto seguro → localhost).

test("F0: MediaRecorder + fake mic + persist() + IndexedDB están disponibles", async ({
  page,
}) => {
  await page.goto("/"); // contexto seguro (localhost) para getUserMedia

  const informe = await page.evaluate(async () => {
    const r: Record<string, unknown> = {};

    // 1) Formatos de grabación soportados (matriz ADR-010).
    const candidatos = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];
    r.formatosSoportados = candidatos.filter((f) =>
      MediaRecorder.isTypeSupported(f),
    );

    // 2) getUserMedia + MediaRecorder → grabar ~700 ms → blob no vacío.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      const trozos: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size > 0 && trozos.push(e.data);
      const fin = new Promise<void>((res) => (rec.onstop = () => res()));
      rec.start();
      await new Promise((res) => setTimeout(res, 700));
      rec.stop();
      await fin;
      const blob = new Blob(trozos, { type: rec.mimeType });
      r.mimeGrabado = rec.mimeType;
      r.bytesGrabados = blob.size;
      stream.getTracks().forEach((t) => t.stop());

      // 3) IndexedDB round-trip del blob (el almacén del banco).
      const db = await new Promise<IDBDatabase>((res, rej) => {
        const req = indexedDB.open("spike-banco", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("g");
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
      await new Promise<void>((res, rej) => {
        const tx = db.transaction("g", "readwrite");
        tx.objectStore("g").put(blob, "k");
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
      const leido = await new Promise<Blob>((res, rej) => {
        const tx = db.transaction("g", "readonly");
        const req = tx.objectStore("g").get("k");
        req.onsuccess = () => res(req.result as Blob);
        req.onerror = () => rej(req.error);
      });
      r.idbRoundTripBytes = leido.size;
      db.close();
      indexedDB.deleteDatabase("spike-banco");
    } catch (e) {
      r.errorGrabacion = String(e);
    }

    // 4) persist() concedible + OPFS disponible (dato para el ADR).
    r.persistConcedido = navigator.storage?.persist
      ? await navigator.storage.persist()
      : "sin API";
    r.opfsDisponible = typeof navigator.storage?.getDirectory === "function";

    return r;
  });

  console.log("SPIKE F0 —", JSON.stringify(informe, null, 2));

  // Supuestos críticos: hay formato, se grabó algo, y el blob sobrevive a IndexedDB.
  expect(
    (informe.formatosSoportados as string[]).length,
    "hay al menos un formato de grabación nativo",
  ).toBeGreaterThan(0);
  expect(
    informe.bytesGrabados as number,
    "MediaRecorder capturó el micrófono fake",
  ).toBeGreaterThan(0);
  expect(
    informe.idbRoundTripBytes as number,
    "el blob sobrevive el round-trip por IndexedDB",
  ).toBe(informe.bytesGrabados);
});
