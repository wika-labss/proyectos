import type { FastifyReply, FastifyRequest } from "fastify";
import type { Config } from "../config.js";
import type { Db } from "../db.js";
import type { Geocoder } from "../geo/geocoder.js";
import type { Html } from "../lib/html.js";

export interface Contexto {
  config: Config;
  db: Db;
  geocoder: Geocoder;
}

export type Cuerpo = Record<string, string | string[] | undefined>;

export function cuerpo(request: FastifyRequest): Cuerpo {
  const b = request.body;
  return b && typeof b === "object" ? (b as Cuerpo) : {};
}

export function campo(origen: Cuerpo | Record<string, unknown>, nombre: string): string {
  const valor = origen[nombre];
  if (typeof valor === "string") return valor;
  if (Array.isArray(valor) && typeof valor[0] === "string") return valor[0];
  return "";
}

export function enviarHtml(reply: FastifyReply, vista: Html, codigo = 200): FastifyReply {
  return reply.code(codigo).type("text/html; charset=utf-8").send(vista.valor);
}

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;

export function esUuid(valor: string): boolean {
  return UUID.test(valor);
}
