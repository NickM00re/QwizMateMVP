import {
  recordAnswer,
  selectQuizQuestions,
} from '../src/services/adaptive/adaptiveEngine';
import type {Question} from '../src/types/models';

function makeQuestion(overrides: Partial<Question> = {}): Question {
  return {
    id: overrides.id ?? Math.random().toString(36),
    projectId: 'p1',
    sourceNoteIds: [],
    prompt: 'Q',
    choices: ['a', 'b', 'c', 'd'],
    correctChoiceIndex: 0,
    difficulty: 'medium',
    performance: {timesShown: 0, timesCorrect: 0, masteryScore: 0.5},
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('recordAnswer', () => {
  it('increments shown/correct counts and raises mastery on a correct answer', () => {
    const question = makeQuestion();
    const updated = recordAnswer(question, true);
    expect(updated.performance.timesShown).toBe(1);
    expect(updated.performance.timesCorrect).toBe(1);
    expect(updated.performance.masteryScore).toBeGreaterThan(0.5);
  });

  it('lowers mastery on an incorrect answer', () => {
    const question = makeQuestion();
    const updated = recordAnswer(question, false);
    expect(updated.performance.timesCorrect).toBe(0);
    expect(updated.performance.masteryScore).toBeLessThan(0.5);
  });
});

describe('selectQuizQuestions', () => {
  it('returns all questions when there are fewer than the requested count', () => {
    const questions = [makeQuestion({id: '1'}), makeQuestion({id: '2'})];
    const selected = selectQuizQuestions(questions, 5);
    expect(selected).toHaveLength(2);
  });

  it('never returns duplicate questions and respects the requested count', () => {
    const questions = Array.from({length: 10}, (_, i) =>
      makeQuestion({id: `q${i}`}),
    );
    const selected = selectQuizQuestions(questions, 4);
    expect(selected).toHaveLength(4);
    const ids = new Set(selected.map(q => q.id));
    expect(ids.size).toBe(4);
  });

  it('strongly favors never-shown questions over mastered ones', () => {
    const mastered = makeQuestion({
      id: 'mastered',
      performance: {
        timesShown: 20,
        timesCorrect: 20,
        masteryScore: 1,
        lastShownAt: new Date().toISOString(),
      },
    });
    const neverShown = makeQuestion({id: 'new'});
    const others = Array.from({length: 8}, (_, i) =>
      makeQuestion({id: `filler${i}`}),
    );

    const counts: Record<string, number> = {mastered: 0, new: 0};
    for (let i = 0; i < 200; i++) {
      const selected = selectQuizQuestions(
        [mastered, neverShown, ...others],
        1,
      );
      counts[selected[0].id] = (counts[selected[0].id] ?? 0) + 1;
    }

    expect(counts.new).toBeGreaterThan(counts.mastered);
  });
});
