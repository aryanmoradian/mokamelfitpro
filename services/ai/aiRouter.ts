
import { AIProvider, AIResponse } from './ai.types';
import { processTextAI } from './text.service';
import { processImageAI } from './image.service';
import { processAudioAI } from './audio.service';
import { processFileAI } from './file.service';

/**
 * Gemini Provider Implementation of the AIProvider interface
 */
const GeminiProvider: AIProvider = {
  async text(messages, options) {
    return processTextAI(messages, options);
  },
  async image(imageUrl, prompt, options) {
    return processImageAI(imageUrl, prompt, options);
  },
  async audio(audioBase64, format, prompt, options) {
    // FIX: Cast the 'format' parameter to 'mp3' | 'wav' to satisfy the type requirement of processAudioAI.
    return processAudioAI(audioBase64, format as 'mp3' | 'wav', prompt, options);
  },
  async file(fileUrl, filename, prompt, options) {
    return processFileAI(fileUrl, filename, prompt, options);
  }
};

// Currently using Gemini as the primary backend provider
const ActiveProvider = GeminiProvider;

/**
 * Unified AIService Router - The only entry point for AI tasks
 * This abstracts the provider details from the rest of the application.
 */
export const AIService = {
  text: ActiveProvider.text,
  image: ActiveProvider.image,
  audio: ActiveProvider.audio,
  file: ActiveProvider.file,
};
