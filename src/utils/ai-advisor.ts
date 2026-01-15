import "server-only";
import OpenAI from "openai";
import { AdvicePayload } from "@/types";

const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export const buildAdvicePrompt = (payload: AdvicePayload) => {
  const { userTraits, mentor, gap } = payload;

  return [
    `User traits: ${userTraits.join(", ") || "(none)"}.`,
    `Mentor: ${mentor.name} (${mentor.title}).`,
    `Mentor DNA: risk ${mentor.dna.risk}, network ${mentor.dna.network}, grind ${mentor.dna.grind}, education ${mentor.dna.education}, resilience ${mentor.dna.resilience}.`,
    `Gap to close: ${gap.attribute} (user ${gap.userScore} vs mentor ${gap.mentorScore}).`,
    "Give blunt, Indian-context advice in 2-3 sentences. Avoid fluff.",
  ].join("\n");
};

const fallbackAdvice = (payload: AdvicePayload) => {
  const { mentor, gap } = payload;
  return `Your biggest stretch is ${gap.attribute}. Borrow ${mentor.name}'s playbook: double down on one weekly rep that grows ${gap.attribute} fast, text three people outside your circle for feedback, and log proof so your confidence is earned, not imagined.`;
};

export const getAdvice = async (payload: AdvicePayload) => {
  const prompt = buildAdvicePrompt(payload);

  if (!openaiClient) {
    return fallbackAdvice(payload);
  }

  const response = await openaiClient.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    max_tokens: 180,
    messages: [
      {
        role: "system",
        content:
          "You are a direct career coach from India. Be concise, specific, and culturally aware. No disclaimers.",
      },
      { role: "user", content: prompt },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim();
  return content?.length ? content : fallbackAdvice(payload);
};
