import {create} from 'zustand';
import {notesRepository} from '../services/storage/repositories';
import {aiService} from '../services/ai';
import {createId, nowIso, type Note, type NoteSourceType} from '../types/models';

interface NotesState {
  notesByProject: Record<string, Note[]>;
  isProcessing: boolean;
  loadNotes: (projectId: string) => Promise<void>;
  addTextNote: (
    projectId: string,
    title: string,
    text: string,
  ) => Promise<Note>;
  addFileNote: (
    projectId: string,
    title: string,
    sourceType: Extract<NoteSourceType, 'document' | 'image'>,
    fileUri: string,
  ) => Promise<Note>;
  deleteNote: (projectId: string, noteId: string) => Promise<void>;
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notesByProject: {},
  isProcessing: false,

  loadNotes: async projectId => {
    const all = await notesRepository.getAll();
    const notes = all
      .filter(n => n.projectId === projectId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    set({notesByProject: {...get().notesByProject, [projectId]: notes}});
  },

  addTextNote: async (projectId, title, text) => {
    const timestamp = nowIso();
    const note: Note = {
      id: createId(),
      projectId,
      title,
      sourceType: 'text',
      extractedText: text,
      isProcessing: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await notesRepository.save(note);
    const current = get().notesByProject[projectId] ?? [];
    set({
      notesByProject: {
        ...get().notesByProject,
        [projectId]: [note, ...current],
      },
    });
    return note;
  },

  addFileNote: async (projectId, title, sourceType, fileUri) => {
    const timestamp = nowIso();
    let note: Note = {
      id: createId(),
      projectId,
      title,
      sourceType,
      fileUri,
      extractedText: '',
      isProcessing: true,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await notesRepository.save(note);
    const current = get().notesByProject[projectId] ?? [];
    set({
      notesByProject: {
        ...get().notesByProject,
        [projectId]: [note, ...current],
      },
      isProcessing: true,
    });

    // Kick off (mock) text extraction so the note becomes usable for quiz
    // generation without blocking the UI thread on the upload screen.
    const extractedText = await aiService.extractText({sourceType, fileUri});
    note = {
      ...note,
      extractedText,
      isProcessing: false,
      updatedAt: nowIso(),
    };
    await notesRepository.save(note);
    const updated = (get().notesByProject[projectId] ?? []).map(n =>
      n.id === note.id ? note : n,
    );
    set({
      notesByProject: {...get().notesByProject, [projectId]: updated},
      isProcessing: false,
    });
    return note;
  },

  deleteNote: async (projectId, noteId) => {
    await notesRepository.remove(noteId);
    const current = get().notesByProject[projectId] ?? [];
    set({
      notesByProject: {
        ...get().notesByProject,
        [projectId]: current.filter(n => n.id !== noteId),
      },
    });
  },
}));
