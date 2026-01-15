export type AttributeKey = "risk" | "network" | "grind" | "education" | "resilience";

export type Vector = Record<AttributeKey, number>;

export interface Trait {
  id: string;
  label: string;
  category: "Origin" | "Economic" | "Social" | "Career" | "Habits";
  note?: string;
  impact: Vector;
}

export interface Mentor {
  id: string;
  name: string;
  title: string;
  image: string;
  bio: string;
  traits: string[];
  dna: Vector;
}

export interface Strategy {
  category: string;
  advice: string;
}

export interface MatchResult {
  mentor: Mentor;
  distance: number;
  compatibility: number;
  userVector: Vector;
}

export interface GapSummary {
  attribute: AttributeKey;
  userScore: number;
  mentorScore: number;
  delta: number;
}

export interface AdvicePayload {
  userTraits: string[];
  mentor: Mentor;
  gap: GapSummary;
}

export const ATTRIBUTE_KEYS: AttributeKey[] = [
  "risk",
  "network",
  "grind",
  "education",
  "resilience",
];
