import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { bit, chrome, motion } from '../../design-system/tokens';
import { PixelText } from '../../components/pixel/PixelText';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'fill' | 'ghost';
};

export function ChromeButton({ label, onPress, variant = 'fill' }: Props) {
  const fill = variant === 'fill';
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <View style={[styles.face, fill ? styles.faceFill : styles.faceGhost]}>
        <PixelText size="sm" color={fill ? bit.ink : bit.cyan}>
          {label}
        </PixelText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  face: {
    minHeight: chrome.hit,
    borderWidth: chrome.outline,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: bit.panel,
  },
  faceFill: {
    borderColor: bit.pink,
  },
  faceGhost: {
    borderColor: bit.cyan,
  },
  pressed: {
    opacity: motion.pressOpacity,
  },
});
