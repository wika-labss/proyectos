import { useMemo } from 'react';

import { formatClock } from '../engine/formatTime';
import { getPresetTokens } from '../constants/theme';
import { selectPreferences, useClockStore } from '../stores/clockStore';
import { useClock } from './useClock';

export function useClockDisplay() {
  const now = useClock();
  const preferences = useClockStore(selectPreferences);
  const tokens = getPresetTokens(preferences.colorPreset);
  const formatted = useMemo(() => formatClock(now, preferences), [now, preferences]);

  return {
    now,
    preferences,
    tokens,
    formatted,
  };
}
