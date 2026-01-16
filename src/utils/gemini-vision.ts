import { GoogleGenerativeAI } from "@google/generative-ai";
import { Vector } from "@/types";

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : undefined;

/**
 * The "Vibe Check"
 * Uses Gemini 1.5 Flash Multimodal to analyze a visual input
 * (e.g., a photo of a workspace, a pitch deck slide, or a Twitter profile)
 * and extract personality traits automatically.
 */
export const analyzeVisualVibe = async (imageBase64: string): Promise<Partial<Vector>> => {
  if (!genAI) {
    console.warn("Gemini API key missing");
    return {};
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
      Analyze this image for entrepreneurial traits. 
      If it's a workspace: look for organization (Grind) or chaos (Creativity/Risk).
      If it's a screen: look for code/data (Education) or social media (Network).
      
      Return a JSON object with estimated scores (1-10) for any of these keys that apply:
      risk, network, grind, education, resilience.
      Only return keys where you have strong visual evidence.
    `;

    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: "image/jpeg",
      },
    };

    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    return JSON.parse(text) as Partial<Vector>;
  } catch (error) {
    console.error("Visual Vibe Check failed:", error);
    return {};
  }
};