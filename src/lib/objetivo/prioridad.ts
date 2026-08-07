// Reordenamiento ESTABLE por objetivo — motor puro. Los que coinciden van primero, conservando su
// orden relativo; el resto va después, también en su orden. Sin `prefiere` que acierte (sin
// objetivo activo), el resultado es IDÉNTICO a la entrada — es lo que mantiene deterministas los
// mazos por semilla del S3 (voz-familiar.spec) cuando no hay objetivo.

export function priorizarEstable<T>(
  items: readonly T[],
  prefiere: (item: T) => boolean,
): T[] {
  const arriba: T[] = [];
  const resto: T[] = [];
  for (const item of items) (prefiere(item) ? arriba : resto).push(item);
  return [...arriba, ...resto];
}
