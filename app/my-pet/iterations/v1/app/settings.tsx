import React, { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { usePets } from '../src/hooks/PetProvider';

export default function SettingsScreen() {
  const { apiBaseUrl, setApiBaseUrl, error, unseen, refresh } = usePets();
  const [url, setUrl] = useState(apiBaseUrl);
  const [saved, setSaved] = useState(false);

  return (
    <Screen
      title="Ajustes"
      subtitle="URL de la web de prueba (API + landing QR)"
      unseen={unseen}
    >
      <Text style={styles.muted}>
        En el emulador Android usa http://10.0.2.2:8787. En un teléfono físico, la IP LAN de tu
        máquina. En este entorno: http://127.0.0.1:8787
      </Text>
      <TextInput
        style={styles.input}
        value={url}
        onChangeText={(v) => {
          setUrl(v);
          setSaved(false);
        }}
        autoCapitalize="none"
        autoCorrect={false}
        placeholder="http://127.0.0.1:8787"
        placeholderTextColor={colors.textMuted}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {saved ? <Text style={styles.ok}>URL guardada. Polling reiniciado.</Text> : null}
      <PrimaryButton
        label="Guardar URL"
        onPress={async () => {
          const ok = await setApiBaseUrl(url);
          if (ok) {
            setSaved(true);
            await refresh();
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  muted: {
    color: colors.textMuted,
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
  ok: { color: colors.accent, fontFamily: fonts.base, fontWeight: fonts.weightBold },
});
