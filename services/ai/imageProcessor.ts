
import { getAiClient, AI_MODEL, logAiUsage } from './aiClient';
import { GenerateContentResponse } from "@google/genai";

/**
 * Process image-based analysis (Vision AI) using Google GenAI SDK.
 */
export async function processImage(
  prompt: string,
  imageUri: string, // Base64 or URL
  systemPrompt?: string
) {
  // Use the fixed logAiUsage export from aiClient.
  logAiUsage('IMAGE_PROCESS', { prompt, imageUriLength: imageUri.length });

  try {
    const ai = getAiClient();
    
    // Extract base64 data if it's a data URL.
    const base64Data = imageUri.includes('base64,') ? imageUri.split('base64,')[1] : imageUri;
    const mimeType = imageUri.includes('image/') ? imageUri.split(';')[0].split(':')[1] : 'image/jpeg';

    // Use ai.models.generateContent for multimodal input.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: AI_MODEL,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Data } }
        ]
      },
      config: {
        systemInstruction: systemPrompt
      }
    });

    return response.text;
  } catch (error: any) {
    console.error('AI Image Processing Error:', error);
    logAiUsage('IMAGE_PROCESS', { success: false });
    throw error;
  }
}
