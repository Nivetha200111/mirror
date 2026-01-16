import { ATTRIBUTE_KEYS, MatchResult, Mentor, MultiMatchResult, Trait, UserTraitSelection, Vector } from "@/types";

const BASELINE_SCORE = 5;
const MAX_SCORE = 10;

const baseVector: Vector = {
  risk: BASELINE_SCORE,
  network: BASELINE_SCORE,
  grind: BASELINE_SCORE,
  education: BASELINE_SCORE,
  resilience: BASELINE_SCORE,
};

// Weights allow us to prioritize certain attributes over others.
// e.g., Risk alignment might be 1.5x more important than Education.
const ATTRIBUTE_WEIGHTS: Vector = {
  risk: 1.5,
  network: 1.0,
  grind: 1.2,
  education: 0.8,
  resilience: 1.0,
};

const clampScore = (value: number) => Math.min(MAX_SCORE, Math.max(0, value));

export const buildUserVector = (selectedTraits: Trait[], selections?: UserTraitSelection[]): Vector => {
  const merged: Vector = { ...baseVector };

  for (const trait of selectedTraits) {
    // Find intensity multiplier if available
    const selection = selections?.find(s => s.traitId === trait.id);
    const intensityMultiplier = selection ? selection.intensity / 100 : 1;

    for (const key of ATTRIBUTE_KEYS) {
      const impactValue = trait.impact[key] * intensityMultiplier;
      merged[key] = clampScore(merged[key] + impactValue);
    }
  }

  return merged;
};

export const euclideanDistance = (a: Vector, b: Vector) => {
  const sumSq = ATTRIBUTE_KEYS.reduce((acc, key) => {
    const diff = a[key] - b[key];
    const weight = ATTRIBUTE_WEIGHTS[key];
    return acc + (weight * (diff * diff));
  }, 0);

  return Math.sqrt(sumSq);
};

const MAX_DISTANCE = Math.sqrt(
  ATTRIBUTE_KEYS.reduce((acc, key) => acc + ATTRIBUTE_WEIGHTS[key] * (MAX_SCORE * MAX_SCORE), 0)
);

const distanceToCompatibility = (distance: number) => {
  const ratio = 1 - distance / MAX_DISTANCE;
  return Math.round(Math.max(0, ratio) * 100);
};

export const findBestMentor = (
  userVector: Vector,
  mentorPool: Mentor[],
): MatchResult => {
  if (!mentorPool.length) {
    throw new Error("Mentor dataset is empty");
  }

  let best: MatchResult | null = null;

  mentorPool.forEach((mentor) => {
    const distance = euclideanDistance(userVector, mentor.dna);
    const compatibility = distanceToCompatibility(distance);

    if (!best || distance < best.distance) {
      best = { mentor, distance, compatibility, userVector };
    }
  });

  return best!;
};

export const findMultipleMentors = (
  userVector: Vector,
  mentorPool: Mentor[],
  topN: number = 3,
): MultiMatchResult => {
  if (!mentorPool.length) {
    throw new Error("Mentor dataset is empty");
  }

  const allMatches: MatchResult[] = mentorPool.map((mentor) => {
    const distance = euclideanDistance(userVector, mentor.dna);
    const compatibility = distanceToCompatibility(distance);
    return { mentor, distance, compatibility, userVector };
  });

  // Sort by distance (ascending = best match first)
  allMatches.sort((a, b) => a.distance - b.distance);

  // Apply Softmax to top N matches to get relative probabilities
  // RankNet Logic: P_i = exp(-distance_i) / sum(exp(-distance_j))
  let topMatches = allMatches.slice(0, topN);
  
  const scores = topMatches.map(m => -m.distance); // Negative because lower distance is better
  // Shift scores for numerical stability (optional but good practice)
  const maxScore = Math.max(...scores); 
  const expScores = scores.map(s => Math.exp(s - maxScore));
  const sumExp = expScores.reduce((a, b) => a + b, 0);

  topMatches = topMatches.map((match, index) => ({
    ...match,
    matchProbability: parseFloat((expScores[index] / sumExp).toFixed(4))
  }));

  const antiMentor = allMatches[allMatches.length - 1]; // Worst match

  return {
    topMatches,
    antiMentor,
    userVector,
  };
};

export const attributeLabel: Record<keyof Vector, string> = {
  risk: "Risk",
  network: "Network",
  grind: "Grind",
  education: "Education",
  resilience: "Resilience",
};
