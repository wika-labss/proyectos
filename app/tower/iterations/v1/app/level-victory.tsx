import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function LevelVictoryScreen() {
  const router = useRouter();
  const { run, campaign, startLevel } = useGame();
  const level = run ? run.levelIndex + 1 : campaign.maxUnlockedLevel - 1;
  const next = Math.min(15, level + 1);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.kicker}>Nivel {level}</Text>
        <Text style={styles.title}>Victoria</Text>
        <Text style={styles.sub}>
          {run?.map.name ?? 'Frente'} asegurado. Siguiente: N{next}.
        </Text>
        <Pressable
          style={styles.cta}
          onPress={() => {
            startLevel(next);
            router.replace('/game');
          }}
        >
          <Text style={styles.ctaText}>Continuar</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={() => router.replace('/levels')}>
          <Text style={styles.linkText}>Selector de niveles</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  safe: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    gap: 12,
  },
  kicker: { color: colors.gold, fontWeight: '700', letterSpacing: 1 },
  title: { color: colors.mist, fontSize: 48, fontWeight: '900' },
  sub: { color: colors.muted, fontSize: 16, marginBottom: 16 },
  cta: {
    backgroundColor: colors.ember,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: colors.mist, fontWeight: '800', fontSize: 18 },
  link: { alignItems: 'center', paddingVertical: 10 },
  linkText: { color: colors.muted, fontWeight: '600' },
});
