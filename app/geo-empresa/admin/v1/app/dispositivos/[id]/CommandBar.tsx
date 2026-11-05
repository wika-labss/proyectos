'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { aprobarDispositivo, solicitarComando } from '../../../src/engine/adminApi';
import { createBrowserSupabase } from '../../../src/lib/supabase/client';

export function CommandBar({ id, enrollment }: { id: string; enrollment: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error');
    } finally {
      setBusy(false);
    }
  }

  const client = () => createBrowserSupabase();

  return (
    <section>
      <p className="muted">
        Liberar apaga el auto-lock. El colaborador entra con su PIN o con el PIN nuevo que defina TI.
        Los comandos se aplican en el próximo poll (30–60 s).
      </p>
      <div className="row">
        {enrollment !== 'aprobado' ? (
          <button
            className="btn"
            disabled={busy}
            onClick={() => void run(() => aprobarDispositivo(client(), id, 'aprobado'))}
          >
            Aprobar
          </button>
        ) : null}
        {enrollment !== 'rechazado' ? (
          <button
            className="btn ghost"
            disabled={busy}
            onClick={() => void run(() => aprobarDispositivo(client(), id, 'rechazado'))}
          >
            Rechazar
          </button>
        ) : null}
        <button
          className="btn danger"
          disabled={busy}
          onClick={() => void run(() => solicitarComando(client(), id, 'lock'))}
        >
          Bloquear
        </button>
        <button
          className="btn ghost"
          disabled={busy}
          onClick={() => void run(() => solicitarComando(client(), id, 'unlock_policy'))}
        >
          Liberar
        </button>
        <button
          className="btn ghost"
          disabled={busy}
          onClick={() => void run(() => solicitarComando(client(), id, 'reboot'))}
        >
          Reiniciar
        </button>
      </div>
      <div className="row" style={{ marginTop: 12 }}>
        <input
          type="text"
          placeholder="Nuevo PIN corporativo"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
        />
        <button
          className="btn"
          disabled={busy || pin.length < 4}
          onClick={() => void run(() => solicitarComando(client(), id, 'reset_pin', pin))}
        >
          Nuevo PIN
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
