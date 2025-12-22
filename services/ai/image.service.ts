
import { getAiClient, AI_MODEL } from './aiClient';
import { AIResponse, BaseAIRequest } from './ai.types';
import { logAIUsage } from './ai.logger';
import { GenerateContentResponse } from "@google/genai";

/**
 * Vision AI processing for image-based analysis using Google GenAI SDK.
 */
export async function processImageAI(
  imageUrl: string,
  prompt = 'Analyze this image',
  meta: BaseAIRequest = {}
): Promise<AIResponse<string>> {
  try {
    const ai = getAiClient();
    
    const base64Data = imageUrl.includes('base64,') ? imageUrl.split('base64,')[1] : imageUrl;
    const mimeType = imageUrl.includes('image/') ? imageUrl.split(';')[0].split(':')[1] : 'image/jpeg';

    // Fix: Use correct parts structure for multimodal inputs.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: AI_MODEL,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Data } }
        ],
      },
    });

    logAIUsage({ userId: meta.userId, inputType: 'image', source: meta.source, success: true });

    return { success: true, data: response.text || '' };
  } catch (error: any) {
    logAIUsage({ userId: meta.userId, inputType: 'image', source: meta.source, success: false });
    return { success: false, error: error.message };
  }
}
