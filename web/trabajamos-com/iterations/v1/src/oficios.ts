/**
 * Lista provisional de categorías de oficio.
 * Pendiente de confirmación de Vissiuss: no es un catálogo firmado.
 * Una sola fuente para el alta de una oferta de tipo oficio y el selector del home.
 * El # de la oferta sigue siendo libre y no se reemplaza por esta lista.
 */
export const CATEGORIAS_OFICIO = [
  "Gasfitería",
  "Electricidad",
  "Carpintería",
  "Pintura",
  "Albañilería",
  "Jardinería",
  "Cerrajería",
  "Limpieza",
  "Mudanzas",
  "Maestro chasquilla",
] as const;

export type CategoriaOficio = (typeof CATEGORIAS_OFICIO)[number];

const CONJUNTO = new Set<string>(CATEGORIAS_OFICIO);

export function esCategoriaOficio(valor: string): valor is CategoriaOficio {
  return CONJUNTO.has(valor);
}

/** El selector del home y la barra mandan el nombre, con o sin #. Las tildes distinguen. */
export function categoriaDeConsulta(q: string): CategoriaOficio | null {
  const limpio = q.trim().replace(/^#+\s*/u, "");
  if (!limpio) return null;
  return (
    CATEGORIAS_OFICIO.find((nombre) => limpio.localeCompare(nombre, "es-CL", { sensitivity: "accent" }) === 0) ?? null
  );
}
