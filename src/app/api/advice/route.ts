import { NextResponse } from "next/server";
import { AdvicePayload } from "@/types";
import { getAdvice } from "@/utils/ai-advisor";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as AdvicePayload;

    if (!payload?.mentor || !payload?.gap) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const advice = await getAdvice(payload);
    return NextResponse.json({ advice });
  } catch (error) {
    console.error("Advice API error", error);
    return NextResponse.json({ error: "Unable to fetch advice" }, { status: 500 });
  }
}
