import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { ChipSelect } from '../src/components/ChipSelect';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import {
  dueStatus,
  getActivePet,
  PREVENTIVE_KINDS,
  toLocalDateKey,
  type PreventiveKind,
} from '../src/engine';
import { useCare } from '../src/hooks/CareProvider';

export default function PreventiveScreen() {
  const { state, addPreventive, removePreventive, error, clearError, todayKey } = useCare();
  const pet = getActivePet(state);
  const [kind, setKind] = useState<PreventiveKind>('vacuna');
  const [name, setName] = useState('');
  const [appliedAt, setAppliedAt] = useState(toLocalDateKey());
  const [nextDueAt, setNextDueAt] = useState('');

  if (!pet) {
    return (
      <Screen title="Preventivos" subtitle="Selecciona una mascota primero">
        <Text style={styles.muted}>Sin mascota activa.</Text>
      </Screen>
    );
  }

  const items = state.preventives.filter((p) => p.petId === pet.id);

  return (
    <Screen title="Vacunas y desparasitación" subtitle={pet.name}>
      {items.map((item) => {
        const status = dueStatus(item.nextDueAt, todayKey);
        return (
          <View key={item.id} style={styles.card}>
            <Text style={styles.name}>
              {item.kind} · {item.name}
            </Text>
            <Text style={styles.muted}>Aplicada: {item.appliedAt}</Text>
            {item.nextDueAt ? (
              <Text
                style={{
                  color:
                    status === 'overdue'
                      ? colors.error
                      : status === 'soon'
                        ? colors.warning
                        : colors.textMuted,
                  fontFamily: fonts.base,
                }}
              >
                Próxima: {item.nextDueAt} ({status})
              </Text>
            ) : null}
            <PrimaryButton
              label="Eliminar"
              variant="danger"
              onPress={() => removePreventive(item.id)}
            />
          </View>
        );
      })}

      <Text style={styles.section}>Agregar</Text>
      <ChipSelect
        options={PREVENTIVE_KINDS.map((k) => ({ value: k, label: k }))}
        value={kind}
        onChange={setKind}
      />
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nombre (ej. Antirrábica)"
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.label}>Fecha aplicada (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        value={appliedAt}
        onChangeText={setAppliedAt}
        autoCapitalize="none"
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.label}>Próxima (opcional)</Text>
      <TextInput
        style={styles.input}
        value={nextDueAt}
        onChangeText={setNextDueAt}
        autoCapitalize="none"
        placeholder="YYYY-MM-DD"
        placeholderTextColor={colors.textMuted}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        label="Guardar preventivo"
        onPress={() => {
          clearError();
          const ok = addPreventive({
            kind,
            name,
            appliedAt,
            nextDueAt: nextDueAt.trim() || undefined,
          });
          if (ok) {
            setName('');
            setNextDueAt('');
          }
        }}
      />
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
  name: {
    color: colors.text,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
  },
  muted: { color: colors.textMuted, fontFamily: fonts.base },
  section: {
    color: colors.text,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
    marginTop: spacing.sm,
  },
  label: { color: colors.text, fontFamily: fonts.base },
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
