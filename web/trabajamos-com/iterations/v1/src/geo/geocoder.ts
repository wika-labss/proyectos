import type { Db } from "../db.js";

export interface Lugar {
  lat: number;
  lng: number;
  etiqueta: string;
}

export interface Geocoder {
  buscar(texto: string): Promise<Lugar[]>;
  inversa(lat: number, lng: number): Promise<string | null>;
}

export class GeocoderNoDisponible extends Error {}

export function coordenadasValidas(lat: number, lng: number): boolean {
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180;
}

interface DireccionNominatim {
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city_district?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  state?: string;
}

interface ResultadoNominatim {
  lat: string;
  lon: string;
  display_name: string;
  address?: DireccionNominatim;
}

function unicos(partes: (string | undefined)[]): string[] {
  const vistas = new Set<string>();
  return partes.filter((p): p is string => {
    if (!p || vistas.has(p)) return false;
    vistas.add(p);
    return true;
  });
}

export function etiquetaDesdeNominatim(r: ResultadoNominatim, detalle: "localidad" | "punto"): string {
  const a = r.address ?? {};
  const comuna = a.city ?? a.town ?? a.village ?? a.municipality ?? a.city_district ?? a.county;
  const partes =
    detalle === "punto"
      ? unicos([a.road ?? a.neighbourhood ?? a.suburb, comuna])
      : unicos([a.suburb ?? a.neighbourhood, comuna, a.state]);
  if (partes.length) return partes.slice(0, 3).join(", ");
  return r.display_name.split(",").slice(0, 2).map((p) => p.trim()).join(", ");
}

export class NominatimGeocoder implements Geocoder {
  private cola: Promise<unknown> = Promise.resolve();
  private ultimo = 0;

  constructor(
    private readonly baseUrl: string,
    private readonly userAgent: string,
    private readonly countrycodes: string,
    private readonly intervaloMs = 1100,
  ) {}

  // Política de Nominatim: máximo 1 consulta por segundo desde esta instancia.
  private enCola<T>(fn: () => Promise<T>): Promise<T> {
    const tarea = this.cola.then(async () => {
      const espera = this.ultimo + this.intervaloMs - Date.now();
      if (espera > 0) await new Promise((r) => setTimeout(r, espera));
      this.ultimo = Date.now();
      return fn();
    });
    this.cola = tarea.catch(() => undefined);
    return tarea;
  }

  private async pedir<T>(ruta: string, parametros: Record<string, string>): Promise<T> {
    const url = new URL(ruta, this.baseUrl);
    for (const [k, v] of Object.entries(parametros)) url.searchParams.set(k, v);
    return this.enCola(async () => {
      let respuesta: Response;
      try {
        respuesta = await fetch(url, {
          headers: { "User-Agent": this.userAgent, "Accept-Language": "es" },
          signal: AbortSignal.timeout(8000),
        });
      } catch (error) {
        throw new GeocoderNoDisponible(String(error));
      }
      if (!respuesta.ok) throw new GeocoderNoDisponible(`Nominatim respondió ${respuesta.status}`);
      return (await respuesta.json()) as T;
    });
  }

  async buscar(texto: string): Promise<Lugar[]> {
    const parametros: Record<string, string> = { q: texto, format: "jsonv2", addressdetails: "1", limit: "5" };
    if (this.countrycodes) parametros.countrycodes = this.countrycodes;
    const resultados = await this.pedir<ResultadoNominatim[]>("/search", parametros);
    return resultados
      .map((r) => ({ lat: Number(r.lat), lng: Number(r.lon), etiqueta: etiquetaDesdeNominatim(r, "localidad") }))
      .filter((l) => coordenadasValidas(l.lat, l.lng));
  }

  async inversa(lat: number, lng: number): Promise<string | null> {
    const r = await this.pedir<ResultadoNominatim | { error: string }>("/reverse", {
      lat: String(lat),
      lon: String(lng),
      format: "jsonv2",
      addressdetails: "1",
      zoom: "17",
    });
    if ("error" in r) return null;
    return etiquetaDesdeNominatim(r, "punto") || null;
  }
}

const VIGENCIA_DIAS = 30;

export class GeocoderConCache implements Geocoder {
  constructor(
    private readonly db: Db,
    private readonly interno: Geocoder,
  ) {}

  private async leer<T>(clave: string): Promise<T | undefined> {
    const { rows } = await this.db.query<{ respuesta: T }>(
      "SELECT respuesta FROM geocache WHERE clave = $1 AND creado_en > now() - make_interval(days => $2)",
      [clave, VIGENCIA_DIAS],
    );
    return rows[0]?.respuesta;
  }

  private async guardar(clave: string, respuesta: unknown): Promise<void> {
    await this.db.query(
      `INSERT INTO geocache (clave, respuesta) VALUES ($1, $2)
       ON CONFLICT (clave) DO UPDATE SET respuesta = EXCLUDED.respuesta, creado_en = now()`,
      [clave, JSON.stringify(respuesta)],
    );
  }

  async buscar(texto: string): Promise<Lugar[]> {
    const clave = `directa:${texto.trim().replace(/\s+/gu, " ").toLocaleLowerCase("es-CL")}`;
    const guardado = await this.leer<Lugar[]>(clave);
    if (guardado) return guardado;
    const lugares = await this.interno.buscar(texto);
    await this.guardar(clave, lugares);
    return lugares;
  }

  async inversa(lat: number, lng: number): Promise<string | null> {
    const clave = `inversa:${lat.toFixed(4)},${lng.toFixed(4)}`;
    const guardado = await this.leer<{ etiqueta: string | null }>(clave);
    if (guardado) return guardado.etiqueta;
    const etiqueta = await this.interno.inversa(lat, lng);
    await this.guardar(clave, { etiqueta });
    return etiqueta;
  }
}

// Comunas de Santiago para pruebas y QA sin red (GEOCODER=fake).
export const LUGARES_FAKE: readonly Lugar[] = [
  { lat: -33.4372, lng: -70.6506, etiqueta: "Santiago, Región Metropolitana" },
  { lat: -33.4263, lng: -70.6114, etiqueta: "Providencia, Región Metropolitana" },
  { lat: -33.4569, lng: -70.5978, etiqueta: "Ñuñoa, Región Metropolitana" },
  { lat: -33.5106, lng: -70.7572, etiqueta: "Maipú, Región Metropolitana" },
  { lat: -33.4155, lng: -70.5831, etiqueta: "Las Condes, Región Metropolitana" },
  { lat: -33.5227, lng: -70.5986, etiqueta: "La Florida, Región Metropolitana" },
  { lat: -33.6117, lng: -70.5758, etiqueta: "Puente Alto, Región Metropolitana" },
  { lat: -33.4489, lng: -70.7186, etiqueta: "Estación Central, Región Metropolitana" },
  { lat: -33.3672, lng: -70.7311, etiqueta: "Quilicura, Región Metropolitana" },
  { lat: -33.0472, lng: -71.6127, etiqueta: "Valparaíso, Región de Valparaíso" },
];

function sinTildes(texto: string): string {
  return texto.normalize("NFD").replace(/[\u0300-\u036f]/gu, "").toLowerCase().trim();
}

export class GeocoderFake implements Geocoder {
  async buscar(texto: string): Promise<Lugar[]> {
    const consulta = sinTildes(texto);
    if (!consulta) return [];
    return LUGARES_FAKE.filter((l) => sinTildes(l.etiqueta).includes(consulta.split(",")[0]!.trim()));
  }

  async inversa(lat: number, lng: number): Promise<string | null> {
    let mejor: { lugar: Lugar; d: number } | null = null;
    for (const lugar of LUGARES_FAKE) {
      const d = Math.hypot(lugar.lat - lat, lugar.lng - lng);
      if (!mejor || d < mejor.d) mejor = { lugar, d };
    }
    return mejor && mejor.d < 0.15 ? mejor.lugar.etiqueta : null;
  }
}
