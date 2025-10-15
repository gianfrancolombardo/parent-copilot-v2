import { useState, useCallback, useMemo } from 'react';
import type { ChatMessage } from '../types';
import { ContextManager, type ConversationContext, type ContextAnalysis } from '../services/contextManager';

export interface UseConversationContextReturn {
  context: ConversationContext | null;
  analysis: ContextAnalysis | null;
  updateContext: (messages: ChatMessage[]) => void;
  getContextualPrompt: (childName: string, childAge: number, userMessage: string) => string;
  hasRecentConversation: boolean;
  suggestedTopics: string[];
  shouldAvoidRepetition: boolean;
}

/**
 * Custom hook to manage conversation context and memory
 */
export const useConversationContext = (): UseConversationContextReturn => {
  const [context, setContext] = useState<ConversationContext | null>(null);
  const [analysis, setAnalysis] = useState<ContextAnalysis | null>(null);

  const updateContext = useCallback((messages: ChatMessage[]) => {
    if (messages.length === 0) {
      setContext(null);
      setAnalysis(null);
      return;
    }

    const newContext = ContextManager.buildContext(messages);
    const newAnalysis = ContextManager.analyzeContext(newContext);
    
    setContext(newContext);
    setAnalysis(newAnalysis);
  }, []);

  const getContextualPrompt = useCallback((
    childName: string,
    childAge: number,
    userMessage: string
  ): string => {
    if (!context || !analysis) {
      return `Usuario: ${userMessage}`;
    }

    return ContextManager.createContextualPrompt(
      childName,
      childAge,
      context,
      analysis,
      userMessage
    );
  }, [context, analysis]);

  const hasRecentConversation = useMemo(() => {
    if (!context) return false;
    
    const lastMessageTime = new Date(context.lastQuestionTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastMessageTime.getTime()) / (1000 * 60 * 60);
    
    return hoursDiff < 24; // Consider recent if within 24 hours
  }, [context]);

  const suggestedTopics = useMemo(() => {
    return analysis?.suggestedTopics.map(topic => topic.toString()) || [];
  }, [analysis]);

  const shouldAvoidRepetition = useMemo(() => {
    return analysis?.shouldAvoidRepetition || false;
  }, [analysis]);

  return {
    context,
    analysis,
    updateContext,
    getContextualPrompt,
    hasRecentConversation,
    suggestedTopics,
    shouldAvoidRepetition
  };
};
