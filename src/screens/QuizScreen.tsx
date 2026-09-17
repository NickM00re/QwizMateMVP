import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {Card} from '../components/Card';
import {EmptyState} from '../components/EmptyState';
import type {ScreenProps} from '../navigation/types';
import {EMPTY_ARRAY} from '../state/emptyArray';
import {useQuizStore} from '../state/useQuizStore';
import {colors, spacing, typography} from '../theme/theme';

export function QuizScreen({route, navigation}: ScreenProps<'Quiz'>) {
  const {projectId} = route.params;
  const questions = useQuizStore(
    state => state.questionsByProject[projectId] ?? EMPTY_ARRAY,
  );
  const activeAttempt = useQuizStore(state => state.activeAttempt);
  const startQuiz = useQuizStore(state => state.startQuiz);
  const answerQuestion = useQuizStore(state => state.answerQuestion);
  const finishQuiz = useQuizStore(state => state.finishQuiz);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);

  useEffect(() => {
    startQuiz(projectId);
  }, [projectId, startQuiz]);

  if (!activeAttempt) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState title="Preparing your quiz…" />
      </SafeAreaView>
    );
  }

  const attemptQuestions = activeAttempt.questionIds
    .map(id => questions.find(q => q.id === id))
    .filter((q): q is NonNullable<typeof q> => !!q);
  const currentQuestion = attemptQuestions[currentIndex];

  if (!currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <EmptyState title="No questions available for this quiz." />
      </SafeAreaView>
    );
  }

  const handleSelect = async (choiceIndex: number) => {
    if (hasAnswered) {
      return;
    }
    setSelectedChoice(choiceIndex);
    setHasAnswered(true);
    await answerQuestion(currentQuestion.id, choiceIndex);
  };

  const handleNext = async () => {
    if (currentIndex + 1 < attemptQuestions.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedChoice(null);
      setHasAnswered(false);
    } else {
      const completed = await finishQuiz();
      if (completed) {
        navigation.replace('QuizResults', {attemptId: completed.id});
      }
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.progressRow}>
        <Text style={styles.progressText}>
          Question {currentIndex + 1} of {attemptQuestions.length}
        </Text>
      </View>

      <Card style={styles.questionCard}>
        <Text style={styles.prompt}>{currentQuestion.prompt}</Text>
      </Card>

      <View style={styles.choices}>
        {currentQuestion.choices.map((choice, index) => {
          const isCorrect = index === currentQuestion.correctChoiceIndex;
          const isSelected = index === selectedChoice;
          const showResult = hasAnswered && (isCorrect || isSelected);

          return (
            <Card
              key={index}
              onPress={() => handleSelect(index)}
              style={[
                styles.choiceCard,
                showResult && isCorrect && styles.choiceCorrect,
                showResult && isSelected && !isCorrect && styles.choiceIncorrect,
              ]}>
              <Text style={styles.choiceText}>{choice}</Text>
            </Card>
          );
        })}
      </View>

      {hasAnswered && currentQuestion.explanation ? (
        <Text style={styles.explanation}>{currentQuestion.explanation}</Text>
      ) : null}

      <View style={styles.footer}>
        <Button
          title={
            currentIndex + 1 < attemptQuestions.length
              ? 'Next Question'
              : 'Finish Quiz'
          }
          onPress={handleNext}
          disabled={!hasAnswered}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  progressRow: {padding: spacing.lg, paddingBottom: 0},
  progressText: {...typography.caption},
  questionCard: {margin: spacing.lg, marginBottom: spacing.md},
  prompt: {...typography.body, fontWeight: '600'},
  choices: {paddingHorizontal: spacing.lg, gap: spacing.sm},
  choiceCard: {},
  choiceCorrect: {borderColor: colors.success, borderWidth: 2},
  choiceIncorrect: {borderColor: colors.danger, borderWidth: 2},
  choiceText: {...typography.body},
  explanation: {
    ...typography.caption,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  footer: {padding: spacing.lg, marginTop: 'auto'},
});
