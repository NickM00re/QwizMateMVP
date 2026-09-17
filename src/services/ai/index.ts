import type {AiService} from './AiService';
import {MockAiService} from './MockAiService';

/**
 * Single injection point for the active AI implementation.
 *
 * When a real backend is available, add a `RemoteAiService implements
 * AiService` (calling e.g. `${API_BASE_URL}/projects/:id/questions`) and
 * swap it in here behind an environment flag — no other file needs to
 * change because every caller depends on the `AiService` interface.
 */
export const aiService: AiService = new MockAiService();

export type {AiService, GenerateQuestionsRequest} from './AiService';
