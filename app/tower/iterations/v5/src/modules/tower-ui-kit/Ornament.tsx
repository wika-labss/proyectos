import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fontWeight, spacing, typography } from '../../design-system/tokens';

type Props = {
  label: string;
  tone?: 'gold' | 'mist' | 'breach' | 'muted';
};

const TONE = {
  gold: colors.torchGold,
  mist: colors.mist,
  breach: colors.danger,
  muted: colors.muted,
} as const;

/** Gold/mist kicker with flanking rules + diamond — chrome-plates / heroes. */
export function OrnamentKicker({ label, tone = 'gold' }: Props) {
  const color = TONE[tone];
  return (
    <View style={styles.row}>
      <View style={[styles.rule, { backgroundColor: color }]} />
      <View style={[styles.diamond, { borderColor: color }]} />
      <Text style={[styles.label, { color }]}>{label}</Text>
      <View style={[styles.diamond, { borderColor: color }]} />
      <View style={[styles.rule, { backgroundColor: color }]} />
    </View>
  );
}

export function OrnamentSub({ label, tone = 'mist' }: { label: string; tone?: keyof typeof TONE }) {
  const color = TONE[tone];
  return (
    <View style={styles.subWrap}>
      <View style={styles.subRuleRow}>
        <View style={[styles.rule, { backgroundColor: color, opacity: 0.5 }]} />
        <View style={[styles.diamond, { borderColor: color }]} />
        <View style={[styles.rule, { backgroundColor: color, opacity: 0.5 }]} />
      </View>
      <Text style={[styles.sub, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    justifyContent: 'center',
    width: '100%',
  },
  rule: {
    flex: 1,
    height: 1,
    maxWidth: 72,
    opacity: 0.85,
  },
  diamond: {
    width: 6,
    height: 6,
    transform: [{ rotate: '45deg' }],
    borderWidth: 1,
  },
  label: {
    fontSize: typography.body,
    fontWeight: fontWeight.bold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  subWrap: { alignItems: 'center', gap: spacing.xs, width: '100%' },
  subRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    width: '70%',
  },
  sub: {
    fontSize: typography.sm,
    fontWeight: fontWeight.semibold,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});
