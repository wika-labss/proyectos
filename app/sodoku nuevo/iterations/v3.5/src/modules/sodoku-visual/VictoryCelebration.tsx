import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography, fontWeight, radius, lineWidth } from '../../design-system';

interface Props {
  message: string;
  score: number;
  reward?: string | null;
}

/** Celebración V4 — jerarquía visual-expectation victory.png */
export function VictoryCelebration({ message, score, reward }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.hero}>¡FELICIDADES!</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.scoreLabel}>PUNTUACIÓN</Text>
      <Text style={styles.score}>{score.toLocaleString('es')}</Text>
      {reward ? (
        <View style={styles.rewardBox}>
          <Text style={styles.rewardIcon}>🎁</Text>
          <View style={styles.rewardTextCol}>
            <Text style={styles.rewardLabel}>REGALO GANADO</Text>
            <Text style={styles.rewardName}>{reward}</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: '100%', marginBottom: spacing.md },
  hero: {
    color: colors.accent,
    fontSize: 36,
    fontWeight: '900',
    textShadowColor: colors.white,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  message: {
    color: colors.active,
    fontSize: typography.subtitle,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  scoreLabel: {
    color: colors.active,
    fontSize: typography.small,
    fontWeight: '800',
    letterSpacing: 2,
  },
  score: {
    color: colors.accent,
    fontSize: typography.displaySm,
    fontWeight: '900',
    textShadowColor: colors.white,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
    marginVertical: spacing.sm,
  },
  rewardBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: lineWidth.medium,
    borderColor: colors.secondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minWidth: 260,
    marginTop: spacing.sm,
  },
  rewardIcon: { fontSize: 36 },
  rewardTextCol: { flex: 1 },
  rewardLabel: {
    color: colors.active,
    fontSize: typography.small,
    fontWeight: '800',
    letterSpacing: 1,
  },
  rewardName: {
    color: colors.accent,
    fontSize: typography.subtitle,
    fontWeight: '800',
    marginTop: 4,
  },
});
