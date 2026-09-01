import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { COUNTRIES } from '../src/data/countries';
import { useProgress } from '../src/hooks/ProgressProvider';
import {
  canTravelToNext,
  currentTravelCost,
  isCountryUnlocked,
} from '../src/modules/progress/progressStore';

export default function MapScreen() {
  const { progress, travel } = useProgress();
  const cost = currentTravelCost(progress);
  const canGo = canTravelToNext(progress);
  const current = COUNTRIES[progress.unlockedCountryIndex];

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>América — tu viaje</Text>
      <Text style={styles.meta}>
        Monedas: {progress.coins.toLocaleString('es')} · Viajar cuesta {cost}
        {progress.partnerId ? ' (pareja)' : ''}
      </Text>
      {current ? (
        <Text style={styles.meta}>
          {progress.countryCleared[current.id]
            ? `${current.name} completado`
            : `Jugando en ${current.name}`}
        </Text>
      ) : null}

      <ScrollView contentContainerStyle={styles.list}>
        {COUNTRIES.map((c) => {
          const unlocked = isCountryUnlocked(progress, c.order);
          const cleared = progress.countryCleared[c.id];
          return (
            <Pressable
              key={c.id}
              disabled={!unlocked}
              onPress={() => router.push(`/country/${c.id}`)}
              style={[styles.row, !unlocked && styles.locked]}
            >
              <Text style={styles.rowText}>
                {unlocked ? '●' : '○'} {c.name}
              </Text>
              <Text style={styles.rowHint}>
                {unlocked ? (cleared ? 'Listo' : 'Abrir') : `🔒 ${cost}`}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <PrimaryButton
        label={canGo ? `Viajar (−${cost})` : 'Viajar bloqueado'}
        disabled={!canGo}
        onPress={() => void travel()}
      />
      <PrimaryButton
        label="Volver"
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
  title: {
    fontFamily: fonts.brand,
    fontSize: 28,
    color: colors.textOnDark,
    marginBottom: 8,
  },
  meta: {
    fontFamily: fonts.body,
    color: colors.muted,
    marginBottom: 8,
  },
  list: {
    gap: 12,
    paddingBottom: spacing.lg,
    flexGrow: 1,
  },
  row: {
    backgroundColor: colors.accentSecondary,
    borderRadius: radius.md,
    padding: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locked: {
    backgroundColor: colors.locked,
    opacity: 0.7,
  },
  rowText: {
    color: colors.textOnDark,
    fontSize: 18,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  rowHint: {
    color: colors.textOnDark,
    fontFamily: fonts.body,
  },
});
