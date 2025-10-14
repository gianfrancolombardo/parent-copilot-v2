import { GeminiProvider } from './ai/geminiProvider';
import { OpenAIProvider } from './ai/openaiProvider';
import type { AIProvider } from './ai/baseProvider';
import { InsightCategory as IC } from '../types';

let aiProvider: AIProvider;

// Prioritize OpenAI if the key is available
if (process.env.OPENAI_API_KEY) {
  try {
    aiProvider = new OpenAIProvider();
    console.log("Using OpenAI provider.");
  } catch (error) {
    console.error("Failed to initialize OpenAI provider:", error);
  }
} else if (process.env.API_KEY) {
  try {
    aiProvider = new GeminiProvider();
    console.log("Using Gemini provider.");
  } catch (error) {
    console.error("Failed to initialize Gemini provider:", error);
  }
}

if (!aiProvider) {
    console.warn("No AI provider API key found. AI features will be disabled. Please set API_KEY (for Gemini) or OPENAI_API_KEY.");
    // Fallback to a dummy provider to avoid crashing the app, but log errors.
    aiProvider = {
        getInitialQuestion: async () => {
            console.error("AI Service not configured.");
            return "Error: El servicio de IA no está configurado. Por favor, revisa tus API keys.";
        },
        getChatbotResponse: async () => {
            console.error("AI Service not configured.");
            return {
                reply: "Error: El servicio de IA no está configurado. Por favor, revisa tus API keys.",
                newInsight: null,
            };
        },
        getStimulationSuggestion: async () => {
            console.error("AI Service not configured.");
            return {
                category: IC.Play,
                title: "Error: IA No Configurada",
                recommendation: "Por favor, configura una API key de Gemini u OpenAI para continuar.",
                createdAt: new Date().toISOString(),
                type: 'stimulation' as const
            };
        },
    };
}

const { 
  getInitialQuestion, 
  getChatbotResponse, 
  getStimulationSuggestion 
} = aiProvider;

export { 
  getInitialQuestion, 
  getChatbotResponse, 
  getStimulationSuggestion 
};
