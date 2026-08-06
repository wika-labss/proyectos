import { useCallback } from 'react';
import { router } from 'expo-router';
import { usePairing } from './usePairing';
import { useTvConnection } from './useTvConnection';

/** Vuelve a emparejamiento y limpia resultados de escaneo — flujo "Cambiar TV". */
export function useChangeTv() {
  const { leaveForPairing } = useTvConnection();
  const { clear: clearPairing } = usePairing();

  return useCallback(() => {
    void (async () => {
      clearPairing();
      await leaveForPairing();
      router.replace('/pairing');
    })();
  }, [clearPairing, leaveForPairing]);
}
