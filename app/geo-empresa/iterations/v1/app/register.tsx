import * as Device from 'expo-device';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { TextField } from '../src/components/TextField';
import { appConfig } from '../src/constants/config';
import { colors, spacing } from '../src/constants/theme';
import { registrarDispositivo } from '../src/engine';
import { useMonitoring } from '../src/hooks/MonitoringProvider';
import {
  isDeviceAdminActive,
  requestDeviceAdmin,
  requestIgnoreBatteryOptimizations,
} from '../src/modules/device-admin/native';
import { startBackgroundMonitoring } from '../src/modules/location-agent/task';
import {
  buildDeviceFingerprint,
  saveLastLocation,
  saveRegistration,
} from '../src/modules/registration/store';

export default function RegisterScreen() {
  const router = useRouter();
  const { refreshRegistration } = useMonitoring();
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  const onRegister = async () => {
    const trimmed = nombre.trim();
    if (trimmed.length < 2) {
      Alert.alert('Nombre requerido', 'Ingresa un nombre de al menos 2 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const { status: foreground } = await Location.requestForegroundPermissionsAsync();
      if (foreground !== 'granted') {
        throw new Error('Debes conceder ubicación para fijar el punto base.');
      }

      const { status: background } = await Location.requestBackgroundPermissionsAsync();
      if (background !== 'granted') {
        throw new Error('Debes conceder ubicación permanente (Siempre).');
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const adminActive = await isDeviceAdminActive();
      if (!adminActive) {
        const granted = await requestDeviceAdmin();
        if (!granted) {
          throw new Error('Debes activar administrador de dispositivo para proteger la app.');
        }
      }

      await requestIgnoreBatteryOptimizations();

      const fingerprint = await buildDeviceFingerprint();
      await registrarDispositivo({
        nombreRegistrado: trimmed,
        deviceFingerprint: fingerprint,
        baseLat: position.coords.latitude,
        baseLng: position.coords.longitude,
        modelo: Device.modelName ?? undefined,
        radioMetros: appConfig.fenceRadiusM,
      });

      const record = {
        nombreRegistrado: trimmed,
        deviceFingerprint: fingerprint,
        baseLat: position.coords.latitude,
        baseLng: position.coords.longitude,
        radioMetros: appConfig.fenceRadiusM,
        registeredAt: new Date().toISOString(),
      };

      await saveRegistration(record);
      await saveLastLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracyM: position.coords.accuracy ?? undefined,
      });

      await startBackgroundMonitoring();
      await refreshRegistration();
      router.replace('/monitor');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo completar el registro.';
      Alert.alert('Registro fallido', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registro corporativo</Text>
      <Text style={styles.subtitle}>
        Se registrará este teléfono con tu nombre y la ubicación actual como punto base (radio{' '}
        {appConfig.fenceRadiusM} m). El monitoreo continuará en segundo plano cada 5 minutos.
      </Text>

      <TextField
        label="Nombre del teléfono"
        value={nombre}
        onChangeText={setNombre}
        placeholder="Ej. Camioneta 12"
      />

      <PrimaryButton label="Registrar y activar monitoreo" onPress={onRegister} loading={loading} />

      <Text style={styles.note}>
        Requiere ubicación permanente, administrador de dispositivo y PIN {appConfig.defaultPin} para
        desinstalar en modo test.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  note: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});
