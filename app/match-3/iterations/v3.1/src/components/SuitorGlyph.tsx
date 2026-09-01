import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts, slotColors } from '../constants/theme';
import type { SuitorSlot } from '../data/suitors';

type Props = {
  name: string;
  slot: SuitorSlot;
  size?: number;
};

export function SuitorGlyph({ name, slot, size = 44 }: Props) {
  const initial = name.charAt(0).toUpperCase();
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: slotColors[slot],
        },
      ]}
    >
      <Text style={[styles.letter, { fontSize: size * 0.42 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: colors.textOnDark,
    fontFamily: fonts.pixel,
    fontWeight: '700',
  },
});
