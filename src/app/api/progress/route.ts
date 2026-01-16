import { NextResponse } from "next/server";
import { ProgressEntry } from "@/types";

// In-memory storage (replace with Supabase in production)
const progressStore = new Map<string, ProgressEntry[]>();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "anonymous";

    const entries = progressStore.get(userId) || [];
    return NextResponse.json(entries);
  } catch (error) {
    console.error("Progress GET error", error);
    return NextResponse.json({ error: "Unable to fetch progress" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const entry = (await request.json()) as ProgressEntry;

    if (!entry.challengeId) {
      return NextResponse.json({ error: "Invalid entry" }, { status: 400 });
    }

    const userId = entry.userId || "anonymous";
    const userEntries = progressStore.get(userId) || [];

    const newEntry: ProgressEntry = {
      ...entry,
      id: `progress-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    userEntries.push(newEntry);
    progressStore.set(userId, userEntries);

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error("Progress POST error", error);
    return NextResponse.json({ error: "Unable to save progress" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, userId, updates } = (await request.json()) as {
      id: string;
      userId?: string;
      updates: Partial<ProgressEntry>;
    };

    const user = userId || "anonymous";
    const userEntries = progressStore.get(user) || [];

    const index = userEntries.findIndex((e) => e.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    userEntries[index] = { ...userEntries[index], ...updates };
    progressStore.set(user, userEntries);

    return NextResponse.json(userEntries[index]);
  } catch (error) {
    console.error("Progress PATCH error", error);
    return NextResponse.json({ error: "Unable to update progress" }, { status: 500 });
  }
}
