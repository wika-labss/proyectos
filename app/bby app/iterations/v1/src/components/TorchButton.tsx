import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, layout, typography } from '../constants/theme';
import type { TorchMode } from '../types';

interface TorchButtonProps {
  mode: TorchMode;
  disabled?: boolean;
  onPress: () => void;
}

export function TorchButton({ mode, disabled = false, onPress }: TorchButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (mode === 'sos') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.04, duration: 500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 500, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }

    scale.setValue(1);
    return undefined;
  }, [mode, scale]);

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
  };

  const isOn = mode === 'on';
  const isSos = mode === 'sos';

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={isSos ? 'Desactivar SOS' : isOn ? 'Apagar linterna' : 'Encender linterna'}
    >
      <Animated.View
        style={[
          styles.button,
          isOn && styles.buttonOn,
          isSos && styles.buttonSos,
          disabled && styles.buttonDisabled,
          { transform: [{ scale }] },
        ]}
      >
        {isSos ? (
          <Text style={styles.sosText}>SOS</Text>
        ) : (
          <View style={styles.bolt}>
            <View style={[styles.boltStem, isOn && styles.boltStemOn]} />
            <View style={[styles.boltZig, isOn && styles.boltZigOn]} />
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: layout.torchButtonSize,
    height: layout.torchButtonSize,
    borderRadius: layout.torchButtonSize / 2,
    backgroundColor: colors.button,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  buttonOn: {
    borderColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 18,
  },
  buttonSos: {
    borderColor: colors.accentGlow,
    backgroundColor: colors.button,
    shadowColor: colors.accentGlow,
    shadowOpacity: 0.6,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  sosText: {
    ...typography.sos,
    color: colors.accent,
  },
  bolt: {
    width: 36,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltStem: {
    width: 4,
    height: 18,
    backgroundColor: colors.buttonText,
    transform: [{ rotate: '12deg' }],
    marginBottom: -4,
  },
  boltStemOn: {
    backgroundColor: colors.primary,
  },
  boltZig: {
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.buttonText,
    transform: [{ rotate: '12deg' }],
  },
  boltZigOn: {
    borderTopColor: colors.primary,
  },
});
