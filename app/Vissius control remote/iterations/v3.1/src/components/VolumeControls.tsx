import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { VolumeCommand } from '../types';
import { colors, layout } from '../constants/theme';
import { RemoteButton } from './RemoteButton';

interface VolumeControlsProps {
  volume: number;
  muted: boolean;
  onCommand: (command: VolumeCommand) => void;
  disabled?: boolean;
}

export function VolumeControls({
  volume,
  muted,
  onCommand,
  disabled = false,
}: VolumeControlsProps) {
  const label = muted || volume === 0 ? 'Mute' : `${volume}`;

  return (
    <View style={styles.container}>
      <RemoteButton
        label="Vol −"
        style={styles.button}
        disabled={disabled}
        onPress={() => onCommand('vol_down')}
      />
      <View style={styles.levelBox}>
        <Text style={styles.levelLabel}>Volumen</Text>
        <Text style={styles.levelValue}>{label}</Text>
      </View>
      <RemoteButton
        label="Vol +"
        style={styles.button}
        disabled={disabled}
        onPress={() => onCommand('vol_up')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  button: {
    flex: 1,
    maxWidth: 120,
  },
  levelBox: {
    alignItems: 'center',
    backgroundColor: colors.backgroundSoft,
    borderColor: colors.backgroundStrong,
    borderRadius: layout.buttonRadius,
    borderWidth: 2,
    minWidth: 88,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  levelLabel: {
    color: colors.textOnSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  levelValue: {
    color: colors.textOnSoft,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 2,
  },
});
