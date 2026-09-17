import React, {useEffect} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {Card} from '../components/Card';
import {EmptyState} from '../components/EmptyState';
import type {ScreenProps} from '../navigation/types';
import {EMPTY_ARRAY} from '../state/emptyArray';
import {useNotesStore} from '../state/useNotesStore';
import {useQuizStore} from '../state/useQuizStore';
import {colors, spacing, typography} from '../theme/theme';

export function ProjectDetailScreen({
  route,
  navigation,
}: ScreenProps<'ProjectDetail'>) {
  const {projectId, projectName} = route.params;
  const notes = useNotesStore(
    state => state.notesByProject[projectId] ?? EMPTY_ARRAY,
  );
  const loadNotes = useNotesStore(state => state.loadNotes);

  const questions = useQuizStore(
    state => state.questionsByProject[projectId] ?? EMPTY_ARRAY,
  );
  const loadQuestions = useQuizStore(state => state.loadQuestions);
  const generateQuiz = useQuizStore(state => state.generateQuiz);
  const isGenerating = useQuizStore(state => state.isGenerating);

  useEffect(() => {
    navigation.setOptions({title: projectName});
    loadNotes(projectId);
    loadQuestions(projectId);
  }, [projectId, projectName, navigation, loadNotes, loadQuestions]);

  const notesWithText = notes.filter(n => n.extractedText && !n.isProcessing);

  const handleGenerate = async () => {
    if (notesWithText.length === 0) {
      return;
    }
    await generateQuiz(projectId, notesWithText);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={notes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.summaryRow}>
            <SummaryStat label="Notes" value={notes.length} />
            <SummaryStat label="Questions" value={questions.length} />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="No notes yet"
            subtitle="Upload a document, photo of handwritten notes, or type notes directly to get started."
          />
        }
        renderItem={({item}) => (
          <Card style={styles.noteCard}>
            <Text style={styles.noteTitle}>{item.title}</Text>
            <Text style={styles.noteMeta}>
              {item.isProcessing
                ? 'Processing…'
                : `${item.sourceType} · ${item.extractedText.length} characters`}
            </Text>
          </Card>
        )}
      />

      <View style={styles.footer}>
        <Button
          title="Upload Notes"
          variant="secondary"
          onPress={() => navigation.navigate('UploadNote', {projectId})}
          style={styles.footerButton}
        />
        <Button
          title={
            questions.length > 0 ? 'Generate More Questions' : 'Generate Quiz'
          }
          onPress={handleGenerate}
          disabled={notesWithText.length === 0}
          loading={isGenerating}
          style={styles.footerButton}
        />
        <Button
          title="Take Quiz"
          variant="secondary"
          onPress={() => navigation.navigate('Quiz', {projectId})}
          disabled={questions.length === 0}
          style={styles.footerButton}
        />
      </View>
    </SafeAreaView>
  );
}

function SummaryStat({label, value}: {label: string; value: number}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  listContent: {padding: spacing.lg, flexGrow: 1},
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
  },
  statValue: {...typography.title, fontSize: 24},
  statLabel: {...typography.caption},
  noteCard: {marginBottom: spacing.md},
  noteTitle: {...typography.body, fontWeight: '600'},
  noteMeta: {...typography.caption, marginTop: spacing.xs},
  footer: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerButton: {},
});
