
import { getAiClient, AI_MODEL } from './aiClient';
import { AIResponse, BaseAIRequest } from './ai.types';
import { logAIUsage } from './ai.logger';
import { GenerateContentResponse } from "@google/genai";

/**
 * File/PDF AI processing for document insights using Google GenAI SDK.
 */
export async function processFileAI(
  fileUrl: string,
  filename: string,
  prompt = 'Summarize this document',
  meta: BaseAIRequest = {}
): Promise<AIResponse<string>> {
  try {
    const ai = getAiClient();
    const base64Data = fileUrl.includes('base64,') ? fileUrl.split('base64,')[1] : fileUrl;

    // Fix: Use correct parts structure for multimodal inputs.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: AI_MODEL,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: base64Data,
            },
          },
        ],
      },
    });

    logAIUsage({ userId: meta.userId, inputType: 'file', source: meta.source, success: true });

    return { success: true, data: response.text || '' };
  } catch (error: any) {
    logAIUsage({ userId: meta.userId, inputType: 'file', source: meta.source, success: false });
    return { success: false, error: error.message };
  }
}
