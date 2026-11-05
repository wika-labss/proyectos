import Link from 'next/link';
import { listarComandos, obtenerDispositivoAdmin } from '../../../src/engine/adminApi';
import { createServerSupabase } from '../../../src/lib/supabase/server';
import { CommandBar } from './CommandBar';

export default async function DevicePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabase();
  const device = await obtenerDispositivoAdmin(supabase, params.id).catch(() => null);
  const commands = device ? await listarComandos(supabase, params.id).catch(() => []) : [];

  if (!device) {
    return (
      <main className="wrap">
        <Link href="/">← Flota</Link>
        <p className="error">Dispositivo no encontrado o sin permiso TI.</p>
      </main>
    );
  }

  return (
    <main className="wrap">
      <Link href="/">← Flota</Link>
      <h1>{device.nombre_registrado}</h1>
      <p className="muted">
        {device.distancia_base_m != null ? `${Math.round(device.distancia_base_m)} m` : '—'} ·{' '}
        {device.dentro_perimetro ? 'dentro' : 'fuera'} · {device.estado_enrollment}
      </p>
      <p>
        Owner: {device.es_device_owner ? 'sí' : 'no'} · Admin: {device.admin_activo ? 'sí' : 'no'} ·
        Auto-lock: {device.politica_autolock ? 'on' : 'off'}
      </p>
      <CommandBar id={device.id} enrollment={device.estado_enrollment} />
      <h2>Comandos</h2>
      <div className="card">
        {commands.length === 0 ? <p className="muted">Sin comandos.</p> : null}
        {commands.map((cmd) => (
          <p key={cmd.id}>
            {cmd.tipo} · {cmd.estado} · {cmd.solicitado_at}
            {cmd.error_mensaje ? ` · ${cmd.error_mensaje}` : ''}
          </p>
        ))}
      </div>
      <h2>Últimos pings</h2>
      <div className="card">
        {(device.reportes ?? []).map((r, i) => (
          <p key={`${r.registrado_at}-${i}`} className="muted">
            {r.registrado_at} · {r.dentro_perimetro ? 'dentro' : 'fuera'} ·{' '}
            {r.distancia_base_m != null ? `${Math.round(r.distancia_base_m)} m` : ''}
          </p>
        ))}
      </div>
    </main>
  );
}
