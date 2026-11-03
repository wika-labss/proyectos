import pg from "pg";

export type Db = pg.Pool;

export function crearPool(databaseUrl: string): Db {
  return new pg.Pool({ connectionString: databaseUrl, max: 10 });
}

export async function enTransaccion<T>(db: Db, fn: (cliente: pg.PoolClient) => Promise<T>): Promise<T> {
  const cliente = await db.connect();
  try {
    await cliente.query("BEGIN");
    const resultado = await fn(cliente);
    await cliente.query("COMMIT");
    return resultado;
  } catch (error) {
    await cliente.query("ROLLBACK");
    throw error;
  } finally {
    cliente.release();
  }
}
