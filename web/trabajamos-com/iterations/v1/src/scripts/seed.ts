import path from "node:path";
import sharp from "sharp";
import { LARGO_MINIMO_CONTRASENA, crearUsuario } from "../auth/cuentas.js";
import { agregarImagen, agregarOferta, crearPerfil, guardarRedes, marcarPunto, perfilDeUsuario } from "../datos.js";
import { crearPool } from "../db.js";
import { guardarImagen } from "../imagenes.js";
import type { OfertaTipo } from "../lib/reglas.js";

// Datos de demostración para QA. Idempotente: omite las cuentas que ya existen.
// Cada perfil publica teléfono y correo, y al menos una imagen.
interface Demo {
  correo: string;
  nombre: string;
  telefono: string;
  correoPublico: string;
  punto: { lat: number; lng: number; etiqueta: string } | null;
  ofertas: [OfertaTipo, string, string][];
  redes: [string, string][];
  imagenes: { color: [number, number, number]; alt: string }[];
}

const DEMOS: Demo[] = [
  {
    correo: "juan@demo.trabajamos.test",
    nombre: "Juan Pérez Gasfitería",
    telefono: "+56 9 1234 5678",
    correoPublico: "juan.publico@demo.trabajamos.test",
    punto: { lat: -33.4569, lng: -70.5978, etiqueta: "Ñuñoa, Región Metropolitana" },
    ofertas: [
      ["oficio", "Gasfitería a domicilio", "#gasfiter"],
      ["servicio", "Destape de cañerías", "#gasfiter"],
    ],
    redes: [["Instagram", "https://www.instagram.com/juanperez.gasfiter"]],
    imagenes: [
      { color: [70, 110, 160], alt: "Calefont recién instalado en una cocina" },
      { color: [150, 150, 140], alt: "Cañería de cobre reparada bajo un lavaplatos" },
    ],
  },
  {
    correo: "maria@demo.trabajamos.test",
    nombre: "María Soto Electricidad",
    telefono: "+56 9 2222 3333",
    correoPublico: "maria.soto@demo.trabajamos.test",
    punto: { lat: -33.4263, lng: -70.6114, etiqueta: "Providencia, Región Metropolitana" },
    ofertas: [
      ["servicio", "Instalaciones eléctricas certificadas", "#electricista"],
      ["proyecto", "Remodelación de tablero eléctrico", "#electricista"],
    ],
    redes: [],
    imagenes: [{ color: [200, 170, 60], alt: "Tablero eléctrico ordenado con automáticos rotulados" }],
  },
  {
    correo: "pedro@demo.trabajamos.test",
    nombre: "Pedro Rojas",
    telefono: "+56 9 4444 5555",
    correoPublico: "pedro.publico@demo.trabajamos.test",
    punto: { lat: -33.5106, lng: -70.7572, etiqueta: "Maipú, Región Metropolitana" },
    ofertas: [
      ["oficio", "Arreglos generales del hogar", "#maestro chasquilla"],
      ["oficio", "Cambio de llaves y flexibles", "#gasfiter"],
    ],
    redes: [
      ["Sitio", "https://www.pedrorojas.example/contacto"],
      ["Facebook", "https://www.facebook.com/pedrorojas.maestro"],
      ["TikTok", "https://www.tiktok.com/@pedrorojas"],
    ],
    imagenes: [{ color: [90, 120, 90], alt: "Mueble reparado en un living" }],
  },
  {
    correo: "luis@demo.trabajamos.test",
    nombre: "Luis Fuentes",
    telefono: "+56 9 8765 4321",
    correoPublico: "luis.publico@demo.trabajamos.test",
    punto: { lat: -33.6117, lng: -70.5758, etiqueta: "Puente Alto, Región Metropolitana" },
    ofertas: [["oficio", "Electricista domiciliario", "#electricista"]],
    redes: [],
    imagenes: [{ color: [40, 70, 140], alt: "Enchufe domiciliario recién instalado" }],
  },
  {
    // Sin localidad: cubre el mensaje D-04 para #carpintero.
    correo: "ana@demo.trabajamos.test",
    nombre: "Ana Díaz Carpintería",
    telefono: "+56 9 5555 0000",
    correoPublico: "ana.publico@demo.trabajamos.test",
    punto: null,
    ofertas: [["oficio", "Muebles a medida", "#carpintero"]],
    redes: [],
    imagenes: [{ color: [160, 110, 60], alt: "Mueble de madera a medida en un taller" }],
  },
];

const contrasena = process.env.SEED_PASSWORD ?? "";
if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
  console.error(`Define SEED_PASSWORD (al menos ${LARGO_MINIMO_CONTRASENA} caracteres) para las cuentas de demostración.`);
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("Falta DATABASE_URL");
  process.exit(1);
}
const uploadsDir = path.resolve(process.env.UPLOADS_DIR ?? "data/uploads");
const db = crearPool(process.env.DATABASE_URL);
try {
  for (const demo of DEMOS) {
    const usuario = await crearUsuario(db, demo.correo, contrasena);
    if (usuario === "duplicado") {
      console.log(`Ya existe ${demo.correo}; se omite.`);
      continue;
    }
    await crearPerfil(db, usuario.id, demo.nombre, demo.telefono, demo.correoPublico);
    const perfil = (await perfilDeUsuario(db, usuario.id))!;
    if (demo.punto) await marcarPunto(db, perfil.id, demo.punto);
    for (const [tipo, titulo, tag] of demo.ofertas) await agregarOferta(db, perfil.id, tipo, titulo, tag);
    if (demo.redes.length) {
      await guardarRedes(db, perfil.id, demo.redes.map(([nombre, url]) => ({ id: null, nombre, url })));
    }
    for (const img of demo.imagenes) {
      const [r, g, b] = img.color;
      const png = await sharp({ create: { width: 1200, height: 900, channels: 3, background: { r, g, b } } })
        .png()
        .toBuffer();
      const guardada = await guardarImagen(uploadsDir, perfil.id, png);
      await agregarImagen(db, perfil.id, { ...guardada, alt: img.alt });
    }
    console.log(`Creado ${demo.correo} → /perfil.html?slug=${perfil.slug}`);
  }
} finally {
  await db.end();
}
