import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';

export default function HowToScreen() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Cómo jugar</Text>
        <Text style={styles.p}>
          Los enemigos siguen el camino hacia tu base. Coloca torres en las zonas
          marcadas para detener las oleadas.
        </Text>
        <Text style={styles.p}>
          Hay 4 torres: Arquera, Cañón, Hielo y Francotirador. Junta 2 del mismo
          tipo y mismo nivel para evolucionar (hasta Lv.4 con nombre único:
          Ballesta Élite, Mortero Infernal, Ventisca Absolute, Águila de Ébano).
        </Text>
        <Text style={styles.p}>
          Completa 25 mapas. Coloca en preparación, entre oleadas y durante el
          combate. Cada nivel aporta más oleadas, con balance ajustado en V3.
        </Text>
        <Pressable style={styles.cta} onPress={() => router.back()}>
          <Text style={styles.ctaText}>Entendido</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.night },
  safe: { flex: 1, padding: 24, gap: 16, justifyContent: 'center' },
  title: { color: colors.mist, fontSize: 32, fontWeight: '900' },
  p: { color: colors.muted, fontSize: 16, lineHeight: 24 },
  cta: {
    marginTop: 12,
    backgroundColor: colors.ember,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: { color: colors.mist, fontWeight: '800', fontSize: 16 },
});
