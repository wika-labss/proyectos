import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { ChipSelect } from '../../src/components/ChipSelect';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { PET_TYPES, type PetSex, type PetType, toLocalDateKey } from '../../src/engine';
import { useCare } from '../../src/hooks/CareProvider';

const SEX_OPTIONS: { value: PetSex; label: string }[] = [
  { value: 'macho', label: 'Macho' },
  { value: 'hembra', label: 'Hembra' },
  { value: 'desconocido', label: 'N/D' },
];

export default function NewPetScreen() {
  const { createPet, error, clearError, state } = useCare();
  const [name, setName] = useState('');
  const [type, setType] = useState<PetType>('perro');
  const [sex, setSex] = useState<PetSex>('desconocido');
  const [birthDate, setBirthDate] = useState('2023-01-01');
  const [weight, setWeight] = useState('');
  const [estimated, setEstimated] = useState(false);

  const onSave = () => {
    clearError();
    const weightKg = weight.trim() ? Number(weight.replace(',', '.')) : undefined;
    const ok = createPet({
      name,
      type,
      sex,
      birthDate,
      birthDateEstimated: estimated,
      weightKg: weightKg != null && Number.isFinite(weightKg) ? weightKg : undefined,
    });
    if (ok) router.replace('/');
  };

  return (
    <Screen
      title="Nueva mascota"
      subtitle="Ficha básica para empezar el registro diario"
      showTabs={state.pets.length > 0}
    >
      <Text style={styles.label}>Nombre</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ej. Luna"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={styles.label}>Tipo</Text>
      <ChipSelect
        options={PET_TYPES.map((t) => ({ value: t, label: t }))}
        value={type}
        onChange={setType}
      />

      <Text style={styles.label}>Sexo</Text>
      <ChipSelect options={SEX_OPTIONS} value={sex} onChange={setSex} />

      <Text style={styles.label}>Fecha de nacimiento (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder={toLocalDateKey()}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
      />
      <PrimaryButton
        label={estimated ? 'Fecha estimada: sí' : 'Fecha estimada: no'}
        variant="secondary"
        onPress={() => setEstimated((v) => !v)}
      />

      <Text style={styles.label}>Peso kg (opcional)</Text>
      <TextInput
        style={styles.input}
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
        placeholder="12.4"
        placeholderTextColor={colors.textMuted}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton label="Guardar mascota" onPress={onSave} />
      {state.pets.length > 0 ? (
        <PrimaryButton label="Cancelar" variant="secondary" onPress={() => router.back()} />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: {
    color: colors.text,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.base,
    fontSize: fonts.sizeMd,
  },
  error: { color: colors.error, fontFamily: fonts.base },
});
