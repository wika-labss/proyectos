import path from "node:path";

export interface Config {
  host: string;
  port: number;
  databaseUrl: string;
  sessionSecret: string;
  publicBaseUrl: string;
  uploadsDir: string;
  cookieSecure: boolean;
  geocoder: "nominatim" | "fake";
  nominatimUrl: string;
  nominatimUserAgent: string;
  nominatimCountrycodes: string;
}

function requerida(env: NodeJS.ProcessEnv, nombre: string): string {
  const valor = env[nombre];
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`);
  return valor;
}

export function cargarConfig(env: NodeJS.ProcessEnv = process.env): Config {
  const geocoder = env.GEOCODER === "fake" ? "fake" : "nominatim";
  const sessionSecret = requerida(env, "SESSION_SECRET");
  if (sessionSecret.length < 32) throw new Error("SESSION_SECRET debe tener al menos 32 caracteres");
  return {
    host: env.HOST ?? "0.0.0.0",
    port: Number(env.PORT ?? 3000),
    databaseUrl: requerida(env, "DATABASE_URL"),
    sessionSecret,
    publicBaseUrl: env.PUBLIC_BASE_URL ?? "http://localhost:3000",
    uploadsDir: path.resolve(env.UPLOADS_DIR ?? "data/uploads"),
    cookieSecure: env.COOKIE_SECURE === "true",
    geocoder,
    nominatimUrl: env.NOMINATIM_URL ?? "https://nominatim.openstreetmap.org",
    nominatimUserAgent:
      geocoder === "nominatim" ? requerida(env, "NOMINATIM_USER_AGENT") : (env.NOMINATIM_USER_AGENT ?? ""),
    nominatimCountrycodes: env.NOMINATIM_COUNTRYCODES ?? "cl",
  };
}
