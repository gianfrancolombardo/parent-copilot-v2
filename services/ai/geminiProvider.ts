import { GoogleGenAI, Type } from "@google/genai";
import type { Child, ChatMessage, Insight, InsightCategory } from "../../types";
import { getAgeInMonths } from "../../utils/age";
import { SYSTEM_PROMPT, GET_INITIAL_QUESTION_PROMPT, GET_STIMULATION_SUGGESTION_PROMPT } from "../../prompts";
import { InsightCategory as IC } from '../../types';
import type { AIProvider } from './baseProvider';
import { ContextManager } from '../contextManager';

const API_KEY = process.env.REACT_APP_API_KEY;

export class GeminiProvider implements AIProvider {
    private ai: GoogleGenAI;

    constructor() {
        if (!API_KEY) {
            throw new Error("Gemini API key (REACT_APP_API_KEY) is not set in environment variables.");
        }
        this.ai = new GoogleGenAI({ apiKey: API_KEY });
    }

    getInitialQuestion = async (child: Child): Promise<string> => {
        const ageInMonths = getAgeInMonths(new Date(child.birthDate));
        const prompt = GET_INITIAL_QUESTION_PROMPT(child.name, ageInMonths);
        const fallbackQuestion = `¡Hola! Soy tu copiloto. Para empezar, cuéntame un poco sobre ${child.name}. ¿Qué ha hecho hoy que te haya llamado la atención?`;

        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            question: { type: Type.STRING },
                        },
                        required: ["question"]
                    }
                }
            });
            const jsonString = response.text;
            const parsed = JSON.parse(jsonString);
            return parsed.question || fallbackQuestion;
        } catch (error) {
            console.error("Error generating initial question with Gemini:", error);
            return fallbackQuestion;
        }
    }

    getChatbotResponse = async (
      child: Child,
      chatHistory: ChatMessage[],
      userMessage: string
    ): Promise<{ reply: string; newInsight: Omit<Insight, 'id' | 'childId'> | null }> => {
        const ageInMonths = getAgeInMonths(new Date(child.birthDate));
        
        // Build intelligent context from conversation history
        const context = ContextManager.buildContext(chatHistory);
        const analysis = ContextManager.analyzeContext(context);
        
        // DEBUG: Log context information
        console.log('🔍 INSIGHT DEBUG (Gemini) - Context Analysis:', {
          coveredTopics: context.coveredTopics,
          shouldAvoidRepetition: analysis.shouldAvoidRepetition,
          conversationTone: analysis.conversationTone,
          suggestedTopics: analysis.suggestedTopics,
          contextualInsights: analysis.contextualInsights,
          userMessage: userMessage.substring(0, 100) + '...'
        });
        
        // Create contextual prompt with memory
        const contextualPrompt = ContextManager.createContextualPrompt(
          child.name,
          ageInMonths,
          context,
          analysis,
          userMessage
        );
        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: contextualPrompt,
                config: { systemInstruction: SYSTEM_PROMPT },
            });
            let rawText = response.text;
            let newInsight: Omit<Insight, 'id' | 'childId'> | null = null;
            let reply = '';
            const insightMarker = 'CREAR_INSIGHT:';
            
            console.log('🔍 INSIGHT DEBUG (Gemini) - Raw AI Response:', rawText.substring(0, 200) + '...');
            console.log('🔍 INSIGHT DEBUG (Gemini) - Contains insight marker:', rawText.includes(insightMarker));
            
            if (rawText.includes(insightMarker)) {
                const parts = rawText.split(insightMarker);
                const insightJsonString = parts[1].trim().split('\n')[0];
                reply = rawText.substring(rawText.indexOf(insightJsonString) + insightJsonString.length).trim();
                try {
                    const parsedInsight = JSON.parse(insightJsonString);
                    if (parsedInsight.observation && parsedInsight.recommendation) {
                        newInsight = { ...parsedInsight, createdAt: new Date().toISOString(), type: 'observation' };
                        console.log('✅ INSIGHT DEBUG (Gemini) - Insight created successfully:', {
                          category: parsedInsight.category,
                          title: parsedInsight.title,
                          status: parsedInsight.status
                        });
                    } else {
                        console.error("❌ INSIGHT DEBUG (Gemini) - Parsed insight is missing 'observation' or 'recommendation' field:", parsedInsight);
                        reply = rawText;
                    }
                } catch (e) {
                    console.error("❌ INSIGHT DEBUG (Gemini) - Failed to parse insight JSON:", e, "JSON String:", insightJsonString);
                    reply = rawText;
                }
            } else {
                reply = rawText;
                console.log('❌ INSIGHT DEBUG (Gemini) - No insight marker found in response');
            }
            if (!reply) {
                reply = "Entendido. ¿Hay algo más que te gustaría compartir sobre eso?";
            }
            return { reply, newInsight };
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            return {
                reply: "Lo siento, estoy teniendo problemas para conectarme. Por favor, inténtalo de nuevo en un momento.",
                newInsight: null,
            };
        }
    }

    getStimulationSuggestion = async (child: Child): Promise<Omit<Insight, 'id' | 'childId' | 'status' | 'observation' | 'iconName'>> => {
        const ageInMonths = getAgeInMonths(new Date(child.birthDate));
        const prompt = GET_STIMULATION_SUGGESTION_PROMPT(child.name, ageInMonths);
        const fallbackSuggestion = {
            category: IC.Play,
            title: "Juego Sensorial",
            recommendation: "Prueba a crear una caja con diferentes texturas (telas suaves, objetos rugosos, etc.) para que explore con sus manos. ¡Es genial para su desarrollo táctil!",
            createdAt: new Date().toISOString(),
            type: 'stimulation' as const
        };
        try {
            const response = await this.ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            category: { type: Type.STRING, enum: Object.values(IC) },
                            title: { type: Type.STRING },
                            recommendation: { type: Type.STRING },
                        },
                        required: ["category", "title", "recommendation"]
                    }
                }
            });
            const jsonString = response.text;
            const parsed = JSON.parse(jsonString);
            return {
                ...parsed,
                category: parsed.category as InsightCategory,
                createdAt: new Date().toISOString(),
                type: 'stimulation' as const
            };
        } catch (error) {
            console.error("Error generating stimulation suggestion with Gemini:", error);
            return fallbackSuggestion;
        }
    }
}