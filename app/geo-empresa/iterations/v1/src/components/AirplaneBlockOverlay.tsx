import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../constants/theme';
import { PrimaryButton } from './PrimaryButton';

type AirplaneBlockOverlayProps = {
  visible: boolean;
  onOpenSettings: () => void;
};

export function AirplaneBlockOverlay({ visible, onOpenSettings }: AirplaneBlockOverlayProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Modo avión detectado</Text>
        <Text style={styles.body}>
          Este teléfono corporativo no permite modo avión mientras Geo Empresa está activo.
          Desactívalo para continuar el monitoreo.
        </Text>
        <PrimaryButton label="Abrir ajustes" onPress={onOpenSettings} />
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
    gap: spacing.lg,
  },
  title: {
    color: colors.danger,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  body: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
});
