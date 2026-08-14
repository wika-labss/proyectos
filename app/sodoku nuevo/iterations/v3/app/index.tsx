import { Link } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { TOTAL_LEVELS } from '../src/constants/levels';
import { colors, spacing, typography } from '../src/modules/app-theme';
import { useProgressStore } from '../src/stores/progressStore';

/** home-branding V3 — Jugar / Inventario + info puntaje / histórico / regalos */
export default function HomeScreen() {
  const totalScore = useProgressStore((s) => s.totalScore);
  const giftsCount = useProgressStore((s) => s.giftsCount());
  const continueLevelId = useProgressStore((s) => s.continueLevelId());
  const historyCount = useProgressStore((s) => (s.history ?? []).length);
  const completedCount = useProgressStore((s) => s.completedCount());

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/vissiuss-logo.png')}
        style={styles.watermark}
        resizeMode="contain"
        accessibilityLabel="VISSIUSS"
      />
      <Text style={styles.brand}>VISSIUSS</Text>
      <Text style={styles.title}>Sodoku nuevo</Text>
      <Text style={styles.subtitle}>
        Nivel {continueLevelId} · {completedCount}/{TOTAL_LEVELS}
      </Text>

      <View style={styles.actions}>
        <Link href={`/game/${continueLevelId}`} asChild>
          <Pressable style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Jugar</Text>
          </Pressable>
        </Link>
        <Link href="/inventory" asChild>
          <Pressable style={styles.secondaryBtn}>
            <Text style={styles.secondaryBtnText}>Inventario</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.infoRow}>
        <Link href="/score" asChild>
          <Pressable style={styles.infoBtn}>
            <Text style={styles.infoLabel}>Puntaje</Text>
            <Text style={styles.infoValue}>{totalScore}</Text>
          </Pressable>
        </Link>
        <Link href="/history" asChild>
          <Pressable style={styles.infoBtn}>
            <Text style={styles.infoLabel}>Histórico</Text>
            <Text style={styles.infoValue}>{historyCount}</Text>
          </Pressable>
        </Link>
        <Link href="/inventory" asChild>
          <Pressable style={styles.infoBtn}>
            <Text style={styles.infoLabel}>Regalos</Text>
            <Text style={styles.infoValue}>{giftsCount}</Text>
          </Pressable>
        </Link>
      </View>

      <Link href="/levels" asChild>
        <Pressable style={styles.levelsLink}>
          <Text style={styles.levelsLinkText}>Ver todos los niveles</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  watermark: {
    width: 200,
    height: 200,
    opacity: 0.22,
    position: 'absolute',
    top: 48,
  },
  brand: {
    color: colors.active,
    fontSize: 22,
    letterSpacing: 6,
    marginBottom: spacing.sm,
    fontWeight: '800',
  },
  title: {
    color: colors.accent,
    fontSize: typography.title,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.text,
    fontSize: typography.small,
    marginBottom: spacing.lg,
  },
  actions: {
    width: '100%',
    maxWidth: 320,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  primaryBtn: {
    backgroundColor: colors.buttonBg,
    borderWidth: 2,
    borderColor: colors.buttonBorder,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: colors.buttonSecondaryBg,
    borderWidth: 2,
    borderColor: colors.buttonSecondaryBorder,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: colors.accent,
    fontSize: typography.body,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
  infoBtn: {
    borderWidth: 2,
    borderColor: colors.secondary,
    backgroundColor: colors.infoBg,
    width: 96,
    paddingVertical: 12,
    alignItems: 'center',
  },
  infoLabel: {
    color: colors.active,
    fontSize: 11,
    fontWeight: '700',
  },
  infoValue: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
    marginTop: 4,
  },
  levelsLink: { paddingVertical: 8 },
  levelsLinkText: {
    color: colors.active,
    fontSize: typography.small,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
