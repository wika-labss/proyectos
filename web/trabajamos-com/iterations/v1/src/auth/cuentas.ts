import { createHash, randomBytes } from "node:crypto";
import argon2 from "argon2";
import type { Db } from "../db.js";

export const MAX_INTENTOS = 5;
export const MINUTOS_BLOQUEO = 15;
export const DIAS_SESION = 7;
export const LARGO_MINIMO_CONTRASENA = 8;

export interface Usuario {
  id: string;
  correo: string;
}

export async function hashContrasena(contrasena: string): Promise<string> {
  return argon2.hash(contrasena, { type: argon2.argon2id });
}

export async function crearUsuario(db: Db, correo: string, contrasena: string): Promise<Usuario | "duplicado"> {
  const hash = await hashContrasena(contrasena);
  const { rows } = await db.query<Usuario>(
    `INSERT INTO usuarios (correo, password_hash) VALUES ($1, $2)
     ON CONFLICT (correo) DO NOTHING
     RETURNING id, correo::text AS correo`,
    [correo, hash],
  );
  return rows[0] ?? "duplicado";
}

export type ResultadoIngreso = { tipo: "ok"; usuario: Usuario } | { tipo: "rechazado" } | { tipo: "bloqueado" };

export async function verificarCredencial(db: Db, correo: string, contrasena: string): Promise<ResultadoIngreso> {
  const { rows } = await db.query<{
    id: string;
    correo: string;
    password_hash: string;
    bloqueado: boolean;
  }>(
    `SELECT id, correo::text AS correo, password_hash,
            (bloqueado_hasta IS NOT NULL AND bloqueado_hasta > now()) AS bloqueado
     FROM usuarios WHERE correo = $1`,
    [correo],
  );
  const fila = rows[0];
  if (!fila) {
    // Mismo costo que una verificación real para no revelar si el correo existe.
    await argon2.hash(contrasena, { type: argon2.argon2id });
    return { tipo: "rechazado" };
  }
  if (fila.bloqueado) return { tipo: "bloqueado" };
  const valida = await argon2.verify(fila.password_hash, contrasena);
  if (!valida) {
    const { rows: actualizada } = await db.query<{ bloqueado: boolean }>(
      `UPDATE usuarios
       SET intentos_fallidos = CASE WHEN intentos_fallidos + 1 >= $2 THEN 0 ELSE intentos_fallidos + 1 END,
           bloqueado_hasta = CASE WHEN intentos_fallidos + 1 >= $2 THEN now() + make_interval(mins => $3) ELSE bloqueado_hasta END
       WHERE id = $1
       RETURNING (bloqueado_hasta IS NOT NULL AND bloqueado_hasta > now()) AS bloqueado`,
      [fila.id, MAX_INTENTOS, MINUTOS_BLOQUEO],
    );
    return actualizada[0]?.bloqueado ? { tipo: "bloqueado" } : { tipo: "rechazado" };
  }
  await db.query(
    "UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_acceso_en = now() WHERE id = $1",
    [fila.id],
  );
  return { tipo: "ok", usuario: { id: fila.id, correo: fila.correo } };
}

export async function restablecerContrasena(db: Db, correo: string, contrasena: string): Promise<boolean> {
  const hash = await hashContrasena(contrasena);
  const { rowCount } = await db.query(
    "UPDATE usuarios SET password_hash = $2, intentos_fallidos = 0, bloqueado_hasta = NULL WHERE correo = $1",
    [correo, hash],
  );
  if (!rowCount) return false;
  await db.query("DELETE FROM sesiones WHERE usuario_id = (SELECT id FROM usuarios WHERE correo = $1)", [correo]);
  return true;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function crearSesion(db: Db, usuarioId: string): Promise<string> {
  const token = randomBytes(32).toString("base64url");
  await db.query("DELETE FROM sesiones WHERE usuario_id = $1 AND expira_en < now()", [usuarioId]);
  await db.query(
    "INSERT INTO sesiones (token_hash, usuario_id, expira_en) VALUES ($1, $2, now() + make_interval(days => $3))",
    [hashToken(token), usuarioId, DIAS_SESION],
  );
  return token;
}

export async function usuarioDeSesion(db: Db, token: string | undefined): Promise<Usuario | null> {
  if (!token) return null;
  const { rows } = await db.query<Usuario>(
    `UPDATE sesiones s SET expira_en = now() + make_interval(days => $2)
     FROM usuarios u
     WHERE s.token_hash = $1 AND s.expira_en > now() AND u.id = s.usuario_id
     RETURNING u.id, u.correo::text AS correo`,
    [hashToken(token), DIAS_SESION],
  );
  return rows[0] ?? null;
}

export async function cerrarSesion(db: Db, token: string | undefined): Promise<void> {
  if (!token) return;
  await db.query("DELETE FROM sesiones WHERE token_hash = $1", [hashToken(token)]);
}
