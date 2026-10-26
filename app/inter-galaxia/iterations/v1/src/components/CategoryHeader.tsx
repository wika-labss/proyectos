import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useCategory } from '../context/CategoryContext';

export function CategoryHeader() {
  const { categories, categoryId, setCategoryId, loading } = useCategory();

  if (loading && categories.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.hint}>Cargando categorías…</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Categoría</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {categories.map((cat) => {
          const active = cat.id === categoryId;
          return (
            <Pressable
              key={cat.id}
              onPress={() => setCategoryId(cat.id)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat.name}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    backgroundColor: '#0D3B1E',
  },
  title: {
    color: '#A5D6A7',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  row: {
    gap: 8,
    paddingBottom: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1B5E20',
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  chipActive: {
    backgroundColor: '#FFD54F',
    borderColor: '#FFC107',
  },
  chipText: {
    color: '#E8F5E9',
    fontWeight: '700',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#1B5E20',
  },
  hint: {
    color: '#C8E6C9',
    paddingVertical: 12,
  },
});
