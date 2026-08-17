import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

type Props = {
  score: number;
  level: number;
  gravityMs: number;
  statusLabel?: string;
};

export function Hud({ score, level, gravityMs, statusLabel }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.block}>
        <Text style={styles.label}>Score</Text>
        <Text style={styles.value}>{score}</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>Nivel</Text>
        <Text style={styles.value}>{level}</Text>
      </View>
      <View style={styles.block}>
        <Text style={styles.label}>Drop</Text>
        <Text style={styles.small}>{gravityMs}ms</Text>
      </View>
      {statusLabel ? <Text style={styles.status}>{statusLabel}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 8,
  },
  block: {
    gap: 2,
  },
  label: {
    color: colors.muted,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  value: {
    color: colors.accent,
    fontSize: 26,
    fontWeight: '800',
  },
  small: {
    color: colors.neonText,
    fontSize: 16,
    fontWeight: '700',
  },
  status: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
});
