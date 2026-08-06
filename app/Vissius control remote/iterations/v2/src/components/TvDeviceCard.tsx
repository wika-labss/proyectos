import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { TvDevice } from '../types';
import { colors, layout } from '../constants/theme';

interface TvDeviceCardProps {
  device: TvDevice;
  onConnect: (device: TvDevice) => void;
  connecting?: boolean;
}

export function TvDeviceCard({ device, onConnect, connecting = false }: TvDeviceCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{device.name}</Text>
        <Text style={styles.ip}>
          {device.ip}:{device.port} · {device.protocol === 'roku' ? 'Roku' : 'Vissius'}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={connecting}
        onPress={() => onConnect(device)}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          connecting && styles.buttonDisabled,
        ]}
      >
        <Text style={styles.buttonText}>{connecting ? 'Conectando…' : 'Conectar'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.backgroundSoft,
    borderColor: colors.backgroundStrong,
    borderRadius: layout.buttonRadius,
    borderWidth: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  info: {
    flex: 1,
    marginRight: 12,
  },
  name: {
    color: colors.textOnSoft,
    fontSize: 16,
    fontWeight: '600',
  },
  ip: {
    color: colors.textOnSoft,
    fontSize: 14,
    marginTop: 4,
    opacity: 0.8,
  },
  button: {
    backgroundColor: colors.buttonBackground,
    borderRadius: layout.buttonRadius,
    minHeight: layout.minTouchTarget,
    minWidth: 110,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  buttonPressed: {
    backgroundColor: colors.buttonPressed,
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.buttonText,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
