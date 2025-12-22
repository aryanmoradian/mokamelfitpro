
import { QuizData, ChatMessage, AnalysisResult, VisionAnalysis } from '../types';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

export const initializeAi = (apiKey: string) => {
  // No-op: The Backend handles the API Key. Frontend is dumb.
  console.log('FitPro Client Initialized.');
  return true;
};

/**
 * Sends Quiz Data to Backend -> Backend executes SASKA -> Returns Formula
 */
export const generateFormulaAndRecommendations = async (quizData: QuizData): Promise<AnalysisResult> => {
  try {
    const response = await fetch(`${API_URL}/ai/generate-formula`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(quizData)
    });

    if (!response.ok) {
        if (response.status === 401) throw new Error('لطفاً ابتدا وارد حساب کاربری شوید');
        const errorData = await response.json();
        throw new Error(errorData.message || 'خطا در ارتباط با سرور ساسکا');
    }

    const data = await response.json();
    return data as AnalysisResult;

  } catch (error: any) {
    console.error("API Error:", error);
    throw error;
  }
};

/**
 * Sends Image to Backend -> Backend runs Vision AI -> Returns analysis & updated formula logic
 */
export const analyzeImageAndRegenerateFormula = async (
  currentAnalysis: AnalysisResult,
  base64Image: string, 
  mimeType: string
): Promise<AnalysisResult> => {
  try {
      const response = await fetch(`${API_URL}/ai/analyze-image`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
              currentFormulaId: currentAnalysis.formula.id,
              image: base64Image,
              mimeType: mimeType
          })
      });

      if (!response.ok) throw new Error('خطا در تحلیل تصویر');
      return await response.json();
  } catch (e) {
      console.error("Vision API Error:", e);
      throw new Error("تحلیل تصویر با خطا مواجه شد.");
  }
};

/**
 * Sends chat history to Backend -> Backend queries Gemini -> Returns response
 */
export const continueConversation = async (history: ChatMessage[], latestQuery: string, useThinkingMode: boolean, useSearch: boolean) => {
  try {
      const response = await fetch(`${API_URL}/ai/chat`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({
              history: history.map(h => ({ role: h.role, content: h.parts[0].text })),
              message: latestQuery,
              useThinking: useThinkingMode,
              useSearch: useSearch
          })
      });

      if (!response.ok) throw new Error('Failed to get response');
      
      const data = await response.json();
      return {
          text: data.text,
          groundingChunks: data.groundingChunks || []
      };
  } catch (error) {
      console.error("Chat API Error:", error);
      return { text: "متاسفم، ارتباط با ساسکا قطع شده است.", groundingChunks: [] };
  }
};

/**
 * Requests TTS audio from Backend
 */
export const generateSpeech = async (text: string) => {
    try {
        const response = await fetch(`${API_URL}/ai/tts`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ text })
        });
        
        if (!response.ok) throw new Error('TTS Failed');
        const data = await response.json();
        return data.audioBase64;
    } catch (e) {
        console.error("TTS API Error:", e);
        return '';
    }
};
