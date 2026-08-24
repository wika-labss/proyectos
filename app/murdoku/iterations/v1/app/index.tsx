import { router } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, fonts, spacing } from '../src/constants/theme';
import { useProgress } from '../src/hooks/ProgressProvider';

export default function HomeScreen() {
  const { ready } = useProgress();

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.hero}>
        <Text style={styles.brand}>Murdoku</Text>
        <Text style={styles.tagline}>Investiga. Coloca. Resuelve.</Text>
      </View>
      <PrimaryButton
        label="Entrar a la mansión"
        onPress={() => router.push('/map')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  hero: {
    marginTop: 72,
    gap: spacing.sm,
  },
  brand: {
    color: colors.accent,
    fontSize: 48,
    fontFamily: fonts.brand,
    fontWeight: '700',
  },
  tagline: {
    color: colors.textMuted,
    fontSize: 18,
    fontFamily: fonts.body,
  },
});
