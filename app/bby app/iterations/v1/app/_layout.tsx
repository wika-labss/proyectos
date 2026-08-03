import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { colors } from '../src/constants/theme';
import { TorchProvider } from '../src/hooks/TorchProvider';
import { useFlashAvailability } from '../src/hooks/useFlashAvailability';
import { useTorchStore } from '../src/stores/torchStore';

function AppShell({ children }: { children: React.ReactNode }) {
  const { checking, cameraReady, markCameraUnavailable } = useFlashAvailability();
  const loaded = useTorchStore((state) => state.loaded);

  if (checking || !loaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <TorchProvider cameraReady={cameraReady} onCameraUnavailable={markCameraUnavailable}>
      {children}
    </TorchProvider>
  );
}

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <AppShell>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background },
          }}
        >
          <Stack.Screen name="index" />
        </Stack>
      </AppShell>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
