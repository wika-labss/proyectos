import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { bit } from '../src/constants/theme';

const RULES = [
  'CONTROL A VAUS. TOCA PARA LANZAR.',
  '33 NIVELES. SI CAE LA BOLA, PIERDES UNA VIDA.',
  'CAPSULAS: ATRAPALAS CON LA PALA.',
  'L LASER  E ENLARGE  C CATCH',
  'S SLOW  B BREAK  D DISRUPT  P 1UP',
  'SIN MUSICA. V4 QUITA EL MP3 PARA QUE LA APP ARRANQUE.',
];

export default function HowToScreen() {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <View style={styles.safe}>
        <Text style={styles.title}>COMO JUGAR</Text>
        <ScrollView contentContainerStyle={styles.rules}>
          {RULES.map((rule) => (
            <View key={rule} style={styles.ruleBox}>
              <Text style={styles.rule}>{rule}</Text>
            </View>
          ))}
        </ScrollView>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.back()}
          style={({ pressed }) => [styles.back, pressed && styles.pressed]}
        >
          <Text style={styles.backText}>VOLVER</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bit.night,
  },
  safe: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 28,
    justifyContent: 'space-between',
    gap: 16,
  },
  title: {
    color: bit.gold,
    fontSize: 18,
    fontWeight: '800',
  },
  rules: {
    gap: 10,
    paddingBottom: 16,
  },
  ruleBox: {
    borderWidth: 3,
    borderColor: bit.wall,
    backgroundColor: bit.panel,
    padding: 10,
  },
  rule: {
    color: bit.ink,
    fontSize: 12,
    lineHeight: 18,
  },
  back: {
    borderWidth: 3,
    borderColor: bit.gold,
    backgroundColor: bit.panel,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backText: {
    color: bit.gold,
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
});
