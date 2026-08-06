import { useEffect } from 'react';
import { logExec } from '../diagnostics/logger';
import { useTvStore } from '../stores/tvStore';

/** Carga preferencias y reconexión inicial — único punto de bootstrap fuera de pantallas. */
export function useTvBootstrap() {
  const loaded = useTvStore((state) => state.loaded);
  const load = useTvStore((state) => state.load);

  useEffect(() => {
    logExec('app.bootstrap', 'v3.2.0 — mock cleanup + logs claros para conexión v4');
    void load();
  }, [load]);

  return { loaded };
}
