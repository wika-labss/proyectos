import { useCallback, useEffect, useState } from 'react';
import * as Network from 'expo-network';

export function useNetworkStatus() {
  const [online, setOnline] = useState(true);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    setChecking(true);
    try {
      const state = await Network.getNetworkStateAsync();
      if (state.isConnected === false) {
        setOnline(false);
        return false;
      }

      if (
        state.type === Network.NetworkStateType.WIFI ||
        state.type === Network.NetworkStateType.CELLULAR ||
        state.type === Network.NetworkStateType.ETHERNET ||
        state.type === Network.NetworkStateType.UNKNOWN
      ) {
        setOnline(true);
        return true;
      }

      setOnline(Boolean(state.isInternetReachable ?? state.isConnected));
      return Boolean(state.isInternetReachable ?? state.isConnected);
    } catch {
      setOnline(true);
      return true;
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { online, checking, refresh };
}
