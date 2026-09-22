import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { AvatarId } from '../../constants/avatars';
import { bit, chrome } from '../../design-system/tokens';
import { PixelText } from '../../components/pixel/PixelText';
import { AvatarPortrait } from './AvatarPortrait';

type Props = {
  avatarId: AvatarId;
  lives: number;
  score: number;
  level: number;
  statusLabel?: string;
  powerLabel?: string;
};

export function HudChip({ avatarId, lives, score, level, statusLabel, powerLabel }: Props) {
  const lifeMarks = Array.from({ length: Math.min(lives, 6) }, () => '*').join('');
  return (
    <View style={styles.wrap}>
      <View style={styles.chip}>
        <AvatarPortrait id={avatarId} cell={chrome.avatarHudCell} />
        <View style={styles.meta}>
          <View style={styles.row}>
            <PixelText size="xs" color={bit.hot} style={styles.lives}>
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
            <PixelText size="xs" color={bit.pink} style={styles.center}>
              {powerLabel}
            </PixelText>
          ) : null}
          {statusLabel ? (
            <PixelText size="xs" color={bit.muted} style={styles.center}>
              {statusLabel}
            </PixelText>
          ) : null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: chrome.hit,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: bit.panel,
    borderWidth: chrome.outline,
    borderColor: bit.outline,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  lives: {
    minWidth: 56,
  },
  score: {
    flex: 1,
    textAlign: 'center',
  },
  center: {
    textAlign: 'center',
  },
});
