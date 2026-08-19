import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Battlefield } from '../src/components/Battlefield';
import { Hud } from '../src/components/Hud';
import { PauseOverlay } from '../src/components/PauseOverlay';
import { TowerBar } from '../src/components/TowerBar';
import { colors } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function GameScreen() {
  const router = useRouter();
  const {
    run,
    selectedTower,
    paused,
    lastResult,
    selectTower,
    tryPlace,
    togglePause,
    resume,
    nextWave,
    clearResult,
  } = useGame();
  const [field, setField] = useState({ w: 320, h: 420 });

  useEffect(() => {
    if (!run) {
      router.replace('/levels');
    }
  }, [run, router]);

  useEffect(() => {
    if (lastResult === 'victory') {
      clearResult();
      router.replace('/level-victory');
    } else if (lastResult === 'campaign') {
      clearResult();
      router.replace('/campaign-victory');
    } else if (lastResult === 'defeat') {
      clearResult();
      router.replace('/defeat');
    }
  }, [lastResult, router, clearResult]);

  if (!run) return null;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setField({ w: width, h: Math.max(280, height) });
  };

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Hud
          lives={run.lives}
          gold={run.gold}
          wave={run.waveIndex + 1}
          waveCount={run.waves.length}
          level={run.levelIndex + 1}
          mapName={run.map.name}
          onPause={togglePause}
        />

        <View style={styles.fieldWrap} onLayout={onLayout}>
          <Battlefield
            run={run}
            selectedTower={selectedTower}
            width={field.w}
            height={field.h}
            onPadPress={tryPlace}
          />
        </View>

        {run.status === 'waveBreak' && (
          <View style={styles.waveBreak}>
            <Text style={styles.waveText}>
              Oleada {run.waveIndex + 1} superada
            </Text>
            <Pressable style={styles.waveCta} onPress={nextWave}>
              <Text style={styles.waveCtaText}>Siguiente oleada</Text>
            </Pressable>
          </View>
        )}

        <TowerBar
          selected={selectedTower}
          gold={run.gold}
          onSelect={selectTower}
        />
        <Text style={styles.hint}>
          Elige torre → toca zona iluminada para colocar
        </Text>
      </SafeAreaView>

      {paused && (
        <PauseOverlay
          onResume={resume}
          onMenu={() => router.replace('/')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  safe: { flex: 1, paddingBottom: 12 },
  fieldWrap: {
    flex: 1,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  hint: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    marginTop: 8,
  },
  waveBreak: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: colors.steel,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  waveText: { color: colors.mist, fontWeight: '700' },
  waveCta: {
    backgroundColor: colors.ember,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  waveCtaText: { color: colors.mist, fontWeight: '800' },
});
