import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ChipSelect } from '../../src/components/ChipSelect';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { FOOD_TYPES, type FoodType } from '../../src/engine';
import { useCare } from '../../src/hooks/CareProvider';

export default function LogFeedScreen() {
  const { logFeed, error, clearError } = useCare();
  const [foodType, setFoodType] = useState<FoodType>('seco');
  const [amount, setAmount] = useState('');

  return (
    <Screen title="Registrar comida" showTabs={false}>
      <Text style={styles.label}>Tipo de alimento</Text>
      <ChipSelect
        options={FOOD_TYPES.map((t) => ({ value: t, label: t }))}
        value={foodType}
        onChange={setFoodType}
      />
      <Text style={styles.label}>Cantidad (opcional)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="1 taza"
        placeholderTextColor={colors.textMuted}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        label="Guardar"
        onPress={() => {
          clearError();
          if (logFeed({ foodType, amountLabel: amount || undefined })) router.back();
        }}
      />
      <PrimaryButton label="Cancelar" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: fonts.weightBold, fontFamily: fonts.base },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
    fontFamily: fonts.base,
  },
  error: { color: colors.error, fontFamily: fonts.base },
});
