import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { Trait } from "@/types";

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("traits")
    .select("id,label,votes")
    .order("votes", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data satisfies Partial<Trait>[]);
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 500 },
    );
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
