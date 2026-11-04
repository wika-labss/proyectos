import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { type ConsultaBusqueda, resolverBusqueda } from "../busqueda.js";
import { perfilPorSlug } from "../datos.js";
import { urlImagen } from "../imagenes.js";
import {
  type EstadoBusqueda,
  seccionResultados,
  textoEstado,
  textoUbicacion,
  tituloInicio,
  vistaInicio,
  vistaPerfil,
  vistaPerfilNoDisponible,
  vistaPublicate,
} from "../vistas/publico.js";
import { type Contexto, campo, enviarHtml } from "./comun.js";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/u;

function numero(valor: unknown): number | null {
  if (typeof valor === "number") return Number.isFinite(valor) ? valor : null;
  if (typeof valor !== "string" || !valor.trim()) return null;
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

export function registrarPublicas(app: FastifyInstance, ctx: Contexto): void {
  async function buscar(request: FastifyRequest, consulta: ConsultaBusqueda): Promise<EstadoBusqueda> {
    try {
      return await resolverBusqueda(ctx.db, ctx.geocoder, consulta);
    } catch (error) {
      request.log.error({ err: error }, "búsqueda fallida");
      return {
        tipo: "error_servicio",
        q: consulta.q ?? "",
        localidad: consulta.localidad,
        tag: null,
        origen: null,
        origenTexto: null,
        resultados: [],
      };
    }
  }

  // Sin JavaScript solo hay origen por localidad escrita: las coordenadas nunca van en la URL.
  const inicio = async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as Record<string, unknown>;
    const q = typeof query.q === "string" ? query.q : null;
    const estado = await buscar(request, { q, localidad: campo(query, "localidad") });
    return enviarHtml(reply, vistaInicio(estado));
  };
  app.get("/", inicio);
  app.get("/index.html", inicio);

  app.get("/publicate-ahora.html", async (_request, reply) => enviarHtml(reply, vistaPublicate()));

  app.post("/api/buscar", async (request, reply) => {
    const b = (request.body && typeof request.body === "object" ? request.body : {}) as Record<string, unknown>;
    const estado = await buscar(request, {
      q: typeof b.q === "string" ? b.q : "",
      localidad: typeof b.localidad === "string" ? b.localidad : "",
      lat: numero(b.lat),
      lng: numero(b.lng),
    });
    return reply.header("cache-control", "no-store").send({
      tipo: estado.tipo,
      tag: estado.tag,
      estado: textoEstado(estado),
      ubicacion: textoUbicacion(estado),
      titulo: tituloInicio(estado),
      resultadosHtml: seccionResultados(estado).valor,
    });
  });

  app.get("/perfil.html", async (request, reply) => {
    const slug = campo(request.query as Record<string, unknown>, "slug");
    const perfil = SLUG.test(slug) ? await perfilPorSlug(ctx.db, slug) : null;
    if (!perfil) return enviarHtml(reply, vistaPerfilNoDisponible(), 404);
    return enviarHtml(reply, vistaPerfil(perfil, urlImagen));
  });
}
