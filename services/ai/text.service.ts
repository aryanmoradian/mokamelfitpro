
import { getAiClient, AI_MODEL } from './aiClient';
import { AIResponse, TextProcessingOptions } from './ai.types';
import { logAIUsage } from './ai.logger';
import { GenerateContentResponse } from "@google/genai";

/**
 * Process text input and handle prompts (RTL Support) using Google GenAI SDK.
 */
export async function processTextAI(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  options: TextProcessingOptions = {}
): Promise<AIResponse<string>> {
  try {
    const ai = getAiClient();
    
    // Format messages for Gemini API.
    const systemInstruction = messages.find(m => m.role === 'system')?.content;
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: AI_MODEL,
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: options.jsonMode ? "application/json" : undefined,
      },
    });

    logAIUsage({
      userId: options.userId,
      inputType: 'text',
      source: options.source,
      success: true,
    });

    return {
      success: true,
      data: response.text || '',
    };
  } catch (error: any) {
    logAIUsage({
      userId: options.userId,
      inputType: 'text',
      source: options.source,
      success: false,
    });

    return {
      success: false,
      error: error.message || 'AI Text Processing Failed',
    };
  }
}
