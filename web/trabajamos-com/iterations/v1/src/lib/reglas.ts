// Regla única del # (04 §3.3). La usan la barra de búsqueda y el guardado de ofertas.
export function normalizarTag(texto: string): string | null {
  const sinPrefijo = texto.trim().replace(/^[#\s]+/u, "");
  const compacto = sinPrefijo.replace(/\s+/gu, " ").toLocaleLowerCase("es-CL");
  return compacto ? `#${compacto}` : null;
}

export type ContactoTipo = "telefono" | "correo" | "url";
export const CONTACTO_TIPOS: readonly ContactoTipo[] = ["telefono", "correo", "url"];

export function esContactoTipo(valor: unknown): valor is ContactoTipo {
  return typeof valor === "string" && (CONTACTO_TIPOS as readonly string[]).includes(valor);
}

export type OfertaTipo = "proyecto" | "servicio" | "oficio" | "producto";
export const OFERTA_TIPOS: readonly OfertaTipo[] = ["proyecto", "servicio", "oficio", "producto"];

export function esOfertaTipo(valor: unknown): valor is OfertaTipo {
  return typeof valor === "string" && (OFERTA_TIPOS as readonly string[]).includes(valor);
}

export const ETIQUETA_OFERTA: Record<OfertaTipo, string> = {
  proyecto: "Proyecto",
  servicio: "Servicio",
  oficio: "Oficio",
  producto: "Producto",
};

export function compactar(texto: string): string {
  return texto.trim().replace(/\s+/gu, " ");
}

export function telefonoValido(valor: string): boolean {
  const digitos = valor.replace(/[\s\-()]/gu, "");
  return /^\+\d{8,15}$/u.test(digitos);
}

export function telefonoHref(valor: string): string {
  return `tel:${valor.replace(/[\s\-()]/gu, "")}`;
}

export function correoValido(valor: string): boolean {
  return valor.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(valor);
}

export function urlHttpsValida(valor: string): boolean {
  if (!valor.startsWith("https://")) return false;
  try {
    const url = new URL(valor);
    return url.protocol === "https:" && url.hostname.includes(".") && valor.length <= 500;
  } catch {
    return false;
  }
}

export function dominioDe(valor: string): string {
  try {
    return new URL(valor).hostname.replace(/^www\./u, "");
  } catch {
    return valor;
  }
}

export function contactoValido(tipo: ContactoTipo, valor: string): boolean {
  if (tipo === "telefono") return telefonoValido(valor);
  if (tipo === "correo") return correoValido(valor);
  return urlHttpsValida(valor);
}

export function contactoHref(tipo: ContactoTipo, valor: string): string {
  if (tipo === "telefono") return telefonoHref(valor);
  if (tipo === "correo") return `mailto:${valor}`;
  return valor;
}

// Dato público junto a Contactar. El botón abre el teléfono; el correo se copia al lado.
export function datoTelefono(valor: string): string {
  return `Teléfono: ${valor}`;
}

export function datoCorreo(valor: string): string {
  return `Correo: ${valor}`;
}

// D-03 histórico: un solo medio. El perfil publicado ya no usa esta variante.
export function contactoDato(tipo: ContactoTipo, valor: string): string {
  if (tipo === "telefono") return `Teléfono: ${valor}`;
  if (tipo === "correo") return `Correo: ${valor}`;
  return `Sitio: ${dominioDe(valor)}`;
}

export function contactoDestino(tipo: ContactoTipo, valor: string): string {
  if (tipo === "telefono") return `una llamada a ${valor}`;
  if (tipo === "correo") return `un correo a ${valor}`;
  return `el enlace ${valor}`;
}

export function contactoMedio(tipo: ContactoTipo): string {
  if (tipo === "telefono") return "por teléfono";
  if (tipo === "correo") return "por correo";
  return "en su sitio";
}

// D-02: "a 1,2 km".
export function distanciaTexto(km: number): string {
  const redondeado = Math.round(km * 10) / 10;
  return `a ${redondeado.toFixed(1).replace(".", ",")} km`;
}

export function slugBase(nombre: string): string {
  const base = nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 60)
    .replace(/-+$/u, "");
  return base || "perfil";
}

// Solo rutas internas del panel: evita redirecciones abiertas.
export function volverSeguro(valor: unknown): string | null {
  if (typeof valor !== "string") return null;
  if (!valor.startsWith("/panel/") || valor.startsWith("//") || valor.includes("\\")) return null;
  if (valor.startsWith("/panel/entrar") || valor.startsWith("/panel/crear-cuenta")) return null;
  return valor;
}
