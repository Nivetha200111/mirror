import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase";
import { Trait } from "@/types";
import { fallbackSeeds } from "@/data/traits";

export async function GET() {
  const supabase = createSupabaseClient();
  if (!supabase) {
    return NextResponse.json(fallbackSeeds.map((label, idx) => ({ id: idx, label, votes: 1 })));
  }

  const { data, error } = await supabase
    .from("traits")
    .select("id,label,votes")
    .order("votes", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(fallbackSeeds.map((label, idx) => ({ id: idx, label, votes: 1 })));
  }

  return NextResponse.json(data satisfies Partial<Trait>[]);
}

export async function POST(request: Request) {
  const supabase = createSupabaseClient();
  if (!supabase) {
    const body = await request.json();
    const label = (body?.label as string)?.trim();
    if (!label) {
      return NextResponse.json({ error: "Label required" }, { status: 400 });
    }
    return NextResponse.json({ id: Date.now(), label, votes: 1 });
  }

  const body = await request.json();
  const label = (body?.label as string)?.trim();

  if (!label) {
    return NextResponse.json({ error: "Label required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("traits")
    .insert({ label })
    .select("id,label,votes")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
