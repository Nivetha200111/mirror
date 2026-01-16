import { NextResponse } from "next/server";
import { aggregateMentors } from "@/utils/mentorAggregator";
import { realMentors } from "@/data/realMentors";
import { Mentor } from "@/types";

// Cache mentors for 1 hour
let cachedMentors: Mentor[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const minLevel = parseInt(searchParams.get("minLevel") || "1");
    const maxResults = parseInt(searchParams.get("limit") || "100");
    const includeStatic = searchParams.get("includeStatic") !== "false";
    const source = searchParams.get("source") || "all"; // 'yc', 'wikidata', 'all'

    // Check cache
    const now = Date.now();
    if (cachedMentors && (now - cacheTime) < CACHE_DURATION) {
      console.log('[MENTORS-LIVE] Serving from cache');
      return NextResponse.json({
        mentors: cachedMentors.slice(0, maxResults),
        cached: true,
        cacheAge: Math.floor((now - cacheTime) / 1000),
      });
    }

    console.log('[MENTORS-LIVE] Fetching fresh data...');

    // Start with static mentors
    let allMentors = includeStatic ? [...realMentors] : [];

    // Fetch live data
    const liveMentors = await aggregateMentors({
      includeYC: source === 'all' || source === 'yc',
      includeWikidata: source === 'all' || source === 'wikidata',
      minLevel,
      maxResults: maxResults - allMentors.length,
    });

    allMentors = [...allMentors, ...liveMentors];

    // Update cache
    cachedMentors = allMentors;
    cacheTime = now;

    console.log(`[MENTORS-LIVE] Fetched ${allMentors.length} mentors`);

    return NextResponse.json({
      mentors: allMentors.slice(0, maxResults),
      cached: false,
      count: allMentors.length,
      sources: {
        static: includeStatic ? realMentors.length : 0,
        live: liveMentors.length,
      },
    });
  } catch (error) {
    console.error('[MENTORS-LIVE] Error:', error);

    // Fallback to static mentors
    return NextResponse.json({
      mentors: realMentors,
      cached: false,
      error: 'Failed to fetch live data, using static mentors',
    });
  }
}

// POST endpoint to refresh cache manually
export async function POST() {
  cachedMentors = null;
  cacheTime = 0;
  return NextResponse.json({ message: 'Cache cleared' });
}
