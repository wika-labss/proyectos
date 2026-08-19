import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';
import { useGame } from '../src/hooks/GameProvider';

export default function DefeatScreen() {
  const router = useRouter();
  const { run, startLevel } = useGame();
  const level = run ? run.levelIndex + 1 : 1;

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.kicker}>Nivel {level}</Text>
        <Text style={styles.title}>Derrota</Text>
        <Text style={styles.sub}>La base cayó. Reorganiza tus torres y reintenta.</Text>
        <Pressable
          style={styles.cta}
          onPress={() => {
            startLevel(level);
            router.replace('/game');
          }}
        >
          <Text style={styles.ctaText}>Reintentar</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={() => router.replace('/levels')}>
          <Text style={styles.linkText}>Selector</Text>
        </Pressable>
        <Pressable style={styles.link} onPress={() => router.replace('/')}>
          <Text style={styles.linkText}>Menú</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  safe: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  kicker: { color: colors.danger, fontWeight: '700' },
  title: { color: colors.mist, fontSize: 48, fontWeight: '900' },
  sub: { color: colors.muted, fontSize: 16, marginBottom: 12 },
  cta: {
    backgroundColor: colors.ember,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: { color: colors.mist, fontWeight: '800', fontSize: 18 },
  link: { alignItems: 'center', paddingVertical: 8 },
  linkText: { color: colors.muted, fontWeight: '600' },
});
