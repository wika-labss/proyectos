import path from "node:path";
import sharp from "sharp";
import { LARGO_MINIMO_CONTRASENA, crearUsuario } from "../auth/cuentas.js";
import { agregarImagen, agregarOferta, crearPerfil, guardarRedes, marcarPunto, perfilDeUsuario } from "../datos.js";
import { crearPool } from "../db.js";
import { guardarImagen } from "../imagenes.js";
import type { ContactoTipo, OfertaTipo } from "../lib/reglas.js";

// Datos de demostración para QA. Idempotente: omite las cuentas que ya existen.
interface Demo {
  correo: string;
  nombre: string;
  contacto: [ContactoTipo, string];
  punto: { lat: number; lng: number; etiqueta: string } | null;
  descripcion: string | null;
  ofertas: [OfertaTipo, string, string, string | null][];
  redes: [string, string][];
  imagenes: { color: [number, number, number]; alt: string }[];
}

const DEMOS: Demo[] = [
  {
    correo: "juan@demo.trabajamos.test",
    nombre: "Juan Pérez Gasfitería",
    contacto: ["telefono", "+56 9 1234 5678"],
    descripcion: "Arreglo cañerías y calefont en casa.",
    punto: { lat: -33.4569, lng: -70.5978, etiqueta: "Ñuñoa, Región Metropolitana" },
    ofertas: [
      ["oficio", "Gasfitería a domicilio", "#gasfiter", "Gasfitería"],
      ["servicio", "Destape de cañerías", "#gasfiter", null],
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
    contacto: ["correo", "maria.soto@demo.trabajamos.test"],
    descripcion: null,
    punto: { lat: -33.4263, lng: -70.6114, etiqueta: "Providencia, Región Metropolitana" },
    ofertas: [
      ["servicio", "Instalaciones eléctricas certificadas", "#electricista", null],
      ["proyecto", "Remodelación de tablero eléctrico", "#electricista", null],
    ],
    redes: [],
    imagenes: [{ color: [200, 170, 60], alt: "Tablero eléctrico ordenado con automáticos rotulados" }],
  },
  {
    correo: "pedro@demo.trabajamos.test",
    nombre: "Pedro Rojas",
    contacto: ["url", "https://www.pedrorojas.example/contacto"],
    descripcion: null,
    punto: { lat: -33.5106, lng: -70.7572, etiqueta: "Maipú, Región Metropolitana" },
    ofertas: [
      ["oficio", "Arreglos generales del hogar", "#maestro chasquilla", "Maestro chasquilla"],
      ["oficio", "Cambio de llaves y flexibles", "#gasfiter", "Gasfitería"],
    ],
    redes: [
      ["Facebook", "https://www.facebook.com/pedrorojas.maestro"],
      ["TikTok", "https://www.tiktok.com/@pedrorojas"],
    ],
    imagenes: [],
  },
  {
    correo: "luis@demo.trabajamos.test",
    nombre: "Luis Fuentes",
    contacto: ["telefono", "+56 9 8765 4321"],
    descripcion: null,
    punto: { lat: -33.6117, lng: -70.5758, etiqueta: "Puente Alto, Región Metropolitana" },
    ofertas: [["oficio", "Electricista domiciliario", "#electricista", "Electricidad"]],
    redes: [],
    imagenes: [],
  },
  {
    // Sin localidad: cubre el mensaje D-04 para #carpintero.
    correo: "ana@demo.trabajamos.test",
    nombre: "Ana Díaz Carpintería",
    contacto: ["telefono", "+56 9 5555 0000"],
    descripcion: null,
    punto: null,
    ofertas: [["oficio", "Muebles a medida", "#carpintero", "Carpintería"]],
    redes: [],
    imagenes: [],
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
    await crearPerfil(db, usuario.id, demo.nombre, demo.contacto[0], demo.contacto[1], demo.descripcion);
    const perfil = (await perfilDeUsuario(db, usuario.id))!;
    if (demo.punto) await marcarPunto(db, perfil.id, demo.punto);
    for (const [tipo, titulo, tag, categoria] of demo.ofertas) {
      await agregarOferta(db, perfil.id, tipo, titulo, tag, categoria);
    }
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
