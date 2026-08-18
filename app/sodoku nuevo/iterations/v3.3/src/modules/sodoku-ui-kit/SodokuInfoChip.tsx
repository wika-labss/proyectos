import React from 'react';
import {
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  ImageSourcePropType,
} from 'react-native';
import {
  colors,
  typography,
  fontWeight,
  layout,
  radius,
  interaction,
} from '../../design-system';
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

/** SodokuInfoChip — spec: design-system/components/sodoku-ui-kit/sodoku-info-chip */
export function SodokuInfoChip({ kind, label, value, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        pressed && {
          opacity: interaction.chipPressedOpacity,
          transform: [{ scale: interaction.chipPressedScale }],
        },
      ]}
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
  wrap: { width: layout.chipWidth },
  chip: {
    width: layout.chipWidth,
    height: layout.chipHeight,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  img: { borderRadius: radius.lg },
  label: {
    color: colors.active,
    fontSize: typography.xs,
    fontWeight: '700',
    textShadowColor: colors.white,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 2,
  },
  value: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
  },
});
