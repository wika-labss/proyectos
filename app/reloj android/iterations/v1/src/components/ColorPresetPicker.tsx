import React, { useState } from 'react';
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
          <PresetSwatch
            key={preset}
            label={PRESET_LABELS[preset]}
            color={token.display}
            glowColor={token.displayGlow}
            selected={selected}
            onPress={() => onChange(preset)}
          />
        );
      })}
    </View>
  );
}

function PresetSwatch({
  label,
  color,
  glowColor,
  selected,
  onPress,
}: {
  label: string;
  color: string;
  glowColor: string;
  selected: boolean;
  onPress: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        styles.swatch,
        { backgroundColor: color, shadowColor: glowColor },
        selected && styles.swatchSelected,
        pressed && styles.swatchPressed,
      ]}
    />
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },
  swatchSelected: {
    borderColor: colors.textPrimary,
  },
  swatchPressed: {
    transform: [{ scale: 0.97 }],
  },
  legend: {
    marginTop: 8,
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
  },
});
