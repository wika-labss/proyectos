import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '../src/components/PrimaryButton';
import { TextField } from '../src/components/TextField';
import { appConfig } from '../src/constants/config';
import { colors, spacing } from '../src/constants/theme';
import { formatDistance } from '../src/engine';
import { useMonitoring } from '../src/hooks/MonitoringProvider';
import { removeDeviceAdminWithPin } from '../src/modules/device-admin/native';
import { stopBackgroundMonitoring } from '../src/modules/location-agent/task';
import { clearRegistration } from '../src/modules/registration/store';

export default function MonitorScreen() {
  const router = useRouter();
  const { registration, phoneOn, airplaneMode, lastReportAt, verifyPin } = useMonitoring();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  if (!registration) {
    return <Redirect href="/register" />;
  }

  const onDeactivate = async () => {
    if (!verifyPin(pin)) {
      Alert.alert('PIN incorrecto', `Usa el PIN corporativo (test: ${appConfig.defaultPin}).`);
      return;
    }

    setLoading(true);
    try {
      const removed = await removeDeviceAdminWithPin(pin);
      if (!removed) {
        throw new Error('No se pudo desactivar el administrador de dispositivo.');
      }
      await stopBackgroundMonitoring();
      await clearRegistration();
      Alert.alert('Monitoreo detenido', 'Ahora puedes desinstalar la app desde Ajustes.');
      router.replace('/register');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo desactivar.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Geo Empresa activo</Text>
      <Text style={styles.subtitle}>{registration.nombreRegistrado}</Text>

      <View style={styles.card}>
        <StatusRow label="Monitoreo background" value="Activo (5 min)" ok />
        <StatusRow label="Teléfono encendido" value={phoneOn ? 'Sí' : 'No'} ok={phoneOn} />
        <StatusRow label="Modo avión" value={airplaneMode ? 'Activado' : 'Desactivado'} ok={!airplaneMode} />
        <StatusRow
          label="Radio permitido"
          value={formatDistance(registration.radioMetros)}
          ok
        />
        <StatusRow
          label="Último reporte"
          value={lastReportAt ? new Date(lastReportAt).toLocaleString('es-CL') : 'Pendiente'}
          ok={Boolean(lastReportAt)}
        />
      </View>

      <Text style={styles.help}>
        La app permanece en segundo plano. Para desinstalar, ingresa el PIN y desactiva el monitoreo.
      </Text>

      <TextField
        label="PIN para desinstalar / detener"
        value={pin}
        onChangeText={setPin}
        secureTextEntry
        keyboardType="number-pad"
        placeholder="PIN corporativo"
      />

      <PrimaryButton
        label="Detener monitoreo (requiere PIN)"
        onPress={onDeactivate}
        loading={loading}
        variant="danger"
      />
    </View>
  );
}

function StatusRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, { color: ok ? colors.success : colors.danger }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.md,
    justifyContent: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  rowLabel: {
    color: colors.muted,
    fontSize: 14,
    flex: 1,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  help: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 20,
  },
});
