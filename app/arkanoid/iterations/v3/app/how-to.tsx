import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { menu } from '../src/constants/theme';

export default function HowToScreen() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <View style={styles.nebula} />
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Cómo jugar</Text>
        <View style={styles.rules}>
          <Text style={styles.rule}>Arrastra la pala. Toca para lanzar la bola.</Text>
          <Text style={styles.rule}>En cada nivel hay un jefe: rompe el muro y derrota al jefe.</Text>
          <Text style={styles.rule}>Si la bola cae, pierdes una vida. Tienes 3.</Text>
          <Text style={styles.rule}>El jefe se endurece por nivel (4 / 6 / 8 golpes).</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText}>Volver</Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: menu.void,
  },
  nebula: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: menu.nebulaTop,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  title: {
    color: menu.neon,
    fontSize: 32,
    fontWeight: '800',
  },
  rules: {
    gap: 18,
  },
  rule: {
    color: menu.text,
    fontSize: 18,
    lineHeight: 26,
  },
  cta: {
    borderWidth: 1,
    borderColor: menu.neon,
    borderRadius: 4,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: menu.neon,
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.85,
  },
});
