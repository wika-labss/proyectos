import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { useCare } from '../../src/hooks/CareProvider';

export default function LogWalkScreen() {
  const { logWalk, error, clearError } = useCare();
  const [duration, setDuration] = useState('30');
  const [note, setNote] = useState('');

  return (
    <Screen title="Registrar paseo" showTabs={false}>
      <Text style={styles.label}>Duración (minutos, opcional)</Text>
      <TextInput
        style={styles.input}
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
        placeholder="30"
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.label}>Nota (opcional)</Text>
      <TextInput
        style={styles.input}
        value={note}
        onChangeText={setNote}
        placeholder="Parque"
        placeholderTextColor={colors.textMuted}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        label="Guardar"
        onPress={() => {
          clearError();
          const n = duration.trim() ? Number(duration) : undefined;
          if (
            logWalk({
              durationMin: n,
              note: note || undefined,
            })
          ) {
            router.back();
          }
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
