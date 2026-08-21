import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DatePager, EventList } from '../src/components/EventList';
import { Screen } from '../src/components/Screen';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import {
  getActivePet,
  getDaySummary,
  shiftDateKey,
  toLocalDateKey,
} from '../src/engine';
import { useCare } from '../src/hooks/CareProvider';

export default function HistoryScreen() {
  const { state, todayKey } = useCare();
  const [dateKey, setDateKey] = useState(todayKey);
  const pet = getActivePet(state);

  const day = useMemo(() => {
    if (!pet) return null;
    return getDaySummary(state, pet.id, dateKey);
  }, [state, pet, dateKey]);

  if (!pet || !day) {
    return (
      <Screen title="Histórico" subtitle="Selecciona una mascota primero">
        <Text style={styles.muted}>Sin mascota activa.</Text>
      </Screen>
    );
  }

  return (
    <Screen title="Histórico" subtitle={pet.name}>
      <DatePager
        dateKey={dateKey}
        onPrev={() => setDateKey((d) => shiftDateKey(d, -1))}
        onNext={() => setDateKey((d) => shiftDateKey(d, 1))}
      />
      {dateKey !== todayKey ? (
        <Text
          style={styles.link}
          onPress={() => setDateKey(toLocalDateKey())}
        >
          Ir a hoy
        </Text>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.summary}>
          Comidas {day.feedCount} · Baño {day.bathroomCount} · Paseos {day.walkCount}
          {day.noteCount ? ` · Notas ${day.noteCount}` : ''}
        </Text>
        {day.health ? (
          <Text style={styles.muted}>Estado: {day.health.status}</Text>
        ) : null}
      </View>

      <EventList events={day.events} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  summary: {
    color: colors.text,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: fonts.base,
  },
  link: {
    color: colors.accent,
    fontFamily: fonts.base,
    marginBottom: spacing.sm,
  },
});
