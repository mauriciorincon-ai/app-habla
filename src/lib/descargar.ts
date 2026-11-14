// Una descarga local por acción explícita del adulto (S9 pedido de cuentos, S10 «la otra casa»): el
// archivo lo guarda él donde quiera. Sin red: es un enlace a un Blob de este mismo aparato.
export function descargarArchivo(contenido: string, nombre: string, tipo: string): void {
  const blob = new Blob([contenido], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
