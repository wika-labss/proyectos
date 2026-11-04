import { randomBytes, timingSafeEqual } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";

export const COOKIE_CSRF = "csrf";

// Doble envío: la cookie y el campo oculto _csrf deben coincidir.
export function tokenCsrf(request: FastifyRequest, reply: FastifyReply, secure: boolean): string {
  const existente = request.cookies[COOKIE_CSRF];
  if (existente && /^[A-Za-z0-9_-]{32,}$/u.test(existente)) return existente;
  const nuevo = randomBytes(24).toString("base64url");
  reply.setCookie(COOKIE_CSRF, nuevo, { path: "/", httpOnly: true, sameSite: "lax", secure });
  request.cookies[COOKIE_CSRF] = nuevo;
  return nuevo;
}

export function csrfValido(request: FastifyRequest, enviado: unknown): boolean {
  const cookie = request.cookies[COOKIE_CSRF];
  if (!cookie || typeof enviado !== "string" || cookie.length !== enviado.length) return false;
  return timingSafeEqual(Buffer.from(cookie), Buffer.from(enviado));
}
