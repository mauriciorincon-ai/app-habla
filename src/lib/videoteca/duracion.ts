// Lee la duración de un clip desde su metadato, en el dispositivo: un <video> con un blob: local.
// Nada de red. Si el navegador no entiende el códec, devuelve null y el adulto decide.

export function leerDuracion(archivo: Blob, esperaMs = 4000): Promise<number | null> {
  return new Promise((res) => {
    const url = URL.createObjectURL(archivo);
    const video = document.createElement("video");
    let hecho = false;
    const fin = (v: number | null) => {
      if (hecho) return;
      hecho = true;
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
      res(v);
    };
    video.preload = "metadata";
    video.onloadedmetadata = () => fin(Number.isFinite(video.duration) ? video.duration : null);
    video.onerror = () => fin(null);
    setTimeout(() => fin(null), esperaMs);
    video.src = url;
  });
}
