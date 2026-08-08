import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { buildWidgetModel } from '../engine/widgetRenderer';
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
  const model = buildWidgetModel(now, preferences);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>VISTA PREVIA WIDGET</Text>
      <RetroBezel compact>
        <SevenSegmentDisplay
          value={model.time}
          color={tokens.display}
          glowColor={tokens.displayGlow}
          size="medium"
          ampm={model.ampm}
          blinkColon
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
