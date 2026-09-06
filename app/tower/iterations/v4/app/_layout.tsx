import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/constants/theme';
import { GameProvider } from '../src/hooks/GameProvider';

export default function RootLayout() {
  return (
    <GameProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.night },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="levels" />
        <Stack.Screen name="game" />
        <Stack.Screen name="shop" />
        <Stack.Screen name="how-to" />
        <Stack.Screen name="level-victory" />
        <Stack.Screen name="defeat" />
        <Stack.Screen name="campaign-victory" />
      </Stack>
    </GameProvider>
  );
}
