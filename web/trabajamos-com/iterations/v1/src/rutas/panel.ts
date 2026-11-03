import type { MultipartFile } from "@fastify/multipart";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  LARGO_MINIMO_CONTRASENA,
  type Usuario,
  cerrarSesion,
  crearSesion,
  crearUsuario,
  usuarioDeSesion,
  verificarCredencial,
} from "../auth/cuentas.js";
import { csrfValido, tokenCsrf } from "../auth/csrf.js";
import {
  type Perfil,
  type RedAGuardar,
  actualizarPerfil,
  agregarImagen,
  agregarOferta,
  crearPerfil,
  guardarRedes,
  marcarPunto,
  perfilDeUsuario,
  quitarImagen,
  quitarOferta,
  quitarRed,
} from "../datos.js";
import { GeocoderNoDisponible, coordenadasValidas } from "../geo/geocoder.js";
import { NoEsImagen, borrarArchivo, guardarImagen, urlImagen } from "../imagenes.js";
import {
  type ContactoTipo,
  compactar,
  contactoDato,
  contactoValido,
  correoValido,
  esContactoTipo,
  esOfertaTipo,
  normalizarTag,
  urlHttpsValida,
  volverSeguro,
} from "../lib/reglas.js";
import type { ErrorCampo } from "../vistas/comun.js";
import {
  type EstadoLocalidad,
  type EstadoOfertas,
  type EstadoPerfilPanel,
  type EstadoPortafolio,
  type FilaRed,
  type FormDatos,
  type ResultadoLocalidad,
  valorResultado,
  vistaCrearCuenta,
  vistaEntrar,
  vistaLocalidad,
  vistaOfertas,
  vistaPerfilPanel,
  vistaPortafolio,
  vistaSesionTerminada,
  vistaSolicitudInvalida,
} from "../vistas/panel.js";
import { type Contexto, type Cuerpo, campo, cuerpo, enviarHtml, esUuid } from "./comun.js";

export const COOKIE_SESION = "sid";
const COOKIE_AVISO = "aviso";
const MAX_REDES = 20;
const MAX_OFERTAS = 50;
const MAX_IMAGENES = 30;
const LARGO_MAXIMO_CONTRASENA = 200;

declare module "fastify" {
  interface FastifyRequest {
    usuario: Usuario | null;
  }
}

interface Aviso {
  form: string;
  texto: string;
}

function rutaActual(request: FastifyRequest): string {
  return request.url.split("#")[0] ?? "/panel/perfil.html";
}

export function registrarPanel(app: FastifyInstance, ctx: Contexto): void {
  const { config, db } = ctx;
  const opcionesCookie = { path: "/", httpOnly: true, sameSite: "lax" as const, secure: config.cookieSecure };

  app.decorateRequest("usuario", null);

  app.addHook("onRequest", async (request, reply) => {
    if (request.url.startsWith("/panel")) reply.header("cache-control", "no-store");
  });

  function csrf(request: FastifyRequest, reply: FastifyReply): string {
    return tokenCsrf(request, reply, config.cookieSecure);
  }

  function avisar(reply: FastifyReply, aviso: Aviso): void {
    reply.setCookie(COOKIE_AVISO, JSON.stringify(aviso), { ...opcionesCookie, path: "/panel" });
  }

  function leerAviso(request: FastifyRequest, reply: FastifyReply, form: string): string {
    const crudo = request.cookies[COOKIE_AVISO];
    if (!crudo) return "";
    reply.clearCookie(COOKIE_AVISO, { path: "/panel" });
    try {
      const aviso = JSON.parse(crudo) as Partial<Aviso>;
      return aviso.form === form && typeof aviso.texto === "string" ? aviso.texto : "";
    } catch {
      return "";
    }
  }

  function redirigirAEntrar(request: FastifyRequest, reply: FastifyReply): FastifyReply {
    const motivo = request.cookies[COOKIE_SESION] ? "&motivo=sesion" : "";
    reply.clearCookie(COOKIE_SESION, { path: "/" });
    return reply.redirect(`/panel/entrar.html?volver=${encodeURIComponent(rutaActual(request))}${motivo}`, 303);
  }

  // Guardia de VIEW-11. En POST no redirige: avisa que nada se guardó.
  async function requiereSesion(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const token = request.cookies[COOKIE_SESION];
    const usuario = await usuarioDeSesion(db, token);
    if (!usuario) {
      if (request.method === "GET") {
        await redirigirAEntrar(request, reply);
        return;
      }
      reply.clearCookie(COOKIE_SESION, { path: "/" });
      await enviarHtml(reply, vistaSesionTerminada(rutaActual(request)), 401);
      return;
    }
    request.usuario = usuario;
    reply.setCookie(COOKIE_SESION, token!, { ...opcionesCookie, maxAge: 7 * 24 * 3600 });
  }

  async function requiereCsrf(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (request.isMultipart()) return;
    if (!csrfValido(request, campo(cuerpo(request), "_csrf"))) {
      await enviarHtml(reply, vistaSolicitudInvalida(), 403);
    }
  }

  const protegida = { preHandler: [requiereSesion] };
  const protegidaPost = { preHandler: [requiereSesion, requiereCsrf] };

  // VIEW-10
  app.get("/panel/entrar.html", async (request, reply) => {
    const query = request.query as Record<string, unknown>;
    const volver = volverSeguro(query.volver);
    if (await usuarioDeSesion(db, request.cookies[COOKIE_SESION])) {
      return reply.redirect(volver ?? "/panel/perfil.html", 303);
    }
    return enviarHtml(
      reply,
      vistaEntrar({
        csrf: csrf(request, reply),
        correo: "",
        volver,
        sesionTerminada: query.motivo === "sesion",
        error: null,
      }),
    );
  });

  app.post("/panel/entrar.html", { preHandler: [requiereCsrf] }, async (request, reply) => {
    const b = cuerpo(request);
    const volver = volverSeguro((request.query as Record<string, unknown>).volver);
    const correo = campo(b, "correo").trim().slice(0, 254);
    const contrasena = campo(b, "contrasena").slice(0, LARGO_MAXIMO_CONTRASENA);
    const rechazo = (error: string, codigo: number) =>
      enviarHtml(
        reply,
        vistaEntrar({ csrf: csrf(request, reply), correo, volver, sesionTerminada: false, error }),
        codigo,
      );
    if (!correo || !contrasena) return rechazo("No pudimos verificar tus datos. Revisa e intenta de nuevo.", 401);
    let resultado;
    try {
      resultado = await verificarCredencial(db, correo, contrasena);
    } catch (error) {
      request.log.error({ err: error }, "verificación de credencial fallida");
      return rechazo("No pudimos conectar con el servicio de acceso. Intenta en unos minutos.", 503);
    }
    if (resultado.tipo === "bloqueado") {
      return rechazo("Demasiados intentos. Espera 15 minutos e intenta de nuevo.", 429);
    }
    if (resultado.tipo === "rechazado") {
      return rechazo("No pudimos verificar tus datos. Revisa e intenta de nuevo.", 401);
    }
    const token = await crearSesion(db, resultado.usuario.id);
    reply.setCookie(COOKIE_SESION, token, { ...opcionesCookie, maxAge: 7 * 24 * 3600 });
    return reply.redirect(volver ?? "/panel/perfil.html", 303);
  });

  // VIEW-18
  app.get("/panel/crear-cuenta.html", async (request, reply) => {
    if (await usuarioDeSesion(db, request.cookies[COOKIE_SESION])) return reply.redirect("/panel/perfil.html", 303);
    return enviarHtml(reply, vistaCrearCuenta({ csrf: csrf(request, reply), correo: "", errores: [], duplicado: false }));
  });

  app.post("/panel/crear-cuenta.html", { preHandler: [requiereCsrf] }, async (request, reply) => {
    const b = cuerpo(request);
    const correo = campo(b, "correo").trim().slice(0, 254);
    const contrasena = campo(b, "contrasena");
    const contrasena2 = campo(b, "contrasena2");
    const errores: ErrorCampo[] = [];
    if (!correo) errores.push({ campo: "correo", texto: "Escribe tu correo" });
    else if (!correoValido(correo)) errores.push({ campo: "correo", texto: "El correo no es válido" });
    if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
      errores.push({ campo: "contrasena", texto: "La contraseña debe tener al menos 8 caracteres" });
    } else if (contrasena.length > LARGO_MAXIMO_CONTRASENA) {
      errores.push({ campo: "contrasena", texto: "La contraseña puede tener hasta 200 caracteres" });
    }
    if (contrasena !== contrasena2) errores.push({ campo: "contrasena2", texto: "Las contraseñas no coinciden" });
    const responder = (duplicado: boolean) =>
      enviarHtml(reply, vistaCrearCuenta({ csrf: csrf(request, reply), correo, errores, duplicado }), 422);
    if (errores.length) return responder(false);
    const usuario = await crearUsuario(db, correo, contrasena);
    if (usuario === "duplicado") return responder(true);
    const token = await crearSesion(db, usuario.id);
    reply.setCookie(COOKIE_SESION, token, { ...opcionesCookie, maxAge: 7 * 24 * 3600 });
    return reply.redirect("/panel/perfil.html", 303);
  });

  app.post("/panel/salir", { preHandler: [requiereCsrf] }, async (request, reply) => {
    await cerrarSesion(db, request.cookies[COOKIE_SESION]);
    reply.clearCookie(COOKIE_SESION, { path: "/" });
    return reply.redirect("/index.html", 303);
  });

  // VIEW-11 + VIEW-12 + VIEW-13 + VIEW-17
  function filasDe(perfil: Perfil | null): FilaRed[] {
    return (perfil?.redes ?? []).map((r) => ({ id: r.id, nombre: r.nombre, url: r.url }));
  }

  function estadoPerfil(request: FastifyRequest, reply: FastifyReply, perfil: Perfil | null): EstadoPerfilPanel {
    return {
      csrf: csrf(request, reply),
      perfil,
      datos: perfil
        ? { nombre: perfil.nombre, tipo: perfil.contacto.tipo, valor: perfil.contacto.valor }
        : { nombre: "", tipo: "", valor: "" },
      erroresDatos: [],
      vigenteNombre: null,
      vigenteContacto: null,
      estadoDatos: "",
      redes: filasDe(perfil),
      erroresRedes: [],
      estadoRedes: "",
    };
  }

  app.get("/panel/perfil.html", protegida, async (request, reply) => {
    const perfil = await perfilDeUsuario(db, request.usuario!.id);
    const e = estadoPerfil(request, reply, perfil);
    e.estadoDatos = leerAviso(request, reply, "datos");
    if (!e.estadoDatos) e.estadoRedes = leerAviso(request, reply, "redes");
    return enviarHtml(reply, vistaPerfilPanel(e));
  });

  app.post("/panel/perfil.html", protegidaPost, async (request, reply) => {
    const b = cuerpo(request);
    const perfil = await perfilDeUsuario(db, request.usuario!.id);
    if (campo(b, "form") === "redes") return guardarFormRedes(request, reply, b, perfil);
    return guardarFormDatos(request, reply, b, perfil);
  });

  function erroresContacto(tipo: ContactoTipo | "", valor: string): ErrorCampo[] {
    if (!tipo) {
      const errores: ErrorCampo[] = [{ campo: "contacto-tipo", texto: "Elige un medio de contacto" }];
      if (!valor) errores.push({ campo: "contacto-valor", texto: "Escribe tu teléfono, correo o enlace" });
      return errores;
    }
    if (!valor) {
      const que = tipo === "telefono" ? "tu teléfono" : tipo === "correo" ? "tu correo" : "tu enlace";
      return [{ campo: "contacto-valor", texto: `Escribe ${que}` }];
    }
    if (contactoValido(tipo, valor)) return [];
    const texto =
      tipo === "telefono"
        ? "El teléfono debe incluir el código de país, por ejemplo +56 9 1234 5678"
        : tipo === "correo"
          ? "El correo no es válido"
          : "El enlace debe empezar con https://";
    return [{ campo: "contacto-valor", texto }];
  }

  async function guardarFormDatos(request: FastifyRequest, reply: FastifyReply, b: Cuerpo, perfil: Perfil | null) {
    const tipoCrudo = campo(b, "contacto[tipo]");
    const datos: FormDatos = {
      nombre: compactar(campo(b, "nombre")),
      tipo: esContactoTipo(tipoCrudo) ? tipoCrudo : "",
      valor: campo(b, "contacto[valor]").trim().slice(0, 500),
    };
    const e = estadoPerfil(request, reply, perfil);
    e.datos = datos;
    const errorNombre = !datos.nombre
      ? perfil
        ? "Falta el nombre visible. No se guardó ningún cambio."
        : "Falta el nombre visible. Tu perfil no se publicó."
      : datos.nombre.length > 120
        ? "El nombre visible puede tener hasta 120 caracteres"
        : null;
    const errContacto = erroresContacto(datos.tipo, datos.valor);

    if (!perfil) {
      e.erroresDatos = [...(errorNombre ? [{ campo: "nombre", texto: errorNombre }] : []), ...errContacto];
      if (e.erroresDatos.length) {
        e.estadoDatos = "Tu perfil no se publicó.";
        return enviarHtml(reply, vistaPerfilPanel(e), 422);
      }
      await crearPerfil(db, request.usuario!.id, datos.nombre, datos.tipo as ContactoTipo, datos.valor);
      avisar(reply, { form: "datos", texto: "Perfil publicado" });
      return reply.redirect("/panel/perfil.html", 303);
    }

    if (errorNombre) {
      e.erroresDatos = [{ campo: "nombre", texto: errorNombre }];
      e.vigenteNombre = perfil.nombre;
      e.estadoDatos = "No se guardó ningún cambio.";
      return enviarHtml(reply, vistaPerfilPanel(e), 422);
    }
    if (errContacto.length) {
      // 02 7.2: el nombre se guarda y el contacto anterior sigue publicado.
      await actualizarPerfil(db, perfil.id, datos.nombre, null);
      const actualizado = await perfilDeUsuario(db, request.usuario!.id);
      const e2 = estadoPerfil(request, reply, actualizado);
      e2.datos = datos;
      e2.erroresDatos = errContacto;
      e2.vigenteContacto = contactoDato(perfil.contacto.tipo, perfil.contacto.valor);
      e2.estadoDatos = "Perfil guardado. El contacto no se guardó.";
      return enviarHtml(reply, vistaPerfilPanel(e2), 422);
    }
    await actualizarPerfil(db, perfil.id, datos.nombre, { tipo: datos.tipo as ContactoTipo, valor: datos.valor });
    avisar(reply, { form: "datos", texto: "Perfil guardado" });
    return reply.redirect("/panel/perfil.html", 303);
  }

  interface FilaEnviada {
    id: string | null;
    nombre: string;
    url: string;
  }

  function filasEnviadas(b: Cuerpo): FilaEnviada[] {
    const porIndice = new Map<number, FilaEnviada>();
    for (const [clave, valor] of Object.entries(b)) {
      const m = /^redes\[(\d{1,3})\]\[(id|nombre|url)\]$/u.exec(clave);
      if (!m || typeof valor !== "string") continue;
      const n = Number(m[1]);
      const fila = porIndice.get(n) ?? { id: null, nombre: "", url: "" };
      if (m[2] === "id") fila.id = esUuid(valor) ? valor : null;
      else if (m[2] === "nombre") fila.nombre = compactar(valor);
      else fila.url = valor.trim();
      porIndice.set(n, fila);
    }
    return [...porIndice.entries()].sort((a, b2) => a[0] - b2[0]).map(([, f]) => f);
  }

  async function guardarFormRedes(request: FastifyRequest, reply: FastifyReply, b: Cuerpo, perfil: Perfil | null) {
    if (!perfil) return reply.redirect("/panel/perfil.html", 303);
    const enviadas = filasEnviadas(b);
    const quitar = campo(b, "quitar");
    if (quitar) {
      const quitada = esUuid(quitar) ? await quitarRed(db, perfil.id, quitar) : null;
      const actualizado = await perfilDeUsuario(db, request.usuario!.id);
      const e = estadoPerfil(request, reply, actualizado);
      e.redes = enviadas.filter((f) => f.id !== quitar);
      e.estadoRedes = quitada ? `Se quitó la red ${quitada.nombre}.` : "Esa red ya no estaba publicada.";
      return enviarHtml(reply, vistaPerfilPanel(e));
    }

    const anteriores = new Map(perfil.redes.map((r) => [r.id, r]));
    const validas: RedAGuardar[] = [];
    const fallidas: (FilaEnviada & { error: NonNullable<FilaRed["error"]> })[] = [];
    for (const fila of enviadas) {
      if (fila.id && !anteriores.has(fila.id)) fila.id = null;
      if (!fila.nombre && !fila.url) continue;
      let error: FilaRed["error"];
      if (!fila.nombre) error = { campo: "nombre", texto: "Escribe el nombre de la red" };
      else if (fila.nombre.length > 60) error = { campo: "nombre", texto: "El nombre de la red puede tener hasta 60 caracteres" };
      else if (!fila.url) error = { campo: "url", texto: "Escribe la dirección de la red" };
      else if (!urlHttpsValida(fila.url)) error = { campo: "url", texto: "La dirección debe empezar con https://" };
      if (error) fallidas.push({ ...fila, error });
      else validas.push(fila);
    }
    const nuevas = validas.filter((v) => !v.id).length;
    if (perfil.redes.length + nuevas > MAX_REDES) {
      const e = estadoPerfil(request, reply, perfil);
      e.redes = enviadas;
      e.erroresRedes = [{ campo: "lista-redes", texto: `Puedes publicar hasta ${MAX_REDES} redes. No se guardó ningún cambio.` }];
      return enviarHtml(reply, vistaPerfilPanel(e), 422);
    }
    if (validas.length) await guardarRedes(db, perfil.id, validas);
    if (!fallidas.length) {
      avisar(reply, { form: "redes", texto: "Redes guardadas" });
      return reply.redirect("/panel/perfil.html#redes", 303);
    }

    const actualizado = await perfilDeUsuario(db, request.usuario!.id);
    const e = estadoPerfil(request, reply, actualizado);
    const filas: FilaRed[] = filasDe(actualizado);
    for (const f of fallidas) {
      const anterior = f.id ? anteriores.get(f.id) : undefined;
      const vigente = anterior ? `Sigue publicada: ${anterior.nombre} ${anterior.url}` : "Esta red no se publicó";
      const fila: FilaRed = { id: f.id, nombre: f.nombre, url: f.url, error: f.error, vigente };
      const i = f.id ? filas.findIndex((x) => x.id === f.id) : -1;
      if (i >= 0) filas[i] = fila;
      else filas.push(fila);
    }
    e.redes = filas;
    e.erroresRedes = filas.flatMap((f, n) =>
      f.error ? [{ campo: `red-${n}-${f.error.campo}`, texto: `Red ${n + 1}: ${f.error.texto}` }] : [],
    );
    const k = validas.length;
    e.estadoRedes = `Se guardaron ${k} ${k === 1 ? "red" : "redes"}. ${fallidas.length} no se ${fallidas.length === 1 ? "publicó" : "publicaron"}.`;
    return enviarHtml(reply, vistaPerfilPanel(e), 422);
  }

  // VIEW-14
  function estadoOfertas(request: FastifyRequest, reply: FastifyReply, perfil: Perfil | null): EstadoOfertas {
    return {
      csrf: csrf(request, reply),
      perfil,
      form: { tipo: "", titulo: "", tag: "" },
      vistaPrevia: "—",
      errores: [],
      estado: "",
    };
  }

  app.get("/panel/ofertas.html", protegida, async (request, reply) => {
    const perfil = await perfilDeUsuario(db, request.usuario!.id);
    const e = estadoOfertas(request, reply, perfil);
    e.estado = leerAviso(request, reply, "oferta");
    return enviarHtml(reply, vistaOfertas(e));
  });

  app.post("/panel/ofertas.html", protegidaPost, async (request, reply) => {
    const b = cuerpo(request);
    const perfil = await perfilDeUsuario(db, request.usuario!.id);
    if (!perfil) return enviarHtml(reply, vistaOfertas(estadoOfertas(request, reply, null)), 409);
    const quitar = campo(b, "quitar");
    if (quitar) {
      const quitada = esUuid(quitar) ? await quitarOferta(db, perfil.id, quitar) : null;
      avisar(reply, {
        form: "oferta",
        texto: quitada ? `Se quitó la oferta: ${quitada.titulo}.` : "Esa oferta ya no estaba publicada.",
      });
      return reply.redirect("/panel/ofertas.html", 303);
    }
    const form = { tipo: campo(b, "tipo"), titulo: compactar(campo(b, "titulo")), tag: campo(b, "tag").slice(0, 200) };
    const tag = normalizarTag(form.tag);
    const errores: ErrorCampo[] = [];
    if (!esOfertaTipo(form.tipo)) errores.push({ campo: "tipo", texto: "Elige el tipo de oferta" });
    if (!form.titulo) errores.push({ campo: "titulo", texto: "Escribe un título" });
    else if (form.titulo.length > 120) errores.push({ campo: "titulo", texto: "El título puede tener hasta 120 caracteres" });
    if (!tag) errores.push({ campo: "tag", texto: "Escribe la etiqueta de oficio" });
    else if (tag.length > 61) errores.push({ campo: "tag", texto: "La etiqueta puede tener hasta 60 caracteres" });
    if (!errores.length && perfil.ofertas.length >= MAX_OFERTAS) {
      errores.push({ campo: "titulo", texto: `Puedes publicar hasta ${MAX_OFERTAS} ofertas` });
    }
    if (errores.length) {
      const e = estadoOfertas(request, reply, perfil);
      e.form = form;
      e.vistaPrevia = tag ?? "—";
      e.errores = errores;
      e.estado = "La oferta no se guardó. Tus ofertas anteriores siguen publicadas.";
      return enviarHtml(reply, vistaOfertas(e), 422);
    }
    await agregarOferta(db, perfil.id, form.tipo as Parameters<typeof agregarOferta>[2], form.titulo, tag!);
    avisar(reply, { form: "oferta", texto: `Oferta agregada: ${form.titulo}, ${tag}` });
    return reply.redirect("/panel/ofertas.html", 303);
  });

  // VIEW-15
  function estadoPortafolio(request: FastifyRequest, reply: FastifyReply, perfil: Perfil | null): EstadoPortafolio {
    return { csrf: csrf(request, reply), perfil, alt: "", errores: [], estado: "", urlImagen };
  }

  app.get("/panel/portafolio.html", protegida, async (request, reply) => {
    const perfil = await perfilDeUsuario(db, request.usuario!.id);
    const e = estadoPortafolio(request, reply, perfil);
    e.estado = leerAviso(request, reply, "imagen");
    return enviarHtml(reply, vistaPortafolio(e));
  });

  app.post("/panel/portafolio.html", protegidaPost, async (request, reply) => {
    const perfil = await perfilDeUsuario(db, request.usuario!.id);
    if (!request.isMultipart()) {
      const quitar = campo(cuerpo(request), "quitar");
      if (!perfil) return reply.redirect("/panel/portafolio.html", 303);
      const quitada = esUuid(quitar) ? await quitarImagen(db, perfil.id, quitar) : null;
      if (quitada) await borrarArchivo(config.uploadsDir, quitada.archivo);
      avisar(reply, {
        form: "imagen",
        texto: quitada ? `Se quitó la imagen: ${quitada.alt}.` : "Esa imagen ya no estaba en tu portafolio.",
      });
      return reply.redirect("/panel/portafolio.html", 303);
    }

    const campos: Record<string, string> = {};
    let archivo: Buffer | null = null;
    let demasiadoGrande = false;
    try {
      for await (const parte of request.parts()) {
        if (parte.type === "file") {
          const f = parte as MultipartFile;
          if (f.fieldname !== "imagen" || archivo) {
            await f.toBuffer();
            continue;
          }
          const datos = await f.toBuffer();
          if (f.file.truncated) demasiadoGrande = true;
          else if (datos.length) archivo = datos;
        } else if (typeof parte.value === "string") {
          campos[parte.fieldname] = parte.value;
        }
      }
    } catch (error) {
      if ((error as { code?: string }).code === "FST_REQ_FILE_TOO_LARGE") demasiadoGrande = true;
      else throw error;
    }
    if (!csrfValido(request, campos._csrf)) return enviarHtml(reply, vistaSolicitudInvalida(), 403);
    if (!perfil) return enviarHtml(reply, vistaPortafolio(estadoPortafolio(request, reply, null)), 409);

    const alt = compactar(campos.alt ?? "");
    const errores: ErrorCampo[] = [];
    if (demasiadoGrande) {
      errores.push({ campo: "imagen", texto: "La imagen pesa más de 5 MB. La imagen no se guardó y tu portafolio no cambió." });
    } else if (!archivo) {
      errores.push({ campo: "imagen", texto: "Elige una imagen" });
    }
    if (!alt) errores.push({ campo: "alt", texto: "Escribe la descripción de la imagen. La imagen no se guardó." });
    else if (alt.length > 300) errores.push({ campo: "alt", texto: "La descripción puede tener hasta 300 caracteres" });
    if (!errores.length && perfil.imagenes.length >= MAX_IMAGENES) {
      errores.push({ campo: "imagen", texto: `Puedes tener hasta ${MAX_IMAGENES} imágenes en tu portafolio` });
    }

    let guardada: Awaited<ReturnType<typeof guardarImagen>> | null = null;
    if (!errores.length && archivo) {
      try {
        guardada = await guardarImagen(config.uploadsDir, perfil.id, archivo);
        await agregarImagen(db, perfil.id, { ...guardada, alt });
      } catch (error) {
        if (guardada) await borrarArchivo(config.uploadsDir, guardada.archivo);
        if (error instanceof NoEsImagen) {
          errores.push({ campo: "imagen", texto: "El archivo no es una imagen. La imagen no se guardó y tu portafolio no cambió." });
        } else {
          request.log.error({ err: error }, "carga de imagen fallida");
          errores.push({ campo: "imagen", texto: "La imagen no se guardó y tu portafolio no cambió. Intenta de nuevo." });
        }
      }
    }
    if (errores.length) {
      const e = estadoPortafolio(request, reply, perfil);
      e.alt = alt;
      e.errores = errores;
      e.estado = "La imagen no se guardó.";
      return enviarHtml(reply, vistaPortafolio(e), 422);
    }
    avisar(reply, { form: "imagen", texto: "Imagen agregada al portafolio." });
    return reply.redirect("/panel/portafolio.html", 303);
  });

  // VIEW-16
  function estadoLocalidad(request: FastifyRequest, reply: FastifyReply, perfil: Perfil | null): EstadoLocalidad {
    return {
      csrf: csrf(request, reply),
      perfil,
      texto: "",
      resultados: null,
      elegido: "",
      lat: "",
      lng: "",
      etiqueta: "",
      errores: [],
      estado: "",
    };
  }

  function leerResultado(valor: string): ResultadoLocalidad | null {
    const [lat, lng, ...resto] = valor.split("|");
    const r = { lat: Number(lat), lng: Number(lng), etiqueta: resto.join("|").trim() };
    return coordenadasValidas(r.lat, r.lng) && lat && lng ? r : null;
  }

  app.get("/panel/localidad.html", protegida, async (request, reply) => {
    const perfil = await perfilDeUsuario(db, request.usuario!.id);
    const e = estadoLocalidad(request, reply, perfil);
    e.estado = leerAviso(request, reply, "localidad");
    return enviarHtml(reply, vistaLocalidad(e));
  });

  app.post("/panel/localidad.html", protegidaPost, async (request, reply) => {
    const b = cuerpo(request);
    const perfil = await perfilDeUsuario(db, request.usuario!.id);
    const e = estadoLocalidad(request, reply, perfil);
    if (!perfil) return enviarHtml(reply, vistaLocalidad(e), 409);
    e.texto = compactar(campo(b, "localidad_texto")).slice(0, 160);
    e.elegido = campo(b, "resultado");
    e.lat = campo(b, "punto[lat]").trim();
    e.lng = campo(b, "punto[lng]").trim();
    e.etiqueta = compactar(campo(b, "punto[etiqueta]"));

    const buscarTexto = async (): Promise<boolean> => {
      try {
        e.resultados = await ctx.geocoder.buscar(e.texto);
        return true;
      } catch (error) {
        if (!(error instanceof GeocoderNoDisponible)) throw error;
        request.log.warn({ err: error }, "geocodificador no disponible");
        e.errores = [
          {
            campo: "localidad-texto",
            texto: "No pudimos buscar la localidad en este momento. Intenta en unos minutos o marca el punto en el mapa.",
          },
        ];
        return false;
      }
    };

    if (campo(b, "accion") === "buscar") {
      if (!e.texto) {
        e.errores = [{ campo: "localidad-texto", texto: "Escribe tu localidad para buscarla" }];
        return enviarHtml(reply, vistaLocalidad(e), 422);
      }
      if (!(await buscarTexto())) return enviarHtml(reply, vistaLocalidad(e), 503);
      if (!e.resultados?.length) {
        e.errores = [
          {
            campo: "localidad-texto",
            texto: "No encontramos esa localidad. No se marcó ningún punto. Prueba con la comuna o una calle cercana.",
          },
        ];
        return enviarHtml(reply, vistaLocalidad(e), 422);
      }
      const unico = e.resultados.length === 1 ? e.resultados[0] : undefined;
      if (unico) {
        e.elegido = valorResultado(unico);
        e.lat = String(unico.lat);
        e.lng = String(unico.lng);
        e.etiqueta = unico.etiqueta;
      }
      const n = e.resultados.length;
      e.estado = n === 1 ? "1 resultado. Revisa el nombre y marca tu localidad." : `${n} resultados. Elige el correcto.`;
      return enviarHtml(reply, vistaLocalidad(e));
    }

    // Sin JavaScript los campos ocultos llegan vacíos: el radio elegido trae el punto y su nombre.
    const elegido = leerResultado(e.elegido);
    let lat = Number(e.lat);
    let lng = Number(e.lng);
    if (!e.lat || !e.lng || !coordenadasValidas(lat, lng)) {
      if (elegido) {
        lat = elegido.lat;
        lng = elegido.lng;
        e.lat = String(lat);
        e.lng = String(lng);
      } else {
        lat = Number.NaN;
      }
    }
    if (!e.etiqueta && elegido && elegido.lat === lat && elegido.lng === lng) e.etiqueta = elegido.etiqueta;

    const errores: ErrorCampo[] = [];
    if (!coordenadasValidas(lat, lng)) {
      e.lat = "";
      e.lng = "";
      errores.push({ campo: "localidad-texto", texto: "Elige tu localidad en el mapa o escríbela." });
    } else if (!e.etiqueta) {
      errores.push({ campo: "punto-etiqueta", texto: "Escribe el nombre de la localidad. La localidad no se guardó." });
    } else if (e.etiqueta.length > 160) {
      errores.push({ campo: "punto-etiqueta", texto: "El nombre de la localidad puede tener hasta 160 caracteres" });
    }
    if (errores.length) {
      if (e.texto) await buscarTexto();
      e.errores = errores;
      e.estado = perfil.punto
        ? `La localidad no se guardó. Sigue publicada: ${perfil.punto.etiqueta}`
        : "Sigues sin localidad confirmada.";
      return enviarHtml(reply, vistaLocalidad(e), 422);
    }
    await marcarPunto(db, perfil.id, { lat, lng, etiqueta: e.etiqueta });
    avisar(reply, {
      form: "localidad",
      texto: `Localidad marcada: ${e.etiqueta}. Tus ofertas ya pueden aparecer como oficios cercanos.`,
    });
    return reply.redirect("/panel/localidad.html", 303);
  });

  // Apoyo de localidad.js. Solo con sesión: el geocodificador público tiene cuota limitada.
  async function sesionApi(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const usuario = await usuarioDeSesion(db, request.cookies[COOKIE_SESION]);
    if (!usuario) {
      await reply.code(401).send({ error: "sesion" });
      return;
    }
    request.usuario = usuario;
  }

  app.get("/panel/api/geo/buscar", { preHandler: [sesionApi] }, async (request, reply) => {
    const texto = compactar(campo(request.query as Record<string, unknown>, "q")).slice(0, 160);
    if (!texto) return reply.code(400).send({ error: "vacio" });
    try {
      return { resultados: await ctx.geocoder.buscar(texto) };
    } catch (error) {
      if (error instanceof GeocoderNoDisponible) return reply.code(503).send({ error: "geocoder" });
      throw error;
    }
  });

  app.get("/panel/api/geo/inversa", { preHandler: [sesionApi] }, async (request, reply) => {
    const q = request.query as Record<string, unknown>;
    const lat = Number(campo(q, "lat"));
    const lng = Number(campo(q, "lng"));
    if (!coordenadasValidas(lat, lng)) return reply.code(400).send({ error: "coordenadas" });
    try {
      return { etiqueta: await ctx.geocoder.inversa(lat, lng) };
    } catch (error) {
      if (error instanceof GeocoderNoDisponible) return reply.code(503).send({ error: "geocoder" });
      throw error;
    }
  });

  app.get("/panel", async (_request, reply) => reply.redirect("/panel/perfil.html", 303));
  app.get("/panel/", async (_request, reply) => reply.redirect("/panel/perfil.html", 303));
}
