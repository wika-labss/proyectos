import { construirApp } from "./app.js";
import { cargarConfig } from "./config.js";
import { crearPool } from "./db.js";
import { type Geocoder, GeocoderConCache, GeocoderFake, NominatimGeocoder } from "./geo/geocoder.js";

const config = cargarConfig();
const db = crearPool(config.databaseUrl);
const interno: Geocoder =
  config.geocoder === "fake"
    ? new GeocoderFake()
    : new NominatimGeocoder(config.nominatimUrl, config.nominatimUserAgent, config.nominatimCountrycodes);
const geocoder = new GeocoderConCache(db, interno);

const app = await construirApp({ config, db, geocoder }, { logger: true });

for (const senal of ["SIGINT", "SIGTERM"] as const) {
  process.once(senal, () => {
    app.log.info({ senal }, "cerrando");
    void app.close().then(() => db.end()).then(() => process.exit(0));
  });
}

await app.listen({ host: config.host, port: config.port });
