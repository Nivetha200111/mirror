import { AttributeKey } from "@/types";

export interface LadderLevel {
  level: number;
  title: string;
  yearsExperience: string;
  salary: string;
  realExamples: string[];
  keyMilestones: string[];
  dayToDay: string;
  attributeRequirements: Partial<Record<AttributeKey, number>>;
}

export interface CareerPath {
  track: "IC" | "Management" | "Founder";
  levels: LadderLevel[];
}

// The REAL ladder in tech - from junior to the greats
export const techCareerLadder: Record<string, CareerPath> = {
  IC: {
    track: "IC",
    levels: [
      {
        level: 1,
        title: "Junior Engineer",
        yearsExperience: "0-2 years",
        salary: "$70-100k",
        realExamples: [
          "Fresh IIT grad at Google Bangalore",
          "Bootcamp grad at Stripe",
          "CS grad at Microsoft"
        ],
        keyMilestones: [
          "First PR merged",
          "Shipped first feature",
          "Fixed first production bug"
        ],
        dayToDay: "Write code, ask for code reviews, attend standups, learn the codebase",
        attributeRequirements: {
          grind: 5,
          education: 6,
          resilience: 4
        }
      },
      {
        level: 2,
        title: "Software Engineer",
        yearsExperience: "2-4 years",
        salary: "$100-150k",
        realExamples: [
          "Mid-level at Meta",
          "SDE II at Amazon",
          "Engineer at early-stage YC startup"
        ],
        keyMilestones: [
          "Owned a microservice",
          "Mentored a junior",
          "Launched feature to 1M+ users"
        ],
        dayToDay: "Own features end-to-end, review others' code, design small systems",
        attributeRequirements: {
          grind: 6,
          education: 7,
          resilience: 5
        }
      },
      {
        level: 3,
        title: "Senior Engineer",
        yearsExperience: "5-8 years",
        salary: "$150-250k",
        realExamples: [
          "Senior at Google (L5)",
          "Senior at Stripe",
          "Tech Lead at unicorn startup"
        ],
        keyMilestones: [
          "Led project affecting 10+ engineers",
          "Designed distributed system",
          "On-call for critical services"
        ],
        dayToDay: "Design systems, unblock teams, mentor 3-5 engineers, make architecture decisions",
        attributeRequirements: {
          grind: 7,
          education: 8,
          network: 5,
          resilience: 6
        }
      },
      {
        level: 4,
        title: "Staff Engineer",
        yearsExperience: "8-12 years",
        salary: "$250-400k",
        realExamples: [
          "Staff at Meta (E6)",
          "Principal at Airbnb",
          "Founding Engineer at Series B startup"
        ],
        keyMilestones: [
          "Influenced company-wide technical decisions",
          "Designed systems used by 100M+ users",
          "Published influential technical blog/talks"
        ],
        dayToDay: "Set technical direction for org, solve ambiguous problems, multiply team output",
        attributeRequirements: {
          grind: 8,
          education: 9,
          network: 7,
          resilience: 7,
          risk: 6
        }
      },
      {
        level: 5,
        title: "Principal/Distinguished Engineer",
        yearsExperience: "12+ years",
        salary: "$400-800k+",
        realExamples: [
          "Jeff Dean (Google)",
          "Anders Hejlsberg (Microsoft, TypeScript creator)",
          "John Carmack (id Software, VR)"
        ],
        keyMilestones: [
          "Created new programming language/framework",
          "Built infrastructure for billions of users",
          "Industry-recognized expert"
        ],
        dayToDay: "Define technical strategy for company, represent company externally, solve impossible problems",
        attributeRequirements: {
          grind: 9,
          education: 10,
          network: 8,
          resilience: 8,
          risk: 7
        }
      }
    ]
  },
  Management: {
    track: "Management",
    levels: [
      {
        level: 1,
        title: "Engineering Manager",
        yearsExperience: "5-8 years",
        salary: "$150-250k",
        realExamples: [
          "EM at Google managing 6-8 engineers",
          "Team Lead at Uber",
          "Manager at fintech startup"
        ],
        keyMilestones: [
          "First direct report",
          "Ran performance reviews",
          "Hired first engineer"
        ],
        dayToDay: "1-on-1s, unblock team, hire, performance reviews, some coding",
        attributeRequirements: {
          grind: 7,
          network: 6,
          resilience: 7,
          education: 7
        }
      },
      {
        level: 2,
        title: "Senior Engineering Manager",
        yearsExperience: "8-12 years",
        salary: "$200-350k",
        realExamples: [
          "Senior EM at Meta (M2)",
          "Manager of Managers at Stripe",
          "Head of Engineering at Series A"
        ],
        keyMilestones: [
          "Managed managers",
          "Built team from 5 to 20",
          "Set hiring bar for org"
        ],
        dayToDay: "Coach managers, align roadmaps, strategic planning, culture building",
        attributeRequirements: {
          grind: 7,
          network: 7,
          resilience: 8,
          education: 7,
          risk: 6
        }
      },
      {
        level: 3,
        title: "Director of Engineering",
        yearsExperience: "10-15 years",
        salary: "$250-500k",
        realExamples: [
          "Director at Amazon",
          "Director at Netflix",
          "VP Eng at Series B startup"
        ],
        keyMilestones: [
          "Responsible for 50-100 engineers",
          "Multi-quarter planning",
          "Partner with Product/Design VPs"
        ],
        dayToDay: "Set org strategy, manage budgets, align cross-functional leadership, scale processes",
        attributeRequirements: {
          grind: 8,
          network: 8,
          resilience: 8,
          education: 7,
          risk: 7
        }
      },
      {
        level: 4,
        title: "VP Engineering",
        yearsExperience: "12-18 years",
        salary: "$300-700k + equity",
        realExamples: [
          "VP at Airbnb",
          "VP at Coinbase",
          "CTO at Series C startup"
        ],
        keyMilestones: [
          "Built engineering org 0 to 100+",
          "Set company technical vision",
          "Recruited other VPs/Directors"
        ],
        dayToDay: "Exec meetings, represent eng to board, recruit leadership, set culture/values",
        attributeRequirements: {
          grind: 8,
          network: 9,
          resilience: 9,
          education: 8,
          risk: 8
        }
      },
      {
        level: 5,
        title: "CTO / Chief Engineer",
        yearsExperience: "15+ years",
        salary: "$500k-2M+ + equity",
        realExamples: [
          "Satya Nadella (Microsoft CEO, former Cloud leader)",
          "Sundar Pichai (Google CEO, former Chrome/Android)",
          "Adam D'Angelo (Quora CEO, former Facebook CTO)"
        ],
        keyMilestones: [
          "Scaled eng org to 1000+",
          "Led company through IPO/acquisition",
          "Industry thought leader"
        ],
        dayToDay: "Board meetings, strategic partnerships, M&A, public speaking, recruiting execs",
        attributeRequirements: {
          grind: 9,
          network: 10,
          resilience: 9,
          education: 9,
          risk: 9
        }
      }
    ]
  },
  Founder: {
    track: "Founder",
    levels: [
      {
        level: 1,
        title: "Solo Founder / Pre-Seed",
        yearsExperience: "Variable",
        salary: "$0-50k (mostly equity)",
        realExamples: [
          "Building MVP in nights/weekends",
          "YC application stage",
          "First 10 users"
        ],
        keyMilestones: [
          "Quit job or went full-time",
          "Shipped v1 product",
          "Got first paying customer"
        ],
        dayToDay: "Code, talk to users, pitch investors, do everything yourself",
        attributeRequirements: {
          risk: 8,
          grind: 9,
          resilience: 7,
          education: 6
        }
      },
      {
        level: 2,
        title: "Seed Stage Founder",
        yearsExperience: "1-2 years",
        salary: "$100-150k + equity",
        realExamples: [
          "$1-3M raised",
          "Team of 3-10",
          "Finding product-market fit"
        ],
        keyMilestones: [
          "Raised first $1M+",
          "Hired first 5 employees",
          "Hit $10k MRR"
        ],
        dayToDay: "Recruit, fundraise, set vision, sell to customers, still coding some",
        attributeRequirements: {
          risk: 9,
          grind: 9,
          network: 7,
          resilience: 8,
          education: 7
        }
      },
      {
        level: 3,
        title: "Series A Founder / CEO",
        yearsExperience: "2-4 years",
        salary: "$150-250k + equity",
        realExamples: [
          "$5-15M raised",
          "Team of 20-50",
          "Clear product-market fit"
        ],
        keyMilestones: [
          "Hit $1M ARR",
          "Hired exec team (CTO, VP Sales)",
          "Repeatable sales process"
        ],
        dayToDay: "Recruit execs, fundraise Series B, strategic deals, company culture",
        attributeRequirements: {
          risk: 9,
          grind: 8,
          network: 8,
          resilience: 9,
          education: 7
        }
      },
      {
        level: 4,
        title: "Growth Stage CEO",
        yearsExperience: "5-10 years",
        salary: "$200-500k + equity",
        realExamples: [
          "Series B-D ($50-200M raised)",
          "Team of 100-500",
          "Scaling revenue fast"
        ],
        keyMilestones: [
          "$10M+ ARR",
          "Expanded to new markets/products",
          "Built scalable leadership team"
        ],
        dayToDay: "Board meetings, M&A, strategic hires, public positioning, scale culture",
        attributeRequirements: {
          risk: 8,
          grind: 8,
          network: 9,
          resilience: 9,
          education: 8
        }
      },
      {
        level: 5,
        title: "Visionary Founder / Public CEO",
        yearsExperience: "10+ years",
        salary: "$500k-10M+ (mostly equity/stock)",
        realExamples: [
          "Jensen Huang (Nvidia, $3T market cap)",
          "Brian Chesky (Airbnb IPO)",
          "Patrick Collison (Stripe, $95B valuation)"
        ],
        keyMilestones: [
          "IPO or $1B+ valuation",
          "1000+ employees",
          "Industry-defining company"
        ],
        dayToDay: "Set long-term vision, represent company globally, strategic bets, shareholder relations",
        attributeRequirements: {
          risk: 10,
          grind: 9,
          network: 10,
          resilience: 10,
          education: 8
        }
      }
    ]
  }
};

// Calculate which level the user is at based on their vector
export function findUserLevel(
  userVector: Record<AttributeKey, number>,
  track: "IC" | "Management" | "Founder"
): number {
  const path = techCareerLadder[track];
  let bestMatch = 1;
  let bestScore = Infinity;

  path.levels.forEach((level) => {
    let score = 0;
    const reqs = level.attributeRequirements;

    (Object.keys(reqs) as AttributeKey[]).forEach((attr) => {
      const required = reqs[attr] || 0;
      const actual = userVector[attr] || 0;
      score += Math.abs(required - actual);
    });

    if (score < bestScore) {
      bestScore = score;
      bestMatch = level.level;
    }
  });

  return bestMatch;
}

// Find the track that best matches the user
export function findBestTrack(userVector: Record<AttributeKey, number>): "IC" | "Management" | "Founder" {
  // High risk + high grind = Founder
  if (userVector.risk >= 7 && userVector.grind >= 7) return "Founder";

  // High network + moderate grind = Management
  if (userVector.network >= 7 && userVector.resilience >= 6) return "Management";

  // Default to IC
  return "IC";
}
