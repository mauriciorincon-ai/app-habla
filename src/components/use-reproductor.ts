"use client";

// Reproductor de blobs con limpieza automática: corta el clip anterior al empezar uno nuevo y, al
// desmontar el componente, libera la URL del clip en curso (remate S4: revoke al navegar a mitad de
// clip). Lo usa el estudio para "Escuchar" las grabaciones de la familia.

import { useCallback, useEffect, useRef } from "react";
import { reproducirBlob } from "@/lib/audio/reproducir";

export function useReproductor(): (blob: Blob) => void {
  const cancelarRef = useRef<(() => void) | null>(null);

  useEffect(() => () => cancelarRef.current?.(), []);

  return useCallback((blob: Blob) => {
    cancelarRef.current?.(); // corta lo que estuviera sonando
    cancelarRef.current = reproducirBlob(blob).cancelar;
  }, []);
}
