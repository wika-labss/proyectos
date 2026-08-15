import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

type Props = {
  lives: number;
  score: number;
  statusLabel?: string;
};

export function Hud({ lives, score, statusLabel }: Props) {
  const hearts = Array.from({ length: 3 }, (_, i) => (i < lives ? '♥' : '♡')).join('');
  return (
    <View style={styles.row}>
      <Text style={styles.lives}>{hearts}</Text>
      <Text style={styles.score}>Score {score}</Text>
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
    paddingVertical: 8,
    gap: 8,
  },
  lives: {
    color: colors.danger,
    fontSize: 22,
    letterSpacing: 2,
    fontWeight: '700',
  },
  score: {
    color: colors.accent,
    fontSize: 18,
    fontWeight: '700',
  },
  status: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
  },
});
