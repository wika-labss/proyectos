import type { Db } from "./db.js";
import { enTransaccion } from "./db.js";
import type { ContactoTipo, OfertaTipo } from "./lib/reglas.js";
import { slugBase } from "./lib/reglas.js";

export interface Red {
  id: string;
  nombre: string;
  url: string;
}

export interface Oferta {
  id: string;
  tipo: OfertaTipo;
  titulo: string;
  tag: string;
  /** Categoría provisional. Solo cuando tipo es oficio; null en filas anteriores o en otros tipos. */
  categoria: string | null;
}

export interface Imagen {
  id: string;
  archivo: string;
  alt: string;
  ancho: number;
  alto: number;
}

export interface Punto {
  lat: number;
  lng: number;
  etiqueta: string;
}

export interface Perfil {
  id: string;
  slug: string;
  nombre: string;
  /** Texto del emprendedor. Null si aún no escribe una descripción. */
  descripcion: string | null;
  /** Ruta relativa dentro de UPLOADS_DIR. Null: el recuadro público queda vacío. */
  fotoArchivo: string | null;
  contacto: { tipo: ContactoTipo; valor: string };
  punto: Punto | null;
  redes: Red[];
  ofertas: Oferta[];
  imagenes: Imagen[];
}

interface FilaPerfil {
  id: string;
  slug: string;
  nombre: string;
  descripcion: string | null;
  foto_archivo: string | null;
  contacto_tipo: ContactoTipo;
  contacto_valor: string;
  lat: number | null;
  lng: number | null;
  punto_etiqueta: string | null;
}

const COLUMNAS_PERFIL = `id, slug, nombre, descripcion, foto_archivo, contacto_tipo, contacto_valor,
  ST_Y(punto::geometry) AS lat, ST_X(punto::geometry) AS lng, punto_etiqueta`;

async function completar(db: Db, fila: FilaPerfil | undefined): Promise<Perfil | null> {
  if (!fila) return null;
  const [redes, ofertas, imagenes] = await Promise.all([
    db.query<Red>("SELECT id, nombre, url FROM redes WHERE perfil_id = $1 ORDER BY orden, creado_en", [fila.id]),
    db.query<Oferta>(
      "SELECT id, tipo, titulo, tag, categoria FROM ofertas WHERE perfil_id = $1 ORDER BY creado_en, id",
      [fila.id],
    ),
    db.query<Imagen>(
      "SELECT id, archivo, alt, ancho, alto FROM imagenes WHERE perfil_id = $1 ORDER BY creado_en, id",
      [fila.id],
    ),
  ]);
  return {
    id: fila.id,
    slug: fila.slug,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    fotoArchivo: fila.foto_archivo,
    contacto: { tipo: fila.contacto_tipo, valor: fila.contacto_valor },
    punto:
      fila.lat !== null && fila.lng !== null && fila.punto_etiqueta !== null
        ? { lat: fila.lat, lng: fila.lng, etiqueta: fila.punto_etiqueta }
        : null,
    redes: redes.rows,
    ofertas: ofertas.rows,
    imagenes: imagenes.rows,
  };
}

export async function perfilDeUsuario(db: Db, usuarioId: string): Promise<Perfil | null> {
  const { rows } = await db.query<FilaPerfil>(`SELECT ${COLUMNAS_PERFIL} FROM perfiles WHERE usuario_id = $1`, [
    usuarioId,
  ]);
  return completar(db, rows[0]);
}

export async function perfilPorSlug(db: Db, slug: string): Promise<Perfil | null> {
  const { rows } = await db.query<FilaPerfil>(`SELECT ${COLUMNAS_PERFIL} FROM perfiles WHERE slug = $1`, [slug]);
  return completar(db, rows[0]);
}

export async function crearPerfil(
  db: Db,
  usuarioId: string,
  nombre: string,
  contactoTipo: ContactoTipo,
  contactoValor: string,
  descripcion: string | null = null,
): Promise<string> {
  const base = slugBase(nombre);
  for (let intento = 0; intento < 20; intento++) {
    const slug = intento === 0 ? base : `${base}-${intento + 1}`;
    const { rows } = await db.query<{ slug: string }>(
      `INSERT INTO perfiles (usuario_id, slug, nombre, contacto_tipo, contacto_valor, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (slug) DO NOTHING
       RETURNING slug`,
      [usuarioId, slug, nombre, contactoTipo, contactoValor, descripcion],
    );
    if (rows[0]) return rows[0].slug;
  }
  throw new Error("No se pudo generar un slug único");
}

export async function actualizarPerfil(
  db: Db,
  perfilId: string,
  nombre: string,
  contacto: { tipo: ContactoTipo; valor: string } | null,
  descripcion: string | null,
): Promise<void> {
  if (contacto) {
    await db.query(
      `UPDATE perfiles
       SET nombre = $2, contacto_tipo = $3, contacto_valor = $4, descripcion = $5, actualizado_en = now()
       WHERE id = $1`,
      [perfilId, nombre, contacto.tipo, contacto.valor, descripcion],
    );
  } else {
    await db.query(
      "UPDATE perfiles SET nombre = $2, descripcion = $3, actualizado_en = now() WHERE id = $1",
      [perfilId, nombre, descripcion],
    );
  }
}

/** Guarda la ruta de la foto y devuelve la anterior para borrarla del disco. `null` quita la foto. */
export async function fijarFoto(db: Db, perfilId: string, archivo: string | null): Promise<string | null> {
  return enTransaccion(db, async (c) => {
    const { rows } = await c.query<{ foto_archivo: string | null }>(
      "SELECT foto_archivo FROM perfiles WHERE id = $1 FOR UPDATE",
      [perfilId],
    );
    const anterior = rows[0]?.foto_archivo ?? null;
    await c.query("UPDATE perfiles SET foto_archivo = $2, actualizado_en = now() WHERE id = $1", [perfilId, archivo]);
    return anterior;
  });
}

export interface RedAGuardar {
  id: string | null;
  nombre: string;
  url: string;
}

export async function guardarRedes(db: Db, perfilId: string, redes: RedAGuardar[]): Promise<void> {
  await enTransaccion(db, async (c) => {
    const { rows } = await c.query<{ max: number | null }>("SELECT max(orden) AS max FROM redes WHERE perfil_id = $1", [
      perfilId,
    ]);
    let orden = (rows[0]?.max ?? -1) + 1;
    for (const red of redes) {
      if (red.id) {
        await c.query("UPDATE redes SET nombre = $3, url = $4 WHERE id = $1 AND perfil_id = $2", [
          red.id,
          perfilId,
          red.nombre,
          red.url,
        ]);
      } else {
        await c.query("INSERT INTO redes (perfil_id, nombre, url, orden) VALUES ($1, $2, $3, $4)", [
          perfilId,
          red.nombre,
          red.url,
          orden++,
        ]);
      }
    }
    await c.query("UPDATE perfiles SET actualizado_en = now() WHERE id = $1", [perfilId]);
  });
}

export async function quitarRed(db: Db, perfilId: string, id: string): Promise<Red | null> {
  const { rows } = await db.query<Red>(
    "DELETE FROM redes WHERE id = $1 AND perfil_id = $2 RETURNING id, nombre, url",
    [id, perfilId],
  );
  return rows[0] ?? null;
}

export async function agregarOferta(
  db: Db,
  perfilId: string,
  tipo: OfertaTipo,
  titulo: string,
  tag: string,
  categoria: string | null,
): Promise<Oferta> {
  const { rows } = await db.query<Oferta>(
    `INSERT INTO ofertas (perfil_id, tipo, titulo, tag, categoria)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, tipo, titulo, tag, categoria`,
    [perfilId, tipo, titulo, tag, categoria],
  );
  return rows[0]!;
}

export async function quitarOferta(db: Db, perfilId: string, id: string): Promise<Oferta | null> {
  const { rows } = await db.query<Oferta>(
    "DELETE FROM ofertas WHERE id = $1 AND perfil_id = $2 RETURNING id, tipo, titulo, tag, categoria",
    [id, perfilId],
  );
  return rows[0] ?? null;
}

export async function agregarImagen(
  db: Db,
  perfilId: string,
  imagen: { id: string; archivo: string; alt: string; ancho: number; alto: number; bytes: number },
): Promise<void> {
  await db.query(
    "INSERT INTO imagenes (id, perfil_id, archivo, alt, ancho, alto, bytes) VALUES ($1, $2, $3, $4, $5, $6, $7)",
    [imagen.id, perfilId, imagen.archivo, imagen.alt, imagen.ancho, imagen.alto, imagen.bytes],
  );
}

export async function quitarImagen(db: Db, perfilId: string, id: string): Promise<Imagen | null> {
  const { rows } = await db.query<Imagen>(
    "DELETE FROM imagenes WHERE id = $1 AND perfil_id = $2 RETURNING id, archivo, alt, ancho, alto",
    [id, perfilId],
  );
  return rows[0] ?? null;
}

export async function marcarPunto(db: Db, perfilId: string, punto: Punto): Promise<void> {
  await db.query(
    `UPDATE perfiles
     SET punto = ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography, punto_etiqueta = $4, actualizado_en = now()
     WHERE id = $1`,
    [perfilId, punto.lat, punto.lng, punto.etiqueta],
  );
}

export interface ResultadoCercano {
  oferta: Oferta;
  perfil: { slug: string; nombre: string };
  contacto: { tipo: ContactoTipo; valor: string };
  distanciaKm: number;
}

export const LIMITE_RESULTADOS = 100;

export async function buscarCercanos(
  db: Db,
  tag: string,
  lat: number,
  lng: number,
  categoria: string | null = null,
): Promise<ResultadoCercano[]> {
  const { rows } = await db.query<{
    id: string;
    tipo: OfertaTipo;
    titulo: string;
    tag: string;
    categoria: string | null;
    slug: string;
    nombre: string;
    contacto_tipo: ContactoTipo;
    contacto_valor: string;
    distancia_km: number;
  }>(
    `WITH origen AS (SELECT ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography AS g)
     SELECT o.id, o.tipo, o.titulo, o.tag, o.categoria, p.slug, p.nombre,
            p.contacto_tipo, p.contacto_valor,
            ST_Distance(p.punto, origen.g) / 1000.0 AS distancia_km
     FROM ofertas o
     JOIN perfiles p ON p.id = o.perfil_id
     CROSS JOIN origen
     WHERE (
       o.tag = $1
       OR ($5::text IS NOT NULL AND o.tipo = 'oficio' AND o.categoria = $5)
     )
       AND p.punto IS NOT NULL
     ORDER BY p.punto <-> origen.g, p.nombre, o.creado_en
     LIMIT $4`,
    [tag, lat, lng, LIMITE_RESULTADOS, categoria],
  );
  return rows.map((r) => ({
    oferta: { id: r.id, tipo: r.tipo, titulo: r.titulo, tag: r.tag, categoria: r.categoria },
    perfil: { slug: r.slug, nombre: r.nombre },
    contacto: { tipo: r.contacto_tipo, valor: r.contacto_valor },
    distanciaKm: Number(r.distancia_km),
  }));
}

/** Hay ofertas de ese # o, si la consulta nombra una categoría provisional, de esa categoría. */
export async function existeOficio(db: Db, tag: string, categoria: string | null): Promise<boolean> {
  const { rows } = await db.query<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM ofertas
       WHERE tag = $1
          OR ($2::text IS NOT NULL AND tipo = 'oficio' AND categoria = $2)
     ) AS existe`,
    [tag, categoria],
  );
  return rows[0]?.existe ?? false;
}
