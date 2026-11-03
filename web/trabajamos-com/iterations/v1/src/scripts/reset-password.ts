import { LARGO_MINIMO_CONTRASENA, restablecerContrasena } from "../auth/cuentas.js";
import { crearPool } from "../db.js";

// Uso: NUEVA_CONTRASENA=... npm run admin:reset-password -- correo@dominio.cl
// La contraseña va por variable de entorno para que no quede en el historial de la terminal.
const url = process.env.DATABASE_URL;
const correo = process.argv[2];
const contrasena = process.env.NUEVA_CONTRASENA ?? "";
if (!url || !correo) {
  console.error("Uso: NUEVA_CONTRASENA=... npm run admin:reset-password -- correo@dominio.cl (requiere DATABASE_URL)");
  process.exit(1);
}
if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
  console.error(`NUEVA_CONTRASENA debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres`);
  process.exit(1);
}
const db = crearPool(url);
try {
  const ok = await restablecerContrasena(db, correo, contrasena);
  console.log(ok ? `Contraseña restablecida y sesiones cerradas para ${correo}.` : `No existe una cuenta con ${correo}.`);
  process.exitCode = ok ? 0 : 2;
} finally {
  await db.end();
}
