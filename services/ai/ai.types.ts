
export type AIInputType = 'text' | 'image' | 'audio' | 'file';

export interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: any;
}

export interface BaseAIRequest {
  userId?: string;
  source?: 'user-dashboard' | 'admin-panel' | 'system';
}

export interface TextProcessingOptions extends BaseAIRequest {
  jsonMode?: boolean;
}

export interface AIProvider {
  text(messages: { role: 'user' | 'assistant' | 'system'; content: string }[], options?: TextProcessingOptions): Promise<AIResponse<string>>;
  image(imageUrl: string, prompt: string, options?: BaseAIRequest): Promise<AIResponse<string>>;
  audio(audioBase64: string, format: string, prompt: string, options?: BaseAIRequest): Promise<AIResponse<string>>;
  file(fileUrl: string, filename: string, prompt: string, options?: BaseAIRequest): Promise<AIResponse<string>>;
}
