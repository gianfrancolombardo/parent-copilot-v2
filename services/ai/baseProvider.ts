import type { Child, ChatMessage, Insight } from '../../types';

export interface AIProvider {
  getInitialQuestion(child: Child): Promise<string>;
  getChatbotResponse(
    child: Child,
    chatHistory: ChatMessage[],
    userMessage: string
  ): Promise<{ reply: string; newInsight: Omit<Insight, 'id' | 'childId'> | null }>;
  getStimulationSuggestion(
    child: Child
  ): Promise<Omit<Insight, 'id' | 'childId' | 'status' | 'observation' | 'iconName'>>;
}
