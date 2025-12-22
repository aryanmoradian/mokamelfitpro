
// Backend-Aligned Types (Prisma Schema Reflection)

export type UserRole = 'user' | 'admin' | 'coach' | 'premium';
export type UserStatus = 'active' | 'suspended';
export type Gender = 'male' | 'female' | 'other';

// Matches 'model User'
export interface User {
  id: string; // UUID
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  gender?: Gender;
  birthDate?: string;
  role: UserRole;
  emailVerified: boolean;
  status: UserStatus;
  profilePicture?: string;
  createdAt: number;
  lastLoginAt?: number;
}

// Helper for Frontend Quiz (Input DTO)
export interface QuizData {
  gender: Gender | '';
  weight: string;
  age: string;
  exerciseLevel: 'none' | 'light' | 'moderate' | 'heavy' | '';
  nutrition: string;
  sleep: string;
  goal: 'lose-fat' | 'build-muscle' | 'maintain' | '';
}

// Matches 'model Formula' -> summary JSON field
export interface FormulaSummary {
  proteinNeed: 'low' | 'moderate' | 'high';
  creatineNeed: 'low' | 'moderate' | 'high';
  recoveryStatus: 'poor' | 'average' | 'good';
  energyIndex: number;
  stressLevel: 'low' | 'moderate' | 'high';
  priority: string;
}

// Matches 'model Formula'
export interface Formula {
  id: string; // UUID
  code: string; // "MFP-X92-GLD" - Unique Identity Code
  aiVersion: string; // "SASKA v1.2"
  summary: FormulaSummary; // JSONB
  confidenceScore: number;
  approvedBySpecialist: boolean;
  createdAt: number;
}

// Matches 'model Supplement' + 'model SupplementStack' joined
export interface SupplementStack {
  id: string; // UUID
  name: string; // From Supplement model
  category?: string; // From Supplement model
  dosage: string;
  timing: string;
  reason: string;
  priority: number;
  isCompleted: boolean;
  rating?: number;
}

// Matches 'model BioAlert'
export interface BioAlert {
  id: string; // UUID
  type: string; // 'interaction' | 'dosage' | 'general'
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface VisionAnalysis {
  type: 'supplement' | 'food' | 'unknown';
  name: string;
  doseEstimate?: string; // For supplements
  calories?: number; // For food
  protein?: number; // For food
  confidence: number;
  detectedIngredients?: string[];
}

// The complete API Response wrapper
export interface AnalysisResult {
  formula: Formula;
  stacks: SupplementStack[];
  alerts: BioAlert[];
  visionAnalysis?: VisionAnalysis;
}

// Chat & System Types
export interface ChatMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
  groundingChunks?: any[];
  timestamp: number;
  status?: 'sent' | 'responded';
}

export type EventType = 
  | 'LOGIN' 
  | 'REGISTER' 
  | 'EMAIL_VERIFIED' 
  | 'PASSWORD_RESET' 
  | 'PROFILE_UPDATED' 
  | 'AI_USED' 
  | 'QUIZ_COMPLETED' 
  | 'SUBSCRIPTION_REQUESTED'
  | 'SUBSCRIPTION_ACTIVATED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_ACTIVATED'
  | 'PAYMENT_SUBMITTED'
  | 'PAYMENT_APPROVED'
  | 'PAYMENT_REJECTED';

export interface UserEvent {
  id: string;
  userId: string;
  userEmail?: string;
  eventType: EventType;
  source: 'dashboard' | 'elite' | 'ai' | 'admin' | 'system';
  metadata: any;
  createdAt: number;
}

export interface WaterReminderSettings {
  enabled: boolean;
  interval: number; // in minutes
  message: string;
}

export interface AIProvider {
  text(messages: any[], options?: any): Promise<any>;
  image(imageUrl: string, prompt: string, options?: any): Promise<any>;
  audio(audioBase64: string, format: string, prompt: string, options?: any): Promise<any>;
  file(fileUrl: string, filename: string, prompt: string, options?: any): Promise<any>;
}

// Payment Types
export type PaymentStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentRequest {
    id: string;
    userId: string;
    userEmail: string;
    txId: string; // Transaction ID
    receiptUrl?: string; // URL or Base64 of the uploaded receipt
    amount: string; // e.g., '1 USDT'
    status: PaymentStatus;
    createdAt: number;
    reviewedAt?: number;
}
