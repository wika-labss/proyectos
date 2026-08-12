import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/constants/theme';
import { useTvBootstrap } from '../src/hooks/useTvBootstrap';

export default function RootLayout() {
  const { loaded } = useTvBootstrap();

  if (!loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.backgroundStrong} size="large" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.backgroundSoft } }}>
        <Stack.Screen name="index" options={{ contentStyle: { backgroundColor: colors.splashBackground } }} />
        <Stack.Screen name="pairing" />
        <Stack.Screen name="logs" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    alignItems: 'center',
    backgroundColor: colors.backgroundSoft,
    flex: 1,
    justifyContent: 'center',
  },
});
