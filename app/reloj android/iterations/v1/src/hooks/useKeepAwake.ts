import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const TAG = 'reloj-mesa';

export function useKeepAwake(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) {
      return undefined;
    }
    void activateKeepAwakeAsync(TAG);
    return () => {
      deactivateKeepAwake(TAG);
    };
  }, [enabled]);
}
