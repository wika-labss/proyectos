import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import { ChipSelect } from '../../src/components/ChipSelect';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { colors, fonts } from '../../src/constants/theme';
import {
  BATHROOM_TYPES,
  listStoolMeta,
  requiresStool,
  type BathroomType,
  type StoolCode,
} from '../../src/engine';
import { useCare } from '../../src/hooks/CareProvider';

export default function LogBathroomScreen() {
  const { logBathroom, error, clearError } = useCare();
  const [bathroomType, setBathroomType] = useState<BathroomType>('heces');
  const [stool, setStool] = useState<StoolCode | null>('firme');
  const needsStool = requiresStool(bathroomType);

  return (
    <Screen title="Registrar baño" showTabs={false}>
      <Text style={styles.label}>Tipo</Text>
      <ChipSelect
        options={BATHROOM_TYPES.map((t) => ({ value: t, label: t }))}
        value={bathroomType}
        onChange={setBathroomType}
      />
      {needsStool ? (
        <>
          <Text style={styles.label}>Consistencia de heces</Text>
          <ChipSelect
            options={listStoolMeta().map((m) => ({ value: m.code, label: m.label }))}
            value={stool}
            onChange={setStool}
          />
        </>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <PrimaryButton
        label="Guardar"
        onPress={() => {
          clearError();
          const ok = logBathroom({
            bathroomType,
            stool: needsStool ? stool ?? undefined : undefined,
          });
          if (ok) router.back();
        }}
      />
      <PrimaryButton label="Cancelar" variant="secondary" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: colors.text, fontWeight: fonts.weightBold, fontFamily: fonts.base },
  error: { color: colors.error, fontFamily: fonts.base },
});
