import { NextResponse } from "next/server";

const sparqlQuery = `
SELECT ?person ?personLabel ?description ?image WHERE {
  ?person wdt:P106 wd:Q5482740. # software engineer
  OPTIONAL { ?person wdt:P18 ?image }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "en". }
  FILTER(lang(?description) = "en")
}
LIMIT 12`;

const endpoint = "https://query.wikidata.org/sparql";

export async function GET() {
  try {
    const res = await fetch(`${endpoint}?query=${encodeURIComponent(sparqlQuery)}`, {
      headers: { Accept: "application/sparql-results+json" },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(`Wikidata HTTP_${res.status}`);
    }

    const data = (await res.json()) as {
      results?: { bindings?: Array<Record<string, { value: string }>> };
    };

    const rows = data.results?.bindings || [];

    const normalized = rows.map((row) => {
      const name = row.personLabel?.value || "UNKNOWN";
      const bio = row.description?.value || "";
      const image = row.image?.value || "";
      const id = row.person?.value?.split("/").pop() || name;
      return { id, name, bio, image };
    });

    return NextResponse.json(normalized);
  } catch (error) {
    console.error("mentor fetch error", error);
    return NextResponse.json({ error: "MENTOR_FEED_FAIL" }, { status: 500 });
  }
}
