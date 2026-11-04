import { mkdtempSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import type { FastifyInstance, InjectOptions } from "fastify";
import sharp from "sharp";
import { construirApp } from "../src/app.js";
import type { Config } from "../src/config.js";
import { type Db, crearPool } from "../src/db.js";
import { GeocoderConCache, GeocoderFake } from "../src/geo/geocoder.js";
import { aplicarMigraciones } from "../src/migraciones.js";

export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgres://trabajamos:trabajamos@localhost:5432/trabajamos_test";

export interface Entorno {
  app: FastifyInstance;
  db: Db;
  config: Config;
}

export async function crearEntorno(): Promise<Entorno> {
  const db = crearPool(TEST_DATABASE_URL);
  await aplicarMigraciones(db);
  const config: Config = {
    host: "127.0.0.1",
    port: 0,
    databaseUrl: TEST_DATABASE_URL,
    sessionSecret: "x".repeat(32),
    publicBaseUrl: "http://localhost",
    uploadsDir: mkdtempSync(path.join(os.tmpdir(), "trabajamos-uploads-")),
    cookieSecure: false,
    geocoder: "fake",
    nominatimUrl: "",
    nominatimUserAgent: "",
    nominatimCountrycodes: "cl",
  };
  const app = await construirApp({ config, db, geocoder: new GeocoderConCache(db, new GeocoderFake()) });
  return { app, db, config };
}

export async function limpiar(db: Db): Promise<void> {
  await db.query("TRUNCATE usuarios, geocache CASCADE");
}

type Respuesta = Awaited<ReturnType<FastifyInstance["inject"]>>;

// Navegador mínimo: guarda cookies y lee el token CSRF de la última página.
export class Agente {
  cookies = new Map<string, string>();
  csrf = "";

  constructor(private readonly app: FastifyInstance) {}

  private guardarCookies(r: Respuesta): void {
    for (const c of r.cookies as { name: string; value: string; maxAge?: number; expires?: Date }[]) {
      const vencida = c.maxAge === 0 || (c.expires && c.expires.getTime() <= Date.now()) || c.value === "";
      if (vencida) this.cookies.delete(c.name);
      else this.cookies.set(c.name, c.value);
    }
    const m = /name="_csrf" value="([^"]+)"/u.exec(r.body);
    if (m?.[1]) this.csrf = m[1];
  }

  async pedir(opciones: InjectOptions): Promise<Respuesta> {
    const r = await this.app.inject({ ...opciones, cookies: Object.fromEntries(this.cookies) });
    this.guardarCookies(r);
    return r;
  }

  get(url: string): Promise<Respuesta> {
    return this.pedir({ method: "GET", url });
  }

  async seguir(r: Respuesta): Promise<Respuesta> {
    const destino = r.headers.location;
    return typeof destino === "string" ? this.get(destino) : r;
  }

  post(url: string, campos: Record<string, string>, { conCsrf = true } = {}): Promise<Respuesta> {
    const cuerpo = new URLSearchParams(conCsrf ? { _csrf: this.csrf, ...campos } : campos);
    return this.pedir({
      method: "POST",
      url,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      payload: cuerpo.toString(),
    });
  }

  postMultipart(url: string, partes: { nombre: string; valor: string | Buffer; archivo?: string; tipo?: string }[]) {
    const limite = "----trabajamos" + Math.random().toString(16).slice(2);
    const trozos: Buffer[] = [];
    for (const p of partes) {
      const disposicion = p.archivo
        ? `form-data; name="${p.nombre}"; filename="${p.archivo}"\r\nContent-Type: ${p.tipo ?? "application/octet-stream"}`
        : `form-data; name="${p.nombre}"`;
      trozos.push(Buffer.from(`--${limite}\r\nContent-Disposition: ${disposicion}\r\n\r\n`));
      trozos.push(Buffer.isBuffer(p.valor) ? p.valor : Buffer.from(p.valor));
      trozos.push(Buffer.from("\r\n"));
    }
    trozos.push(Buffer.from(`--${limite}--\r\n`));
    return this.pedir({
      method: "POST",
      url,
      headers: { "content-type": `multipart/form-data; boundary=${limite}` },
      payload: Buffer.concat(trozos),
    });
  }

  async crearCuenta(correo: string, contrasena = "contrasena-segura"): Promise<Respuesta> {
    await this.get("/panel/crear-cuenta.html");
    return this.post("/panel/crear-cuenta.html", { correo, contrasena, contrasena2: contrasena });
  }

  async crearPerfil(
    nombre: string,
    opciones: {
      telefono?: string;
      correo?: string;
      tipo?: string;
      titulo?: string;
      tag?: string;
      alt?: string;
      localidad?: string;
    } = {},
  ): Promise<Respuesta> {
    await this.get("/panel/perfil.html");
    const png = await sharp({
      create: { width: 8, height: 8, channels: 3, background: { r: 20, g: 40, b: 80 } },
    })
      .png()
      .toBuffer();
    const partes: { nombre: string; valor: string | Buffer; archivo?: string; tipo?: string }[] = [
      { nombre: "_csrf", valor: this.csrf },
      { nombre: "form", valor: "registro" },
      { nombre: "accion", valor: "publicar" },
      { nombre: "nombre", valor: nombre },
      { nombre: "telefono", valor: opciones.telefono ?? "+56 9 1234 5678" },
      { nombre: "correo_publico", valor: opciones.correo ?? "publico@ejemplo.cl" },
      { nombre: "tipo", valor: opciones.tipo ?? "oficio" },
      { nombre: "titulo", valor: opciones.titulo ?? "Trabajo de oficio" },
      { nombre: "tag", valor: opciones.tag ?? "oficio" },
      { nombre: "alt", valor: opciones.alt ?? "Foto de un trabajo realizado" },
      { nombre: "imagen", valor: png, archivo: "obra.png", tipo: "image/png" },
    ];
    if (opciones.localidad) partes.push({ nombre: "localidad_texto", valor: opciones.localidad });
    return this.postMultipart("/panel/perfil.html", partes);
  }
}

export function texto(htmlCrudo: string): string {
  return htmlCrudo
    .replace(/<script[\s\S]*?<\/script>/gu, "")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
    .replace(/&lt;/gu, "<")
    .replace(/&gt;/gu, ">")
    .replace(/\s+/gu, " ");
}
