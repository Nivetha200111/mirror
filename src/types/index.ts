export type AttributeKey = "risk" | "network" | "grind" | "education" | "resilience";

export type Vector = Record<AttributeKey, number>;

export interface Trait {
  id: string;
  label: string;
  category: "Origin" | "Economic" | "Social" | "Career" | "Habits" | "Vibe";
  note?: string;
  impact: Vector;
  contextQuestion?: string;
  verificationPrompts?: string[];
}

export interface UserTraitSelection {
  traitId: string;
  intensity: number; // 0-100
  context?: string;
  verifications?: boolean[];
  timestamp: number;
}

export interface Mentor {
  id: string;
  name: string;
  level: number; // 1 (Pre-seed) to 5 (Unicorn)
  title: string;
  image: string;
  bio: string;
  traits: string[];
  dna: Vector;
  resources?: MentorResource[];
  keyQuotes?: string[];
}

export interface MentorResource {
  type: "essay" | "video" | "book" | "course" | "tool";
  title: string;
  url: string;
  relevantFor?: AttributeKey[];
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
  matchProbability?: number; // Softmax probability among top candidates
}

export interface MultiMatchResult {
  topMatches: MatchResult[];
  antiMentor: MatchResult;
  userVector: Vector;
}

export interface GapSummary {
  attribute: AttributeKey;
  userScore: number;
  mentorScore: number;
  delta: number;
}

export interface EnhancedGapAnalysis {
  primaryGap: GapSummary;
  allGaps: GapSummary[];
  weeklyChallenges: Challenge[];
  resources: MentorResource[];
  benchmarks: Benchmark[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  attribute: AttributeKey;
  difficulty: "starter" | "intermediate" | "advanced";
  estimatedTime: string;
  successCriteria: string[];
}

export interface Benchmark {
  level: number;
  score: number;
  description: string;
  examples: string[];
}

export interface ProgressEntry {
  id: string;
  userId?: string;
  timestamp: number;
  challengeId: string;
  completed: boolean;
  evidence?: string;
  reflection?: string;
  scoreImprovement?: Partial<Vector>;
}

export interface AdvicePayload {
  userTraits: string[];
  userSelections?: UserTraitSelection[];
  mentor: Mentor;
  gap: GapSummary;
}

export interface MatchFeedback {
  userId?: string;
  userVector: Vector;
  candidates: {
    mentorId: string;
    distance: number;
    compatibility: number;
    matchProbability?: number;
    rank: number; // The order they were displayed (0, 1, 2...)
  }[];
  selectedMentorId: string; // The "Winner" (Ground Truth)
  timestamp: number;
}

export const ATTRIBUTE_KEYS: AttributeKey[] = [
  "risk",
  "network",
  "grind",
  "education",
  "resilience",
];
