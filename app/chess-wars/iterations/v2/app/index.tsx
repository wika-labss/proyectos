import React from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, spacing, typography } from '../src/constants/theme';
import { useMeta } from '../src/hooks/MetaProvider';

export default function HomeScreen() {
  const { meta } = useMeta();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.glow} />
      <View style={styles.body}>
        <Text style={styles.brand}>AI CHESS WARS</Text>
        <Text style={styles.sub}>Evoluciona. Domina. Offline.</Text>
        <Text style={styles.meta}>
          Partidas {meta.gamesPlayed} · Victorias {meta.wins}
        </Text>
        <PrimaryButton label="Jugar" onPress={() => router.push('/lobby')} style={{ marginTop: spacing.xl }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  glow: {
    position: 'absolute',
    top: -60,
    left: -30,
    right: -30,
    height: 300,
    backgroundColor: colors.backgroundWarm,
    opacity: 0.55,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  brand: { ...typography.brand, color: colors.accent, textAlign: 'center' },
  sub: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  meta: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
