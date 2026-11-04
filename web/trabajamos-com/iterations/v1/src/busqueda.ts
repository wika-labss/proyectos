import { buscarCercanos, existeOficio } from "./datos.js";
import type { Db } from "./db.js";
import { type Geocoder, GeocoderNoDisponible, coordenadasValidas } from "./geo/geocoder.js";
import { compactar, normalizarTag } from "./lib/reglas.js";
import { categoriaDeConsulta } from "./oficios.js";
import type { EstadoBusqueda } from "./vistas/publico.js";

export interface ConsultaBusqueda {
  q: string | null;
  localidad: string;
  lat?: number | null;
  lng?: number | null;
}

// Orden de 04 §3.4: # vacío, # inexistente, origen, cercanos.
export async function resolverBusqueda(db: Db, geocoder: Geocoder, consulta: ConsultaBusqueda): Promise<EstadoBusqueda> {
  const localidad = compactar(consulta.localidad).slice(0, 160);
  const base: EstadoBusqueda = {
    tipo: "inicial",
    q: consulta.q ?? "",
    localidad,
    tag: null,
    origen: null,
    origenTexto: null,
    resultados: [],
  };
  if (consulta.q === null) return base;
  const tag = normalizarTag(consulta.q.slice(0, 200));
  if (!tag) return { ...base, tipo: "tag_vacio" };
  const categoria = categoriaDeConsulta(consulta.q.slice(0, 200));
  // Si el texto es una categoría provisional, el mensaje usa ese nombre. Si no, el #.
  base.tag = categoria ?? tag;
  try {
    if (!(await existeOficio(db, tag, categoria))) return { ...base, tipo: "sin_coincidencia" };

    let origen: { lat: number; lng: number } | null = null;
    if (localidad) {
      const lugares = await geocoder.buscar(localidad);
      const primero = lugares[0];
      if (!primero) return { ...base, tipo: "localidad_no_encontrada" };
      origen = primero;
      base.origen = "localidad";
      base.origenTexto = primero.etiqueta;
    } else if (
      typeof consulta.lat === "number" &&
      typeof consulta.lng === "number" &&
      coordenadasValidas(consulta.lat, consulta.lng)
    ) {
      origen = { lat: consulta.lat, lng: consulta.lng };
      base.origen = "navegador";
    }
    if (!origen) return { ...base, tipo: "sin_origen" };

    const resultados = await buscarCercanos(db, tag, origen.lat, origen.lng, categoria);
    if (!resultados.length) return { ...base, tipo: "sin_punto" };
    return { ...base, tipo: "exito", resultados };
  } catch (error) {
    if (error instanceof GeocoderNoDisponible) return { ...base, tipo: "error_servicio" };
    throw error;
  }
}
