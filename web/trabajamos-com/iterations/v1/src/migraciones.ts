import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Db } from "./db.js";
import { enTransaccion } from "./db.js";

export const DIRECTORIO_MIGRACIONES = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "migrations",
);

export async function aplicarMigraciones(db: Db, directorio = DIRECTORIO_MIGRACIONES): Promise<string[]> {
  await db.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY, aplicada_en timestamptz NOT NULL DEFAULT now())",
  );
  const { rows } = await db.query<{ version: string }>("SELECT version FROM schema_migrations");
  const aplicadas = new Set(rows.map((r) => r.version));
  const archivos = (await readdir(directorio)).filter((f) => f.endsWith(".sql")).sort();
  const nuevas: string[] = [];
  for (const archivo of archivos) {
    if (aplicadas.has(archivo)) continue;
    const sql = await readFile(path.join(directorio, archivo), "utf8");
    await enTransaccion(db, async (cliente) => {
      await cliente.query(sql);
      await cliente.query("INSERT INTO schema_migrations (version) VALUES ($1)", [archivo]);
    });
    nuevas.push(archivo);
  }
  return nuevas;
}
