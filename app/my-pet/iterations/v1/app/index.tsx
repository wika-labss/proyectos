import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { unseenCount } from '../src/engine';
import { usePets } from '../src/hooks/PetProvider';

export default function HomeScreen() {
  const { ready, pets, alerts, error, unseen, refresh } = usePets();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <Screen
      title="my Pet"
      subtitle="Placa QR para volver a casa"
      unseen={unseen}
    >
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {pets.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.muted}>
            Aún no hay mascotas. Registra la primera o abre la semilla Luna desde la web de prueba
            (token demo-luna).
          </Text>
        </View>
      ) : (
        pets.map((pet) => {
          const count = unseenCount({ pets, alerts }, pet.id);
          return (
            <Pressable
              key={pet.id}
              onPress={() => router.push(`/pet/${pet.id}`)}
              style={styles.card}
            >
              <Text style={styles.petName}>
                {pet.name} · {pet.species}
              </Text>
              <Text style={styles.muted}>{pet.address}</Text>
              {count > 0 ? (
                <Text style={styles.badge}>
                  {count} alerta{count === 1 ? '' : 's'} nueva{count === 1 ? '' : 's'}
                </Text>
              ) : (
                <Text style={styles.muted}>Casa {pet.homeLat.toFixed(4)}, {pet.homeLng.toFixed(4)}</Text>
              )}
            </Pressable>
          );
        })
      )}

      <PrimaryButton
        label="+ Registrar mascota"
        onPress={() => router.push('/register')}
      />
      <PrimaryButton
        label={busy ? 'Actualizando…' : 'Actualizar ahora'}
        variant="secondary"
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          await refresh();
          setBusy(false);
        }}
      />
      <Link href="/alerts" style={styles.link}>
        Ver alertas de hallazgo
      </Link>
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
  muted: {
    color: colors.textMuted,
    fontSize: fonts.sizeMd,
    fontFamily: fonts.base,
  },
  badge: {
    color: colors.alert,
    fontFamily: fonts.base,
    fontWeight: fonts.weightBold,
  },
  error: { color: colors.error, fontFamily: fonts.base },
  link: {
    color: colors.accent,
    fontFamily: fonts.base,
    fontSize: fonts.sizeMd,
  },
});
