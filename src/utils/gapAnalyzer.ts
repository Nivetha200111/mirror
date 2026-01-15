import { ATTRIBUTE_KEYS, GapSummary, Vector } from "@/types";

export const analyzeGap = (
  userVector: Vector,
  mentorVector: Vector,
): GapSummary => {
  let winner: GapSummary | null = null;

  ATTRIBUTE_KEYS.forEach((attribute) => {
    const delta = mentorVector[attribute] - userVector[attribute];
    const candidate: GapSummary = {
      attribute,
      userScore: userVector[attribute],
      mentorScore: mentorVector[attribute],
      delta,
    };

    if (!winner || delta > winner.delta) {
      winner = candidate;
    }
  });

  if (!winner) {
    return {
      attribute: "risk",
      userScore: userVector.risk,
      mentorScore: mentorVector.risk,
      delta: 0,
    };
  }

  return winner;
};
