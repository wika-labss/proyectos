import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { menu } from '../src/constants/theme';

export default function HowToScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>Cómo jugar</Text>
      <View style={styles.list}>
        <Text style={styles.line}>• Arrastra la pala horizontalmente.</Text>
        <Text style={styles.line}>• Toca la pantalla para lanzar la bola.</Text>
        <Text style={styles.line}>• Rompe todos los ladrillos del nivel.</Text>
        <Text style={styles.line}>• Si la bola cae, pierdes 1 de 3 vidas.</Text>
        <Text style={styles.line}>• Ladrillos grises resisten 2 golpes.</Text>
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
    backgroundColor: menu.void,
    paddingHorizontal: 24,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  title: {
    marginTop: 48,
    color: menu.neon,
    fontSize: 32,
    fontWeight: '800',
  },
  list: {
    gap: 14,
  },
  line: {
    color: menu.text,
    fontSize: 17,
    lineHeight: 26,
  },
  cta: {
    backgroundColor: menu.neon,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: menu.void,
    fontSize: 18,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
});
