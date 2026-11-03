import { mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fastifyCookie from "@fastify/cookie";
import fastifyFormbody from "@fastify/formbody";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import Fastify, { type FastifyInstance } from "fastify";
import { BYTES_MAXIMOS } from "./imagenes.js";
import { html } from "./lib/html.js";
import { type Contexto, enviarHtml } from "./rutas/comun.js";
import { registrarPanel } from "./rutas/panel.js";
import { registrarPublicas } from "./rutas/publicas.js";
import { cabeceraBanner, documento } from "./vistas/comun.js";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LEAFLET = path.join(path.dirname(createRequire(import.meta.url).resolve("leaflet/package.json")), "dist");

const CSP = [
  "default-src 'self'",
  "img-src 'self' data: https://tile.openstreetmap.org",
  "style-src 'self'",
  "script-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join("; ");

function paginaSimple(titulo: string, texto: string) {
  return documento({
    titulo: `${titulo} — trabajamos.com`,
    noindex: true,
    cabecera: cabeceraBanner({
      lema: titulo,
      meta: "SISTEMA",
      enlaces: [
        { href: "/panel/entrar.html", texto: "Crear perfil" },
        { href: "/index.html", texto: "Buscar oficios" },
      ],
    }),
    cuerpo: html`<main id="contenido">
  <h1>${titulo}</h1>
  <div role="alert"><p>${texto}</p></div>
  <p><a href="/index.html">Volver al inicio de trabajamos.com</a></p>
</main>`,
    pie: html`<footer></footer>`,
  });
}

export async function construirApp(ctx: Contexto, opciones: { logger?: boolean } = {}): Promise<FastifyInstance> {
  const app = Fastify({
    logger: opciones.logger ?? false,
    trustProxy: true,
    bodyLimit: 1024 * 1024,
  });

  await app.register(fastifyCookie);
  await app.register(fastifyFormbody);
  await app.register(fastifyMultipart, {
    limits: { fileSize: BYTES_MAXIMOS, files: 1, fields: 10, fieldSize: 10_000 },
  });

  app.addHook("onSend", async (_request, reply, payload) => {
    reply.header("x-content-type-options", "nosniff");
    reply.header("referrer-policy", "strict-origin-when-cross-origin");
    reply.header("x-frame-options", "DENY");
    reply.header("permissions-policy", "camera=(), microphone=()");
    reply.header("content-security-policy", CSP);
    return payload;
  });

  await app.register(fastifyStatic, {
    root: path.join(RAIZ, "public", "assets"),
    prefix: "/assets/",
    maxAge: "1h",
  });
  await app.register(fastifyStatic, {
    root: LEAFLET,
    prefix: "/vendor/leaflet/",
    decorateReply: false,
    maxAge: "7d",
  });
  mkdirSync(ctx.config.uploadsDir, { recursive: true });
  await app.register(fastifyStatic, {
    root: ctx.config.uploadsDir,
    prefix: "/uploads/",
    decorateReply: false,
    maxAge: "30d",
    immutable: true,
    index: false,
    list: false,
  });

  app.get("/health", async (_request, reply) => {
    try {
      await ctx.db.query("SELECT 1");
      return { ok: true };
    } catch {
      return reply.code(503).send({ ok: false });
    }
  });

  registrarPublicas(app, ctx);
  registrarPanel(app, ctx);

  app.setNotFoundHandler(async (_request, reply) =>
    enviarHtml(reply, paginaSimple("Página no encontrada", "No encontramos esta página."), 404),
  );

  app.setErrorHandler(async (error, request, reply) => {
    const codigo = (error as { statusCode?: number }).statusCode ?? 500;
    if (codigo >= 500) request.log.error({ err: error }, "error no controlado");
    if (request.url.startsWith("/api/") || request.url.startsWith("/panel/api/")) {
      return reply.code(codigo).send({ error: codigo >= 500 ? "interno" : "solicitud" });
    }
    const texto = request.url.startsWith("/panel")
      ? "No pudimos cargar tus datos. No se cambió nada."
      : "Algo falló de nuestro lado. Intenta de nuevo en unos minutos.";
    return enviarHtml(reply, paginaSimple(codigo >= 500 ? "Algo falló" : "Solicitud no válida", texto), codigo);
  });

  return app;
}
