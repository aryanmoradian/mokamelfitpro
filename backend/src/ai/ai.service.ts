
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AiService {
  private aiClient: GoogleGenAI;
  private readonly logger = new Logger(AiService.name);

  constructor(private prisma: PrismaService) {
    if (!process.env.API_KEY) {
      this.logger.error("API_KEY is missing in backend environment!");
    }
    this.aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  // --- 1. Formula Generation (SASKA Engine) ---
  async generateFormula(userId: string, quizData: any) {
    const model = 'gemini-2.5-flash-latest';
    const formulaCode = `MFP-${Math.floor(1000 + Math.random() * 9000)}-${quizData.goal === 'build-muscle' ? 'BLD' : 'CUT'}`;

    const systemPrompt = `
      You are SASKA (Smart AI Supplement Knowledge Assistant).
      Your mission: Analyze the user's biological data and create a 100% personalized supplement stack.
      
      CRITICAL OUTPUT RULES:
      1. Output MUST be valid JSON.
      2. All text fields (reason, message) MUST be in Persian (Farsi).
      3. Be scientifically accurate but concise.

      JSON SCHEMA:
      {
        "summary": {
             "proteinNeed": "low" | "moderate" | "high",
             "creatineNeed": "low" | "moderate" | "high",
             "recoveryStatus": "poor" | "average" | "good",
             "energyIndex": number (0-100),
             "stressLevel": "low" | "moderate" | "high",
             "priority": "string (e.g., بهبود خواب و ریکاوری)"
        },
        "stacks": [
          {
            "id": "uuid",
            "name": "string (English Name of Supplement)",
            "dosage": "string (e.g., 5g daily)",
            "timing": "string (e.g., After workout)",
            "reason": "string (Scientific reason in Persian)",
            "priority": number (1-5, 5 is highest),
            "isCompleted": false,
            "rating": 0
          }
        ],
        "alerts": [
          {
            "id": "uuid",
            "type": "interaction" | "dosage" | "general",
            "message": "string (Warning in Persian)",
            "severity": "low" | "medium" | "high"
          }
        ]
      }
    `;

    const userPrompt = `
      User Profile:
      - Gender: ${quizData.gender}
      - Age: ${quizData.age}
      - Weight: ${quizData.weight}kg
      - Goal: ${quizData.goal}
      - Exercise Intensity: ${quizData.exerciseLevel}
      - Sleep Duration: ${quizData.sleep} hours
      - Diet Description: ${quizData.nutrition}
      
      Generate the formula now.
    `;

    try {
      const response = await this.aiClient.models.generateContent({
        model,
        contents: {
          parts: [{ text: userPrompt }]
        },
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json'
        }
      });

      const resultText = response.text();
      if (!resultText) throw new InternalServerErrorException("SASKA failed to generate output.");

      const parsedResult = JSON.parse(resultText);

      // --- PERSISTENCE LAYER ---
      // Save the generated formula to Supabase (via Prisma)
      const savedFormula = await this.prisma.formula.create({
        data: {
          code: formulaCode,
          aiVersion: "SASKA v2.0 (Gemini 2.5)",
          summary: parsedResult.summary,
          stacks: parsedResult.stacks,
          alerts: parsedResult.alerts,
          userId: userId
        }
      });

      // Construct the AnalysisResult object for the frontend
      return {
        formula: {
            id: savedFormula.id,
            code: savedFormula.code,
            aiVersion: savedFormula.aiVersion,
            summary: savedFormula.summary,
            confidenceScore: savedFormula.confidenceScore,
            approvedBySpecialist: savedFormula.approvedBySpecialist,
            createdAt: savedFormula.createdAt.getTime()
        },
        stacks: parsedResult.stacks,
        alerts: parsedResult.alerts
      };

    } catch (e) {
      this.logger.error("SASKA Logic Error", e);
      throw new InternalServerErrorException("خطا در پردازش هوش مصنوعی ساسکا");
    }
  }

  // --- 2. Chat (SASKA Conversation) ---
  async chat(history: any[], message: string, useThinking: boolean, useSearch: boolean) {
    const modelName = useThinking ? 'gemini-2.0-flash-thinking-exp-01-21' : 'gemini-2.5-flash-latest';
    
    const tools = [];
    if (useSearch) {
      tools.push({ googleSearch: {} });
    }

    try {
      // Clean history for Gemini SDK
      const contents = history.map(h => ({
        role: h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content }]
      }));
      
      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await this.aiClient.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          tools: tools.length > 0 ? tools : undefined,
          systemInstruction: "You are SASKA, the dedicated AI coach of 'Mokammel Fit Pro'. You are knowledgeable about biology, supplements, and fitness. Speak Persian (Farsi) in a professional yet encouraging tone."
        }
      });

      return {
        text: response.text(),
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };

    } catch (e) {
      this.logger.error("Chat Error", e);
      throw new InternalServerErrorException("ارتباط با ساسکا برقرار نشد");
    }
  }

  // --- 3. Vision Analysis & Update ---
  async analyzeImage(userId: string, currentFormulaId: string, base64Image: string, mimeType: string) {
    const model = 'gemini-2.5-flash-latest';
    
    // Step A: Vision Analysis
    const response = await this.aiClient.models.generateContent({
      model,
      contents: {
        parts: [
          { text: "Identify this supplement or food. Return JSON: { type: 'supplement'|'food', name: 'string', doseEstimate: 'string', calories: number, protein: number, detectedIngredients: string[] }" },
          { inlineData: { mimeType, data: base64Image } }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });

    const analysis = JSON.parse(response.text());

    // Step B: Update Logic (Mocking the re-calculation for MVP)
    // In a full implementation, we would fetch the user's existing stack from Prisma,
    // add this new item, check for conflicts, and save a NEW formula version.
    
    // For now, we return the vision data so the frontend can display it
    // And we return the *current* formula ID to keep the state consistent.
    
    const currentFormula = await this.prisma.formula.findUnique({ where: { id: currentFormulaId }});
    
    if (!currentFormula) throw new InternalServerErrorException("Formula not found");

    return {
        formula: {
            ...currentFormula,
            createdAt: currentFormula.createdAt.getTime() // Normalize Date
        }, 
        stacks: currentFormula.stacks, // Keeping existing stacks for this interaction
        alerts: currentFormula.alerts, 
        visionAnalysis: analysis 
    };
  }

  // --- 4. Text to Speech ---
  async textToSpeech(text: string) {
      try {
        // Using a specialized model or standard one with audio output config
        // Note: Actual model availability for TTS via REST varies, using config as requested.
        const response = await this.aiClient.models.generateContent({
            model: 'gemini-2.5-flash-latest', 
            contents: { parts: [{ text: `Say this text in Persian with a professional tone: ${text}` }] },
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
            }
        });
        
        const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return { audioBase64: audioData };

      } catch (e) {
          this.logger.error("TTS Error", e);
          return { audioBase64: null }; 
      }
  }
}
