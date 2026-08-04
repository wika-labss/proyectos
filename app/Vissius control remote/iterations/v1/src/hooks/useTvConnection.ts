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
    const state = await Network.getNetworkStateAsync();
    return state.type === Network.NetworkStateType.WIFI && state.isConnected === true;
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
