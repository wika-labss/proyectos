import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../constants/theme';
import type { TorchMode } from '../types';

interface StatusIndicatorProps {
  mode: TorchMode;
}

const LABELS: Record<TorchMode, string> = {
  off: 'APAGADA',
  on: 'ENCENDIDA',
  sos: 'SOS ACTIVO',
};

export function StatusIndicator({ mode }: StatusIndicatorProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (mode !== 'sos') {
      opacity.setValue(1);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.35, duration: 500, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [mode, opacity]);

  const dotColor = mode === 'sos' ? colors.accentGlow : mode === 'on' ? colors.primary : colors.textSecondary;
  const textColor = mode === 'sos' ? colors.accentGlow : mode === 'on' ? colors.primary : colors.textSecondary;

  return (
    <Animated.View style={[styles.container, mode === 'sos' && { opacity }]}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[styles.text, { color: textColor }]}>{LABELS[mode]}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  text: {
    ...typography.label,
    letterSpacing: 2,
    fontWeight: '600',
  },
});
