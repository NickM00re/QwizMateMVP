/**
 * Core domain models for QwizMate.
 *
 * These types intentionally model an "offline-first" data shape: every
 * entity carries the timestamps needed to reconcile with a future backend
 * sync process, even though the MVP only persists to local device storage.
 */

/** A student-defined container for a course or subject (e.g. "Biology 101"). */
export interface Project {
  id: string;
  name: string;
  courseName?: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
}

export type NoteSourceType = 'text' | 'document' | 'image';

/** A single piece of source material a student has added to a project. */
export interface Note {
  id: string;
  projectId: string;
  title: string;
  sourceType: NoteSourceType;
  /** Original file name/uri for documents & images; undefined for typed text. */
  fileUri?: string;
  /** Plain-text content: typed directly, or extracted via OCR/parsing from a file/image. */
  extractedText: string;
  /** True while the AI text-extraction step (OCR/parsing) has not finished yet. */
  isProcessing: boolean;
  createdAt: string;
  updatedAt: string;
}

export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

/** Rolling performance stats used to drive adaptive quiz selection. */
export interface QuestionPerformance {
  timesShown: number;
  timesCorrect: number;
  lastShownAt?: string;
  /** Simple mastery score in [0, 1]; higher means the student knows it well. */
  masteryScore: number;
}

/** An AI-generated multiple-choice question tied back to its source notes. */
export interface Question {
  id: string;
  projectId: string;
  sourceNoteIds: string[];
  prompt: string;
  choices: string[];
  correctChoiceIndex: number;
  explanation?: string;
  difficulty: QuestionDifficulty;
  performance: QuestionPerformance;
  createdAt: string;
}

export interface QuizAnswer {
  questionId: string;
  selectedChoiceIndex: number;
  correct: boolean;
}

/** A single completed (or in-progress) quiz-taking session. */
export interface QuizAttempt {
  id: string;
  projectId: string;
  questionIds: string[];
  answers: QuizAnswer[];
  startedAt: string;
  completedAt?: string;
  scorePercent?: number;
}

export function createId(): string {
  // React Native's JS engine (Hermes) supports crypto.randomUUID in RN 0.87+.
  // Fall back to a timestamp+random string for older engines/tests.
  const globalCrypto = (globalThis as {crypto?: {randomUUID?: () => string}})
    .crypto;
  if (globalCrypto?.randomUUID) {
    return globalCrypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
