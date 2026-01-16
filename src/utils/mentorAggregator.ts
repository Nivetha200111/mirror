/**
 * Live Mentor Aggregator
 *
 * Pulls entrepreneur data from multiple sources:
 * - YC Companies (ycombinator.com/companies)
 * - Wikidata (SPARQL queries for entrepreneurs)
 * - OpenVC (when API becomes stable)
 * - Kaggle datasets (cached)
 *
 * Scores founders based on:
 * - Company valuation/funding
 * - Years active
 * - Team size
 * - Industry impact
 */

import { Mentor, Vector } from "@/types";

export interface RawFounder {
  name: string;
  company: string;
  founded?: string;
  funding?: string;
  valuation?: string;
  batch?: string; // YC batch
  location?: string;
  industry?: string;
  teamSize?: number;
  linkedIn?: string;
  twitter?: string;
  website?: string;
  description?: string;
}

export interface ScoredFounder extends RawFounder {
  level: number; // 1-5
  dna: Vector;
  sources: string[];
}

// Score founder based on available metrics
export function scoreFounder(founder: RawFounder): { level: number; dna: Vector } {
  let score = 0;
  const dna: Vector = {
    risk: 4,      // Founders start slightly above student baseline (3)
    network: 4,
    grind: 4,
    education: 4,
    resilience: 4,
  };

  // Parse funding amount
  const fundingMatch = founder.funding?.match(/\$?([\d.]+)([MBK]?)/);
  if (fundingMatch) {
    const amount = parseFloat(fundingMatch[1]);
    const unit = fundingMatch[2];
    let fundingMillions = amount;

    if (unit === 'B') fundingMillions = amount * 1000;
    else if (unit === 'K') fundingMillions = amount / 1000;

    // Funding levels
    if (fundingMillions < 1) {
      score = 1; // Pre-seed
      dna.risk = 7;  // High, but reachable
      dna.grind = 8; // Hustle is main asset
    } else if (fundingMillions < 5) {
      score = 2; // Seed
      dna.risk = 8;
      dna.network = 5;
      dna.grind = 8;
    } else if (fundingMillions < 20) {
      score = 3; // Series A
      dna.risk = 8;
      dna.network = 6;
      dna.grind = 8;
      dna.resilience = 6;
    } else if (fundingMillions < 100) {
      score = 4; // Series B+
      dna.risk = 9;
      dna.network = 8;
      dna.grind = 9;
      dna.resilience = 8;
    } else {
      score = 5; // Unicorn+
      dna.risk = 10; // The elite
      dna.network = 10;
      dna.grind = 10;
      dna.resilience = 10;
      dna.education = 9;
    }
  }

  // Adjust for years active
  if (founder.founded) {
    const yearFounded = parseInt(founder.founded);
    const yearsActive = new Date().getFullYear() - yearFounded;

    if (yearsActive > 10) {
      dna.resilience = Math.min(10, dna.resilience + 2);
      dna.network = Math.min(10, dna.network + 1);
    }
  }

  // Adjust for team size
  if (founder.teamSize) {
    if (founder.teamSize > 100) {
      dna.network = Math.min(10, dna.network + 2);
      score = Math.max(score, 4);
    } else if (founder.teamSize > 50) {
      dna.network = Math.min(10, dna.network + 1);
      score = Math.max(score, 3);
    }
  }

  // YC founders get bonus
  if (founder.batch) {
    dna.network = Math.min(10, dna.network + 1);
    dna.education = Math.min(10, dna.education + 1);
  }

  return {
    level: Math.max(1, score),
    dna,
  };
}

// Convert raw founder to Mentor format
export function founderToMentor(founder: RawFounder): Mentor {
  const { level, dna } = scoreFounder(founder);

  const levelTitles = [
    "Pre-Seed Founder",
    "Seed Stage Founder",
    "Series A CEO",
    "Growth Stage CEO",
    "Unicorn Founder"
  ];

  return {
    id: founder.name.toLowerCase().replace(/\s+/g, '-'),
    name: founder.name,
    level,
    title: `${founder.company} · ${levelTitles[level - 1] || "Founder"}`,
    image: "",
    bio: founder.description || `Founded ${founder.company}${founder.founded ? ` in ${founder.founded}` : ''}. ${founder.funding ? `Raised ${founder.funding}.` : ''}${founder.batch ? ` YC ${founder.batch}.` : ''}`,
    traits: [
      founder.batch ? `YC ${founder.batch}` : "Independent",
      founder.industry || "Tech",
      founder.location || "Remote"
    ].filter(Boolean),
    dna,
    resources: [
      founder.website ? {
        type: "essay" as const,
        title: `${founder.company} Website`,
        url: founder.website,
      } : null,
      founder.linkedIn ? {
        type: "essay" as const,
        title: "LinkedIn Profile",
        url: founder.linkedIn,
      } : null,
      founder.twitter ? {
        type: "essay" as const,
        title: "Twitter/X",
        url: founder.twitter,
      } : null,
    ].filter((r): r is NonNullable<typeof r> => r !== null),
    keyQuotes: [
      `Building ${founder.company}.`,
      founder.funding ? `Raised ${founder.funding} to date.` : "Bootstrapped and profitable.",
      "Every day is a grind."
    ]
  };
}

// Fetch YC founders from public API
export async function fetchYCFounders(limit = 100): Promise<RawFounder[]> {
  try {
    const { ycFounders } = await import("@/data/ycDataset");
    return ycFounders.slice(0, limit);
  } catch (error) {
    console.error('Error fetching YC founders:', error);
    return [];
  }
}

// Fetch entrepreneurs from Wikidata
export async function fetchWikidataEntrepreneurs(limit = 50): Promise<RawFounder[]> {
  try {
    const query = `
      SELECT DISTINCT ?person ?personLabel ?companyLabel ?founded WHERE {
        ?person wdt:P31 wd:Q5;
                wdt:P106 wd:Q131524;
                wdt:P108 ?company.
        OPTIONAL { ?company wdt:P571 ?founded. }
        SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
      }
      LIMIT ${limit}
    `;

    const url = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Wikidata query failed: ${response.status}`);
    }

    const data = await response.json();

    return data.results.bindings.map((binding: {
      personLabel?: { value: string };
      companyLabel?: { value: string };
      founded?: { value: string };
    }) => ({
      name: binding.personLabel?.value || 'Unknown',
      company: binding.companyLabel?.value || 'Unknown Company',
      founded: binding.founded?.value?.substring(0, 4),
      description: `Entrepreneur and business leader`,
    }));
  } catch (error) {
    console.error('Error fetching Wikidata entrepreneurs:', error);
    return [];
  }
}

// Get cached YC data from our curated dataset
export async function getCachedYCData(): Promise<RawFounder[]> {
  return await fetchYCFounders();
}

// Aggregate all sources
export async function aggregateMentors(options: {
  includeYC?: boolean;
  includeWikidata?: boolean;
  minLevel?: number;
  maxResults?: number;
} = {}): Promise<Mentor[]> {
  const {
    includeYC = true,
    includeWikidata = true,
    minLevel = 1,
    maxResults = 100,
  } = options;

  const allFounders: RawFounder[] = [];

  // Fetch from all sources
  if (includeYC) {
    const ycFounders = await getCachedYCData();
    allFounders.push(...ycFounders);
  }

  if (includeWikidata) {
    const wdFounders = await fetchWikidataEntrepreneurs(50);
    allFounders.push(...wdFounders);
  }

  // Convert to mentors and filter
  const mentors = allFounders
    .map(founderToMentor)
    .filter(m => {
      const level = scoreFounder(allFounders.find(f =>
        f.name.toLowerCase().replace(/\s+/g, '-') === m.id
      )!).level;
      return level >= minLevel;
    })
    .slice(0, maxResults);

  return mentors;
}
