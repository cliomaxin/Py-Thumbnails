import { GoogleGenAI, Type } from "@google/genai";
import { Platform, GeneratedContent } from "../types";

// Helper to get the AI instance with the injected key
const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found. Please select a key.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateSocialText = async (
  concept: string,
  platforms: Platform[]
): Promise<GeneratedContent[]> => {
  const ai = getAI();
  
  const prompt = `
    You are an expert social media manager. 
    Video Concept: "${concept}"
    
    For each selected platform (${platforms.join(', ')}), generate optimized content.
    - YouTube: Clickbaity but relevant title, SEO-rich description (approx 100 words).
    - Instagram: Engaging caption, line breaks, mix of popular and niche hashtags.
    - TikTok: Short, punchy caption, trending hashtags.
    - Facebook: Conversational tone, community-focused.
    - Reddit: Authentic title (no clickbait), detailed context for the post body.
    
    Also provide a specific, highly detailed visual description for an image/thumbnail for this post.
    For YouTube/Facebook/Reddit, describe a 16:9 landscape thumbnail with high contrast and legible text space.
    For Instagram/TikTok, describe a 1:1 or 9:16 visual that pops.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            platform: { type: Type.STRING, enum: Object.values(Platform) },
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } },
            imagePrompt: { type: Type.STRING }
          },
          required: ["platform", "title", "description", "hashtags", "imagePrompt"]
        }
      }
    }
  });

  if (response.text) {
    return JSON.parse(response.text) as GeneratedContent[];
  }
  return [];
};

export const generateThumbnail = async (
  prompt: string,
  platform: Platform
): Promise<string> => {
  const ai = getAI();

  // Determine aspect ratio based on platform
  let aspectRatio = "16:9";
  if (platform === Platform.Instagram) aspectRatio = "1:1";
  if (platform === Platform.TikTok) aspectRatio = "9:16";

  // Enforce high quality
  const enhancedPrompt = `${prompt}. 4K resolution, photorealistic, cinematic lighting, vibrant colors, high detail, masterpiece.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-image-preview",
    contents: {
      parts: [{ text: enhancedPrompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
        imageSize: "4K" // Requesting 4K specifically
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("No image generated");
};