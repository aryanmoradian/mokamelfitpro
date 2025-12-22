
import { GoogleGenAI } from "@google/genai";
import { logAIUsage } from './ai.logger';
import { logUserEvent } from '../eventService';
import { getCurrentUser } from '../../utils/authService';

/**
 * FitPro Backend AI Service (Simulated)
 * This file represents server-side logic where environment variables are secure.
 */

// Production API Key from environment - Never exposed to frontend UI
const INTERNAL_API_KEY = process.env.API_KEY;

export const getAiClient = () => {
  if (!INTERNAL_API_KEY) {
    throw new Error("AI Configuration Missing: System Error 500");
  }
  return new GoogleGenAI({ apiKey: INTERNAL_API_KEY });
};

export const AI_MODEL = 'gemini-3-flash-preview';

export const logAiUsage = (inputType: string, details: any) => {
  const user = getCurrentUser();
  
  logAIUsage({
    inputType,
    success: details?.success !== false,
    userId: user?.id || details?.userId,
    source: details?.source || details?.options?.source
  });

  if (user && details?.success !== false) {
    logUserEvent(user.id, 'AI_USED', 'ai', { inputType });
  }
};
