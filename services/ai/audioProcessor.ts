
import { getAiClient, logAiUsage } from './aiClient';
import { GenerateContentResponse } from "@google/genai";

/**
 * Process audio input through Gemini using Google GenAI SDK.
 */
export async function processAudio(
  audioBase64: string,
  format: 'mp3' | 'wav' = 'mp3',
  prompt: string = 'بررسی فایل صوتی'
) {
  // Use the fixed logAiUsage export from aiClient.
  logAiUsage('AUDIO_PROCESS', { format, audioLength: audioBase64.length });

  try {
    const ai = getAiClient();
    // Use the native audio model for best results as per guidelines.
    const model = 'gemini-2.5-flash-native-audio-preview-09-2025';

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          { text: prompt },
          { 
            inlineData: { 
              mimeType: `audio/${format}`, 
              data: audioBase64 
            } 
          }
        ],
      },
    });

    return response.text;
  } catch (error: any) {
    console.error('AI Audio Processing Error:', error);
    logAiUsage('AUDIO_PROCESS', { success: false });
    throw error;
  }
}
