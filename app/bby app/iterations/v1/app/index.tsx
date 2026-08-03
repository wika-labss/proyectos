import React, { useCallback, useEffect } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { GothicBackground } from '../src/components/GothicBackground';
import { IntensitySlider } from '../src/components/IntensitySlider';
import { SosButton } from '../src/components/SosButton';
import { StatusIndicator } from '../src/components/StatusIndicator';
import { TorchButton } from '../src/components/TorchButton';
import { colors, spacing, typography } from '../src/constants/theme';
import { useSosPattern } from '../src/hooks/useSosPattern';
import { useTorch } from '../src/hooks/useTorch';
import { useTorchController } from '../src/hooks/TorchProvider';
import { useTorchStore } from '../src/stores/torchStore';

function UnavailableScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <GothicBackground />
      <View style={styles.unavailableContent}>
        <Text style={styles.title}>BBY LIGHT</Text>
        <Text style={styles.unavailableTitle}>Flash no disponible</Text>
        <Text style={styles.unavailableBody}>
          Este dispositivo no tiene flash LED o no se otorgó permiso de cámara necesario para controlar la linterna.
        </Text>
      </View>
    </SafeAreaView>
  );
}

function MainScreen() {
  const mode = useTorchStore((state) => state.mode);
  const intensity = useTorchStore((state) => state.intensity);
  const setMode = useTorchStore((state) => state.setMode);
  const { toggle, turnOff, updateIntensity, syncKeepAwake } = useTorch();
  const { start: startSos, stop: stopSos } = useSosPattern();
  const controller = useTorchController();

  const handleTorchPress = useCallback(async () => {
    if (mode === 'sos') {
      stopSos();
      await turnOff();
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    await toggle();
  }, [mode, stopSos, toggle, turnOff]);

  const handleSosPress = useCallback(async () => {
    if (mode === 'sos') {
      stopSos();
      await turnOff();
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      return;
    }

    setMode('sos');
    startSos();
    await syncKeepAwake(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }, [mode, setMode, startSos, stopSos, syncKeepAwake, turnOff]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'background' || nextState === 'inactive') {
        stopSos();
        controller.stopIntensity();
        controller.setTorch(false);
        setMode('off');
        void syncKeepAwake(false);
      }
    });

    return () => {
      subscription.remove();
      stopSos();
      controller.stopIntensity();
      controller.setTorch(false);
      void syncKeepAwake(false);
    };
  }, [controller, setMode, stopSos, syncKeepAwake]);

  const sliderDisabled = mode === 'off' || mode === 'sos';

  return (
    <SafeAreaView style={styles.safeArea}>
      <GothicBackground />
      <View style={styles.content}>
        <Text style={styles.title}>BBY LIGHT</Text>

        <View style={styles.centerBlock}>
          <TorchButton mode={mode} onPress={handleTorchPress} />
          <View style={styles.statusSpacing}>
            <StatusIndicator mode={mode} />
          </View>
        </View>

        <View style={styles.controls}>
          <IntensitySlider value={intensity} disabled={sliderDisabled} onChange={(value) => void updateIntensity(value)} />
          <View style={styles.sosSpacing}>
            <SosButton active={mode === 'sos'} onPress={handleSosPress} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default function HomeScreen() {
  const isFlashAvailable = useTorchStore((state) => state.isFlashAvailable);
  return isFlashAvailable ? <MainScreen /> : <UnavailableScreen />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'space-between',
  },
  title: {
    ...typography.title,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  centerBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  statusSpacing: {
    marginTop: spacing.lg,
  },
  controls: {
    marginBottom: spacing.md,
  },
  sosSpacing: {
    marginTop: spacing.lg,
  },
  unavailableContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  unavailableTitle: {
    ...typography.sos,
    color: colors.accentGlow,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  unavailableBody: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
