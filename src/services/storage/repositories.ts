import {AsyncStorageRepository} from './AsyncStorageRepository';
import type {Note, Project, Question, QuizAttempt} from '../../types/models';

/**
 * Single source of truth for storage keys + repository instances.
 * Import these singletons rather than constructing new repositories so all
 * screens/stores share the same in-memory cache semantics.
 */
export const projectsRepository = new AsyncStorageRepository<Project>(
  '@qwizmate/projects',
);

export const notesRepository = new AsyncStorageRepository<Note>(
  '@qwizmate/notes',
);

export const questionsRepository = new AsyncStorageRepository<Question>(
  '@qwizmate/questions',
);

export const quizAttemptsRepository = new AsyncStorageRepository<QuizAttempt>(
  '@qwizmate/quiz_attempts',
);
