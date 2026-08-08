import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ColorPresetLegend,
  ColorPresetPicker,
} from '../src/components/ColorPresetPicker';
import { SettingsRow } from '../src/components/SettingsRow';
import { WidgetPreview } from '../src/components/WidgetPreview';
import { useClock } from '../src/hooks/useClock';
import { refreshWidget } from '../src/hooks/useWidgetSync';
import { colors } from '../src/constants/theme';
import { useClockStore } from '../src/stores/clockStore';
import type { ColorPreset } from '../src/types';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useClock();
  const setPreference = useClockStore((state) => state.setPreference);
  const preferences = useClockStore((state) => ({
    format24h: state.format24h,
    showSeconds: state.showSeconds,
    showDate: state.showDate,
    colorPreset: state.colorPreset,
    keepAwake: state.keepAwake,
  }));

  const update = async <K extends keyof typeof preferences>(
    key: K,
    value: (typeof preferences)[K],
  ) => {
    await setPreference(key, value);
    void Haptics.selectionAsync();
    await refreshWidget();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← VOLVER</Text>
        </Pressable>
        <Text style={styles.headerTitle}>AJUSTES</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <WidgetPreview now={now} preferences={preferences} />

        <SettingsRow label="Formato 24 horas">
          <Switch
            value={preferences.format24h}
            onValueChange={(value) => void update('format24h', value)}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </SettingsRow>

        <SettingsRow label="Mostrar segundos">
          <Switch
            value={preferences.showSeconds}
            onValueChange={(value) => void update('showSeconds', value)}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </SettingsRow>

        <SettingsRow label="Mostrar fecha">
          <Switch
            value={preferences.showDate}
            onValueChange={(value) => void update('showDate', value)}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </SettingsRow>

        <SettingsRow label="Pantalla siempre encendida">
          <Switch
            value={preferences.keepAwake}
            onValueChange={(value) => void update('keepAwake', value)}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </SettingsRow>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COLOR DEL DISPLAY</Text>
          <ColorPresetPicker
            value={preferences.colorPreset}
            onChange={(preset: ColorPreset) => void update('colorPreset', preset)}
          />
          <ColorPresetLegend value={preferences.colorPreset} />
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>AÑADIR WIDGET</Text>
          <Text style={styles.instructionsText}>
            Mantén pulsado en la pantalla de inicio → Widgets → Reloj Retro
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
  },
  backText: {
    color: colors.accent,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontFamily: 'monospace',
    letterSpacing: 2,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  section: {
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 8,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  instructions: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  instructionsTitle: {
    color: colors.textPrimary,
    fontFamily: 'monospace',
    fontSize: 13,
    letterSpacing: 1,
  },
  instructionsText: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
