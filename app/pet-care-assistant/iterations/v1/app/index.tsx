import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Link, Redirect } from 'expo-router';
import { HealthBanner } from '../src/components/HealthBanner';
import { EventList } from '../src/components/EventList';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { StoolBadge } from '../src/components/StoolBadge';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import {
  ageFromBirthDate,
  dueStatus,
  formatAge,
  getActivePet,
  getDaySummary,
} from '../src/engine';
import { useCare } from '../src/hooks/CareProvider';

export default function HomeScreen() {
  const { ready, corrupt, state, error, resetCorrupt, todayKey } = useCare();

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (corrupt) {
    return (
      <Screen title="Pet Care Assistant" subtitle="Datos locales ilegibles" showTabs={false}>
        <Text style={styles.muted}>
          El almacenamiento local parece corrupto. Puedes reiniciar los datos del dispositivo.
        </Text>
        <PrimaryButton label="Reiniciar datos locales" variant="danger" onPress={resetCorrupt} />
      </Screen>
    );
  }

  if (state.pets.length === 0) {
    return <Redirect href="/pets/new" />;
  }

  const pet = getActivePet(state);
  if (!pet) {
    return <Redirect href="/pets" />;
  }

  const day = getDaySummary(state, pet.id, todayKey);
  const age = formatAge(ageFromBirthDate(pet.birthDate));
  const health = state.healthByPetId[pet.id];
  const alerts = state.preventives
    .filter((p) => p.petId === pet.id && p.nextDueAt)
    .map((p) => ({ item: p, status: dueStatus(p.nextDueAt, todayKey) }))
    .filter((x) => x.status !== 'ok');

  return (
    <Screen>
      <Text style={styles.brand}>Pet Care Assistant</Text>
      <Text style={styles.tagline}>El día de tu mascota, en un vistazo.</Text>

      <View style={styles.card}>
        <Text style={styles.petName}>
          {pet.name} · {pet.type} · {age}
        </Text>
        <Link href="/pets" style={styles.link}>
          Cambiar mascota
        </Link>
      </View>

      <HealthBanner health={health} />

      {alerts.map(({ item, status }) => (
        <View
          key={item.id}
          style={[
            styles.alert,
            { borderColor: status === 'overdue' ? colors.error : colors.warning },
          ]}
        >
          <Text style={styles.alertText}>
            {status === 'overdue' ? 'Vencido' : 'Próximo'} · {item.name} ({item.nextDueAt})
          </Text>
        </View>
      ))}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.section}>Hoy</Text>
        <Text style={styles.muted}>
          Comidas {day.feedCount} · Baño {day.bathroomCount} · Paseos {day.walkCount}
        </Text>
        {day.lastStool ? (
          <View style={styles.stoolRow}>
            <Text style={styles.muted}>Última heces:</Text>
            <StoolBadge code={day.lastStool} />
          </View>
        ) : null}
      </View>

      <View style={styles.quick}>
        <Link href="/log/feed" asChild>
          <PrimaryButton label="+ Comida" />
        </Link>
        <Link href="/log/bathroom" asChild>
          <PrimaryButton label="+ Baño" />
        </Link>
        <Link href="/log/walk" asChild>
          <PrimaryButton label="+ Paseo" />
        </Link>
        <Link href="/log/health" asChild>
          <PrimaryButton label="+ Salud" variant="secondary" />
        </Link>
        <Link href="/log/note" asChild>
          <PrimaryButton label="+ Nota" variant="secondary" />
        </Link>
        <Link href="/preventive" asChild>
          <PrimaryButton label="Vacunas" variant="secondary" />
        </Link>
      </View>

      <Text style={styles.section}>Actividad de hoy</Text>
      <EventList events={day.events} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  brand: {
    color: colors.text,
    fontSize: 28,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
  },
  tagline: {
    color: colors.textMuted,
    fontSize: fonts.sizeMd,
    marginBottom: spacing.sm,
    fontFamily: fonts.base,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  petName: {
    color: colors.text,
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
  },
  link: {
    color: colors.accent,
    fontSize: fonts.sizeSm,
    fontFamily: fonts.base,
  },
  section: {
    color: colors.text,
    fontSize: fonts.sizeMd,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
  },
  muted: {
    color: colors.textMuted,
    fontSize: fonts.sizeMd,
    fontFamily: fonts.base,
  },
  stoolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  quick: {
    gap: spacing.sm,
  },
  alert: {
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  alertText: {
    color: colors.text,
    fontFamily: fonts.base,
    fontSize: fonts.sizeSm,
  },
  error: {
    color: colors.error,
    fontFamily: fonts.base,
  },
});
