import { Link } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../src/modules/app-theme';
import { useProgressStore } from '../src/stores/progressStore';

/** home-branding — VISSIUSS + iconos puntaje / histórico / completados */
export default function HomeScreen() {
  const totalScore = useProgressStore((s) => s.totalScore);
  const completedCount = useProgressStore((s) => s.completedCount());
  const historyCount = useProgressStore((s) => (s.history ?? []).length);

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

      <View style={styles.iconsRow}>
        <View style={styles.iconCard}>
          <Text style={styles.iconGlyph}>★</Text>
          <Text style={styles.iconLabel}>Puntaje</Text>
          <Text style={styles.iconValue}>{totalScore}</Text>
        </View>
        <Link href="/history" asChild>
          <Pressable style={styles.iconCard}>
            <Text style={styles.iconGlyph}>☰</Text>
            <Text style={styles.iconLabel}>Histórico</Text>
            <Text style={styles.iconValue}>{historyCount}</Text>
          </Pressable>
        </Link>
        <View style={styles.iconCard}>
          <Text style={styles.iconGlyph}>✓</Text>
          <Text style={styles.iconLabel}>Completados</Text>
          <Text style={styles.iconValue}>{completedCount}/20</Text>
        </View>
      </View>

      <Link href="/levels" asChild>
        <Pressable style={styles.cta}>
          <Text style={styles.ctaText}>Jugar</Text>
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
    width: 180,
    height: 180,
    opacity: 0.18,
    position: 'absolute',
    top: 60,
  },
  brand: {
    color: colors.text,
    fontSize: typography.small,
    letterSpacing: 4,
    marginBottom: spacing.sm,
    fontWeight: '700',
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '700',
    marginBottom: spacing.lg,
  },
  iconsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.xl,
  },
  iconCard: {
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    width: 96,
    paddingVertical: 12,
    alignItems: 'center',
  },
  iconGlyph: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  iconLabel: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '600',
  },
  iconValue: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
    marginTop: 4,
  },
  cta: {
    borderWidth: 2,
    borderColor: colors.buttonBorder,
    backgroundColor: colors.buttonBg,
    paddingHorizontal: 40,
    paddingVertical: 14,
  },
  ctaText: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '700',
  },
});
