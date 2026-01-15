import { ATTRIBUTE_KEYS, MatchResult, Mentor, Trait, Vector } from "@/types";

const BASELINE_SCORE = 5;
const MAX_SCORE = 10;

const baseVector: Vector = {
  risk: BASELINE_SCORE,
  network: BASELINE_SCORE,
  grind: BASELINE_SCORE,
  education: BASELINE_SCORE,
  resilience: BASELINE_SCORE,
};

const clampScore = (value: number) => Math.min(MAX_SCORE, Math.max(0, value));

export const buildUserVector = (selectedTraits: Trait[]): Vector => {
  const merged: Vector = { ...baseVector };

  for (const trait of selectedTraits) {
    for (const key of ATTRIBUTE_KEYS) {
      merged[key] = clampScore(merged[key] + trait.impact[key]);
    }
  }

  return merged;
};

export const euclideanDistance = (a: Vector, b: Vector) => {
  const sumSq = ATTRIBUTE_KEYS.reduce((acc, key) => {
    const diff = a[key] - b[key];
    return acc + diff * diff;
  }, 0);

  return Math.sqrt(sumSq);
};

const MAX_DISTANCE = Math.sqrt(ATTRIBUTE_KEYS.length * (MAX_SCORE * MAX_SCORE));

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

export const attributeLabel: Record<keyof Vector, string> = {
  risk: "Risk",
  network: "Network",
  grind: "Grind",
  education: "Education",
  resilience: "Resilience",
};
