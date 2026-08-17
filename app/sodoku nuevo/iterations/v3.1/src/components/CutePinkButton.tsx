import React from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  ViewStyle,
} from 'react-native';
import { colors, typography } from '../modules/app-theme';

const BTN = require('../../assets/recursos/btn_002_cute_pink.png');

interface Props {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  compact?: boolean;
}

/** Botón gráfico Cute Pink (recursos/buttons/btn_002_cute_pink.png) */
export function CutePinkButton({ label, onPress, style, compact }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, style, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <ImageBackground
        source={BTN}
        style={[styles.btn, compact && styles.btnCompact]}
        imageStyle={styles.btnImage}
        resizeMode="stretch"
      >
        <Text style={[styles.label, compact && styles.labelCompact]}>{label}</Text>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  pressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
  btn: {
    width: '100%',
    height: 72,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  btnCompact: {
    height: 56,
    paddingHorizontal: 36,
  },
  btnImage: {
    borderRadius: 28,
  },
  label: {
    color: colors.textOnPink,
    fontSize: typography.subtitle,
    fontWeight: '800',
    textShadowColor: 'rgba(90,42,58,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  labelCompact: {
    fontSize: typography.body,
  },
});
