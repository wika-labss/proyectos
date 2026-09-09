import React from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  colors,
  fontWeight,
  layout,
  motion,
  spacing,
  typography,
} from '../../design-system/tokens';
import { chromePause, chromePlaqueHud } from './assets';

type Props = {
  lives: number;
  gold: number;
  waveLabel: string;
  mapName: string;
  levelLabel: string;
  onPause: () => void;
};

export function HudPlaques({
  lives,
  gold,
  waveLabel,
  mapName,
  levelLabel,
  onPause,
}: Props) {
  return (
    <View style={styles.row}>
      <Plaque
        mark={<Text style={[styles.mark, { color: colors.danger }]}>{'\u2665'}</Text>}
        value={String(lives)}
        danger={lives <= 5}
      />
      <Plaque
        mark={<View style={styles.coin} />}
        value={String(gold)}
        gold
      />
      <Plaque caption="Oleada" value={waveLabel} />
      <Plaque caption={levelLabel} value={mapName} compact />
      <Pressable
        onPress={onPause}
        style={({ pressed }) => [styles.pauseHit, pressed && styles.pressed]}
        accessibilityLabel="Pausa"
      >
        <Image source={chromePause} style={styles.pauseImg} />
      </Pressable>
    </View>
  );
}

function Plaque({
  mark,
  value,
  caption,
  danger,
  gold,
  compact,
}: {
  mark?: React.ReactNode;
  value: string;
  caption?: string;
  danger?: boolean;
  gold?: boolean;
  compact?: boolean;
}) {
  return (
    <ImageBackground
      source={chromePlaqueHud}
      style={styles.block}
      imageStyle={styles.blockImg}
      resizeMode="stretch"
    >
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
      <View style={styles.valueRow}>
        {mark}
        <Text
          style={[
            styles.value,
            compact && styles.map,
            danger && { color: colors.danger },
            gold && { color: colors.torchGold },
          ]}
          numberOfLines={1}
        >
          {value}
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    minHeight: layout.hudHeight,
  },
  block: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    justifyContent: 'center',
  },
  blockImg: {},
  caption: {
    color: colors.muted,
    fontSize: typography.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    color: colors.mist,
    fontSize: typography.subtitle,
    fontWeight: fontWeight.extrabold,
    flexShrink: 1,
  },
  map: { fontSize: typography.sm, fontWeight: fontWeight.semibold },
  mark: { fontSize: typography.subtitle, fontWeight: fontWeight.black },
  coin: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.torchGold,
  },
  pauseHit: {
    width: layout.touchMin,
    height: layout.touchMin,
  },
  pauseImg: { width: '100%', height: '100%' },
  pressed: { opacity: motion.pressOpacity },
});
