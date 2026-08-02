import React from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { getTheme, spacing, typography } from '../src/constants/theme';
import { useGameStore } from '../src/stores/gameStore';
import { useProgressStore } from '../src/stores/progressStore';
import { useSettingsStore } from '../src/stores/settingsStore';

export default function SettingsScreen() {
  const darkMode = useSettingsStore((state) => state.darkMode);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const vibrationEnabled = useSettingsStore((state) => state.vibrationEnabled);
  const setDarkMode = useSettingsStore((state) => state.setDarkMode);
  const setSoundEnabled = useSettingsStore((state) => state.setSoundEnabled);
  const setVibrationEnabled = useSettingsStore((state) => state.setVibrationEnabled);
  const resetProgress = useProgressStore((state) => state.resetProgress);
  const clearActiveGame = useGameStore((state) => state.clearActiveGame);
  const colors = getTheme(darkMode ? 'dark' : 'light');

  const confirmReset = () => {
    Alert.alert(
      'Reiniciar progreso',
      'Se borrarán todos los niveles completados y estadísticas.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Reiniciar',
          style: 'destructive',
          onPress: () => {
            void resetProgress();
            void clearActiveGame();
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SettingRow
        label="Modo oscuro"
        colors={colors}
        control={<Switch value={darkMode} onValueChange={(value) => void setDarkMode(value)} />}
      />
      <SettingRow
        label="Sonido"
        colors={colors}
        control={<Switch value={soundEnabled} onValueChange={(value) => void setSoundEnabled(value)} />}
      />
      <SettingRow
        label="Vibración"
        colors={colors}
        control={<Switch value={vibrationEnabled} onValueChange={(value) => void setVibrationEnabled(value)} />}
      />

      <Pressable
        onPress={confirmReset}
        style={[styles.resetButton, { backgroundColor: colors.error }]}
      >
        <Text style={[styles.resetText, { color: colors.buttonText }]}>Reiniciar progreso</Text>
      </Pressable>
    </View>
  );
}

function SettingRow({
  label,
  colors,
  control,
}: {
  label: string;
  colors: ReturnType<typeof getTheme>;
  control: React.ReactNode;
}) {
  return (
    <View style={[styles.row, { backgroundColor: colors.surface }]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      {control}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  row: {
    minHeight: 56,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: typography.body,
    fontWeight: '600',
  },
  resetButton: {
    marginTop: spacing.lg,
    minHeight: 48,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetText: {
    fontSize: typography.body,
    fontWeight: '700',
  },
});
