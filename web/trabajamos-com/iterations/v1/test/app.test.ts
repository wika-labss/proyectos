import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { Agente, type Entorno, crearEntorno, limpiar, texto } from "./ayuda.js";

let e: Entorno;

beforeAll(async () => {
  e = await crearEntorno();
});

afterAll(async () => {
  await e.app.close();
  await e.db.end();
});

beforeEach(async () => {
  await limpiar(e.db);
});

async function emprendedor(correo: string, nombre: string, punto?: string): Promise<Agente> {
  const a = new Agente(e.app);
  await a.crearCuenta(correo);
  await a.crearPerfil(nombre);
  if (punto) {
    await a.get("/panel/localidad.html");
    const r = await a.post("/panel/localidad.html", { accion: "buscar", localidad_texto: punto });
    const valor = /name="resultado" value="([^"]+)"/u.exec(r.body)?.[1];
    if (!valor) throw new Error(`Sin resultado fake para ${punto}`);
    await a.post("/panel/localidad.html", { accion: "marcar", resultado: valor.replace(/&#39;/gu, "'") });
  }
  return a;
}

async function oferta(a: Agente, titulo: string, tag: string, tipo = "oficio") {
  await a.get("/panel/ofertas.html");
  return a.post("/panel/ofertas.html", { tipo, titulo, tag });
}

describe("infraestructura", () => {
  it("responde /health y cabeceras de seguridad", async () => {
    const r = await e.app.inject({ method: "GET", url: "/health" });
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual({ ok: true });
    expect(r.headers["x-content-type-options"]).toBe("nosniff");
    expect(String(r.headers["content-security-policy"])).toContain("frame-ancestors 'none'");
  });

  it("sirve los recursos estáticos y Leaflet", async () => {
    expect((await e.app.inject({ method: "GET", url: "/assets/app.css" })).statusCode).toBe(200);
    expect((await e.app.inject({ method: "GET", url: "/vendor/leaflet/leaflet.js" })).statusCode).toBe(200);
  });

  it("404 con página propia", async () => {
    const r = await e.app.inject({ method: "GET", url: "/no-existe" });
    expect(r.statusCode).toBe(404);
    expect(r.body).toContain("Página no encontrada");
  });
});

describe("cuentas y sesión (VIEW-10, VIEW-18)", () => {
  it("valida el registro sin crear nada", async () => {
    const a = new Agente(e.app);
    await a.get("/panel/crear-cuenta.html");
    let r = await a.post("/panel/crear-cuenta.html", { correo: "", contrasena: "corta", contrasena2: "otra" });
    expect(r.statusCode).toBe(422);
    expect(r.body).toContain("Escribe tu correo");
    expect(r.body).toContain("La contraseña debe tener al menos 8 caracteres");
    expect(r.body).toContain("Las contraseñas no coinciden");
    expect(r.body).toContain("<title>Error: Crear cuenta — Panel — trabajamos.com</title>");
    r = await a.post("/panel/crear-cuenta.html", { correo: "no-es-correo", contrasena: "12345678", contrasena2: "12345678" });
    expect(r.body).toContain("El correo no es válido");
    const { rows } = await e.db.query("SELECT count(*)::int AS n FROM usuarios");
    expect(rows[0].n).toBe(0);
  });

  it("crea la cuenta, inicia sesión y guarda la contraseña con argon2id", async () => {
    const a = new Agente(e.app);
    const r = await a.crearCuenta("Juan@Ejemplo.cl");
    expect(r.statusCode).toBe(303);
    expect(r.headers.location).toBe("/panel/perfil.html");
    expect(a.cookies.has("sid")).toBe(true);
    const perfil = await a.get("/panel/perfil.html");
    expect(perfil.statusCode).toBe(200);
    expect(perfil.body).toContain("<h1>Crear perfil</h1>");
    const { rows } = await e.db.query("SELECT password_hash FROM usuarios");
    expect(rows[0].password_hash).toMatch(/^\$argon2id\$/u);
    const { rows: sesiones } = await e.db.query("SELECT token_hash FROM sesiones");
    expect(sesiones[0].token_hash).not.toBe(a.cookies.get("sid"));
  });

  it("rechaza un correo ya registrado sin importar mayúsculas", async () => {
    await new Agente(e.app).crearCuenta("ana@ejemplo.cl");
    const r = await new Agente(e.app).crearCuenta("ANA@ejemplo.cl");
    expect(r.statusCode).toBe(422);
    expect(r.body).toContain("Ya existe una cuenta con ese correo.");
  });

  it("guardia: sin sesión redirige a entrar con volver y vuelve tras entrar", async () => {
    await new Agente(e.app).crearCuenta("luis@ejemplo.cl");
    const a = new Agente(e.app);
    const r = await a.get("/panel/ofertas.html");
    expect(r.statusCode).toBe(303);
    expect(r.headers.location).toBe("/panel/entrar.html?volver=%2Fpanel%2Fofertas.html");
    await a.seguir(r);
    const entrar = await a.post("/panel/entrar.html?volver=%2Fpanel%2Fofertas.html", {
      correo: "luis@ejemplo.cl",
      contrasena: "contrasena-segura",
    });
    expect(entrar.statusCode).toBe(303);
    expect(entrar.headers.location).toBe("/panel/ofertas.html");
  });

  it("no permite redirecciones abiertas con volver", async () => {
    await new Agente(e.app).crearCuenta("luis@ejemplo.cl");
    const a = new Agente(e.app);
    await a.get("/panel/entrar.html");
    const r = await a.post("/panel/entrar.html?volver=https%3A%2F%2Fmalo.example", {
      correo: "luis@ejemplo.cl",
      contrasena: "contrasena-segura",
    });
    expect(r.headers.location).toBe("/panel/perfil.html");
  });

  it("mensaje genérico y bloqueo tras 5 intentos fallidos", async () => {
    await new Agente(e.app).crearCuenta("rosa@ejemplo.cl");
    const a = new Agente(e.app);
    await a.get("/panel/entrar.html");
    for (let i = 0; i < 4; i++) {
      const r = await a.post("/panel/entrar.html", { correo: "rosa@ejemplo.cl", contrasena: "mala-contrasena" });
      expect(r.statusCode).toBe(401);
      expect(r.body).toContain("No pudimos verificar tus datos. Revisa e intenta de nuevo.");
    }
    const quinto = await a.post("/panel/entrar.html", { correo: "rosa@ejemplo.cl", contrasena: "mala-contrasena" });
    expect(quinto.statusCode).toBe(429);
    expect(quinto.body).toContain("Demasiados intentos. Espera 15 minutos e intenta de nuevo.");
    const correcta = await a.post("/panel/entrar.html", { correo: "rosa@ejemplo.cl", contrasena: "contrasena-segura" });
    expect(correcta.statusCode).toBe(429);
    const inexistente = await a.post("/panel/entrar.html", { correo: "nadie@ejemplo.cl", contrasena: "x".repeat(10) });
    expect(inexistente.statusCode).toBe(401);
  });

  it("CSRF: un POST sin token no cambia nada", async () => {
    const a = new Agente(e.app);
    await a.crearCuenta("csrf@ejemplo.cl");
    const r = await a.post(
      "/panel/perfil.html",
      { form: "datos", nombre: "Ataque", "contacto[tipo]": "telefono", "contacto[valor]": "+56912345678" },
      { conCsrf: false },
    );
    expect(r.statusCode).toBe(403);
    const { rows } = await e.db.query("SELECT count(*)::int AS n FROM perfiles");
    expect(rows[0].n).toBe(0);
  });

  it("salir cierra la sesión y un POST posterior avisa que nada se guardó", async () => {
    const a = new Agente(e.app);
    await a.crearCuenta("sale@ejemplo.cl");
    const sid = a.cookies.get("sid")!;
    await a.get("/panel/perfil.html");
    const salir = await a.post("/panel/salir", {});
    expect(salir.statusCode).toBe(303);
    expect(a.cookies.has("sid")).toBe(false);
    a.cookies.set("sid", sid);
    const r = await a.post("/panel/perfil.html", {
      form: "datos",
      nombre: "Tarde",
      "contacto[tipo]": "telefono",
      "contacto[valor]": "+56912345678",
    });
    expect(r.statusCode).toBe(401);
    expect(r.body).toContain("Tu sesión terminó. No se guardó ningún cambio.");
  });
});

describe("perfil y contacto (VIEW-12, VIEW-13, VIEW-17)", () => {
  it("primer guardado exige nombre y contacto válido (D-01)", async () => {
    const a = new Agente(e.app);
    await a.crearCuenta("nuevo@ejemplo.cl");
    await a.get("/panel/perfil.html");
    const r = await a.post("/panel/perfil.html", { form: "datos", nombre: " ", "contacto[valor]": "" });
    expect(r.statusCode).toBe(422);
    expect(r.body).toContain("Falta el nombre visible. Tu perfil no se publicó.");
    expect(r.body).toContain("Elige un medio de contacto");
    expect(r.body).toContain("Tu perfil no se publicó.");
    const r2 = await a.post("/panel/perfil.html", {
      form: "datos",
      nombre: "Juan",
      "contacto[tipo]": "url",
      "contacto[valor]": "http://inseguro.cl",
    });
    expect(r2.body).toContain("El enlace debe empezar con https://");
    const { rows } = await e.db.query("SELECT count(*)::int AS n FROM perfiles");
    expect(rows[0].n).toBe(0);
  });

  it("publica el perfil y lo muestra con Contactar y el dato (D-03)", async () => {
    const a = new Agente(e.app);
    await a.crearCuenta("juan@ejemplo.cl");
    const r = await a.crearPerfil("Juan Pérez", "telefono", "+56 9 1234 5678");
    expect(r.statusCode).toBe(303);
    const panel = await a.seguir(r);
    expect(panel.body).toContain("Perfil publicado");
    expect(panel.body).toContain("Ver mi perfil público");
    const pub = await e.app.inject({ method: "GET", url: "/perfil.html?slug=juan-perez" });
    expect(pub.statusCode).toBe(200);
    expect(pub.body).toContain('href="tel:+56912345678"');
    expect(pub.body).toContain("Teléfono: +56 9 1234 5678");
    expect(pub.body).toContain("Este perfil aún no marca su localidad.");
  });

  it("slug único aunque se repita el nombre", async () => {
    await emprendedor("a@ejemplo.cl", "Gasfitería Central");
    await emprendedor("b@ejemplo.cl", "Gasfitería Central");
    const { rows } = await e.db.query("SELECT slug FROM perfiles ORDER BY creado_en");
    expect(rows.map((x) => x.slug)).toEqual(["gasfiteria-central", "gasfiteria-central-2"]);
  });

  it("edición sin nombre no guarda nada y muestra lo publicado", async () => {
    const a = await emprendedor("e@ejemplo.cl", "Nombre Viejo");
    const r = await a.post("/panel/perfil.html", {
      form: "datos",
      nombre: "",
      "contacto[tipo]": "correo",
      "contacto[valor]": "nuevo@ejemplo.cl",
    });
    expect(r.statusCode).toBe(422);
    expect(r.body).toContain("Falta el nombre visible. No se guardó ningún cambio.");
    expect(r.body).toContain("Sigue publicado: Nombre Viejo");
    const { rows } = await e.db.query("SELECT nombre, contacto_tipo FROM perfiles");
    expect(rows[0]).toEqual({ nombre: "Nombre Viejo", contacto_tipo: "telefono" });
  });

  it("contacto inválido en edición: guarda el nombre y conserva el contacto (02 7.2)", async () => {
    const a = await emprendedor("e@ejemplo.cl", "Nombre Viejo");
    const r = await a.post("/panel/perfil.html", {
      form: "datos",
      nombre: "Nombre Nuevo",
      "contacto[tipo]": "correo",
      "contacto[valor]": "sin-arroba",
    });
    expect(r.statusCode).toBe(422);
    expect(r.body).toContain("Perfil guardado. El contacto no se guardó.");
    expect(r.body).toContain("Sigue publicado: Teléfono: +56 9 1234 5678");
    const { rows } = await e.db.query("SELECT nombre, contacto_tipo, contacto_valor FROM perfiles");
    expect(rows[0]).toEqual({ nombre: "Nombre Nuevo", contacto_tipo: "telefono", contacto_valor: "+56 9 1234 5678" });
  });

  it("redes: guarda las válidas, informa las que fallan y quita por id (D-09)", async () => {
    const a = await emprendedor("r@ejemplo.cl", "Con Redes");
    const r = await a.post("/panel/perfil.html", {
      form: "redes",
      "redes[0][nombre]": "Instagram",
      "redes[0][url]": "https://instagram.com/conredes",
      "redes[1][nombre]": "Facebook",
      "redes[1][url]": "facebook.com/conredes",
      "redes[2][nombre]": "",
      "redes[2][url]": "",
    });
    expect(r.statusCode).toBe(422);
    expect(r.body).toContain("Se guardaron 1 red. 1 no se publicó.");
    expect(r.body).toContain("La dirección debe empezar con https://");
    expect(r.body).toContain("Esta red no se publicó");
    const { rows } = await e.db.query<{ id: string; nombre: string }>("SELECT id, nombre FROM redes");
    expect(rows.map((x) => x.nombre)).toEqual(["Instagram"]);

    const pub = await e.app.inject({ method: "GET", url: "/perfil.html?slug=con-redes" });
    expect(pub.body).toContain('<a href="https://instagram.com/conredes" rel="nofollow ugc">Instagram</a>');

    const q = await a.post("/panel/perfil.html", { form: "redes", quitar: rows[0]!.id });
    expect(q.statusCode).toBe(200);
    expect(q.body).toContain("Se quitó la red Instagram.");
    const { rows: despues } = await e.db.query("SELECT count(*)::int AS n FROM redes");
    expect(despues[0].n).toBe(0);
  });

  it("escapa el contenido del emprendedor en el perfil público", async () => {
    await emprendedor("x@ejemplo.cl", '<script>alert("x")</script> Maestro');
    const { rows } = await e.db.query("SELECT slug FROM perfiles");
    const pub = await e.app.inject({ method: "GET", url: `/perfil.html?slug=${rows[0].slug}` });
    expect(pub.body).not.toContain("<script>alert");
    expect(pub.body).toContain("&lt;script&gt;");
  });

  it("perfil inexistente: 404 y noindex", async () => {
    const r = await e.app.inject({ method: "GET", url: "/perfil.html?slug=no-existe" });
    expect(r.statusCode).toBe(404);
    expect(r.body).toContain('<meta name="robots" content="noindex">');
    expect((await e.app.inject({ method: "GET", url: "/perfil.html" })).statusCode).toBe(404);
  });
});

describe("ofertas (VIEW-14)", () => {
  it("bloqueada sin perfil", async () => {
    const a = new Agente(e.app);
    await a.crearCuenta("sin@ejemplo.cl");
    const r = await a.get("/panel/ofertas.html");
    expect(r.body).toContain("Primero crea tu perfil.");
    expect(r.body).not.toContain('id="form-oferta"');
  });

  it("valida tipo, título (D-07) y #", async () => {
    const a = await emprendedor("o@ejemplo.cl", "Ofertas");
    await a.get("/panel/ofertas.html");
    const r = await a.post("/panel/ofertas.html", { titulo: " ", tag: " ## " });
    expect(r.statusCode).toBe(422);
    expect(r.body).toContain("Elige el tipo de oferta");
    expect(r.body).toContain("Escribe un título");
    expect(r.body).toContain("Escribe la etiqueta de oficio");
    expect(r.body).toContain("La oferta no se guardó. Tus ofertas anteriores siguen publicadas.");
  });

  it("normaliza el # al guardar y quita por id", async () => {
    const a = await emprendedor("o@ejemplo.cl", "Ofertas");
    const r = await oferta(a, "Gasfitería  a domicilio", "  #Maestro   Chasquilla ");
    expect(r.statusCode).toBe(303);
    const lista = await a.seguir(r);
    expect(lista.body).toContain("Oferta agregada: Gasfitería a domicilio, #maestro chasquilla");
    expect(lista.body).toContain("Etiqueta: #maestro chasquilla");
    const { rows } = await e.db.query<{ id: string; tag: string }>("SELECT id, tag FROM ofertas");
    expect(rows[0]!.tag).toBe("#maestro chasquilla");

    const otro = await emprendedor("otro@ejemplo.cl", "Otro");
    await otro.get("/panel/ofertas.html");
    await otro.post("/panel/ofertas.html", { quitar: rows[0]!.id });
    expect((await e.db.query("SELECT count(*)::int AS n FROM ofertas")).rows[0].n).toBe(1);

    const q = await a.seguir(await a.post("/panel/ofertas.html", { quitar: rows[0]!.id }));
    expect(q.body).toContain("Se quitó la oferta: Gasfitería a domicilio.");
    expect((await e.db.query("SELECT count(*)::int AS n FROM ofertas")).rows[0].n).toBe(0);
  });

  it("avisa cuando hay ofertas y no hay localidad", async () => {
    const a = await emprendedor("o@ejemplo.cl", "Sin Punto");
    await oferta(a, "Muebles", "carpintero");
    const r = await a.get("/panel/portafolio.html");
    expect(r.body).toContain("Tus ofertas no aparecen como oficios cercanos porque no has marcado tu localidad.");
  });
});

describe("búsqueda por cercanía (VIEW-01..04)", () => {
  beforeEach(async () => {
    const nunoa = await emprendedor("n@ejemplo.cl", "Gasfiter Ñuñoa", "Ñuñoa");
    await oferta(nunoa, "Gasfitería Ñuñoa", "gasfiter");
    const maipu = await emprendedor("m@ejemplo.cl", "Gasfiter Maipú", "Maipú");
    await oferta(maipu, "Gasfitería Maipú", "#Gasfiter");
    const providencia = await emprendedor("p@ejemplo.cl", "Gasfiter Providencia", "Providencia");
    await oferta(providencia, "Gasfitería Providencia", "gasfiter");
    const sinPunto = await emprendedor("s@ejemplo.cl", "Carpintera");
    await oferta(sinPunto, "Muebles", "carpintero");
    const tilde = await emprendedor("t@ejemplo.cl", "Con Tilde", "Santiago");
    await oferta(tilde, "Gásfiter con tilde", "gásfiter");
  });

  it("ordena de la más cercana a la más lejana con distancia en km (D-02)", async () => {
    const r = await e.app.inject({ method: "GET", url: "/index.html?q=Gasfiter&localidad=Providencia" });
    expect(r.statusCode).toBe(200);
    const t = texto(r.body);
    expect(t).toContain("3 ofertas de #gasfiter, de la más cercana a la más lejana.");
    expect(t).toContain("Ofertas de #gasfiter cerca de Providencia");
    const orden = [...r.body.matchAll(/<h3 id="r\d+"[^>]*><a [^>]+>([^<]+)<\/a>/gu)].map((m) => m[1]);
    expect(orden).toEqual([
      "Gasfitería Providencia",
      "Gasfitería Ñuñoa",
      "Gasfitería Maipú",
    ]);
    expect(r.body).toMatch(/a \d+,\d km/u);
    expect(r.body).toContain("Gasfiter Providencia");
    expect(r.body).toContain("Gasfiter Maipú");
    expect(r.body).toContain("<title>#gasfiter cerca de ti — trabajamos.com</title>");
  });

  it("las tildes son oficios distintos", async () => {
    const r = await e.app.inject({ method: "GET", url: "/index.html?q=g%C3%A1sfiter&localidad=Santiago" });
    expect(texto(r.body)).toContain("1 oferta de #gásfiter");
  });

  it("# vacío pide un oficio", async () => {
    const r = await e.app.inject({ method: "GET", url: "/index.html?q=%23%23" });
    expect(r.body).toContain("Escribe un oficio, por ejemplo gasfiter.");
    expect(r.body).toMatch(/id="q"[^>]*aria-invalid="true"/u);
  });

  it("sin coincidencia no pide ubicación", async () => {
    const r = await e.app.inject({ method: "GET", url: "/index.html?q=astronauta" });
    expect(texto(r.body)).toContain("No encontramos #astronauta.");
    expect(r.body).toContain("Ese oficio no está publicado.");
  });

  it("sin origen pide la ubicación", async () => {
    const r = await e.app.inject({ method: "GET", url: "/index.html?q=gasfiter" });
    expect(r.body).toContain("Para ver oficios cercanos necesitamos tu ubicación.");
    expect(r.body).toMatch(/id="resultados"[^>]*aria-labelledby="resultados-titulo"[^>]*\bhidden\b/u);
  });

  it("localidad no encontrada no inventa un punto", async () => {
    const r = await e.app.inject({ method: "GET", url: "/index.html?q=gasfiter&localidad=Atlantida" });
    expect(texto(r.body)).toContain("No encontramos la localidad «Atlantida».");
  });

  it("mensaje propio cuando el # existe pero nadie tiene punto (D-04)", async () => {
    const r = await e.app.inject({ method: "GET", url: "/index.html?q=carpintero&localidad=Maip%C3%BA" });
    const t = texto(r.body);
    expect(t).toContain("Ninguna oferta de #carpintero tiene localidad marcada.");
    expect(t).toContain("Sin oficios cercanos para #carpintero");
    expect(t).not.toContain("Ese oficio no está publicado");
  });

  it("API con coordenadas del navegador (por POST, fuera de la URL)", async () => {
    const r = await e.app.inject({
      method: "POST",
      url: "/api/buscar",
      payload: { q: "gasfiter", lat: -33.5106, lng: -70.7572 },
    });
    expect(r.statusCode).toBe(200);
    const datos = r.json();
    expect(datos.tipo).toBe("exito");
    expect(datos.ubicacion).toBe("Ubicación: tu ubicación actual");
    expect(datos.resultadosHtml.indexOf("Gasfitería Maipú")).toBeLessThan(datos.resultadosHtml.indexOf("Gasfitería Ñuñoa"));
    expect(datos.resultadosHtml).toContain("a 0,0 km");
    const sinOrigen = await e.app.inject({ method: "POST", url: "/api/buscar", payload: { q: "gasfiter" } });
    expect(sinOrigen.json().tipo).toBe("sin_origen");
  });
});

describe("portafolio (VIEW-15)", () => {
  async function png(ancho = 2400, alto = 1800) {
    return sharp({ create: { width: ancho, height: alto, channels: 3, background: { r: 10, g: 120, b: 200 } } })
      .jpeg()
      .withExif({ IFD0: { Copyright: "secreto", Artist: "dueño" } })
      .toBuffer();
  }

  it("sube, re-codifica a WebP sin EXIF, sirve y quita la imagen", async () => {
    const a = await emprendedor("f@ejemplo.cl", "Fotos");
    await a.get("/panel/portafolio.html");
    const r = await a.postMultipart("/panel/portafolio.html", [
      { nombre: "_csrf", valor: a.csrf },
      { nombre: "imagen", valor: await png(), archivo: "obra.jpg", tipo: "image/jpeg" },
      { nombre: "alt", valor: "Baño con cerámica nueva" },
    ]);
    expect(r.statusCode).toBe(303);
    const lista = await a.seguir(r);
    expect(lista.body).toContain("Imagen agregada al portafolio.");
    expect(lista.body).toContain("Texto alternativo: Baño con cerámica nueva");

    const { rows } = await e.db.query("SELECT id, archivo, ancho, alto FROM imagenes");
    const fila = rows[0];
    expect(fila.archivo).toMatch(/\.webp$/u);
    expect(Math.max(fila.ancho, fila.alto)).toBe(1600);
    const servida = await e.app.inject({ method: "GET", url: `/uploads/${fila.archivo}` });
    expect(servida.statusCode).toBe(200);
    expect(servida.headers["content-type"]).toBe("image/webp");
    const meta = await sharp(servida.rawPayload).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.exif).toBeUndefined();

    const ruta = path.join(e.config.uploadsDir, fila.archivo);
    expect(existsSync(ruta)).toBe(true);
    await a.post("/panel/portafolio.html", { quitar: fila.id });
    expect(existsSync(ruta)).toBe(false);
    expect((await e.db.query("SELECT count(*)::int AS n FROM imagenes")).rows[0].n).toBe(0);
  });

  it("rechaza archivos que no son imagen, sin descripción o demasiado grandes", async () => {
    const a = await emprendedor("f@ejemplo.cl", "Fotos");
    await a.get("/panel/portafolio.html");
    let r = await a.postMultipart("/panel/portafolio.html", [
      { nombre: "_csrf", valor: a.csrf },
      { nombre: "imagen", valor: Buffer.from("%PDF-1.4 no soy imagen"), archivo: "x.jpg", tipo: "image/jpeg" },
      { nombre: "alt", valor: "Algo" },
    ]);
    expect(r.statusCode).toBe(422);
    expect(r.body).toContain("El archivo no es una imagen. La imagen no se guardó y tu portafolio no cambió.");

    r = await a.postMultipart("/panel/portafolio.html", [
      { nombre: "_csrf", valor: a.csrf },
      { nombre: "imagen", valor: await png(400, 300), archivo: "x.jpg", tipo: "image/jpeg" },
      { nombre: "alt", valor: "  " },
    ]);
    expect(r.body).toContain("Escribe la descripción de la imagen. La imagen no se guardó.");

    r = await a.postMultipart("/panel/portafolio.html", [
      { nombre: "_csrf", valor: a.csrf },
      { nombre: "imagen", valor: Buffer.alloc(5 * 1024 * 1024 + 10, 1), archivo: "grande.jpg", tipo: "image/jpeg" },
      { nombre: "alt", valor: "Grande" },
    ]);
    expect(r.body).toContain("La imagen pesa más de 5 MB.");

    r = await a.postMultipart("/panel/portafolio.html", [
      { nombre: "_csrf", valor: "malo" },
      { nombre: "imagen", valor: await png(400, 300), archivo: "x.jpg", tipo: "image/jpeg" },
      { nombre: "alt", valor: "Algo" },
    ]);
    expect(r.statusCode).toBe(403);
    expect((await e.db.query("SELECT count(*)::int AS n FROM imagenes")).rows[0].n).toBe(0);
  });
});

describe("localidad (VIEW-16)", () => {
  it("sin JavaScript: busca, elige y marca con la etiqueta del resultado", async () => {
    const a = await emprendedor("l@ejemplo.cl", "Local");
    await a.get("/panel/localidad.html");
    const r = await a.post("/panel/localidad.html", { accion: "buscar", localidad_texto: "nunoa" });
    expect(r.statusCode).toBe(200);
    expect(r.body).toContain("Ñuñoa, Región Metropolitana");
    const valor = /name="resultado" value="([^"]+)"/u.exec(r.body)![1]!;
    const m = await a.post("/panel/localidad.html", { accion: "marcar", resultado: valor, "punto[lat]": "", "punto[lng]": "" });
    expect(m.statusCode).toBe(303);
    const despues = await a.seguir(m);
    expect(despues.body).toContain(
      "Localidad marcada: Ñuñoa, Región Metropolitana. Tus ofertas ya pueden aparecer como oficios cercanos.",
    );
    const { rows } = await e.db.query("SELECT punto_etiqueta, ST_Y(punto::geometry) AS lat FROM perfiles");
    expect(rows[0].punto_etiqueta).toBe("Ñuñoa, Región Metropolitana");
    expect(rows[0].lat).toBeCloseTo(-33.4569, 3);
  });

  it("punto sin nombre no se guarda (D-08) y sin punto pide elegirlo", async () => {
    const a = await emprendedor("l@ejemplo.cl", "Local");
    await a.get("/panel/localidad.html");
    let r = await a.post("/panel/localidad.html", {
      accion: "marcar",
      "punto[lat]": "-33.45",
      "punto[lng]": "-70.6",
      "punto[etiqueta]": " ",
    });
    expect(r.statusCode).toBe(422);
    expect(r.body).toContain("Escribe el nombre de la localidad. La localidad no se guardó.");
    r = await a.post("/panel/localidad.html", { accion: "marcar", "punto[etiqueta]": "Algún lugar" });
    expect(r.body).toContain("Elige tu localidad en el mapa o escríbela.");
    r = await a.post("/panel/localidad.html", { accion: "buscar", localidad_texto: "Atlántida" });
    expect(r.body).toContain("No encontramos esa localidad. No se marcó ningún punto.");
    const { rows } = await e.db.query("SELECT punto FROM perfiles");
    expect(rows[0].punto).toBeNull();
  });

  it("marca desde el mapa con etiqueta editada", async () => {
    const a = await emprendedor("l@ejemplo.cl", "Local");
    await a.get("/panel/localidad.html");
    const r = await a.post("/panel/localidad.html", {
      accion: "marcar",
      "punto[lat]": "-33.4300",
      "punto[lng]": "-70.6100",
      "punto[etiqueta]": "Metro Los Leones, Providencia",
    });
    expect(r.statusCode).toBe(303);
    const pub = await e.app.inject({ method: "GET", url: "/perfil.html?slug=local" });
    expect(pub.body).toContain("<p>Metro Los Leones, Providencia</p>");
    expect(pub.body).toContain('data-lat="-33.43"');
  });

  it("API de geocodificación solo con sesión y nunca de la ubicación del dispositivo", async () => {
    const anon = await e.app.inject({ method: "GET", url: "/panel/api/geo/inversa?lat=-33.45&lng=-70.6" });
    expect(anon.statusCode).toBe(401);
    const a = await emprendedor("l@ejemplo.cl", "Local");
    const inv = await a.get("/panel/api/geo/inversa?lat=-33.4570&lng=-70.5980");
    expect(inv.json()).toEqual({ etiqueta: "Ñuñoa, Región Metropolitana" });
    const bus = await a.get("/panel/api/geo/buscar?q=Maip%C3%BA");
    expect(bus.json().resultados[0].etiqueta).toBe("Maipú, Región Metropolitana");
    const pagina = await a.get("/panel/localidad.html");
    expect(pagina.body).not.toContain("Usar mi ubicación");
  });
});
