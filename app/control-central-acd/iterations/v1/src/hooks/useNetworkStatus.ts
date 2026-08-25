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
      setOnline(Boolean(state.isInternetReachable ?? state.isConnected ?? true));
      return Boolean(state.isInternetReachable ?? state.isConnected ?? true);
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
