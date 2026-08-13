import { Link } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../src/modules/app-theme';
import { useProgressStore } from '../src/stores/progressStore';

/** home-branding — marca de agua VISSIUSS */
export default function HomeScreen() {
  const totalScore = useProgressStore((s) => s.totalScore);

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
      <Text style={styles.score}>Puntaje total: {totalScore}</Text>
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
    top: 80,
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
    marginBottom: spacing.md,
  },
  score: {
    color: colors.text,
    fontSize: typography.body,
    marginBottom: spacing.xl,
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
