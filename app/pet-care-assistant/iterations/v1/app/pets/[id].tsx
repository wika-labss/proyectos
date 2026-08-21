import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link, useLocalSearchParams } from 'expo-router';
import { HealthBanner } from '../../src/components/HealthBanner';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { ageFromBirthDate, formatAge } from '../../src/engine';
import { useCare } from '../../src/hooks/CareProvider';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, selectPet } = useCare();
  const pet = state.pets.find((p) => p.id === id);

  if (!pet) {
    return (
      <Screen title="Mascota" subtitle="No encontrada">
        <Link href="/pets" asChild>
          <PrimaryButton label="Volver" />
        </Link>
      </Screen>
    );
  }

  const age = formatAge(ageFromBirthDate(pet.birthDate));
  const health = state.healthByPetId[pet.id];

  return (
    <Screen title={pet.name} subtitle={`${pet.type} · ${age}`}>
      <View style={styles.card}>
        <Text style={styles.line}>Sexo: {pet.sex}</Text>
        <Text style={styles.line}>
          Nacimiento: {pet.birthDate}
          {pet.birthDateEstimated ? ' (estimado)' : ''}
        </Text>
        {pet.weightKg != null ? <Text style={styles.line}>Peso: {pet.weightKg} kg</Text> : null}
        {pet.breed ? <Text style={styles.line}>Raza: {pet.breed}</Text> : null}
      </View>

      <HealthBanner health={health} />

      <PrimaryButton
        label="Usar esta mascota"
        onPress={() => {
          selectPet(pet.id);
        }}
      />
      <Link href="/preventive" asChild>
        <PrimaryButton label="Vacunas / desparasitación" variant="secondary" />
      </Link>
      <Link href="/log/health" asChild>
        <PrimaryButton label="Actualizar salud" variant="secondary" />
      </Link>
      <Link href="/pets" asChild>
        <PrimaryButton label="Todas las mascotas" variant="secondary" />
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
    gap: spacing.xs,
  },
  line: {
    color: colors.text,
    fontFamily: fonts.base,
    fontSize: fonts.sizeMd,
  },
});
