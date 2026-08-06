import { useEffect } from 'react';
import { useTvStore } from '../stores/tvStore';

/** Carga preferencias y reconexión inicial — único punto de bootstrap fuera de pantallas. */
export function useTvBootstrap() {
  const loaded = useTvStore((state) => state.loaded);
  const load = useTvStore((state) => state.load);

  useEffect(() => {
    void load();
  }, [load]);

  return { loaded };
}
