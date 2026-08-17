import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../src/modules/app-theme';
import { useGameStore } from '../src/stores/gameStore';
import { useProgressStore } from '../src/stores/progressStore';

export default function RootLayout() {
  const loaded = useProgressStore((s) => s.loaded);
  const load = useProgressStore((s) => s.load);
  const restoreActiveGame = useGameStore((s) => s.restoreActiveGame);

  useEffect(() => {
    void Promise.all([load(), restoreActiveGame()]);
  }, [load, restoreActiveGame]);

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.active,
          headerTitleStyle: { color: colors.accent, fontWeight: '800' },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ title: 'Sodoku nuevo' }} />
        <Stack.Screen name="levels" options={{ title: 'Niveles' }} />
        <Stack.Screen name="history" options={{ title: 'Histórico' }} />
        <Stack.Screen name="score" options={{ title: 'Puntaje' }} />
        <Stack.Screen name="inventory" options={{ title: 'Inventario' }} />
        <Stack.Screen name="game/[levelId]" options={{ title: 'Juego' }} />
        <Stack.Screen name="victory" options={{ title: 'Victoria', presentation: 'modal' }} />
      </Stack>
    </>
  );
}
