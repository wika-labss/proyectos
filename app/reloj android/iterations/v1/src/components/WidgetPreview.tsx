import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatWidgetTime } from '../engine/formatTime';
import { getPresetTokens, colors } from '../constants/theme';
import type { ClockPreferences } from '../types';
import { RetroBezel } from './RetroBezel';
import { SevenSegmentDisplay } from './SevenSegmentDisplay';

interface WidgetPreviewProps {
  now: Date;
  preferences: ClockPreferences;
}

export function WidgetPreview({ now, preferences }: WidgetPreviewProps) {
  const tokens = getPresetTokens(preferences.colorPreset);
  const widgetTime = formatWidgetTime(now, preferences);
  const parts = widgetTime.split(' ');
  const time = parts[0] ?? widgetTime;
  const ampm = parts[1] ?? null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>VISTA PREVIA WIDGET</Text>
      <RetroBezel compact>
        <SevenSegmentDisplay
          value={time}
          color={tokens.display}
          glowColor={tokens.displayGlow}
          size="medium"
          ampm={ampm}
        />
      </RetroBezel>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
    marginBottom: 16,
    gap: 8,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
});
