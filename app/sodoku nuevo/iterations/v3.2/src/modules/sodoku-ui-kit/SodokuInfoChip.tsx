import React from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  ImageSourcePropType,
} from 'react-native';
import { colors, typography } from '../app-theme';
import { UiAssets } from './assets';

type ChipKind = 'puntaje' | 'historico' | 'regalos';

const sources: Record<ChipKind, ImageSourcePropType> = {
  puntaje: UiAssets.chipPuntaje,
  historico: UiAssets.chipHistorico,
  regalos: UiAssets.chipRegalos,
};

interface Props {
  kind: ChipKind;
  label: string;
  value: string | number;
  onPress?: () => void;
}

export function SodokuInfoChip({ kind, label, value, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${label} ${value}`}
    >
      <ImageBackground
        source={sources[kind]}
        style={styles.chip}
        imageStyle={styles.img}
        resizeMode="cover"
      >
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 96 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.97 }] },
  chip: {
    width: 96,
    height: 72,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  img: { borderRadius: 14 },
  label: {
    color: colors.active,
    fontSize: 10,
    fontWeight: '700',
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  value: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
});
