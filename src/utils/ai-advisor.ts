import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { AdvicePayload } from "@/types";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : undefined;

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

  if (!genAI) {
    return fallbackAdvice(payload);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: "You are a direct career coach from India. Be concise, specific, and culturally aware. No disclaimers. Speak with authority.",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text() || fallbackAdvice(payload);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return fallbackAdvice(payload);
  }
};
