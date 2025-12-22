
import { getAiClient, AI_MODEL, logAiUsage } from './aiClient';
import { GenerateContentResponse } from "@google/genai";

export interface TextProcessingOptions {
  systemPrompt?: string;
  jsonMode?: boolean;
}

/**
 * Process text input and handle chat history using Google GenAI SDK.
 */
export async function processText(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  options: TextProcessingOptions = {}
) {
  // Use the fixed logAiUsage export from aiClient.
  logAiUsage('TEXT_PROCESS', { messageCount: messages.length, options });

  try {
    const ai = getAiClient();
    
    // Separate system prompt from conversation history for Gemini.
    const systemInstruction = options.systemPrompt || messages.find(m => m.role === 'system')?.content;
    const contents = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

    // Use ai.models.generateContent as per SDK guidelines.
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: AI_MODEL,
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: options.jsonMode ? "application/json" : undefined,
      },
    });

    const content = response.text;
    
    if (options.jsonMode && content) {
        try {
            return JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse AI JSON response:', content);
            throw new Error('قالب پاسخ هوش مصنوعی نامعتبر بود.');
        }
    }

    return content;
  } catch (error: any) {
    console.error('AI Text Processing Error:', error);
    logAiUsage('TEXT_PROCESS', { success: false, options });
    throw error;
  }
}
