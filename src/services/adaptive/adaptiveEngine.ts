import type {Question} from '../../types/models';

/**
 * Adaptive quiz-selection engine.
 *
 * Goal: questions the student consistently answers correctly should show up
 * less often, while ones they struggle with should be reinforced. This is a
 * lightweight heuristic (not full spaced-repetition scheduling) appropriate
 * for an MVP, but it is isolated here so it can be swapped for a real
 * algorithm (e.g. SM-2) later without touching quiz/UI code.
 *
 * Weighting factors, higher weight = more likely to be picked:
 *  - Never-shown questions get a strong boost (explore new material first).
 *  - Low mastery score increases weight (reinforce weak areas).
 *  - Recently-shown questions are down-weighted to avoid immediate repeats.
 */
export function selectQuizQuestions(
  allQuestions: Question[],
  count: number,
): Question[] {
  if (allQuestions.length <= count) {
    return shuffle([...allQuestions]);
  }

  const now = Date.now();
  const weighted = allQuestions.map(question => ({
    question,
    weight: computeWeight(question, now),
  }));

  const selected: Question[] = [];
  const pool = [...weighted];

  while (selected.length < count && pool.length > 0) {
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let roll = Math.random() * totalWeight;
    let pickedIndex = 0;

    for (let i = 0; i < pool.length; i++) {
      roll -= pool[i].weight;
      if (roll <= 0) {
        pickedIndex = i;
        break;
      }
    }

    selected.push(pool[pickedIndex].question);
    pool.splice(pickedIndex, 1);
  }

  return selected;
}

function computeWeight(question: Question, now: number): number {
  const {performance} = question;

  if (performance.timesShown === 0) {
    return 10;
  }

  // masteryScore in [0,1]; invert so low mastery -> high weight.
  const masteryWeight = 1 + (1 - performance.masteryScore) * 8;

  const hoursSinceShown = performance.lastShownAt
    ? (now - new Date(performance.lastShownAt).getTime()) / (1000 * 60 * 60)
    : Infinity;
  // Ramp recency weight back up to 1x over ~24 hours.
  const recencyWeight = Math.min(1, hoursSinceShown / 24) || 0.1;

  return Math.max(0.1, masteryWeight * recencyWeight);
}

/**
 * Updates a question's rolling performance stats after it has been
 * answered. `masteryScore` uses an exponential moving average so recent
 * answers matter more than distant history.
 */
export function recordAnswer(
  question: Question,
  wasCorrect: boolean,
): Question {
  const {performance} = question;
  const alpha = 0.4; // weight given to the most recent answer
  const previousMastery = performance.timesShown === 0 ? 0.5 : performance.masteryScore;
  const masteryScore =
    previousMastery * (1 - alpha) + (wasCorrect ? 1 : 0) * alpha;

  return {
    ...question,
    performance: {
      timesShown: performance.timesShown + 1,
      timesCorrect: performance.timesCorrect + (wasCorrect ? 1 : 0),
      lastShownAt: new Date().toISOString(),
      masteryScore,
    },
  };
}

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
