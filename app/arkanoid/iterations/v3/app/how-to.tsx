import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { menu } from '../src/constants/theme';

export default function HowToScreen() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <View style={styles.nebula} />
      <SafeAreaView style={styles.safe}>
        <Text style={styles.title}>Cómo jugar</Text>
        <ScrollView contentContainerStyle={styles.rules}>
          <Text style={styles.rule}>Controla la nave Vaus (pala). Toca para lanzar la cápsula de energía.</Text>
          <Text style={styles.rule}>Rompe el muro para pasar de nivel. Si cae la última bola, pierdes una vida.</Text>
          <Text style={styles.rule}>Al romper ladrillos caen cápsulas. Atrápala con la pala:</Text>
          <Text style={styles.rule}>L Láser — dispara a los bloques. E Enlarge — alarga la Vaus.</Text>
          <Text style={styles.rule}>C Catch — atrapa la bola y lanza cuando quieras. S Slow — la ralenta.</Text>
          <Text style={styles.rule}>B Break — abre la puerta derecha y sal al siguiente nivel.</Text>
          <Text style={styles.rule}>D Disrupt — divide la bola en tres. P Player — vida extra.</Text>
          <Text style={styles.rule}>La música ambiente (el tema Castillo) suena en loop desde que abres la app, en el menú y durante toda la partida. El volumen Ambiente no afecta a los efectos.</Text>
        </ScrollView>
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
    marginBottom: 16,
  },
  rules: {
    gap: 14,
    paddingBottom: 20,
  },
  rule: {
    color: menu.text,
    fontSize: 16,
    lineHeight: 24,
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
