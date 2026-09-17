import type {Note, Question, QuestionDifficulty} from '../../types/models';

/**
 * Abstraction over "AI that turns study notes into quiz questions".
 *
 * IMPORTANT (security/architecture): the mobile client should never hold an
 * AI provider API key directly. In production, `RemoteAiService` (to be
 * added alongside a real backend) should call a QwizMate backend endpoint
 * that in turn calls the LLM provider server-side. This interface lets the
 * rest of the app depend only on the contract below, so swapping the mock
 * implementation for a real network client is a one-line change (see
 * `src/services/ai/index.ts`).
 */
export interface GenerateQuestionsRequest {
  projectId: string;
  notes: Note[];
  /** How many new questions to generate in this batch. */
  count: number;
}

export interface AiService {
  /**
   * Generates quiz questions strictly grounded in the provided notes.
   * Implementations must not introduce facts absent from `notes`.
   */
  generateQuestions(request: GenerateQuestionsRequest): Promise<
    Omit<Question, 'id' | 'performance' | 'createdAt' | 'projectId'>[]
  >;

  /**
   * Extracts plain text from a document or a photo of handwritten/printed
   * notes (OCR). Used before a Note is sent for question generation.
   */
  extractText(input: {
    sourceType: 'document' | 'image';
    fileUri: string;
  }): Promise<string>;
}

export const DEFAULT_DIFFICULTY_CYCLE: QuestionDifficulty[] = [
  'easy',
  'medium',
  'medium',
  'hard',
];
