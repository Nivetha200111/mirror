import { ATTRIBUTE_KEYS, AttributeKey, Benchmark, Challenge, EnhancedGapAnalysis, GapSummary, Mentor, Vector } from "@/types";
import { analyzeGap } from "./gapAnalyzer";

const challengeDatabase: Record<AttributeKey, Challenge[]> = {
  risk: [
    {
      id: "risk-starter-1",
      title: "Ship a side project publicly",
      description: "Build and deploy something small in 48 hours. Tweet about it. No perfection allowed.",
      attribute: "risk",
      difficulty: "starter",
      estimatedTime: "2 days",
      successCriteria: [
        "Project is live with a public URL",
        "Shared on at least one social platform",
        "Got feedback from 3+ people"
      ]
    },
    {
      id: "risk-intermediate-1",
      title: "Cold DM 10 people you admire",
      description: "Reach out to people 2 levels above you. Ask for 15min advice. Track response rate.",
      attribute: "risk",
      difficulty: "intermediate",
      estimatedTime: "1 week",
      successCriteria: [
        "Sent 10 personalized DMs",
        "Got at least 2 responses",
        "Had 1 actual conversation"
      ]
    },
    {
      id: "risk-advanced-1",
      title: "Quit something stable for a bet",
      description: "Leave a comfortable position to pursue something uncertain. Document the decision.",
      attribute: "risk",
      difficulty: "advanced",
      estimatedTime: "Months",
      successCriteria: [
        "Made the leap",
        "Have a survival plan",
        "Tracking progress publicly"
      ]
    }
  ],
  network: [
    {
      id: "network-starter-1",
      title: "Comment meaningfully on 20 posts this week",
      description: "Engage authentically on Twitter/LinkedIn. Add value, not noise. Track who responds.",
      attribute: "network",
      difficulty: "starter",
      estimatedTime: "1 week",
      successCriteria: [
        "20 quality comments posted",
        "Got replies from 5+ people",
        "Started 2 DM conversations"
      ]
    },
    {
      id: "network-intermediate-1",
      title: "Host a virtual meetup for your niche",
      description: "Organize a 90min session. Invite 10-15 people. Facilitate intros between attendees.",
      attribute: "network",
      difficulty: "intermediate",
      estimatedTime: "2 weeks",
      successCriteria: [
        "Event held with 5+ attendees",
        "Made 3 new connections",
        "Got requests for a repeat"
      ]
    },
    {
      id: "network-advanced-1",
      title: "Build a tight 10-person kitchen cabinet",
      description: "Curate a group of high-signal people. Monthly sync. Help each other win.",
      attribute: "network",
      difficulty: "advanced",
      estimatedTime: "3 months",
      successCriteria: [
        "10 committed members",
        "Met at least 3 times",
        "Concrete help exchanged"
      ]
    }
  ],
  grind: [
    {
      id: "grind-starter-1",
      title: "30-day deep work streak",
      description: "3 hours of focused work daily. No social media during work blocks. Log it.",
      attribute: "grind",
      difficulty: "starter",
      estimatedTime: "1 month",
      successCriteria: [
        "Completed 25/30 days minimum",
        "Tracked time with proof",
        "Shipped something from the hours"
      ]
    },
    {
      id: "grind-intermediate-1",
      title: "Build in public for 100 days",
      description: "Daily updates on your project. No skipping. Raw progress, not highlights.",
      attribute: "grind",
      difficulty: "intermediate",
      estimatedTime: "100 days",
      successCriteria: [
        "Posted updates 90+ days",
        "Built audience from it",
        "Product made tangible progress"
      ]
    },
    {
      id: "grind-advanced-1",
      title: "Solo founder a revenue-generating product",
      description: "0 to paying customers. Handle everything. No co-founder excuses.",
      attribute: "grind",
      difficulty: "advanced",
      estimatedTime: "6 months",
      successCriteria: [
        "First dollar earned",
        "10+ paying customers",
        "Repeatable acquisition channel"
      ]
    }
  ],
  education: [
    {
      id: "education-starter-1",
      title: "Teach someone what you just learned",
      description: "Write a blog post or record a video explaining a recent learning. Publish it.",
      attribute: "education",
      difficulty: "starter",
      estimatedTime: "1 week",
      successCriteria: [
        "Published content live",
        "At least 10 views/reads",
        "Got 1 question or comment"
      ]
    },
    {
      id: "education-intermediate-1",
      title: "Complete a structured course outside your comfort zone",
      description: "Pick something hard. Finish it. Share learnings publicly every week.",
      attribute: "education",
      difficulty: "intermediate",
      estimatedTime: "6 weeks",
      successCriteria: [
        "Course 100% completed",
        "Applied learning to a project",
        "Shared 5+ weekly updates"
      ]
    },
    {
      id: "education-advanced-1",
      title: "Create and sell your own course/workshop",
      description: "Package your expertise. Get 20 people to pay for it. Iterate based on feedback.",
      attribute: "education",
      difficulty: "advanced",
      estimatedTime: "3 months",
      successCriteria: [
        "Course created and launched",
        "20+ paid students",
        "90%+ satisfaction rating"
      ]
    }
  ],
  resilience: [
    {
      id: "resilience-starter-1",
      title: "Public failure autopsy",
      description: "Share a recent failure in detail. What went wrong. What you learned. No sugar coating.",
      attribute: "resilience",
      difficulty: "starter",
      estimatedTime: "1 day",
      successCriteria: [
        "Publicly shared the failure",
        "Listed 3+ concrete learnings",
        "Got support from community"
      ]
    },
    {
      id: "resilience-intermediate-1",
      title: "Rebuild after a major setback",
      description: "Something broke. A project died. A relationship ended. Document the comeback.",
      attribute: "resilience",
      difficulty: "intermediate",
      estimatedTime: "3 months",
      successCriteria: [
        "Started rebuilding publicly",
        "Made measurable progress",
        "Helped someone else going through similar"
      ]
    },
    {
      id: "resilience-advanced-1",
      title: "Survive and thrive through a dark year",
      description: "Multiple failures. Financial stress. Doubt. Keep shipping. Keep showing up.",
      attribute: "resilience",
      difficulty: "advanced",
      estimatedTime: "1 year",
      successCriteria: [
        "Made it through intact",
        "Shipped despite everything",
        "Documented the journey"
      ]
    }
  ]
};

const benchmarkDatabase: Record<AttributeKey, Benchmark[]> = {
  risk: [
    { level: 1, score: 3, description: "Risk-averse", examples: ["Never cold email", "Avoid public posting", "Stay in comfort zone"] },
    { level: 2, score: 5, description: "Cautious explorer", examples: ["Occasional side projects", "Private experiments", "Safe networking"] },
    { level: 3, score: 7, description: "Calculated risk-taker", examples: ["Ship publicly monthly", "Regular cold outreach", "Quit job for startup"] },
    { level: 4, score: 9, description: "Serial bet-maker", examples: ["Multiple startups", "Public contrarian takes", "Reputation on the line"] },
    { level: 5, score: 10, description: "All-in operator", examples: ["Elon-level bets", "Zero safety net", "Burn boats publicly"] }
  ],
  network: [
    { level: 1, score: 3, description: "Isolated builder", examples: ["No social presence", "< 50 followers", "No DM game"] },
    { level: 2, score: 5, description: "Casual connector", examples: ["Some Twitter activity", "Local meetups", "Know a few people"] },
    { level: 3, score: 7, description: "Strategic networker", examples: ["500+ engaged followers", "Monthly coffee chats", "Connectors know you"] },
    { level: 4, score: 9, description: "Network node", examples: ["Introduce people weekly", "Host events", "Referenced by others"] },
    { level: 5, score: 10, description: "Network architect", examples: ["YC/On Deck level", "Curated communities", "Make careers happen"] }
  ],
  grind: [
    { level: 1, score: 3, description: "9-5 mode", examples: ["Standard hours", "Weekends off", "Vacation matters"] },
    { level: 2, score: 5, description: "Hustle-curious", examples: ["Occasional late nights", "Some weekend work", "Side project dabbling"] },
    { level: 3, score: 7, description: "Consistent grinder", examples: ["6 days/week", "Deep work daily", "Side project shipping"] },
    { level: 4, score: 9, description: "Intensity operator", examples: ["80hr weeks sustainable", "Build in public daily", "Multiple projects live"] },
    { level: 5, score: 10, description: "Obsessed builder", examples: ["Sleep when dead", "Elon/PG level output", "Life = work"] }
  ],
  education: [
    { level: 1, score: 3, description: "Learn as needed", examples: ["Google when stuck", "No courses", "Reactive learning"] },
    { level: 2, score: 5, description: "Casual learner", examples: ["1-2 courses/year", "Read some books", "Follow some experts"] },
    { level: 3, score: 7, description: "Active student", examples: ["Weekly reading habit", "Course completions", "Take notes publicly"] },
    { level: 4, score: 9, description: "Learning machine", examples: ["Teach to learn", "Research papers", "Cross-domain synthesis"] },
    { level: 5, score: 10, description: "Intellectual athlete", examples: ["PhD-level rigor", "Create new knowledge", "Cited by others"] }
  ],
  resilience: [
    { level: 1, score: 3, description: "Fragile", examples: ["First failure = quit", "Avoid criticism", "Need validation"] },
    { level: 2, score: 5, description: "Recovering", examples: ["Bounce back slowly", "Need support to continue", "Some public vulnerability"] },
    { level: 3, score: 7, description: "Steady", examples: ["Failures don't stop you", "Public about struggles", "Help others through hard times"] },
    { level: 4, score: 9, description: "Antifragile", examples: ["Stronger after setbacks", "Turn failures into content", "Reputation for grit"] },
    { level: 5, score: 10, description: "Unstoppable", examples: ["Multiple comebacks", "Dark year survivor", "Inspire others' resilience"] }
  ]
};

export const analyzeGapEnhanced = (
  userVector: Vector,
  mentor: Mentor,
): EnhancedGapAnalysis => {
  const primaryGap = analyzeGap(userVector, mentor.dna);

  const allGaps: GapSummary[] = ATTRIBUTE_KEYS.map((attribute) => ({
    attribute,
    userScore: userVector[attribute],
    mentorScore: mentor.dna[attribute],
    delta: mentor.dna[attribute] - userVector[attribute],
  })).sort((a, b) => b.delta - a.delta);

  const userScore = userVector[primaryGap.attribute];
  const challenges = challengeDatabase[primaryGap.attribute];

  const weeklyChallenges = challenges.filter((c) => {
    if (userScore < 4) return c.difficulty === "starter";
    if (userScore < 7) return c.difficulty === "intermediate";
    return c.difficulty === "advanced";
  });

  const resources = mentor.resources?.filter(
    (r) => !r.relevantFor || r.relevantFor.includes(primaryGap.attribute)
  ) || [];

  const benchmarks = benchmarkDatabase[primaryGap.attribute];

  return {
    primaryGap,
    allGaps,
    weeklyChallenges,
    resources,
    benchmarks,
  };
};
