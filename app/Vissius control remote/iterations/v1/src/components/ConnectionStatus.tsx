import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ConnectionState } from '../types';
import { colors } from '../constants/theme';

interface ConnectionStatusProps {
  state: ConnectionState;
  deviceName?: string;
  error?: string | null;
}

function getLabel(state: ConnectionState, deviceName?: string): string {
  switch (state) {
    case 'connected':
      return deviceName ? `Conectado — ${deviceName}` : 'Conectado';
    case 'connecting':
      return 'Conectando…';
    case 'scanning':
      return 'Buscando TVs…';
    case 'disconnected':
      return 'Desconectado';
    case 'error':
      return 'Error de conexión';
    default:
      return 'Sin conectar';
  }
}

export function ConnectionStatus({ state, deviceName, error }: ConnectionStatusProps) {
  const isError = state === 'error' || state === 'disconnected';
  const isOk = state === 'connected';

  return (
    <View
      style={[
        styles.banner,
        isOk && styles.ok,
        isError && styles.error,
        state === 'connecting' && styles.pending,
      ]}
    >
      <Text style={styles.text}>{getLabel(state, deviceName)}</Text>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.backgroundStrong,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  ok: {
    backgroundColor: colors.backgroundStrong,
  },
  error: {
    backgroundColor: colors.backgroundStrong,
  },
  pending: {
    backgroundColor: colors.backgroundStrong,
  },
  text: {
    color: colors.textOnStrong,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    color: colors.textOnStrong,
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
    textAlign: 'center',
  },
});
