import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { play } from '../constants/theme';

type Props = {
  lives: number;
  score: number;
  level: number;
  statusLabel?: string;
};

export function Hud({ lives, score, level, statusLabel }: Props) {
  const hearts = Array.from({ length: 3 }, (_, i) => (i < lives ? '♥' : '♡')).join(' ');
  return (
    <View style={styles.row}>
      <Text style={styles.lives}>{hearts}</Text>
      <Text style={styles.score}>{score}</Text>
      <Text style={styles.level}>Nv {level}</Text>
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
    color: '#E74C3C',
    fontSize: 18,
    letterSpacing: 1,
    fontWeight: '700',
    minWidth: 72,
  },
  score: {
    color: play.hud,
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  level: {
    color: play.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  status: {
    position: 'absolute',
    right: 16,
    top: 36,
    color: play.hud,
    fontSize: 12,
    fontWeight: '600',
  },
});
