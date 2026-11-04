import type { PoolClient } from "pg";
import type { Db } from "./db.js";
import { enTransaccion } from "./db.js";
import { borrarArchivo, guardarImagen } from "./imagenes.js";
import type { OfertaTipo } from "./lib/reglas.js";
import { correoValido, slugBase, telefonoValido } from "./lib/reglas.js";

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
  telefono: string | null;
  correoPublico: string | null;
  punto: Punto | null;
  redes: Red[];
  ofertas: Oferta[];
  imagenes: Imagen[];
}

interface FilaPerfil {
  id: string;
  slug: string;
  nombre: string;
  telefono: string | null;
  correo_publico: string | null;
  lat: number | null;
  lng: number | null;
  punto_etiqueta: string | null;
}

const COLUMNAS_PERFIL = `id, slug, nombre, telefono, correo_publico,
  ST_Y(punto::geometry) AS lat, ST_X(punto::geometry) AS lng, punto_etiqueta`;

const FILTRO_PUBLICADO = `p.telefono IS NOT NULL AND btrim(p.telefono) <> ''
  AND p.correo_publico IS NOT NULL AND btrim(p.correo_publico::text) <> ''
  AND EXISTS (SELECT 1 FROM imagenes i WHERE i.perfil_id = p.id)
  AND EXISTS (SELECT 1 FROM ofertas pub WHERE pub.perfil_id = p.id)`;

export function perfilPublicado(perfil: Perfil): boolean {
  return Boolean(
    perfil.telefono &&
      telefonoValido(perfil.telefono) &&
      perfil.correoPublico &&
      correoValido(perfil.correoPublico) &&
      perfil.ofertas.length > 0 &&
      perfil.imagenes.length > 0,
  );
}

export function faltantesPublicacion(perfil: Perfil): string[] {
  const faltan: string[] = [];
  if (!perfil.nombre) faltan.push("el nombre visible");
  if (!perfil.telefono || !telefonoValido(perfil.telefono)) faltan.push("el teléfono público");
  if (!perfil.correoPublico || !correoValido(perfil.correoPublico)) faltan.push("el correo público");
  if (!perfil.ofertas.length) faltan.push("al menos una oferta");
  if (!perfil.imagenes.length) faltan.push("al menos una imagen del portafolio");
  return faltan;
}

async function completar(db: Db | PoolClient, fila: FilaPerfil | undefined): Promise<Perfil | null> {
  if (!fila) return null;
  const [redes, ofertas, imagenes] = await Promise.all([
    db.query<Red>("SELECT id, nombre, url FROM redes WHERE perfil_id = $1 ORDER BY orden, creado_en", [fila.id]),
    db.query<Oferta>("SELECT id, tipo, titulo, tag FROM ofertas WHERE perfil_id = $1 ORDER BY creado_en, id", [
      fila.id,
    ]),
    db.query<Imagen>(
      "SELECT id, archivo, alt, ancho, alto FROM imagenes WHERE perfil_id = $1 ORDER BY creado_en, id",
      [fila.id],
    ),
  ]);
  return {
    id: fila.id,
    slug: fila.slug,
    nombre: fila.nombre,
    telefono: fila.telefono,
    correoPublico: fila.correo_publico,
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
  const { rows } = await db.query<FilaPerfil>(
    `SELECT ${COLUMNAS_PERFIL} FROM perfiles p WHERE slug = $1 AND ${FILTRO_PUBLICADO}`,
    [slug],
  );
  return completar(db, rows[0]);
}

async function insertarPerfil(
  db: Db | PoolClient,
  usuarioId: string,
  nombre: string,
  telefono: string,
  correoPublico: string,
): Promise<{ id: string; slug: string }> {
  const base = slugBase(nombre);
  for (let intento = 0; intento < 20; intento++) {
    const slug = intento === 0 ? base : `${base}-${intento + 1}`;
    const { rows } = await db.query<{ id: string; slug: string }>(
      `INSERT INTO perfiles (usuario_id, slug, nombre, telefono, correo_publico)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO NOTHING
       RETURNING id, slug`,
      [usuarioId, slug, nombre, telefono, correoPublico],
    );
    if (rows[0]) return rows[0];
  }
  throw new Error("No se pudo generar un slug único");
}

export async function crearPerfil(
  db: Db,
  usuarioId: string,
  nombre: string,
  telefono: string,
  correoPublico: string,
): Promise<string> {
  const creado = await insertarPerfil(db, usuarioId, nombre, telefono, correoPublico);
  return creado.slug;
}

export async function actualizarPerfil(
  db: Db,
  perfilId: string,
  cambios: { nombre: string; telefono: string | null; correoPublico: string | null },
): Promise<void> {
  await db.query(
    `UPDATE perfiles
     SET nombre = $2,
         telefono = COALESCE($3, telefono),
         correo_publico = COALESCE($4, correo_publico),
         actualizado_en = now()
     WHERE id = $1`,
    [perfilId, cambios.nombre, cambios.telefono, cambios.correoPublico],
  );
}

export interface RegistroAPublicar {
  usuarioId: string;
  nombre: string;
  telefono: string;
  correoPublico: string;
  oferta: { tipo: OfertaTipo; titulo: string; tag: string };
  imagen: { datos: Buffer; alt: string };
  red: { nombre: string; url: string } | null;
  punto: Punto | null;
}

export async function publicarRegistro(db: Db, uploadsDir: string, registro: RegistroAPublicar): Promise<string> {
  let archivo: string | null = null;
  try {
    return await enTransaccion(db, async (cliente) => {
      const perfil = await insertarPerfil(
        cliente,
        registro.usuarioId,
        registro.nombre,
        registro.telefono,
        registro.correoPublico,
      );
      await cliente.query("INSERT INTO ofertas (perfil_id, tipo, titulo, tag) VALUES ($1, $2, $3, $4)", [
        perfil.id,
        registro.oferta.tipo,
        registro.oferta.titulo,
        registro.oferta.tag,
      ]);
      const imagen = await guardarImagen(uploadsDir, perfil.id, registro.imagen.datos);
      archivo = imagen.archivo;
      await cliente.query(
        "INSERT INTO imagenes (id, perfil_id, archivo, alt, ancho, alto, bytes) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [imagen.id, perfil.id, imagen.archivo, registro.imagen.alt, imagen.ancho, imagen.alto, imagen.bytes],
      );
      if (registro.red) {
        await cliente.query("INSERT INTO redes (perfil_id, nombre, url, orden) VALUES ($1, $2, $3, 0)", [
          perfil.id,
          registro.red.nombre,
          registro.red.url,
        ]);
      }
      if (registro.punto) {
        await cliente.query(
          `UPDATE perfiles
           SET punto = ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography, punto_etiqueta = $4, actualizado_en = now()
           WHERE id = $1`,
          [perfil.id, registro.punto.lat, registro.punto.lng, registro.punto.etiqueta],
        );
      }
      return perfil.slug;
    });
  } catch (error) {
    if (archivo) await borrarArchivo(uploadsDir, archivo);
    throw error;
  }
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
): Promise<Oferta> {
  const { rows } = await db.query<Oferta>(
    "INSERT INTO ofertas (perfil_id, tipo, titulo, tag) VALUES ($1, $2, $3, $4) RETURNING id, tipo, titulo, tag",
    [perfilId, tipo, titulo, tag],
  );
  return rows[0]!;
}

export async function quitarOferta(db: Db, perfilId: string, id: string): Promise<Oferta | null> {
  const { rows } = await db.query<Oferta>(
    "DELETE FROM ofertas WHERE id = $1 AND perfil_id = $2 RETURNING id, tipo, titulo, tag",
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
  telefono: string;
  correoPublico: string;
  distanciaKm: number;
}

export const LIMITE_RESULTADOS = 100;

export async function buscarCercanos(db: Db, tag: string, lat: number, lng: number): Promise<ResultadoCercano[]> {
  const { rows } = await db.query<{
    id: string;
    tipo: OfertaTipo;
    titulo: string;
    tag: string;
    slug: string;
    nombre: string;
    telefono: string;
    correo_publico: string;
    distancia_km: number;
  }>(
    `WITH origen AS (SELECT ST_SetSRID(ST_MakePoint($3, $2), 4326)::geography AS g)
     SELECT o.id, o.tipo, o.titulo, o.tag, p.slug, p.nombre,
            p.telefono, p.correo_publico,
            ST_Distance(p.punto, origen.g) / 1000.0 AS distancia_km
     FROM ofertas o
     JOIN perfiles p ON p.id = o.perfil_id
     CROSS JOIN origen
     WHERE o.tag = $1 AND p.punto IS NOT NULL AND ${FILTRO_PUBLICADO}
     ORDER BY p.punto <-> origen.g, p.nombre, o.creado_en
     LIMIT $4`,
    [tag, lat, lng, LIMITE_RESULTADOS],
  );
  return rows.map((r) => ({
    oferta: { id: r.id, tipo: r.tipo, titulo: r.titulo, tag: r.tag },
    perfil: { slug: r.slug, nombre: r.nombre },
    telefono: r.telefono,
    correoPublico: r.correo_publico,
    distanciaKm: Number(r.distancia_km),
  }));
}

export async function existeTag(db: Db, tag: string): Promise<boolean> {
  const { rows } = await db.query<{ existe: boolean }>(
    `SELECT EXISTS (
       SELECT 1 FROM ofertas o
       JOIN perfiles p ON p.id = o.perfil_id
       WHERE o.tag = $1 AND ${FILTRO_PUBLICADO}
     ) AS existe`,
    [tag],
  );
  return rows[0]?.existe ?? false;
}
