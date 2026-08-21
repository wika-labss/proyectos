import { router } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, fonts, spacing } from '../src/constants/theme';
import { useProgress } from '../src/hooks/ProgressProvider';

export default function HomeScreen() {
  const { progress, ready } = useProgress();

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
        <Text style={styles.brand}>VISSIUSS</Text>
        <Text style={styles.subtitle}>Match-3 América</Text>
      </View>

      <View style={styles.actions}>
        <PrimaryButton label="Jugar" onPress={() => router.push('/map')} />
        <PrimaryButton
          label="Inventario"
          variant="secondary"
          onPress={() => router.push('/inventory')}
        />
      </View>

      <View style={styles.infoRow}>
        <InfoChip label="Puntaje" value={String(progress.totalScore)} />
        <InfoChip
          label="Histórico"
          value={String(progress.history.length)}
        />
        <InfoChip
          label="Recompensas"
          value={String(progress.inventory.length)}
        />
      </View>
    </SafeAreaView>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <Pressable style={styles.chip}>
      <Text style={styles.chipLabel}>{label}</Text>
      <Text style={styles.chipValue}>{value}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  hero: {
    marginTop: 48,
    alignItems: 'center',
  },
  brand: {
    fontFamily: fonts.brand,
    fontSize: 48,
    color: colors.textOnDark,
    letterSpacing: 2,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 18,
    color: colors.muted,
    marginTop: 8,
  },
  actions: {
    gap: spacing.md,
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    gap: 8,
  },
  chip: {
    flex: 1,
    backgroundColor: colors.backgroundAlt,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  chipLabel: {
    color: colors.muted,
    fontSize: 12,
    fontFamily: fonts.body,
  },
  chipValue: {
    color: colors.textOnDark,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    fontFamily: fonts.body,
  },
});
