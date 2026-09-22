import React from 'react';
import { StyleSheet, View } from 'react-native';
import { AVATAR_PIXELS, type AvatarId } from '../../constants/avatars';
import { bit, chrome } from '../../design-system/tokens';

const CELL_COLOR = {
  '0': 'transparent',
  '1': bit.night,
  '2': bit.panel,
  '3': bit.peach,
  '4': bit.ink,
  '5': bit.cyan,
  '6': bit.pink,
  '7': bit.gold,
} as const;

type Props = {
  id: AvatarId;
  cell?: number;
};

export function AvatarPortrait({ id, cell = chrome.avatarCell }: Props) {
  const rows = AVATAR_PIXELS[id];
  const size = 12 * cell;
  return (
    <View style={[styles.frame, { width: size, height: size, borderWidth: chrome.hairline }]}>
      {rows.map((row, y) => (
        <View key={y} style={styles.row}>
          {row.split('').map((ch, x) => (
            <View
              key={`${y}-${x}`}
              style={{
                width: cell,
                height: cell,
                backgroundColor: CELL_COLOR[ch as keyof typeof CELL_COLOR] ?? 'transparent',
              }}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderColor: bit.outline,
    backgroundColor: bit.panel,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
  },
});
