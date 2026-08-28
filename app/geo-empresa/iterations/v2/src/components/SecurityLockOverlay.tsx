import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import type { LockReason } from '../constants/config';
import { appConfig } from '../constants/config';
import { colors, spacing } from '../constants/theme';
import { formatDistance } from '../engine';
import { lockReasonMessage } from '../modules/lock-engine/evaluate';
import { PrimaryButton } from './PrimaryButton';
import { TextField } from './TextField';

type SecurityLockOverlayProps = {
  visible: boolean;
  reason: LockReason;
  distanciaBaseM: number;
  radioMetros: number;
  onUnlock: (pin: string) => void;
  error?: string | null;
};

export function SecurityLockOverlay({
  visible,
  reason,
  distanciaBaseM,
  radioMetros,
  onUnlock,
  error,
}: SecurityLockOverlayProps) {
  const [pin, setPin] = useState('');

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={() => {}}>
      <View style={styles.container}>
        <Text style={styles.title}>Alerta de seguridad</Text>
        <Text style={styles.body}>
          {lockReasonMessage(reason, distanciaBaseM, radioMetros)}
        </Text>
        <Text style={styles.meta}>
          Distancia: {formatDistance(distanciaBaseM)} · Radio: {formatDistance(radioMetros)}
        </Text>
        <TextField
          label="PIN corporativo"
          value={pin}
          onChangeText={setPin}
          secureTextEntry
          keyboardType="number-pad"
          placeholder={`PIN test ${appConfig.defaultPin}`}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label="Desbloquear"
          onPress={() => {
            onUnlock(pin);
          }}
        />
        <Text style={styles.note}>
          No puedes salir de esta pantalla sin ingresar el PIN correcto.
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    color: colors.danger,
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  meta: {
    color: colors.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    textAlign: 'center',
  },
  note: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
