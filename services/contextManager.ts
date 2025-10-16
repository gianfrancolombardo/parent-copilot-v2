import type { ChatMessage, InsightCategory } from '../types';
import { CONTEXTUAL_CONVERSATION_PROMPT } from '../prompts';

export interface ConversationContext {
  recentMessages: ChatMessage[];
  conversationSummary: string;
  coveredTopics: InsightCategory[];
  lastQuestionTime: string;
  conversationFlow: string[];
}

export interface ContextAnalysis {
  shouldAvoidRepetition: boolean;
  suggestedTopics: InsightCategory[];
  conversationTone: 'exploratory' | 'specific' | 'follow-up';
  contextualInsights: string[];
}

export class ContextManager {
  private static readonly MAX_CONTEXT_MESSAGES = 12;
  private static readonly MIN_MESSAGES_FOR_ANALYSIS = 3;
  private static readonly REPETITION_THRESHOLD_HOURS = 2;

  /**
   * Builds an intelligent context from chat history
   */
  static buildContext(messages: ChatMessage[]): ConversationContext {
    const recentMessages = this.getRecentMessages(messages);
    const conversationSummary = this.generateConversationSummary(recentMessages);
    const coveredTopics = this.extractCoveredTopics(recentMessages);
    const lastQuestionTime = this.getLastQuestionTime(recentMessages);
    const conversationFlow = this.analyzeConversationFlow(recentMessages);

    return {
      recentMessages,
      conversationSummary,
      coveredTopics,
      lastQuestionTime,
      conversationFlow
    };
  }

  /**
   * Analyzes the context to provide intelligent suggestions
   */
  static analyzeContext(context: ConversationContext): ContextAnalysis {
    const shouldAvoidRepetition = this.shouldAvoidRepetition(context);
    const suggestedTopics = this.suggestNextTopics(context);
    const conversationTone = this.determineConversationTone(context);
    const contextualInsights = this.extractContextualInsights(context);

    // DEBUG: Log context analysis
    console.log('🔍 CONTEXT DEBUG - Analysis Results:', {
      shouldAvoidRepetition,
      suggestedTopics,
      conversationTone,
      contextualInsights,
      coveredTopics: context.coveredTopics,
      recentMessagesCount: context.recentMessages.length
    });

    return {
      shouldAvoidRepetition,
      suggestedTopics,
      conversationTone,
      contextualInsights
    };
  }

  /**
   * Creates an enhanced prompt with contextual information
   */
  static createContextualPrompt(
    childName: string,
    childAge: number,
    context: ConversationContext,
    analysis: ContextAnalysis,
    userMessage: string
  ): string {
    const contextInfo = this.buildContextInfoWithAge(context, analysis, childAge);
    
    return CONTEXTUAL_CONVERSATION_PROMPT(
      contextInfo,
      this.formatRecentMessages(context.recentMessages),
      userMessage,
      context.coveredTopics.join(', '),
      analysis.conversationTone,
      analysis.suggestedTopics.join(', ')
    );
  }

  private static getRecentMessages(messages: ChatMessage[]): ChatMessage[] {
    return messages
      .slice(-this.MAX_CONTEXT_MESSAGES)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  private static generateConversationSummary(messages: ChatMessage[]): string {
    if (messages.length === 0) return 'Nueva conversación';

    const userMessages = messages.filter(msg => msg.role === 'user');
    const assistantMessages = messages.filter(msg => msg.role === 'assistant');

    const topics = this.extractTopicsFromMessages(messages);
    const sentiment = this.analyzeSentiment(messages);

    return `Conversación sobre: ${topics.join(', ')}. Tono: ${sentiment}. ${userMessages.length} intercambios del usuario.`;
  }

  private static extractCoveredTopics(messages: ChatMessage[]): InsightCategory[] {
    const topics = new Set<InsightCategory>();
    
    messages.forEach(msg => {
      if (msg.questionCategory) {
        topics.add(msg.questionCategory);
      }
      // Extract topics from message content
      const contentTopics = this.extractTopicsFromText(msg.content);
      contentTopics.forEach(topic => topics.add(topic));
    });

    return Array.from(topics);
  }

  private static getLastQuestionTime(messages: ChatMessage[]): string {
    const lastAssistantMessage = messages
      .filter(msg => msg.role === 'assistant')
      .slice(-1)[0];
    
    return lastAssistantMessage?.createdAt || new Date().toISOString();
  }

  private static analyzeConversationFlow(messages: ChatMessage[]): string[] {
    const flow = [];
    
    for (let i = 0; i < messages.length - 1; i++) {
      const current = messages[i];
      const next = messages[i + 1];
      
      if (current.role === 'user' && next.role === 'assistant') {
        const pattern = this.identifyConversationPattern(current.content, next.content);
        flow.push(pattern);
      }
    }
    
    return flow;
  }

  private static shouldAvoidRepetition(context: ConversationContext): boolean {
    if (context.coveredTopics.length === 0) return false;
    
    const lastQuestionTime = new Date(context.lastQuestionTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastQuestionTime.getTime()) / (1000 * 60 * 60);
    
    // Be less restrictive - only avoid repetition if the same topic was covered very recently (30 minutes instead of 2 hours)
    const restrictiveThreshold = 0.5; // 30 minutes
    return hoursDiff < restrictiveThreshold;
  }

  private static suggestNextTopics(context: ConversationContext): InsightCategory[] {
    const allCategories: InsightCategory[] = [
      'Language' as InsightCategory, 'Motor' as InsightCategory, 'Social' as InsightCategory, 
      'Sleep' as InsightCategory, 'Feeding' as InsightCategory, 'Cognitive' as InsightCategory, 
      'Play' as InsightCategory, 'Autonomy' as InsightCategory
    ];
    
    return allCategories.filter(category => 
      !context.coveredTopics.includes(category)
    );
  }

  private static determineConversationTone(context: ConversationContext): 'exploratory' | 'specific' | 'follow-up' {
    if (context.recentMessages.length < this.MIN_MESSAGES_FOR_ANALYSIS) {
      return 'exploratory';
    }

    const lastUserMessage = context.recentMessages
      .filter(msg => msg.role === 'user')
      .slice(-1)[0];

    if (!lastUserMessage) return 'exploratory';

    const content = lastUserMessage.content.toLowerCase();
    
    if (content.includes('?') || content.includes('cómo') || content.includes('qué')) {
      return 'specific';
    }
    
    if (content.includes('sí') || content.includes('no') || content.includes('también')) {
      return 'follow-up';
    }

    return 'exploratory';
  }

  private static extractContextualInsights(context: ConversationContext): string[] {
    const insights = [];
    
    // Extract key information from recent messages
    context.recentMessages.forEach(msg => {
      if (msg.role === 'user' && msg.content.length > 20) {
        // Extract meaningful information
        const keyInfo = this.extractKeyInformation(msg.content);
        if (keyInfo) insights.push(keyInfo);
      }
    });

    return insights.slice(-3); // Keep last 3 insights
  }

  private static buildContextInfo(context: ConversationContext, analysis: ContextAnalysis): string {
    return `
- Resumen: ${context.conversationSummary}
- Temas cubiertos: ${context.coveredTopics.length > 0 ? context.coveredTopics.join(', ') : 'Ninguno aún'}
- Evitar repetición: ${analysis.shouldAvoidRepetition ? 'Sí (solo si es muy reciente)' : 'No'}
- Tono sugerido: ${analysis.conversationTone}
- Temas sugeridos: ${analysis.suggestedTopics.join(', ')}
- Insights contextuales: ${analysis.contextualInsights.join('; ')}
- **RECORDATORIO**: Siempre crea insights cuando el usuario proporcione información nueva sobre desarrollo, incluso si el tema ya fue cubierto
`;
  }

  private static buildContextInfoWithAge(context: ConversationContext, analysis: ContextAnalysis, childAge: number): string {
    const ageContext = this.formatAgeForAI(childAge);
    
    return `
- Edad del niño: ${ageContext}
- Resumen: ${context.conversationSummary}
- Temas cubiertos: ${context.coveredTopics.length > 0 ? context.coveredTopics.join(', ') : 'Ninguno aún'}
- Evitar repetición: ${analysis.shouldAvoidRepetition ? 'Sí (solo si es muy reciente)' : 'No'}
- Tono sugerido: ${analysis.conversationTone}
- Temas sugeridos: ${analysis.suggestedTopics.join(', ')}
- Insights contextuales: ${analysis.contextualInsights.join('; ')}
- **RECORDATORIO**: Siempre crea insights cuando el usuario proporcione información nueva sobre desarrollo, incluso si el tema ya fue cubierto
- **IMPORTANTE**: Usa la edad (${ageContext}) para hacer preguntas apropiadas y crear insights relevantes para el desarrollo típico de esta edad
`;
  }

  private static formatAgeForAI(ageInMonths: number): string {
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    
    if (years > 0) {
      if (months > 0) {
        return `${ageInMonths} meses (${years} años y ${months} meses)`;
      } else {
        return `${ageInMonths} meses (${years} ${years > 1 ? 'años' : 'año'})`;
      }
    }
    return `${ageInMonths} meses`;
  }

  private static formatRecentMessages(messages: ChatMessage[]): string {
    return messages
      .slice(-6) // Last 6 messages for context
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  private static extractTopicsFromMessages(messages: ChatMessage[]): string[] {
    const topics = new Set<string>();
    
    messages.forEach(msg => {
      const contentTopics = this.extractTopicsFromText(msg.content);
      contentTopics.forEach(topic => topics.add(topic));
    });

    return Array.from(topics);
  }

  private static extractTopicsFromText(text: string): InsightCategory[] {
    const topics: InsightCategory[] = [];
    const lowerText = text.toLowerCase();

    const topicKeywords = {
      'Language': ['habla', 'palabra', 'vocaliza', 'comunica', 'expresión'],
      'Motor': ['camina', 'gatea', 'agarrar', 'movimiento', 'móvil'],
      'Social': ['sonríe', 'interactúa', 'social', 'contacto visual', 'personas'],
      'Sleep': ['duerme', 'sueño', 'despierta', 'dormir', 'siesta'],
      'Feeding': ['come', 'alimenta', 'mama', 'biberón', 'comida'],
      'Cognitive': ['entiende', 'aprende', 'reconoce', 'memoria', 'atención'],
      'Play': ['juega', 'juego', 'diversión', 'entretenimiento', 'juguete'],
      'Autonomy': ['independiente', 'solo', 'autónomo', 'hace solo']
    };

    Object.entries(topicKeywords).forEach(([category, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        topics.push(category as InsightCategory);
      }
    });

    return topics;
  }

  private static analyzeSentiment(messages: ChatMessage[]): string {
    if (messages.length === 0) return 'neutral';
    
    const userMessages = messages.filter(msg => msg.role === 'user');
    if (userMessages.length === 0) return 'neutral';

    const positiveWords = ['bien', 'genial', 'excelente', 'feliz', 'contento', 'perfecto'];
    const negativeWords = ['problema', 'preocupado', 'mal', 'difícil', 'no puede'];

    let positiveCount = 0;
    let negativeCount = 0;

    userMessages.forEach(msg => {
      const content = msg.content.toLowerCase();
      positiveWords.forEach(word => {
        if (content.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (content.includes(word)) negativeCount++;
      });
    });

    if (positiveCount > negativeCount) return 'positivo';
    if (negativeCount > positiveCount) return 'preocupado';
    return 'neutral';
  }

  private static identifyConversationPattern(userMessage: string, assistantMessage: string): string {
    const userLower = userMessage.toLowerCase();
    const assistantLower = assistantMessage.toLowerCase();

    if (userLower.includes('?')) return 'question-answer';
    if (assistantLower.includes('cuéntame') || assistantLower.includes('describe')) return 'exploration';
    if (assistantLower.includes('sugiero') || assistantLower.includes('recomiendo')) return 'recommendation';
    
    return 'general-discussion';
  }

  private static extractKeyInformation(text: string): string | null {
    // Extract meaningful information from user messages
    const sentences = text.split(/[.!?]+/);
    const meaningfulSentences = sentences.filter(sentence => 
      sentence.trim().length > 15 && 
      !sentence.toLowerCase().includes('hola') &&
      !sentence.toLowerCase().includes('gracias')
    );

    return meaningfulSentences.length > 0 ? meaningfulSentences[0].trim() : null;
  }
}
