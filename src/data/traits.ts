export const fallbackSeeds = [
  "MAIN_CHARACTER",
  "IMPOSTER_SYNDROME",
  "NO_SAFETY_NET",
  "UNDERDOG",
  "GRINDSET",
  "STREET_SMARTS",
  "TECH_OBSESSED",
  "CREATIVE_CORE",
  "SOCIAL_ENGINEER",
  "DEEP_WORK",
  "NIGHT_OWL",
  "EARLY_RISER",
  "OPEN_SOURCE",
  "BETA_TESTER",
  "LEGACY_CODE",
  "SANDBOX_MODE",
];

export const traitContextQuestions: Record<string, { question: string; verifications: string[] }> = {
  "GRINDSET": {
    question: "How many focused hours per week do you consistently work on your craft?",
    verifications: [
      "I've logged my deep work hours for the past month",
      "I work weekends on side projects regularly",
      "I've shipped something in the last 30 days"
    ]
  },
  "NO_SAFETY_NET": {
    question: "What's your current financial runway without stable income?",
    verifications: [
      "I have less than 6 months savings",
      "I quit a stable job to pursue this",
      "My family depends on me making this work"
    ]
  },
  "TECH_OBSESSED": {
    question: "How often do you learn new tech or read technical content?",
    verifications: [
      "I code or read technical docs daily",
      "I've completed a technical course in the last 3 months",
      "I follow and understand current tech trends"
    ]
  },
  "SOCIAL_ENGINEER": {
    question: "How many meaningful professional connections have you made this month?",
    verifications: [
      "I've had 5+ coffee chats or calls this month",
      "I actively introduce people in my network",
      "Someone got value from a connection I made"
    ]
  },
  "DEEP_WORK": {
    question: "How many hours can you focus without distraction on hard problems?",
    verifications: [
      "I regularly do 3+ hour deep work sessions",
      "I have systems to eliminate distractions",
      "I've solved complex problems requiring sustained focus"
    ]
  },
  "UNDERDOG": {
    question: "What systemic disadvantages have you had to overcome?",
    verifications: [
      "I didn't have access to resources most people take for granted",
      "I've succeeded despite people betting against me",
      "My background made this path harder"
    ]
  },
  "IMPOSTER_SYNDROME": {
    question: "How often do you feel you don't belong in the rooms you're in?",
    verifications: [
      "I regularly doubt my accomplishments",
      "I feel like I'm faking it compared to peers",
      "I downplay my achievements publicly"
    ]
  },
  "MAIN_CHARACTER": {
    question: "How publicly do you share your journey and failures?",
    verifications: [
      "I post updates on my progress regularly",
      "I've shared a public failure or struggle",
      "People follow my journey online"
    ]
  },
  "OPEN_SOURCE": {
    question: "How much do you build and share in public?",
    verifications: [
      "I have public repos with real projects",
      "I've contributed to open source projects",
      "My code has been used by others"
    ]
  },
  "STREET_SMARTS": {
    question: "How often do you learn from real-world experience vs formal education?",
    verifications: [
      "I've learned more from doing than courses",
      "I can navigate ambiguous situations well",
      "I've made money outside traditional employment"
    ]
  }
};

export const maxTraits = 7; // Increased from 5
export const minTraits = 3;
