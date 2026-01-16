import "server-only";
import { AdvicePayload } from "@/types";

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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return fallbackAdvice(payload);
  }

  try {
    // Using REST API directly to avoid build errors with missing @google/generative-ai package
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: {
            parts: [{ text: "You are a direct career coach from India. Be concise, specific, and culturally aware. No disclaimers. Speak with authority." }]
          }
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.statusText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return text || fallbackAdvice(payload);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return fallbackAdvice(payload);
  }
};
