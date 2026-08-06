import { useCallback } from 'react';
import * as Network from 'expo-network';
import { logExec, logFail, logOk, logWarn } from '../diagnostics/logger';
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
    logExec('network.wifi', 'check');
    try {
      const state = await Network.getNetworkStateAsync();
      const detail = {
        isConnected: state.isConnected,
        type: String(state.type),
        isInternetReachable: state.isInternetReachable,
      };
      if (state.isConnected === false) {
        logFail('network.wifi', 'not_connected — activa WiFi', detail);
        return false;
      }
      if (state.type === Network.NetworkStateType.WIFI) {
        logOk('network.wifi', 'ok WIFI', detail);
        return true;
      }
      if (state.type === Network.NetworkStateType.UNKNOWN) {
        logWarn('network.wifi', 'type_unknown — se permite continuar', detail);
        return true;
      }
      logFail('network.wifi', `no_wifi type=${String(state.type)}`, detail);
      return false;
    } catch (error) {
      logWarn(
        'network.wifi',
        error instanceof Error ? error.message : String(error),
      );
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
