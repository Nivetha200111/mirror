import { Vector } from "@/types";

/**
 * The "Vibe Check"
 * Uses Gemini 1.5 Flash Multimodal to analyze a visual input
 * (e.g., a photo of a workspace, a pitch deck slide, or a Twitter profile)
 * and extract personality traits automatically.
 */
export const analyzeVisualVibe = async (imageBase64: string): Promise<Partial<Vector>> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("Gemini API key missing");
    return {};
  }

  try {
    const prompt = `
      Analyze this image for entrepreneurial traits. 
      If it's a workspace: look for organization (Grind) or chaos (Creativity/Risk).
      If it's a screen: look for code/data (Education) or social media (Network).
      
      Return a JSON object with estimated scores (1-10) for any of these keys that apply:
      risk, network, grind, education, resilience.
      Only return keys where you have strong visual evidence.
    `;

    // Using REST API directly to avoid build errors with missing @google/generative-ai package
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              { inlineData: { mimeType: "image/jpeg", data: imageBase64 } }
            ]
          }],
          generationConfig: { responseMimeType: "application/json" }
        }),
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error("Visual Vibe Check failed:", error);
    return {};
  }
};