import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import type {ScreenProps} from '../navigation/types';
import {quizAttemptsRepository} from '../services/storage/repositories';
import type {QuizAttempt} from '../types/models';
import {colors, spacing, typography} from '../theme/theme';

export function QuizResultsScreen({
  route,
  navigation,
}: ScreenProps<'QuizResults'>) {
  const {attemptId} = route.params;
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);

  useEffect(() => {
    quizAttemptsRepository.getById(attemptId).then(a => setAttempt(a ?? null));
  }, [attemptId]);

  if (!attempt) {
    return <SafeAreaView style={styles.container} />;
  }

  const correctCount = attempt.answers.filter(a => a.correct).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.score}>{attempt.scorePercent ?? 0}%</Text>
        <Text style={typography.heading}>
          {correctCount} of {attempt.questionIds.length} correct
        </Text>
        <Text style={styles.subtitle}>
          Questions you missed will show up more often in future quizzes;
          ones you know well will appear less. Keep uploading notes to grow
          your question bank.
        </Text>
        <Button
          title="Back to Project"
          onPress={() => {
            // Pop both the Quiz and QuizResults screens to return to the
            // ProjectDetail screen already on the stack (preserving its title).
            if (navigation.canGoBack()) {
              navigation.pop(2);
            } else {
              navigation.navigate('ProjectsList');
            }
          }}
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {flex: 1, justifyContent: 'center', padding: spacing.xl, gap: spacing.md},
  score: {
    fontSize: 56,
    fontWeight: '800',
    color: colors.primary,
    textAlign: 'center',
  },
  subtitle: {...typography.caption, textAlign: 'center'},
  button: {marginTop: spacing.lg},
});
