import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { menu } from '../src/constants/theme';
import { GameProvider } from '../src/hooks/GameProvider';

export default function RootLayout() {
  return (
    <GameProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: menu.void },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="how-to" />
        <Stack.Screen name="game" />
        <Stack.Screen name="lose" />
        <Stack.Screen name="win" />
      </Stack>
    </GameProvider>
  );
}
