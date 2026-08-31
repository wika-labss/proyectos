import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/theme';

type Props = {
  onResume: () => void;
  onMenu: () => void;
};

export function PauseOverlay({ onResume, onMenu }: Props) {
  return (
    <View style={styles.overlay}>
      <Text style={styles.title}>Pausa</Text>
      <Pressable style={styles.cta} onPress={onResume}>
        <Text style={styles.ctaText}>Reanudar</Text>
      </Pressable>
      <Pressable style={styles.secondary} onPress={onMenu}>
        <Text style={styles.secondaryText}>Menú</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000AA',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    zIndex: 20,
  },
  title: {
    color: colors.mist,
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  cta: {
    backgroundColor: colors.ember,
    paddingHorizontal: 36,
    paddingVertical: 14,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.mist,
    fontWeight: '800',
    fontSize: 16,
  },
  secondary: {
    paddingVertical: 10,
  },
  secondaryText: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: '600',
  },
});
