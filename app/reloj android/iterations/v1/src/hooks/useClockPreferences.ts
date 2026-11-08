import { useCallback } from 'react';
import * as Haptics from 'expo-haptics';

import { refreshWidget } from './useWidgetSync';
import { selectPreferences, useClockStore } from '../stores/clockStore';
import type { ClockPreferences } from '../types';

const WIDGET_PREFERENCE_KEYS = new Set<keyof ClockPreferences>(['format24h', 'colorPreset']);

export function useClockPreferences() {
  const preferences = useClockStore(selectPreferences);
  const setPreference = useClockStore((state) => state.setPreference);
  const flushPreferences = useClockStore((state) => state.flushPreferences);

  const updatePreference = useCallback(
    async <K extends keyof ClockPreferences>(key: K, value: ClockPreferences[K]) => {
      setPreference(key, value);
      void Haptics.selectionAsync();
      await flushPreferences();
      if (WIDGET_PREFERENCE_KEYS.has(key)) {
        await refreshWidget();
      }
    },
    [flushPreferences, setPreference],
  );

  return { preferences, updatePreference };
}
