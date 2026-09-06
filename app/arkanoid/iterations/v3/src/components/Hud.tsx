import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { play } from '../constants/theme';

type Props = {
  lives: number;
  score: number;
  level: number;
  statusLabel?: string;
  powerLabel?: string;
};

export function Hud({ lives, score, level, statusLabel, powerLabel }: Props) {
  const hearts =
    lives <= 3
      ? Array.from({ length: 3 }, (_, i) => (i < lives ? '♥' : '♡')).join(' ')
      : `♥ × ${lives}`;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.lives}>{hearts}</Text>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.level}>Nv {level}</Text>
      </View>
      {powerLabel ? <Text style={styles.power}>{powerLabel}</Text> : null}
      {statusLabel ? <Text style={styles.status}>{statusLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  power: {
    marginTop: 4,
    color: play.hud,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  status: {
    marginTop: 2,
    color: play.hud,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});
