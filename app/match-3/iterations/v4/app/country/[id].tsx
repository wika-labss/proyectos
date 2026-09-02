import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { colors, fonts, spacing, typography } from '../../src/constants/theme';
import { getCountry, type CountryId } from '../../src/data/countries';
import { getLevel } from '../../src/data/levels';
import { useProgress } from '../../src/hooks/ProgressProvider';
import { NightScreen } from '../../src/modules/match3-visual/NightScreen';
import { PixelPanel } from '../../src/modules/match3-visual/PixelPanel';
import { isLevelUnlocked } from '../../src/modules/progress/progressStore';

export default function CountryLevelsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const country = getCountry(id ?? '');
  const { progress } = useProgress();

  if (!country) {
    return (
      <NightScreen>
        <View style={styles.center}>
          <Text style={styles.title}>País no encontrado</Text>
          <PrimaryButton label="Volver" onPress={() => router.back()} />
        </View>
      </NightScreen>
    );
  }

  return (
    <NightScreen>
      <SafeAreaView style={styles.root}>
        <Text style={styles.title}>{country.name.toUpperCase()}</Text>
        <Text style={styles.meta}>10 NIVELES · IMPARES FÁCIL · PARES MEDIA</Text>

        <ScrollView contentContainerStyle={styles.list}>
          {Array.from({ length: 10 }, (_, i) => {
            const unlocked = isLevelUnlocked(
              progress,
              country.id as CountryId,
              i,
            );
            const cfg = getLevel(country.id, i);
            const easy = cfg.difficulty === 'easy';
            return (
              <Pressable
                key={i}
                disabled={!unlocked}
                onPress={() => router.push(`/play/${country.id}/${i}`)}
              >
                <PixelPanel>
                  <View style={[styles.row, !unlocked && styles.locked]}>
                    <Text style={styles.rowText}>NIVEL {cfg.levelNumber}</Text>
                    <Text
                      style={[
                        styles.rowHint,
                        {
                          color: !unlocked
                            ? colors.muted
                            : easy
                              ? colors.amigos
                              : colors.coin,
                        },
                      ]}
                    >
                      {unlocked
                        ? `${easy ? 'FÁCIL' : 'MEDIA'} · ${cfg.minScore}`
                        : 'BLOQUEO'}
                    </Text>
                  </View>
                </PixelPanel>
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
    </NightScreen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontFamily: fonts.pixel,
    fontSize: typography.title,
    color: colors.star,
  },
  meta: {
    fontFamily: fonts.pixel,
    fontSize: 8,
    color: colors.muted,
    marginBottom: spacing.lg,
  },
  list: { gap: 10, paddingBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locked: { opacity: 0.45 },
  rowText: {
    color: colors.star,
    fontFamily: fonts.pixel,
    fontSize: typography.body,
  },
  rowHint: {
    fontFamily: fonts.pixel,
    fontSize: 8,
  },
});
