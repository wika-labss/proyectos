import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../src/constants/theme';

export default function HowToScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Cómo jugar</Text>
      <View style={styles.list}>
        <Text style={styles.item}>1. Completa líneas horizontales.</Text>
        <Text style={styles.item}>2. I = 100 · II = 300 · III = 500 · IIII = 800.</Text>
        <Text style={styles.item}>3. Cada 500 puntos el juego se acelera.</Text>
        <Text style={styles.item}>4. Si las piezas llegan arriba, se acaba la partida.</Text>
        <Text style={styles.item}>5. Soft drop +1 pts/celda · Hard drop +2 pts/celda.</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
      >
        <Text style={styles.ctaText}>Volver</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.void,
    paddingHorizontal: 24,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  title: {
    color: colors.accent,
    fontSize: 32,
    fontWeight: '800',
    marginTop: 36,
  },
  list: {
    gap: 14,
  },
  item: {
    color: colors.neonText,
    fontSize: 16,
    lineHeight: 24,
  },
  cta: {
    backgroundColor: colors.accent,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
  },
  ctaText: {
    color: colors.void,
    fontSize: 18,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
});
