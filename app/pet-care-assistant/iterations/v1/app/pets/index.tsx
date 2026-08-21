import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { ageFromBirthDate, formatAge } from '../../src/engine';
import { useCare } from '../../src/hooks/CareProvider';

export default function PetsScreen() {
  const { state, selectPet, deletePet, error } = useCare();

  return (
    <Screen title="Mascotas" subtitle="Selecciona o crea una ficha">
      {state.pets.map((pet) => {
        const active = state.activePetId === pet.id;
        const age = formatAge(ageFromBirthDate(pet.birthDate));
        return (
          <View key={pet.id} style={[styles.card, active && styles.active]}>
            <Pressable
              onPress={() => {
                selectPet(pet.id);
                router.push(`/pets/${pet.id}`);
              }}
            >
              <Text style={styles.name}>
                {pet.name} {active ? '· activa' : ''}
              </Text>
              <Text style={styles.meta}>
                {pet.type} · {age}
                {pet.weightKg != null ? ` · ${pet.weightKg} kg` : ''}
              </Text>
            </Pressable>
            <View style={styles.row}>
              <PrimaryButton
                label="Usar"
                variant="secondary"
                onPress={() => {
                  selectPet(pet.id);
                  router.replace('/');
                }}
              />
              <PrimaryButton
                label="Eliminar"
                variant="danger"
                onPress={() => deletePet(pet.id)}
              />
            </View>
          </View>
        );
      })}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Link href="/pets/new" asChild>
        <PrimaryButton label="Nueva mascota" />
      </Link>
      <Link href="/preventive" asChild>
        <PrimaryButton label="Vacunas / desparasitación" variant="secondary" />
      </Link>
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
    gap: spacing.sm,
  },
  active: {
    borderColor: colors.accent,
  },
  name: {
    color: colors.text,
    fontWeight: fonts.weightBold,
    fontSize: fonts.sizeMd,
    fontFamily: fonts.base,
  },
  meta: {
    color: colors.textMuted,
    fontFamily: fonts.base,
  },
  row: { flexDirection: 'row', gap: spacing.sm },
  error: { color: colors.error, fontFamily: fonts.base },
});
