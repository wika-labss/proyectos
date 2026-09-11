import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, fonts, radius, spacing } from '../constants/theme';

type ProjectCardProps = {
  name: string;
  onPress: () => void;
};

export function ProjectCard({ name, onPress }: ProjectCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress} accessibilityRole="button">
      <Text style={styles.name}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    minHeight: 72,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  name: {
    color: colors.text,
    fontSize: fonts.heading,
    fontWeight: '400',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
