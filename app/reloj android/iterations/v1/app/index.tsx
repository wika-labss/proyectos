import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateLine } from '../src/components/DateLine';
import { RetroBezel } from '../src/components/RetroBezel';
import { SevenSegmentDisplay } from '../src/components/SevenSegmentDisplay';
import { colors } from '../src/constants/theme';
import { useClockDisplay } from '../src/hooks/useClockDisplay';
import { useKeepAwake } from '../src/hooks/useKeepAwake';
import { useWidgetSync } from '../src/hooks/useWidgetSync';

export default function ClockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { preferences, tokens, formatted } = useClockDisplay();
  useWidgetSync();
  useKeepAwake(preferences.keepAwake);
  const [settingsPressed, setSettingsPressed] = useState(false);

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 },
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajustes"
        onPressIn={() => setSettingsPressed(true)}
        onPressOut={() => setSettingsPressed(false)}
        onPress={() => router.push('/settings')}
        style={[styles.settingsButton, settingsPressed && styles.pressed]}
      >
        <Text style={styles.settingsIcon}>⚙</Text>
      </Pressable>

      <View style={styles.center}>
        <Text style={styles.title}>RELOJ RETRO</Text>
        <RetroBezel>
          <SevenSegmentDisplay
            value={formatted.time}
            color={tokens.display}
            glowColor={tokens.displayGlow}
            ampm={formatted.ampm}
            blinkColon
          />
        </RetroBezel>
        {preferences.showDate ? <DateLine value={formatted.date} color={tokens.display} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
  },
  settingsButton: {
    alignSelf: 'flex-end',
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
  },
  settingsIcon: {
    color: colors.textPrimary,
    fontSize: 24,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  title: {
    color: colors.textSecondary,
    fontSize: 14,
    letterSpacing: 4,
    marginBottom: 24,
    fontFamily: 'monospace',
  },
});
