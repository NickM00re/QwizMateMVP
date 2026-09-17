import {create} from 'zustand';
import {
  questionsRepository,
  quizAttemptsRepository,
} from '../services/storage/repositories';
import {aiService} from '../services/ai';
import {selectQuizQuestions, recordAnswer} from '../services/adaptive/adaptiveEngine';
import {
  createId,
  nowIso,
  type Note,
  type Question,
  type QuizAttempt,
} from '../types/models';

const QUESTIONS_PER_QUIZ = 5;
const NEW_QUESTIONS_PER_GENERATION = 5;

interface QuizState {
  questionsByProject: Record<string, Question[]>;
  activeAttempt: QuizAttempt | null;
  isGenerating: boolean;

  loadQuestions: (projectId: string) => Promise<void>;
  generateQuiz: (projectId: string, notes: Note[]) => Promise<void>;
  startQuiz: (projectId: string) => Promise<QuizAttempt>;
  answerQuestion: (
    questionId: string,
    selectedChoiceIndex: number,
  ) => Promise<void>;
  finishQuiz: () => Promise<QuizAttempt | null>;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  questionsByProject: {},
  activeAttempt: null,
  isGenerating: false,

  loadQuestions: async projectId => {
    const all = await questionsRepository.getAll();
    const questions = all.filter(q => q.projectId === projectId);
    set({
      questionsByProject: {...get().questionsByProject, [projectId]: questions},
    });
  },

  /** Uses the AI service to add a fresh batch of questions grounded in the given notes. */
  generateQuiz: async (projectId, notes) => {
    set({isGenerating: true});
    try {
      const drafts = await aiService.generateQuestions({
        projectId,
        notes,
        count: NEW_QUESTIONS_PER_GENERATION,
      });
      const timestamp = nowIso();
      const newQuestions: Question[] = drafts.map(draft => ({
        ...draft,
        id: createId(),
        projectId,
        performance: {timesShown: 0, timesCorrect: 0, masteryScore: 0.5},
        createdAt: timestamp,
      }));
      for (const question of newQuestions) {
        await questionsRepository.save(question);
      }
      const existing = get().questionsByProject[projectId] ?? [];
      set({
        questionsByProject: {
          ...get().questionsByProject,
          [projectId]: [...existing, ...newQuestions],
        },
      });
    } finally {
      set({isGenerating: false});
    }
  },

  startQuiz: async projectId => {
    const allQuestions = get().questionsByProject[projectId] ?? [];
    const selected = selectQuizQuestions(allQuestions, QUESTIONS_PER_QUIZ);
    const attempt: QuizAttempt = {
      id: createId(),
      projectId,
      questionIds: selected.map(q => q.id),
      answers: [],
      startedAt: nowIso(),
    };
    await quizAttemptsRepository.save(attempt);
    set({activeAttempt: attempt});
    return attempt;
  },

  answerQuestion: async (questionId, selectedChoiceIndex) => {
    const attempt = get().activeAttempt;
    if (!attempt) {
      return;
    }
    const projectId = attempt.projectId;
    const question = (get().questionsByProject[projectId] ?? []).find(
      q => q.id === questionId,
    );
    if (!question) {
      return;
    }
    const correct = question.correctChoiceIndex === selectedChoiceIndex;

    const updatedQuestion = recordAnswer(question, correct);
    await questionsRepository.save(updatedQuestion);
    const updatedQuestions = (get().questionsByProject[projectId] ?? []).map(
      q => (q.id === questionId ? updatedQuestion : q),
    );

    const updatedAttempt: QuizAttempt = {
      ...attempt,
      answers: [
        ...attempt.answers.filter(a => a.questionId !== questionId),
        {questionId, selectedChoiceIndex, correct},
      ],
    };
    await quizAttemptsRepository.save(updatedAttempt);

    set({
      questionsByProject: {
        ...get().questionsByProject,
        [projectId]: updatedQuestions,
      },
      activeAttempt: updatedAttempt,
    });
  },

  finishQuiz: async () => {
    const attempt = get().activeAttempt;
    if (!attempt) {
      return null;
    }
    const correctCount = attempt.answers.filter(a => a.correct).length;
    const scorePercent =
      attempt.questionIds.length === 0
        ? 0
        : Math.round((correctCount / attempt.questionIds.length) * 100);
    const completedAttempt: QuizAttempt = {
      ...attempt,
      completedAt: nowIso(),
      scorePercent,
    };
    await quizAttemptsRepository.save(completedAttempt);
    set({activeAttempt: null});
    return completedAttempt;
  },
}));
