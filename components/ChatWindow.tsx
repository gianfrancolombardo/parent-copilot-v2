import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { UI_TEXT } from '../constants';
import Icon from './Icon';

interface ChatWindowProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  isPanel?: boolean;
  onClose?: () => void;
}

const ChatMessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`max-w-[85%] sm:max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl shadow-sm ${isUser ? 'bg-brand-primary text-white rounded-br-none' : 'bg-white dark:bg-gray-700 text-brand-text-primary dark:text-gray-200 rounded-bl-none'}`}>
        <p className="text-sm leading-relaxed break-words">{message.content}</p>
      </div>
    </div>
  );
};

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, onSendMessage, isLoading, isPanel = false, onClose }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className={`flex flex-col h-full ${isPanel ? '' : 'bg-brand-surface/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 dark:border-gray-700/50'}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700/80 flex items-center justify-center relative flex-shrink-0">
        <h2 className="text-lg font-bold text-brand-text-primary dark:text-white">{UI_TEXT.chat}</h2>
        {isPanel && (
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-text-secondary dark:text-gray-400 hover:text-brand-text-primary dark:hover:text-white transition p-1" aria-label="Cerrar chat">
            <Icon name="X" className="w-6 h-6" />
          </button>
        )}
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0">
        
        {messages.map((msg) => <ChatMessageBubble key={msg.id} message={msg} />)}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white dark:bg-gray-700 text-brand-text-primary dark:text-gray-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm">
              <div className="flex items-center space-x-2">
                <Icon name="Loader2" className="w-5 h-5 animate-spin text-brand-primary"/>
                <span className="text-sm">Pensando...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={`p-4 border-t border-gray-200 dark:border-gray-700/80 flex-shrink-0 ${isPanel ? '' : 'bg-white/50 dark:bg-gray-800/50 rounded-b-2xl'}`}>
        <form onSubmit={handleSend} className="flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={UI_TEXT.chatPlaceholder}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-brand-primary focus:border-transparent transition bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white placeholder-gray-400 text-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-brand-primary text-white p-3 rounded-full hover:bg-opacity-90 disabled:bg-opacity-50 transition-transform transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary dark:ring-offset-gray-800 flex-shrink-0"
            disabled={isLoading || !input.trim()}
          >
            <Icon name="Send" className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;