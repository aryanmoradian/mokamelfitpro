
import { getAiClient } from './aiClient';
import { AIResponse, BaseAIRequest } from './ai.types';
import { logAIUsage } from './ai.logger';
import { GenerateContentResponse } from "@google/genai";

/**
 * Audio AI processing for voice notes and feedback using Google GenAI SDK.
 */
export async function processAudioAI(
  audioBase64: string,
  format: 'mp3' | 'wav' = 'mp3',
  prompt = 'Analyze this audio',
  meta: BaseAIRequest = {}
): Promise<AIResponse<string>> {
  try {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash-native-audio-preview-09-2025';

    // Fix: Use correct parts structure for multimodal inputs.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          {
            inlineData: { data: audioBase64, mimeType: `audio/${format}` },
          },
        ],
      },
    });

    logAIUsage({ userId: meta.userId, inputType: 'audio', source: meta.source, success: true });

    return { success: true, data: response.text || '' };
  } catch (error: any) {
    logAIUsage({ userId: meta.userId, inputType: 'audio', source: meta.source, success: false });
    return { success: false, error: error.message };
  }
}
