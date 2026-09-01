import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { getCountry, type CountryId } from '../../src/data/countries';
import { getLevel } from '../../src/data/levels';
import { useProgress } from '../../src/hooks/ProgressProvider';
import { isLevelUnlocked } from '../../src/modules/progress/progressStore';

export default function CountryLevelsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const country = getCountry(id ?? '');
  const { progress } = useProgress();

  if (!country) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>País no encontrado</Text>
        <PrimaryButton label="Volver" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>{country.name}</Text>
      <Text style={styles.meta}>10 niveles · impares Fácil · pares Media</Text>

      <ScrollView contentContainerStyle={styles.list}>
        {Array.from({ length: 10 }, (_, i) => {
          const unlocked = isLevelUnlocked(
            progress,
            country.id as CountryId,
            i,
          );
          const cfg = getLevel(country.id, i);
          return (
            <Pressable
              key={i}
              disabled={!unlocked}
              onPress={() =>
                router.push(`/play/${country.id}/${i}`)
              }
              style={[styles.row, !unlocked && styles.locked]}
            >
              <Text style={styles.rowText}>Nivel {cfg.levelNumber}</Text>
              <Text style={styles.rowHint}>
                {unlocked
                  ? `${cfg.difficulty === 'easy' ? 'Fácil' : 'Media'} · ${cfg.minScore}`
                  : '🔒'}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <PrimaryButton
        label="Volver al mapa"
        variant="ghost"
        onPress={() => router.back()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontFamily: fonts.brand,
    fontSize: 28,
    color: colors.textOnDark,
  },
  meta: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  list: { gap: 10, paddingBottom: spacing.lg },
  row: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  locked: { opacity: 0.45 },
  rowText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    fontWeight: '600',
  },
  rowHint: {
    color: colors.text,
    fontFamily: fonts.body,
  },
});
