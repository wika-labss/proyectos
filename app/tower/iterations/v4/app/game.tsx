import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
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
    selectedPlacedId,
    mergeHint,
    sellPreview,
    paused,
    lastResult,
    selectTower,
    tryPlace,
    onTowerPress,
    sellSelected,
    beginWaves,
    togglePause,
    resume,
    nextWave,
    clearResult,
  } = useGame();
  const [field, setField] = useState({ w: 320, h: 420 });

  useEffect(() => {
    if (!run) router.replace('/');
  }, [run, router]);

  useEffect(() => {
    if (!run) return;
    if (run.mode === 'infinite' && lastResult === 'defeat') {
      clearResult();
      router.replace('/defeat');
      return;
    }
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
  }, [lastResult, router, clearResult, run]);

  if (!run) return null;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setField({ w: width, h: Math.max(280, height) });
  };

  const preparing = run.status === 'preparing';
  const infinite = run.mode === 'infinite';

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Hud
          lives={run.lives}
          gold={run.gold}
          wave={preparing ? 0 : run.waveIndex + 1}
          waveCount={infinite ? 0 : run.waves.length}
          level={infinite ? 0 : run.levelIndex + 1}
          mapName={infinite ? `Infinito · ${run.map.name}` : run.map.name}
          onPause={togglePause}
        />

        <View style={styles.fieldWrap} onLayout={onLayout}>
          <Battlefield
            run={run}
            selectedTower={selectedTower}
            selectedPlacedId={selectedPlacedId}
            width={field.w}
            height={field.h}
            onPadPress={tryPlace}
            onTowerPress={onTowerPress}
          />
        </View>

        {preparing && (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>
              {infinite ? 'Infinito — Preparación' : 'Preparación'}
            </Text>
            <Text style={styles.bannerSub}>
              Coloca, fusiona o vende torres. Luego inicia.
            </Text>
            <Pressable style={styles.bannerCta} onPress={beginWaves}>
              <Text style={styles.bannerCtaText}>Iniciar oleadas</Text>
            </Pressable>
          </View>
        )}

        {run.status === 'waveBreak' && (
          <View style={styles.banner}>
            <Text style={styles.bannerTitle}>
              Oleada {run.waveIndex + 1} superada
            </Text>
            <Text style={styles.bannerSub}>
              {infinite
                ? 'La siguiente será más dura. Refuerza o vende.'
                : 'Refuerza, fusiona o vende antes de continuar.'}
            </Text>
            <Pressable style={styles.bannerCta} onPress={nextWave}>
              <Text style={styles.bannerCtaText}>Siguiente oleada</Text>
            </Pressable>
          </View>
        )}

        {selectedPlacedId && sellPreview != null && (
          <Pressable style={styles.sellBtn} onPress={sellSelected}>
            <Text style={styles.sellText}>Vender (+{sellPreview} oro)</Text>
          </Pressable>
        )}

        <TowerBar
          selected={selectedTower}
          gold={run.gold}
          onSelect={selectTower}
        />
        <Text style={styles.hint}>
          {mergeHint ??
            'Toca torre: fusionar / vender · Barra: colocar'}
        </Text>
      </SafeAreaView>

      {paused && (
        <PauseOverlay onResume={resume} onMenu={() => router.replace('/')} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  safe: { flex: 1, paddingBottom: 12 },
  fieldWrap: { flex: 1, marginHorizontal: 12, marginVertical: 8 },
  hint: {
    textAlign: 'center',
    color: colors.muted,
    fontSize: 12,
    marginTop: 8,
    paddingHorizontal: 12,
  },
  banner: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: colors.steel,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  bannerTitle: { color: colors.mist, fontWeight: '800', fontSize: 16 },
  bannerSub: { color: colors.muted, fontSize: 13, textAlign: 'center' },
  bannerCta: {
    marginTop: 4,
    backgroundColor: colors.ember,
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  bannerCtaText: { color: colors.mist, fontWeight: '800' },
  sellBtn: {
    marginHorizontal: 12,
    marginBottom: 8,
    backgroundColor: colors.danger,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  sellText: { color: colors.mist, fontWeight: '800', fontSize: 15 },
});
