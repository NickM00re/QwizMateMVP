import type {AiService, GenerateQuestionsRequest} from './AiService';
import {DEFAULT_DIFFICULTY_CYCLE} from './AiService';
import type {Question} from '../../types/models';

/**
 * Local, offline-friendly stand-in for the real AI backend.
 *
 * This lets the app be built, run, and demoed end-to-end before a real
 * backend/LLM integration exists. It produces deterministic,
 * clearly-labeled "mock" questions derived from simple heuristics over the
 * note text (sentence splitting + keyword picking) so the rest of the app
 * (adaptive selection, quiz UI, offline storage) can be fully exercised.
 *
 * Replace with a `RemoteAiService` that calls the QwizMate backend once it
 * exists — see the contract in `AiService.ts`.
 */
export class MockAiService implements AiService {
  async extractText(input: {
    sourceType: 'document' | 'image';
    fileUri: string;
  }): Promise<string> {
    // A real implementation would call an OCR/document-parsing endpoint.
    // For local development we simulate latency and return a placeholder
    // the student can edit before generating questions.
    await delay(400);
    return `[${input.sourceType === 'image' ? 'Scanned' : 'Imported'} text from ${lastPathSegment(
      input.fileUri,
    )} — edit this to match your actual notes before generating a quiz.]`;
  }

  async generateQuestions(
    request: GenerateQuestionsRequest,
  ): Promise<
    Omit<Question, 'id' | 'performance' | 'createdAt' | 'projectId'>[]
  > {
    await delay(600);

    const sentences = request.notes
      .flatMap(note => splitIntoSentences(note.extractedText))
      .filter(sentence => sentence.length > 25)
      .slice(0, Math.max(request.count * 3, request.count));

    const questionCount = Math.min(
      request.count,
      Math.max(sentences.length, 1),
    );

    const questions: Omit<
      Question,
      'id' | 'performance' | 'createdAt' | 'projectId'
    >[] = [];

    for (let i = 0; i < questionCount; i++) {
      const sentence = sentences[i % Math.max(sentences.length, 1)] ?? '';
      const noteIds = request.notes.map(n => n.id);
      const difficulty =
        DEFAULT_DIFFICULTY_CYCLE[i % DEFAULT_DIFFICULTY_CYCLE.length];

      questions.push({
        sourceNoteIds: noteIds,
        prompt: sentence
          ? `Which statement best matches your notes?\n"${truncate(sentence, 140)}"`
          : 'Add more detailed notes to generate richer questions.',
        choices: [
          sentence ? truncate(sentence, 100) : 'Not enough note content yet',
          'A plausible but incorrect distractor',
          'Another plausible but incorrect distractor',
          'None of the above',
        ],
        correctChoiceIndex: 0,
        explanation: sentence
          ? `This is taken directly from your uploaded notes: "${truncate(sentence, 200)}"`
          : undefined,
        difficulty,
      });
    }

    return questions;
  }
}

function splitIntoSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);
}

function truncate(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function lastPathSegment(uri: string): string {
  const parts = uri.split(/[\\/]/);
  return parts[parts.length - 1] || uri;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
