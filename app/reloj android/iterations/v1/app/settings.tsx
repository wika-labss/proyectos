import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ColorPresetLegend,
  ColorPresetPicker,
} from '../src/components/ColorPresetPicker';
import { SettingsRow } from '../src/components/SettingsRow';
import { WidgetPreview } from '../src/components/WidgetPreview';
import { colors } from '../src/constants/theme';
import { useClockDisplay } from '../src/hooks/useClockDisplay';
import { useClockPreferences } from '../src/hooks/useClockPreferences';
import type { ColorPreset } from '../src/types';

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { now, preferences } = useClockDisplay();
  const { updatePreference } = useClockPreferences();
  const [backPressed, setBackPressed] = useState(false);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 8 },
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          onPressIn={() => setBackPressed(true)}
          onPressOut={() => setBackPressed(false)}
          style={[styles.backButton, backPressed && styles.pressed]}
        >
          <Text style={styles.backText}>← VOLVER</Text>
        </Pressable>
        <Text style={styles.headerTitle}>AJUSTES</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <WidgetPreview now={now} preferences={preferences} />

        <SettingsRow label="Formato 24 horas">
          <Switch
            value={preferences.format24h}
            onValueChange={(value) => void updatePreference('format24h', value)}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </SettingsRow>

        <SettingsRow label="Mostrar segundos">
          <Switch
            value={preferences.showSeconds}
            onValueChange={(value) => void updatePreference('showSeconds', value)}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </SettingsRow>

        <SettingsRow label="Mostrar fecha">
          <Switch
            value={preferences.showDate}
            onValueChange={(value) => void updatePreference('showDate', value)}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </SettingsRow>

        <SettingsRow label="Pantalla siempre encendida">
          <Switch
            value={preferences.keepAwake}
            onValueChange={(value) => void updatePreference('keepAwake', value)}
            trackColor={{ false: colors.border, true: colors.accent }}
          />
        </SettingsRow>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>COLOR DEL DISPLAY</Text>
          <ColorPresetPicker
            value={preferences.colorPreset}
            onChange={(preset: ColorPreset) => void updatePreference('colorPreset', preset)}
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
  pressed: {
    transform: [{ scale: 0.97 }],
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
