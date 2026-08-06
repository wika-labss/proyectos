import { useEffect } from 'react';
import { logExec } from '../diagnostics/logger';
import { useTvStore } from '../stores/tvStore';

/** Carga preferencias y reconexión inicial — único punto de bootstrap fuera de pantallas. */
export function useTvBootstrap() {
  const loaded = useTvStore((state) => state.loaded);
  const load = useTvStore((state) => state.load);

  useEffect(() => {
    logExec('app.bootstrap', 'v3.1.0 diagnostics module active');
    void load();
  }, [load]);

  return { loaded };
}
