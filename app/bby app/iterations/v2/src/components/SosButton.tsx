import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import { colors, layout, typography } from '../constants/theme';

interface SosButtonProps {
  active: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export function SosButton({ active, disabled = false, onPress }: SosButtonProps) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!active) {
      pulse.setValue(1);
      return undefined;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.88, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [active, pulse]);

  return (
    <Pressable disabled={disabled} onPress={onPress} accessibilityRole="button" accessibilityLabel="Modo SOS">
      <Animated.View
        style={[
          styles.button,
          active && styles.buttonActive,
          disabled && styles.buttonDisabled,
          { transform: [{ scale: pulse }] },
        ]}
      >
        <Text style={styles.text}>SOS</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: layout.sosButtonHeight,
    borderRadius: layout.sosButtonHeight / 2,
    backgroundColor: colors.accent,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: colors.accentGlow,
    borderColor: colors.accentGlow,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  text: {
    ...typography.button,
    color: colors.button,
    letterSpacing: 3,
  },
});
