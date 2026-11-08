import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { retro } from '../constants/theme';

type Props = {
  lives: number;
  score: number;
  level: number;
  statusLabel?: string;
};

export function Hud({ lives, score, level, statusLabel }: Props) {
  const hearts = '♥'.repeat(Math.max(0, lives)) + '♡'.repeat(Math.max(0, 3 - lives));
  return (
    <View style={styles.row}>
      <Text style={styles.item}>{hearts}</Text>
      <Text style={styles.item}>Nv {level + 1}</Text>
      <Text style={styles.score}>{score}</Text>
      {statusLabel ? <Text style={styles.status}>{statusLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  item: {
    color: retro.hud,
    fontSize: 16,
    fontWeight: '700',
    minWidth: 64,
  },
  score: {
    color: retro.accent,
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    textAlign: 'right',
  },
  status: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 42,
    textAlign: 'center',
    color: retro.danger,
    fontWeight: '700',
    fontSize: 14,
  },
});
