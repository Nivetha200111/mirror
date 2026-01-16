/**
 * Curated YC Dataset
 *
 * This is a static dataset of notable YC companies and their founders.
 * Can be replaced with live scraping or API calls.
 *
 * Data sources:
 * - ycombinator.com/companies (public directory)
 * - Kaggle YC datasets
 * - Manual curation
 */

import { RawFounder } from "@/utils/mentorAggregator";

export const ycFounders: RawFounder[] = [
  // Unicorns & Decacorns
  {
    name: "Brian Chesky",
    company: "Airbnb",
    founded: "2008",
    funding: "$6.4B",
    valuation: "$75B",
    batch: "W09",
    location: "San Francisco, CA",
    industry: "Travel & Hospitality",
    teamSize: 6000,
    website: "https://airbnb.com",
    linkedIn: "https://linkedin.com/in/brianchesky",
    twitter: "https://twitter.com/bchesky",
    description: "Founded Airbnb from selling cereal boxes. Survived COVID crash. IPO 2020. Redefined travel industry.",
  },
  {
    name: "Patrick Collison",
    company: "Stripe",
    founded: "2010",
    funding: "$2.2B",
    valuation: "$95B",
    batch: "S10",
    location: "San Francisco, CA",
    industry: "FinTech",
    teamSize: 8000,
    website: "https://stripe.com",
    linkedIn: "https://linkedin.com/in/patrickcollison",
    twitter: "https://twitter.com/patrickc",
    description: "Irish kid who learned programming at 8. Built payments infrastructure for the internet. Rejected by YC first time.",
  },
  {
    name: "Drew Houston",
    company: "Dropbox",
    founded: "2007",
    funding: "$1.7B",
    valuation: "$8B",
    batch: "S07",
    location: "San Francisco, CA",
    industry: "SaaS",
    teamSize: 3000,
    website: "https://dropbox.com",
    linkedIn: "https://linkedin.com/in/drewhouston",
    twitter: "https://twitter.com/drewhouston",
    description: "Built Dropbox after forgetting USB stick. IPO 2018. 700M+ users.",
  },
  {
    name: "Tony Xu",
    company: "DoorDash",
    founded: "2013",
    funding: "$2.5B",
    valuation: "$50B",
    batch: "S13",
    location: "San Francisco, CA",
    industry: "Food Delivery",
    teamSize: 8500,
    website: "https://doordash.com",
    linkedIn: "https://linkedin.com/in/tonyxu1",
    description: "Immigrant kid. Delivered food himself. Built DoorDash to #1 food delivery in US. IPO 2020.",
  },

  // High-Growth Startups ($100M-$1B)
  {
    name: "Nat Friedman",
    company: "GitHub",
    founded: "2008",
    funding: "$350M",
    valuation: "$7.5B",
    batch: "S07",
    location: "San Francisco, CA",
    industry: "Developer Tools",
    teamSize: 1500,
    website: "https://github.com",
    description: "Built developer collaboration platform. Acquired by Microsoft for $7.5B. Now runs AI companies.",
  },
  {
    name: "Aaron Levie",
    company: "Box",
    founded: "2005",
    funding: "$564M",
    valuation: "$3.5B",
    batch: "S06",
    location: "Redwood City, CA",
    industry: "Enterprise SaaS",
    teamSize: 2000,
    website: "https://box.com",
    linkedIn: "https://linkedin.com/in/levie",
    twitter: "https://twitter.com/levie",
    description: "Built enterprise cloud storage. IPO 2015. Active on Twitter/X.",
  },
  {
    name: "Dylan Field",
    company: "Figma",
    founded: "2012",
    funding: "$333M",
    valuation: "$20B",
    batch: "YC Fellowship",
    location: "San Francisco, CA",
    industry: "Design Tools",
    teamSize: 800,
    website: "https://figma.com",
    linkedIn: "https://linkedin.com/in/dylanfield",
    description: "Dropped out of Brown. Built browser-based design tool. Adobe acquisition $20B (blocked). Revolutionized design collaboration.",
  },

  // Series B-D ($10M-$100M)
  {
    name: "Mathilde Collin",
    company: "Front",
    founded: "2013",
    funding: "$79M",
    batch: "S14",
    location: "San Francisco, CA",
    industry: "SaaS",
    teamSize: 200,
    website: "https://front.com",
    linkedIn: "https://linkedin.com/in/mathildecollin",
    twitter: "https://twitter.com/collinmathilde",
    description: "French founder. Built team inbox tool. Transparent culture. Open metrics.",
  },
  {
    name: "Sahil Lavingia",
    company: "Gumroad",
    founded: "2011",
    funding: "$8M",
    batch: "None (Raised from individuals)",
    location: "San Francisco, CA",
    industry: "Creator Economy",
    teamSize: 25,
    website: "https://gumroad.com",
    linkedIn: "https://linkedin.com/in/sahillavingia",
    twitter: "https://twitter.com/shl",
    description: "Ex-Pinterest. Built creator platform. Went from $1B ambitions to minimalist profitability. Advocates for sustainable startups.",
  },
  {
    name: "Amjad Masad",
    company: "Replit",
    founded: "2016",
    funding: "$97M",
    valuation: "$1.1B",
    batch: "S18",
    location: "San Francisco, CA",
    industry: "Developer Tools",
    teamSize: 100,
    website: "https://replit.com",
    linkedIn: "https://linkedin.com/in/amjadmasad",
    twitter: "https://twitter.com/amasad",
    description: "Palestinian immigrant. Built browser-based IDE. Raised at $1.1B valuation. Active open-source contributor.",
  },

  // Series A ($1M-$10M)
  {
    name: "Guillermo Rauch",
    company: "Vercel",
    founded: "2015",
    funding: "$313M",
    valuation: "$2.5B",
    batch: "None",
    location: "San Francisco, CA",
    industry: "Developer Infrastructure",
    teamSize: 400,
    website: "https://vercel.com",
    linkedIn: "https://linkedin.com/in/rauchg",
    twitter: "https://twitter.com/rauchg",
    description: "Argentine developer. Created Next.js. Built Vercel to $2.5B valuation. Active in open-source community.",
  },
  {
    name: "Henrique Dubugras",
    company: "Brex",
    founded: "2017",
    funding: "$1.5B",
    valuation: "$12.3B",
    batch: "S17",
    location: "San Francisco, CA",
    industry: "FinTech",
    teamSize: 1200,
    website: "https://brex.com",
    linkedIn: "https://linkedin.com/in/henrique-dubugras",
    description: "Brazilian founder. Built corporate credit cards for startups. Became unicorn in 2 years.",
  },

  // Seed Stage (Active & Growing)
  {
    name: "Siqi Chen",
    company: "Runway",
    founded: "2020",
    funding: "$77M",
    batch: "None",
    location: "San Francisco, CA",
    industry: "SaaS",
    teamSize: 80,
    website: "https://runway.com",
    linkedIn: "https://linkedin.com/in/siqichen",
    twitter: "https://twitter.com/blader",
    description: "Ex-Sandbox, Heyday. Built financial planning for startups. Raised Series B.",
  },
  {
    name: "Pieter Levels",
    company: "Nomad List",
    founded: "2014",
    funding: "$0 (Bootstrapped)",
    batch: "None",
    location: "Remote/Bali",
    industry: "Travel Tech",
    teamSize: 1,
    website: "https://nomadlist.com",
    twitter: "https://twitter.com/levelsio",
    description: "Solo indie hacker. Built 40+ products. Makes $1M+/year solo. Builds in public. No VC funding.",
  },
];

// Filter by batch
export function getYCBatch(batch: string): RawFounder[] {
  return ycFounders.filter(f => f.batch === batch);
}

// Filter by funding stage
export function getByStage(stage: "seed" | "seriesA" | "seriesB" | "unicorn"): RawFounder[] {
  return ycFounders.filter(f => {
    const fundingMatch = f.funding?.match(/\$?([\d.]+)([MBK]?)/);
    if (!fundingMatch) return false;

    const amount = parseFloat(fundingMatch[1]);
    const unit = fundingMatch[2];
    let fundingMillions = amount;

    if (unit === 'B') fundingMillions = amount * 1000;
    else if (unit === 'K') fundingMillions = amount / 1000;

    if (stage === "seed") return fundingMillions < 5;
    if (stage === "seriesA") return fundingMillions >= 5 && fundingMillions < 20;
    if (stage === "seriesB") return fundingMillions >= 20 && fundingMillions < 100;
    if (stage === "unicorn") return fundingMillions >= 100;

    return false;
  });
}

// Get bootstrapped founders
export function getBootstrapped(): RawFounder[] {
  return ycFounders.filter(f =>
    f.funding?.includes("Bootstrapped") ||
    f.funding === "$0" ||
    !f.funding
  );
}
