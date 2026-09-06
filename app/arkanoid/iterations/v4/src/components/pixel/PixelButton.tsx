import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { bit } from '../../constants/theme';
import { PixelText } from './PixelText';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'fill' | 'ghost';
};

export function PixelButton({ label, onPress, variant = 'fill' }: Props) {
  const fill = variant === 'fill';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View style={[styles.shadow, fill ? styles.shadowFill : styles.shadowGhost]}>
        <View style={[styles.face, fill ? styles.faceFill : styles.faceGhost]}>
          <PixelText size="sm" color={fill ? bit.night : bit.gold}>
            {label}
          </PixelText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.75,
    transform: [{ translateY: 2 }],
  },
  shadow: {
    borderWidth: 3,
    paddingBottom: 3,
  },
  shadowFill: {
    borderColor: '#5C3C00',
    backgroundColor: '#5C3C00',
  },
  shadowGhost: {
    borderColor: bit.gold,
    backgroundColor: bit.night,
  },
  face: {
    borderWidth: 3,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  faceFill: {
    borderColor: bit.gold,
    backgroundColor: bit.gold,
  },
  faceGhost: {
    borderColor: bit.gold,
    backgroundColor: bit.panel,
  },
});
