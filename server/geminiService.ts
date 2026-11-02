import { GoogleGenAI } from '@google/genai';

export interface FarmContext {
  soilMoisture?: number;
  soilPh?: number;
  temperature?: number;
  humidity?: number;
  pumpStatus?: boolean;
  cropType?: string;
  location?: string;
}

export interface DiseaseAnalysisResponse {
  cropName: string;
  possibleIssue: string;
  scientificName?: string;
  confidence: number;
  confidenceLevel: 'High' | 'Moderate' | 'Low / Uncertain';
  symptoms: string[];
  immediateSteps: string[];
  organicRemedies: string[];
  chemicalRemedies: string[];
  preventionTips: string[];
  expertAdvice: string;
  disclaimer: string;
}

class GeminiService {
  private getClient(): GoogleGenAI {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      throw new Error(
        'GEMINI_API_KEY is not configured on the server. Please add your Gemini API key to the .env file (GEMINI_API_KEY=your_key_here).'
      );
    }
    return new GoogleGenAI({ apiKey });
  }

  public getModelName(): string {
    return process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  }

  public getApiKeyStatus(): { configured: boolean; model: string; maskedKey?: string } {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return {
        configured: false,
        model: this.getModelName()
      };
    }
    const visibleStart = apiKey.slice(0, 3);
    const visibleEnd = apiKey.slice(-3);
    return {
      configured: true,
      model: this.getModelName(),
      maskedKey: `${visibleStart}...${visibleEnd}`
    };
  }

  /**
   * AI Farming Assistant Chat
   * Answers farmer questions with real sensor telemetry context
   */
  public async askFarmingAssistant(
    prompt: string,
    farmContext?: FarmContext,
    conversationHistory?: { role: 'user' | 'model'; parts: { text: string }[] }[],
    language: 'en' | 'kn' | 'hi' = 'en'
  ): Promise<string> {
    const ai = this.getClient();
    const model = this.getModelName();

    const langInstruction = 
      language === 'kn'
        ? 'Respond primarily in clear, natural Kannada (ಕನ್ನಡ) with English agricultural terms in brackets if necessary.'
        : language === 'hi'
        ? 'Respond primarily in clear, simple Hindi (हिंदी) with standard agricultural terminology.'
        : 'Respond in clear, accessible English suitable for farmers and agricultural science students.';

    const systemInstruction = `
You are Raitha Vikas AI (ರೈತ ವಿಕಾಸ AI), an expert agronomic and precision farming assistant engineered for Indian agriculture.

Language Directive:
${langInstruction}

Current Farm Telemetry (Actual Live/Simulated Measurements):
- Crop Stand: ${farmContext?.cropType || 'Paddy (Rice) & Tomato'}
- Location: ${farmContext?.location || 'Mandya District, Karnataka'}
- Volumetric Soil Moisture: ${farmContext?.soilMoisture !== undefined ? `${farmContext.soilMoisture}%` : 'Not connected'}
- Soil pH: ${farmContext?.soilPh !== undefined ? `${farmContext.soilPh} (${farmContext.soilPh < 6.8 ? 'Slightly Acidic' : 'Neutral'})` : 'Not connected'}
- Ambient Temperature: ${farmContext?.temperature !== undefined ? `${farmContext.temperature}°C` : 'Not connected'}
- Air Humidity: ${farmContext?.humidity !== undefined ? `${farmContext.humidity}%` : 'Not connected'}
- Irrigation Pump: ${farmContext?.pumpStatus ? 'ON (Water flowing)' : 'OFF (Standby)'}

Core Behavioral Guidelines:
1. Always incorporate the actual sensor values above when answering questions about soil, irrigation, fertilizer, or crop health.
2. Clearly separate measured telemetry from general agronomic guidance.
3. Never invent fake sensor values or make clinical promises without evidence.
4. Give practical, cost-effective Indian agricultural advice (e.g., organic Jeevamrutha, Neem cake, drip irrigation timings, ICAR guidelines).
5. If the farmer's question is uncertain or indicates a serious disease/pest outbreak, advise consulting the local Gram Panchayat Krishi Sahayaka or Krishi Vigyan Kendra (KVK).
6. Format your response clearly with markdown bullet points, bold key terms, and easy-to-read sections.
`;

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nFarmer Query: ${prompt}` }] }
        ]
      });

      return response.text || 'I could not generate an answer. Please try rephrasing your farming question.';
    } catch (err: any) {
      this.handleGeminiError(err, model);
      throw err;
    }
  }

  /**
   * Real AI Crop Disease Detection from Leaf Image
   * Analyzes submitted leaf image buffer using Gemini Multimodal Vision
   */
  public async analyzeCropDisease(
    imageBuffer: Buffer,
    mimeType: string,
    cropTypeHint = 'General Crop'
  ): Promise<DiseaseAnalysisResponse> {
    const ai = this.getClient();
    const model = this.getModelName();

    const base64Data = imageBuffer.toString('base64');

    const prompt = `
You are an expert plant pathologist and AI crop health diagnostic system for Raitha Vikas AI.
Analyze the provided crop leaf image carefully.

Crop hint provided by farmer: "${cropTypeHint}".

Analyze the visual evidence on the leaf (lesions, chlorosis, necrosis, pustules, fungal webbing, insect damage, or healthy tissue).

CRITICAL REQUIREMENT:
You must output ONLY valid, parseable JSON with NO markdown codeblock markers, NO introductory text, and NO trailing text.

JSON Schema:
{
  "cropName": "Identified Crop Name (e.g. Tomato / Paddy / Corn)",
  "possibleIssue": "Likely Disease or Condition Name (e.g. Tomato Early Blight / Rice Blast / Healthy Specimen)",
  "scientificName": "Causal pathogen or scientific classification if applicable (e.g. Alternaria solani)",
  "confidence": 88.5,
  "confidenceLevel": "High", // "High", "Moderate", or "Low / Uncertain"
  "symptoms": [
    "Symptom 1 observed on the leaf",
    "Symptom 2 observed on the leaf"
  ],
  "immediateSteps": [
    "Immediate action 1",
    "Immediate action 2"
  ],
  "organicRemedies": [
    "Organic/bio remedy 1 (e.g., Neem oil, Trichoderma, buttermilk)",
    "Organic/bio remedy 2"
  ],
  "chemicalRemedies": [
    "Approved chemical fungicide/pesticide with dosage (e.g., Mancozeb 75% WP @ 2g/L)",
    "Chemical management step 2"
  ],
  "preventionTips": [
    "Long-term cultural prevention tip 1",
    "Crop rotation or hygiene tip 2"
  ],
  "expertAdvice": "Guidance on when to consult local Krishi Vigyan Kendra (KVK) or extension officer",
  "disclaimer": "AI image analysis provides an automated preliminary estimate for educational and field guidance. It is not a guaranteed agronomic diagnosis. Field validation with local agricultural experts is recommended."
}
`;

    try {
      const response = await ai.models.generateContent({
        model: model,
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: mimeType,
                  data: base64Data
                }
              },
              { text: prompt }
            ]
          }
        ]
      });

      const rawText = response.text || '';
      // Clean up any stray markdown codeblock wrappers if present
      const cleaned = rawText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed: DiseaseAnalysisResponse = JSON.parse(cleaned);
      return parsed;
    } catch (err: any) {
      if (err instanceof SyntaxError) {
        console.error('Failed to parse Gemini response as JSON. Raw output:', err);
        throw new Error('AI disease analysis produced an unparseable response. Please try uploading another clear leaf photo.');
      }
      this.handleGeminiError(err, model);
      throw err;
    }
  }

  private handleGeminiError(err: any, model: string) {
    const errorStr = String(err?.message || err);
    console.error(`[GeminiService Error] Model "${model}":`, errorStr);

    if (errorStr.includes('503') || errorStr.includes('UNAVAILABLE') || errorStr.includes('high demand')) {
      throw new Error(
        `Gemini model "${model}" is temporarily unavailable or experiencing high traffic spikes on Google's free-tier. ` +
        `To switch to an available free-tier model, update your .env file: set GEMINI_MODEL=gemini-2.5-flash or GEMINI_MODEL=gemini-2.0-flash, then restart.`
      );
    }

    if (errorStr.includes('404') || errorStr.includes('NOT_FOUND')) {
      throw new Error(
        `Gemini model "${model}" was not found or is not enabled for your API account. ` +
        `Please check your GEMINI_MODEL environment variable in .env (recommended free-tier models: gemini-2.5-flash, gemini-2.0-flash, gemini-1.5-flash).`
      );
    }

    if (errorStr.includes('API_KEY_INVALID') || errorStr.includes('400') && errorStr.includes('API key')) {
      throw new Error(
        'Invalid GEMINI_API_KEY. Please verify the Gemini API key in your .env configuration from https://aistudio.google.com/.'
      );
    }
  }
}

export const geminiService = new GeminiService();
