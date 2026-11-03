import { crearPool } from "../db.js";
import { aplicarMigraciones } from "../migraciones.js";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL");
  process.exit(1);
}
const db = crearPool(url);
try {
  const nuevas = await aplicarMigraciones(db);
  console.log(nuevas.length ? `Migraciones aplicadas: ${nuevas.join(", ")}` : "La base ya estaba al día.");
} finally {
  await db.end();
}
