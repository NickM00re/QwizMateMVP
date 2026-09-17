import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {Card} from '../components/Card';
import {EmptyState} from '../components/EmptyState';
import type {ScreenProps} from '../navigation/types';
import {useProjectsStore} from '../state/useProjectsStore';
import {colors, spacing, typography} from '../theme/theme';

export function ProjectsListScreen({navigation}: ScreenProps<'ProjectsList'>) {
  const {projects, isLoading, loadProjects, createProject} =
    useProjectsStore();
  const [isModalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [courseName, setCourseName] = useState('');

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      return;
    }
    const project = await createProject(trimmed, courseName.trim() || undefined);
    setName('');
    setCourseName('');
    setModalVisible(false);
    navigation.navigate('ProjectDetail', {
      projectId: project.id,
      projectName: project.name,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={typography.title}>Your Study Projects</Text>
        <Text style={styles.subtitle}>
          One project per course keeps notes and quizzes organized.
        </Text>
      </View>

      <FlatList
        data={projects}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        refreshing={isLoading}
        onRefresh={loadProjects}
        ListEmptyComponent={
          <EmptyState
            title="No projects yet"
            subtitle="Create a project for a course, then upload notes to generate your first quiz."
          />
        }
        renderItem={({item}) => (
          <Card
            style={styles.projectCard}
            onPress={() =>
              navigation.navigate('ProjectDetail', {
                projectId: item.id,
                projectName: item.name,
              })
            }>
            <Text style={styles.projectName}>{item.name}</Text>
            {item.courseName ? (
              <Text style={styles.projectCourse}>{item.courseName}</Text>
            ) : null}
          </Card>
        )}
      />

      <View style={styles.footer}>
        <Button title="+ New Project" onPress={() => setModalVisible(true)} />
      </View>

      <Modal
        visible={isModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={typography.heading}>New Project</Text>
            <TextInput
              placeholder="Project name (e.g. Biology 101)"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={setName}
              style={styles.input}
              autoFocus
            />
            <TextInput
              placeholder="Course name (optional)"
              placeholderTextColor={colors.textMuted}
              value={courseName}
              onChangeText={setCourseName}
              style={styles.input}
            />
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={styles.modalButton}
              />
              <Button
                title="Create"
                onPress={handleCreate}
                disabled={!name.trim()}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  header: {padding: spacing.lg, paddingBottom: spacing.md},
  subtitle: {...typography.caption, marginTop: spacing.xs},
  listContent: {padding: spacing.lg, paddingTop: 0, flexGrow: 1},
  projectCard: {marginBottom: spacing.md},
  projectName: {...typography.heading},
  projectCourse: {...typography.caption, marginTop: spacing.xs},
  footer: {padding: spacing.lg, paddingTop: 0},
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {flex: 1},
});
