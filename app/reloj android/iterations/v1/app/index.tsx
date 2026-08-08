import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateLine } from '../src/components/DateLine';
import { RetroBezel } from '../src/components/RetroBezel';
import { SevenSegmentDisplay } from '../src/components/SevenSegmentDisplay';
import { formatClock } from '../src/engine/formatTime';
import { useClock } from '../src/hooks/useClock';
import { useWidgetSync } from '../src/hooks/useWidgetSync';
import { colors, getPresetTokens } from '../src/constants/theme';
import { useClockStore } from '../src/stores/clockStore';

export default function ClockScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const now = useClock();
  useWidgetSync();

  const format24h = useClockStore((state) => state.format24h);
  const showSeconds = useClockStore((state) => state.showSeconds);
  const showDate = useClockStore((state) => state.showDate);
  const colorPreset = useClockStore((state) => state.colorPreset);
  const keepAwake = useClockStore((state) => state.keepAwake);

  const tokens = getPresetTokens(colorPreset);
  const formatted = formatClock(now, {
    format24h,
    showSeconds,
    showDate,
    colorPreset,
    keepAwake,
  });

  useEffect(() => {
    if (!keepAwake) {
      return undefined;
    }
    void activateKeepAwakeAsync('reloj-mesa');
    return () => {
      deactivateKeepAwake('reloj-mesa');
    };
  }, [keepAwake]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ajustes"
        onPress={() => router.push('/settings')}
        style={styles.settingsButton}
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
          />
        </RetroBezel>
        {showDate ? <DateLine value={formatted.date} color={tokens.display} /> : null}
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
