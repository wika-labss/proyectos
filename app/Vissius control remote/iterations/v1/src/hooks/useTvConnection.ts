import { useCallback } from 'react';
import * as Network from 'expo-network';
import { useTvStore } from '../stores/tvStore';

export function useTvConnection() {
  const connectionState = useTvStore((state) => state.connectionState);
  const pairedDevice = useTvStore((state) => state.pairedDevice);
  const error = useTvStore((state) => state.error);
  const connect = useTvStore((state) => state.connect);
  const reconnect = useTvStore((state) => state.reconnect);
  const disconnect = useTvStore((state) => state.disconnect);
  const forgetDevice = useTvStore((state) => state.forgetDevice);

  const checkWifi = useCallback(async (): Promise<boolean> => {
    try {
      const state = await Network.getNetworkStateAsync();

      if (state.isConnected === false) {
        return false;
      }

      if (state.type === Network.NetworkStateType.WIFI) {
        return true;
      }

      // Android release a menudo reporta UNKNOWN aunque el móvil esté en WiFi.
      if (state.type === Network.NetworkStateType.UNKNOWN) {
        return true;
      }

      return false;
    } catch {
      // v1 mock: no bloquear emparejamiento si expo-network falla en el APK.
      return true;
    }
  }, []);

  return {
    connectionState,
    pairedDevice,
    error,
    connect,
    reconnect,
    disconnect,
    forgetDevice,
    checkWifi,
    isConnected: connectionState === 'connected',
  };
}
