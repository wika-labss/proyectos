import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { useCare } from '../../src/hooks/CareProvider';

export default function LogNoteScreen() {
  const { logNote, error, clearError } = useCare();
  const [text, setText] = useState('');

  return (
    <Screen title="Nota del día" showTabs={false}>
      <Text style={styles.label}>Observación (máx. 280)</Text>
      <TextInput
        style={[styles.input, styles.area]}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={280}
        placeholder="Visitó al vet..."
        placeholderTextColor={colors.textMuted}
      />
      <Text style={styles.muted}>{text.length}/280</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        label="Guardar"
        onPress={() => {
          clearError();
          if (logNote({ text })) router.back();
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
  area: { minHeight: 120, textAlignVertical: 'top', paddingVertical: spacing.sm },
  muted: { color: colors.textMuted, fontFamily: fonts.base },
  error: { color: colors.error, fontFamily: fonts.base },
});
