import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Child, Insight, ChatMessage } from './types';
import { InsightStatus } from './types';
import AddChildForm from './components/AddChildForm';
import ChildSelector from './components/ChildSelector';
import InsightsGrid from './components/InsightsGrid';
import ChatWindow from './components/ChatWindow';
import Toast from './components/Toast';
import aiProvider from './services/aiService';
import { onChildrenUpdate, addChild, onInsightsUpdate, addInsight, onMessagesUpdate, addMessage } from './services/firestoreService';
import { useConversationContext } from './hooks/useConversationContext';
import { useToast } from './hooks/useToast';
import { UI_TEXT } from './constants';
import Icon from './components/Icon';

const App: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeChildId, setActiveChildId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingSuggestion, setIsGeneratingSuggestion] = useState(false);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Conversation context management
  const {
    updateContext
  } = useConversationContext();

  // Toast management
  const { toast, showToast, clearToast } = useToast();

  const activeChild = useMemo(() => children.find(c => c.id === activeChildId), [children, activeChildId]);

  // Effect to fetch children and set initial active child
  useEffect(() => {
    const unsubscribe = onChildrenUpdate((loadedChildren) => {
      setChildren(loadedChildren);
      if (!activeChildId && loadedChildren.length > 0) {
        setActiveChildId(loadedChildren[0].id);
      } else if (loadedChildren.length === 0) {
        setActiveChildId(null);
      }
    });
    return () => unsubscribe();
  }, [activeChildId]);

  // Effect to listen for insights and messages for the active child
  useEffect(() => {
    if (!activeChildId) {
      setInsights([]);
      setMessages([]);
      updateContext([]);
      return;
    }

    const unsubscribeInsights = onInsightsUpdate(activeChildId, setInsights);
    const unsubscribeMessages = onMessagesUpdate(activeChildId, setMessages);

    return () => {
      unsubscribeInsights();
      unsubscribeMessages();
    };
  }, [activeChildId, updateContext]);

  // Effect to update conversation context when messages change
  useEffect(() => {
    if (messages.length > 0 && activeChildId) {
      updateContext(messages);
    }
  }, [messages, activeChildId, updateContext]);


  const handleAddChild = useCallback(async (childData: Omit<Child, 'id'>) => {
    setIsAddingChild(false);
    setIsLoading(true);
    try {
      await addChild(childData);
      // The onChildrenUpdate listener will handle adding the new child to state and setting it as active.
      
      // Let's create a temporary child object to get the initial question,
      // as we don't know the ID yet. A better approach might be a cloud function
      // to generate this on child creation.
      const tempChild: Child = { ...childData, id: 'temp' };
      const initialQuestion = await aiProvider.getInitialQuestion(tempChild);
      
      // We need to wait for the child to be added and become active to get its ID
      // This is a bit tricky. A simple solution is to assume the last added child is the new one.
      // A more robust solution is needed for multi-user env.
      const getNewestChildId = (newChildren: Child[]) => {
          if (children.length < newChildren.length) {
              // Find the child that is in newChildren but not in old children state
              const oldIds = new Set(children.map(c => c.id));
              return newChildren.find(c => !oldIds.has(c.id));
          }
          return newChildren[newChildren.length-1];
      };
      
      const unsubscribe = onChildrenUpdate(async (newChildren) => {
          const newChild = getNewestChildId(newChildren);
          if (newChild && newChild.id !== 'temp') {
              unsubscribe(); // Stop listening once we have the child
              const initialMessage = {
                  role: 'assistant' as const,
                  content: initialQuestion,
              };
              await addMessage(newChild.id, initialMessage);
              setActiveChildId(newChild.id);
          }
      });

    } catch (error) {
      console.error("Failed to add child or get initial question", error);
    } finally {
      setIsLoading(false);
    }
  }, [children]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!activeChild) return;

    const userMessage = { role: 'user' as const, content };
    await addMessage(activeChild.id, userMessage);
    
    setIsLoading(true);
    
    // We get the latest history from state, which is updated by our listener.
    const activeChildHistory = messages.filter(m => m.childId === activeChildId);

    try {
        const { reply, newInsight } = await aiProvider.getChatbotResponse(activeChild, activeChildHistory, content);

        if (newInsight) {
          const insightToAdd: Omit<Insight, 'id'> = {
            ...newInsight,
            childId: activeChild.id,
          } as Omit<Insight, 'id'>;
          
          // Add insight to database and show toast notification
          const addedInsight = await addInsight(insightToAdd);
          showToast(addedInsight);
        }

        const assistantMessage = { role: 'assistant' as const, content: reply };
        await addMessage(activeChild.id, assistantMessage);

    } catch (error) {
        console.error("Error handling message:", error);
        const errorMessage = {
            role: 'assistant' as const,
            content: "Tuve un problema procesando tu mensaje. Por favor, intenta de nuevo."
        };
        await addMessage(activeChild.id, errorMessage);
    } finally {
        setIsLoading(false);
    }
  }, [activeChild, messages, activeChildId]);

  const handleGenerateStimulation = useCallback(async () => {
    if (!activeChild) return;
    setIsGeneratingSuggestion(true);
    try {
      const suggestionData = await aiProvider.getStimulationSuggestion(activeChild);
      const newStimulationInsight: Omit<Insight, 'id'> = {
        childId: activeChild.id,
        ...suggestionData,
        observation: "Actividad para fomentar el próximo hito de desarrollo.",
        status: InsightStatus.OnTrack, // Default status for suggestions
        iconName: 'Sparkles',
      };
      const addedInsight = await addInsight(newStimulationInsight);
      
      // Show toast notification for stimulation suggestion
      showToast(addedInsight);
    } catch (error) {
      console.error("Error generating stimulation suggestion:", error);
    } finally {
      setIsGeneratingSuggestion(false);
    }
  }, [activeChild]);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
    }
  }, []);
  
  if (isAddingChild || children.length === 0 || !activeChild) {
    return <AddChildForm onAddChild={handleAddChild} />;
  }
  
  return (
    <div className="flex flex-col h-screen text-brand-text-primary dark:text-gray-200 font-sans overflow-x-hidden">
      <header className="w-full max-w-screen-2xl mx-auto px-4 lg:px-8 py-4 flex flex-row justify-between items-center gap-4 flex-shrink-0 bg-gradient-to-br from-brand-background/80 to-blue-50/80 dark:from-gray-900/80 dark:to-slate-800/80 backdrop-blur-sm border-b border-black/5 dark:border-white/5 relative z-40">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-primary-light dark:bg-brand-primary/20 rounded-full">
                <Icon name="Baby" className="w-8 h-8 text-brand-primary dark:text-blue-300"/>
            </div>
            <h1 className="text-lg font-bold">{UI_TEXT.appName}</h1>
        </div>
        <ChildSelector
          children={children}
          activeChildId={activeChildId || ''}
          setActiveChildId={setActiveChildId}
          onAddChildClick={() => setIsAddingChild(true)}
        />
      </header>

      <main className="flex-1 w-full max-w-screen-2xl mx-auto px-4 lg:px-8 pb-20 lg:pb-8 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 pt-6">
          <section className="lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between mb-4 flex-shrink-0">
                  <h2 className="text-xl font-bold">{UI_TEXT.insights}</h2>
                  <button 
                    onClick={handleGenerateStimulation} 
                    disabled={isGeneratingSuggestion}
                    className="flex items-center gap-2 text-sm font-semibold text-brand-primary hover:text-opacity-80 dark:text-blue-300 dark:hover:text-opacity-80 transition disabled:opacity-50 disabled:cursor-wait"
                    title="Generar una nueva sugerencia de estímulo"
                  >
                    {isGeneratingSuggestion ? (
                      <Icon name="Loader2" className="w-5 h-5 animate-spin" />
                    ) : (
                      <Icon name="Sparkles" className="w-5 h-5" />
                    )}
                    <span className="hidden sm:inline">Sugerencia de Estímulo</span>
                  </button>
              </div>
              
              
              <div className="space-y-4">
                   <InsightsGrid insights={insights} child={activeChild} />
              </div>
          </section>
          <section className="hidden lg:block lg:col-span-3 h-full py-4 lg:mt-6">
              <ChatWindow 
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
              />
          </section>
        </div>
      </main>

      {/* Mobile Chat Button - Fixed in bottom right corner */}
      <div className="lg:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsChatOpen(true)}
          className="bg-brand-primary text-white p-4 rounded-full shadow-2xl hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-brand-primary/30 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          aria-label="Abrir chat"
        >
          <Icon name="MessageSquare" className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Chat Overlay */}
      <div className={`lg:hidden fixed inset-0 z-50 transition-opacity duration-300 ease-in-out ${isChatOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsChatOpen(false)} aria-hidden="true"></div>
        <div className={`absolute inset-y-0 right-0 w-full max-w-md bg-brand-background dark:bg-gray-900 flex flex-col transform transition-transform duration-300 ease-in-out ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
           <ChatWindow 
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isPanel={true}
              onClose={() => setIsChatOpen(false)}
          />
        </div>
      </div>

      {/* Toast Notification */}
      <Toast 
        insight={toast.insight} 
        onClose={clearToast} 
      />
    </div>
  );
};

export default App;