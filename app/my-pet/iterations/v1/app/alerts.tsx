import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { Screen } from '../src/components/Screen';
import { colors, fonts, radius, spacing } from '../src/constants/theme';
import { formatDistance, getPetById, haversineMeters } from '../src/engine';
import { usePets } from '../src/hooks/PetProvider';

export default function AlertsScreen() {
  const { alerts, pets, unseen, refresh } = usePets();
  const store = { pets, alerts };

  return (
    <Screen
      title="Alertas"
      subtitle="Hallazgos desde el QR (se actualizan cada 5s)"
      unseen={unseen}
    >
      {alerts.length === 0 ? (
        <Text style={styles.muted}>
          Nadie ha pulsado el botón todavía. Abre la landing, pulsa «Encontré tu mascota» y vuelve
          aquí.
        </Text>
      ) : (
        alerts.map((alert) => {
          const pet = getPetById(store, alert.petId);
          let extra = 'Sin coordenadas (el navegador no entregó GPS)';
          if (alert.foundLat != null && alert.foundLng != null && pet) {
            const meters = haversineMeters(
              { lat: pet.homeLat, lng: pet.homeLng },
              { lat: alert.foundLat, lng: alert.foundLng },
            );
            extra = `${alert.foundLat.toFixed(5)}, ${alert.foundLng.toFixed(5)} · ${formatDistance(meters)} de casa`;
          }
          return (
            <View key={alert.id} style={styles.card}>
              <Text style={styles.name}>{pet ? pet.name : alert.publicToken}</Text>
              <Text style={alert.status === 'new' ? styles.badge : styles.muted}>
                {alert.status === 'new' ? 'Nueva' : 'Vista'} · {new Date(alert.createdAt).toLocaleString()}
              </Text>
              <Text style={styles.muted}>{extra}</Text>
              {alert.usedDemoLocation ? (
                <Text style={styles.muted}>Ubicación de prueba de la web</Text>
              ) : null}
            </View>
          );
        })
      )}
      <PrimaryButton label="Actualizar" variant="secondary" onPress={() => void refresh()} />
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
  name: {
    color: colors.text,
    fontWeight: fonts.weightBold,
    fontFamily: fonts.base,
    fontSize: fonts.sizeMd,
  },
  muted: {
    color: colors.textMuted,
    fontFamily: fonts.base,
  },
  badge: {
    color: colors.alert,
    fontFamily: fonts.base,
    fontWeight: fonts.weightBold,
  },
});
