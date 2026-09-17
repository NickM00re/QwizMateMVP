import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors, spacing} from '../theme/theme';

interface EmptyStateProps {
  title: string;
  subtitle?: string;
}

export function EmptyState({title, subtitle}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
