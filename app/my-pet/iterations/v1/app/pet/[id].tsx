import React from 'react';
import { Image, Share, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { Screen } from '../../src/components/Screen';
import { colors, fonts, radius, spacing } from '../../src/constants/theme';
import { buildPrintUrl, buildPublicUrl, buildQrPngUrl } from '../../src/engine';
import { usePets } from '../../src/hooks/PetProvider';

export default function PetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { pets, apiBaseUrl, unseen } = usePets();
  const router = useRouter();
  const pet = pets.find((p) => p.id === id);

  if (!pet) {
    return (
      <Screen title="Mascota" subtitle="No está en la lista cargada" unseen={unseen}>
        <PrimaryButton label="Volver" variant="secondary" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  const publicUrl = buildPublicUrl(apiBaseUrl, pet.publicToken);
  const printUrl = buildPrintUrl(apiBaseUrl, pet.publicToken);
  const qrUrl = buildQrPngUrl(apiBaseUrl, pet.publicToken);

  return (
    <Screen title={pet.name} subtitle={`${pet.species} · casa registrada`} unseen={unseen}>
      <View style={styles.card}>
        <Text style={styles.muted}>{pet.address}</Text>
        <Text style={styles.muted}>
          Casa {pet.homeLat.toFixed(5)}, {pet.homeLng.toFixed(5)}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>QR imprimible</Text>
        <Image source={{ uri: qrUrl }} style={styles.qr} accessibilityLabel={`QR de ${pet.name}`} />
        <Text style={styles.mono}>{publicUrl}</Text>
      </View>

      <PrimaryButton label="Abrir ficha imprimible" onPress={() => void Linking.openURL(printUrl)} />
      <PrimaryButton
        label="Compartir URL del QR"
        variant="secondary"
        onPress={() =>
          void Share.share({
            message: `Si encuentras a ${pet.name}, abre: ${publicUrl}`,
            url: publicUrl,
          })
        }
      />
      <PrimaryButton label="Probar landing ahora" variant="secondary" onPress={() => void Linking.openURL(publicUrl)} />
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
    alignItems: 'center',
  },
  section: {
    color: colors.text,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
    alignSelf: 'flex-start',
  },
  muted: {
    color: colors.textMuted,
    fontFamily: fonts.base,
    alignSelf: 'flex-start',
  },
  qr: {
    width: 240,
    height: 240,
    backgroundColor: colors.surface,
  },
  mono: {
    color: colors.textMuted,
    fontSize: fonts.sizeSm,
    fontFamily: fonts.base,
  },
});
