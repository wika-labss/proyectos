import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRESET_LABELS, colors, getPresetTokens } from '../constants/theme';
import type { ColorPreset } from '../types';

interface ColorPresetPickerProps {
  value: ColorPreset;
  onChange: (preset: ColorPreset) => void;
}

const PRESETS: ColorPreset[] = ['green', 'amber', 'cyan', 'red'];

export function ColorPresetPicker({ value, onChange }: ColorPresetPickerProps) {
  return (
    <View style={styles.wrap}>
      {PRESETS.map((preset) => {
        const token = getPresetTokens(preset);
        const selected = preset === value;
        return (
          <Pressable
            key={preset}
            accessibilityRole="button"
            accessibilityLabel={PRESET_LABELS[preset]}
            onPress={() => onChange(preset)}
            style={[
              styles.swatch,
              { backgroundColor: token.display },
              selected && styles.swatchSelected,
            ]}
          />
        );
      })}
    </View>
  );
}

export function ColorPresetLegend({ value }: { value: ColorPreset }) {
  return <Text style={styles.legend}>{PRESET_LABELS[value]}</Text>;
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: 10,
  },
  swatch: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: colors.textPrimary,
  },
  legend: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
