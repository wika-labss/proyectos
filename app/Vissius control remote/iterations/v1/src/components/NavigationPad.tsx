import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { NavigationCommand } from '../types';
import { RemoteButton } from './RemoteButton';

interface NavigationPadProps {
  onCommand: (command: NavigationCommand) => void;
  disabled?: boolean;
}

export function NavigationPad({ onCommand, disabled = false }: NavigationPadProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <RemoteButton label="▲" style={styles.navButton} disabled={disabled} onPress={() => onCommand('nav_up')} />
      </View>
      <View style={styles.row}>
        <RemoteButton label="◄" style={styles.navButton} disabled={disabled} onPress={() => onCommand('nav_left')} />
        <RemoteButton label="OK" style={styles.okButton} disabled={disabled} onPress={() => onCommand('ok')} />
        <RemoteButton label="►" style={styles.navButton} disabled={disabled} onPress={() => onCommand('nav_right')} />
      </View>
      <View style={styles.row}>
        <RemoteButton label="▼" style={styles.navButton} disabled={disabled} onPress={() => onCommand('nav_down')} />
      </View>
      <View style={styles.backRow}>
        <RemoteButton label="← Atrás" style={styles.backButton} disabled={disabled} onPress={() => onCommand('back')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  navButton: {
    height: 64,
    width: 64,
  },
  okButton: {
    height: 64,
    width: 88,
  },
  backRow: {
    marginTop: 8,
  },
  backButton: {
    minWidth: 140,
  },
});
