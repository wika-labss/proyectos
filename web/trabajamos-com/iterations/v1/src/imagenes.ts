import { randomUUID } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const BYTES_MAXIMOS = 5 * 1024 * 1024;
export const LADO_MAXIMO = 1600;
const FORMATOS_ACEPTADOS = new Set(["jpeg", "png", "webp"]);

export class NoEsImagen extends Error {}

export interface ImagenProcesada {
  id: string;
  archivo: string;
  ancho: number;
  alto: number;
  bytes: number;
}

// Re-codifica a WebP: corrige la orientación, limita el tamaño y descarta EXIF (incluido el GPS).
export async function procesarImagen(entrada: Buffer): Promise<{ datos: Buffer; ancho: number; alto: number }> {
  let formato: string | undefined;
  try {
    formato = (await sharp(entrada).metadata()).format;
  } catch {
    throw new NoEsImagen();
  }
  if (!formato || !FORMATOS_ACEPTADOS.has(formato)) throw new NoEsImagen();
  try {
    const { data, info } = await sharp(entrada, { failOn: "error", limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: LADO_MAXIMO, height: LADO_MAXIMO, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });
    return { datos: data, ancho: info.width, alto: info.height };
  } catch {
    throw new NoEsImagen();
  }
}

export async function guardarImagen(uploadsDir: string, perfilId: string, entrada: Buffer): Promise<ImagenProcesada> {
  const { datos, ancho, alto } = await procesarImagen(entrada);
  const id = randomUUID();
  const archivo = `${perfilId}/${id}.webp`;
  await mkdir(path.join(uploadsDir, perfilId), { recursive: true });
  await writeFile(path.join(uploadsDir, archivo), datos, { flag: "wx" });
  return { id, archivo, ancho, alto, bytes: datos.length };
}

export async function borrarArchivo(uploadsDir: string, archivo: string): Promise<void> {
  const destino = path.resolve(uploadsDir, archivo);
  if (!destino.startsWith(path.resolve(uploadsDir) + path.sep)) return;
  await rm(destino, { force: true });
}

export function urlImagen(archivo: string): string {
  return `/uploads/${archivo}`;
}
