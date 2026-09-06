import React from 'react';
import { StyleSheet, View } from 'react-native';
import { bit } from '../constants/theme';
import { PixelText } from './pixel/PixelText';

type Props = {
  lives: number;
  score: number;
  level: number;
  statusLabel?: string;
  powerLabel?: string;
};

export function Hud({ lives, score, level, statusLabel, powerLabel }: Props) {
  const lifeMarks = Array.from({ length: Math.min(lives, 6) }, () => '*').join('');
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <PixelText size="xs" color={bit.red} style={styles.lives}>
          {lifeMarks || '-'}
        </PixelText>
        <PixelText size="sm" color={bit.gold} style={styles.score}>
          {score}
        </PixelText>
        <PixelText size="xs" color={bit.cyan}>
          LV {level}
        </PixelText>
      </View>
      {powerLabel ? (
        <PixelText size="xs" color={bit.gold} style={styles.center}>
          {powerLabel}
        </PixelText>
      ) : null}
      {statusLabel ? (
        <PixelText size="xs" color={bit.muted} style={styles.center}>
          {statusLabel}
        </PixelText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lives: {
    minWidth: 64,
  },
  score: {
    flex: 1,
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
  },
});
