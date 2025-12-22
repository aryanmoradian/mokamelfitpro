
import { getAiClient, AI_MODEL, logAiUsage } from './aiClient';
import { GenerateContentResponse } from "@google/genai";

/**
 * Process document/PDF inputs using Google GenAI SDK.
 */
export async function processFile(
  fileUrlOrData: string,
  filename: string,
  prompt: string = 'تحلیل این سند'
) {
  // Use the fixed logAiUsage export from aiClient.
  logAiUsage('FILE_PROCESS', { filename, prompt });

  try {
    const ai = getAiClient();
    // Extract base64 data if it's a data URL.
    const base64Data = fileUrlOrData.includes('base64,') ? fileUrlOrData.split('base64,')[1] : fileUrlOrData;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: AI_MODEL,
      contents: {
        parts: [
          { text: prompt },
          { 
            inlineData: { 
              mimeType: 'application/pdf', 
              data: base64Data 
            } 
          }
        ],
      },
    });

    return response.text;
  } catch (error: any) {
    console.error('AI File Processing Error:', error);
    logAiUsage('FILE_PROCESS', { success: false });
    throw error;
  }
}
