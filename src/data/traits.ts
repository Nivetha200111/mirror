import { Trait } from "@/types";

export const traits: Trait[] = [
  {
    id: "no-safety-net",
    label: "No Safety Net",
    category: "Vibe",
    note: "Self-made, no backup plan.",
    impact: { risk: 3, network: -1, grind: 2, education: 0, resilience: 3 },
  },
  {
    id: "main-character",
    label: "Main Character Energy",
    category: "Vibe",
    note: "Confident, takes swings.",
    impact: { risk: 3, network: 2, grind: 1, education: 0, resilience: 1 },
  },
  {
    id: "imposter",
    label: "Imposter Syndrome",
    category: "Vibe",
    note: "Feels like a fraud, still ships.",
    impact: { risk: -1, network: -1, grind: 1, education: 0, resilience: 2 },
  },
  {
    id: "grindset",
    label: "The Grindset",
    category: "Vibe",
    note: "Workaholic, obsessed.",
    impact: { risk: 1, network: 0, grind: 3, education: 0, resilience: 2 },
  },
  {
    id: "lowkey",
    label: "Lowkey",
    category: "Vibe",
    note: "Introvert, observer.",
    impact: { risk: -1, network: -2, grind: 1, education: 0, resilience: 1 },
  },
  {
    id: "late-bloomer",
    label: "Late Bloomer",
    category: "Vibe",
    note: "Took time to figure it out.",
    impact: { risk: 0, network: -1, grind: 1, education: 1, resilience: 1 },
  },
  {
    id: "street-smarts",
    label: "Street Smarts",
    category: "Vibe",
    note: "Road-taught, not classroom.",
    impact: { risk: 2, network: 1, grind: 2, education: -1, resilience: 2 },
  },
  {
    id: "adhd-brain",
    label: "ADHD Brain",
    category: "Vibe",
    note: "Creative chaos, rapid jumps.",
    impact: { risk: 1, network: 0, grind: 1, education: -1, resilience: 1 },
  },
  {
    id: "people-pleaser",
    label: "People Pleaser",
    category: "Vibe",
    note: "Says yes, high empathy.",
    impact: { risk: -1, network: 2, grind: 1, education: 0, resilience: -1 },
  },
  {
    id: "underdog",
    label: "Underdog",
    category: "Vibe",
    note: "Counted out, still here.",
    impact: { risk: 1, network: -1, grind: 2, education: 0, resilience: 3 },
  },
  {
    id: "tech-obsessed",
    label: "Tech Obsessed",
    category: "Vibe",
    note: "Thinks in code, logic first.",
    impact: { risk: 1, network: 0, grind: 2, education: 1, resilience: 1 },
  },
  {
    id: "creative-soul",
    label: "Creative Soul",
    category: "Vibe",
    note: "Art, emotion, design first.",
    impact: { risk: 1, network: 0, grind: 1, education: 0, resilience: 1 },
  },
];

export const maxTraits = 5;
export const minTraits = 3;
