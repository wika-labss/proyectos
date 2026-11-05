import Link from 'next/link';
import { listarFlota, type FlotaRow } from '../src/engine/adminApi';
import { createServerSupabase } from '../src/lib/supabase/server';

export default async function FleetPage() {
  const supabase = createServerSupabase();
  let rows: FlotaRow[] = [];
  let error: string | null = null;
  try {
    rows = await listarFlota(supabase);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Error';
  }

  return (
    <main className="wrap">
      <header className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Flota corporativa</h1>
        <Link href="/enrollment">Enrollment</Link>
      </header>
      {error ? <p className="error">{error}</p> : null}
      {!error && rows.length === 0 ? <p className="muted">No hay dispositivos registrados.</p> : null}
      {rows.length > 0 ? (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Perímetro</th>
                <th>Owner</th>
                <th>Enrollment</th>
                <th>Ping</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/dispositivos/${row.id}`}>{row.nombre_registrado}</Link>
                  </td>
                  <td>
                    <span className={`chip ${row.dentro_perimetro ? 'ok' : 'err'}`}>
                      {row.dentro_perimetro ? 'dentro' : 'fuera'}
                    </span>
                  </td>
                  <td>{row.es_device_owner ? 'sí' : 'no'}</td>
                  <td>
                    <span
                      className={`chip ${
                        row.estado_enrollment === 'aprobado'
                          ? 'ok'
                          : row.estado_enrollment === 'rechazado'
                            ? 'err'
                            : 'warn'
                      }`}
                    >
                      {row.estado_enrollment}
                    </span>
                  </td>
                  <td className="muted">{row.ultimo_ping_at ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </main>
  );
}
