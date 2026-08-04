import { useCallback } from 'react';
import * as Network from 'expo-network';
import { useTvStore } from '../stores/tvStore';

export function useTvConnection() {
  const connectionState = useTvStore((state) => state.connectionState);
  const pairedDevice = useTvStore((state) => state.pairedDevice);
  const error = useTvStore((state) => state.error);
  const feedback = useTvStore((state) => state.feedback);
  const connect = useTvStore((state) => state.connect);
  const reconnect = useTvStore((state) => state.reconnect);
  const disconnect = useTvStore((state) => state.disconnect);
  const forgetDevice = useTvStore((state) => state.forgetDevice);
  const leaveForPairing = useTvStore((state) => state.leaveForPairing);
  const clearFeedback = useTvStore((state) => state.clearFeedback);

  const checkWifi = useCallback(async (): Promise<boolean> => {
    try {
      const state = await Network.getNetworkStateAsync();
      if (state.isConnected === false) {
        return false;
      }
      if (state.type === Network.NetworkStateType.WIFI) {
        return true;
      }
      if (state.type === Network.NetworkStateType.UNKNOWN) {
        return true;
      }
      return false;
    } catch {
      return true;
    }
  }, []);

  return {
    connectionState,
    pairedDevice,
    error,
    feedback,
    connect,
    reconnect,
    disconnect,
    forgetDevice,
    leaveForPairing,
    clearFeedback,
    checkWifi,
    isConnected: connectionState === 'connected',
  };
}
