import React, {useState} from 'react';
import {Alert, ScrollView, StyleSheet, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import type {ScreenProps} from '../navigation/types';
import {useNotesStore} from '../state/useNotesStore';
import {colors, spacing, typography} from '../theme/theme';

type Mode = 'text' | 'document' | 'image';

export function UploadNoteScreen({route, navigation}: ScreenProps<'UploadNote'>) {
  const {projectId} = route.params;
  const addTextNote = useNotesStore(state => state.addTextNote);
  const addFileNote = useNotesStore(state => state.addFileNote);

  const [mode, setMode] = useState<Mode>('text');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isSaving, setSaving] = useState(false);

  const handlePickDocument = async () => {
    try {
      // Lazily required so the JS bundle (and Metro/type-check) still work
      // in environments where the native module hasn't been linked yet
      // (e.g. before `pod install` / a fresh Android build).
      const {pick} = require('@react-native-documents/picker');
      const [result] = await pick({type: ['application/pdf', 'text/*']});
      setTitle(prev => prev || result.name || 'Uploaded document');
      await saveFileNote('document', result.uri);
    } catch (error: any) {
      if (error?.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert('Upload failed', 'Could not read that document.');
      }
    }
  };

  const handlePickImage = async () => {
    try {
      const {launchImageLibrary} = require('react-native-image-picker');
      launchImageLibrary({mediaType: 'photo'}, async (response: any) => {
        const asset = response.assets?.[0];
        if (!asset?.uri) {
          return;
        }
        setTitle(prev => prev || asset.fileName || 'Scanned notes');
        await saveFileNote('image', asset.uri);
      });
    } catch {
      Alert.alert('Upload failed', 'Could not open the photo library.');
    }
  };

  const saveFileNote = async (
    sourceType: 'document' | 'image',
    fileUri: string,
  ) => {
    setSaving(true);
    try {
      await addFileNote(
        projectId,
        title.trim() || 'Untitled note',
        sourceType,
        fileUri,
      );
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTypedNote = async () => {
    if (!text.trim()) {
      return;
    }
    setSaving(true);
    try {
      await addTextNote(projectId, title.trim() || 'Untitled note', text.trim());
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={typography.heading}>Add Study Material</Text>
        <Text style={styles.subtitle}>
          Upload a document, a photo of handwritten notes, or type notes
          directly. QwizMate only generates questions from what you provide.
        </Text>

        <View style={styles.modeRow}>
          <ModeButton
            label="Type Notes"
            active={mode === 'text'}
            onPress={() => setMode('text')}
          />
          <ModeButton
            label="Document"
            active={mode === 'document'}
            onPress={() => setMode('document')}
          />
          <ModeButton
            label="Photo"
            active={mode === 'image'}
            onPress={() => setMode('image')}
          />
        </View>

        <TextInput
          placeholder="Title (e.g. Chapter 4 - Cell Biology)"
          placeholderTextColor={colors.textMuted}
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        {mode === 'text' && (
          <>
            <TextInput
              placeholder="Type or paste your notes here…"
              placeholderTextColor={colors.textMuted}
              value={text}
              onChangeText={setText}
              style={[styles.input, styles.textArea]}
              multiline
              textAlignVertical="top"
            />
            <Button
              title="Save Note"
              onPress={handleSaveTypedNote}
              disabled={!text.trim()}
              loading={isSaving}
            />
          </>
        )}

        {mode === 'document' && (
          <Button
            title="Choose a Document"
            onPress={handlePickDocument}
            loading={isSaving}
          />
        )}

        {mode === 'image' && (
          <Button
            title="Choose a Photo"
            onPress={handlePickImage}
            loading={isSaving}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      title={label}
      variant={active ? 'primary' : 'secondary'}
      onPress={onPress}
      style={styles.modeButton}
    />
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: colors.background},
  content: {padding: spacing.lg, gap: spacing.md},
  subtitle: {...typography.caption},
  modeRow: {flexDirection: 'row', gap: spacing.sm},
  modeButton: {flex: 1, paddingHorizontal: spacing.sm},
  input: {
    backgroundColor: colors.surfaceAlt,
    color: colors.text,
    borderRadius: 12,
    padding: spacing.md,
  },
  textArea: {minHeight: 160},
});
