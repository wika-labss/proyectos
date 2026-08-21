import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ChipSelect } from '../../src/components/ChipSelect';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import {
  HEALTH_STATUSES,
  SYMPTOMS,
  type HealthStatus,
  type Symptom,
} from '../../src/engine';
import { useCare } from '../../src/hooks/CareProvider';

export default function LogHealthScreen() {
  const { setHealth, error, clearError } = useCare();
  const [status, setStatus] = useState<HealthStatus>('enfermo');
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [notes, setNotes] = useState('');

  const toggle = (s: Symptom) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  return (
    <Screen title="Estado de salud" showTabs={false}>
      <Text style={styles.disclaimer}>
        Registro del cuidador. No sustituye consulta veterinaria.
      </Text>
      <Text style={styles.label}>Estado</Text>
      <ChipSelect
        options={HEALTH_STATUSES.map((s) => ({ value: s, label: s.replace('_', ' ') }))}
        value={status}
        onChange={setStatus}
      />
      {status !== 'sano' ? (
        <>
          <Text style={styles.label}>Síntomas</Text>
          <ChipSelect
            options={SYMPTOMS.map((s) => ({ value: s, label: s.replace('_', ' ') }))}
            value={null}
            onChange={() => undefined}
            multi
            values={symptoms}
            onToggle={toggle}
          />
        </>
      ) : null}
      <Text style={styles.label}>Notas (opcional)</Text>
      <TextInput
        style={styles.input}
        value={notes}
        onChangeText={setNotes}
        placeholder="Observaciones"
        placeholderTextColor={colors.textMuted}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        label="Guardar"
        onPress={() => {
          clearError();
          if (setHealth({ status, symptoms, notes: notes || undefined })) router.back();
        }}
      />
      <PrimaryButton label="Cancelar" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  disclaimer: {
    color: colors.textMuted,
    fontFamily: fonts.base,
    fontSize: fonts.sizeSm,
  },
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
