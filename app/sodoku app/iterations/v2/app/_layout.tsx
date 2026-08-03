import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { getTheme } from '../src/constants/theme';
import { useGameStore } from '../src/stores/gameStore';
import { useProgressStore } from '../src/stores/progressStore';
import { useSettingsStore } from '../src/stores/settingsStore';

export default function RootLayout() {
  const loadedSettings = useSettingsStore((state) => state.loaded);
  const loadedProgress = useProgressStore((state) => state.loaded);
  const darkMode = useSettingsStore((state) => state.darkMode);
  const loadSettings = useSettingsStore((state) => state.load);
  const loadProgress = useProgressStore((state) => state.load);
  const restoreActiveGame = useGameStore((state) => state.restoreActiveGame);

  useEffect(() => {
    void Promise.all([loadSettings(), loadProgress(), restoreActiveGame()]);
  }, [loadSettings, loadProgress, restoreActiveGame]);

  const colors = getTheme(darkMode ? 'dark' : 'light');
  const ready = loadedSettings && loadedProgress;

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={darkMode ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Sodoku' }} />
        <Stack.Screen name="levels" options={{ title: 'Niveles' }} />
        <Stack.Screen name="game/[levelId]" options={{ title: 'Juego' }} />
        <Stack.Screen name="settings" options={{ title: 'Ajustes' }} />
        <Stack.Screen name="stats" options={{ title: 'Estadísticas' }} />
      </Stack>
    </>
  );
}
