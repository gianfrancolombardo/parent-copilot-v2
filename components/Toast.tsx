import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import type { Insight } from '../types';

interface ToastProps {
  insight: Insight | null;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ insight, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (insight) {
      setIsVisible(true);
      // Start animation after a brief delay
      setTimeout(() => setIsAnimating(true), 50);
      
      // Auto-hide after 2.5 seconds
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 300); // Wait for animation to complete
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [insight]);

  if (!insight || !isVisible) return null;

  const getCategoryName = (category: string) => {
    const categoryNames: Record<string, string> = {
      'Language': 'Lenguaje',
      'Motor': 'Motor',
      'Social': 'Social',
      'Sleep': 'Sueño',
      'Feeding': 'Alimentación',
      'Cognitive': 'Cognitivo',
      'Play': 'Juego',
      'Autonomy': 'Autonomía'
    };
    return categoryNames[category] || category;
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] w-80 mx-4">
      <div className={`bg-emerald-500 rounded-lg shadow-lg overflow-hidden transition-all duration-300 ease-out transform ${
        isAnimating ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-[-100%] opacity-0 scale-95'
      }`}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle2" className="w-4 h-4 text-white" />
            <span className="text-white font-medium text-sm">
              Nueva tarjeta de {getCategoryName(insight.category)} creada
            </span>
          </div>
          <button
            onClick={() => {
              setIsAnimating(false);
              setTimeout(() => {
                setIsVisible(false);
                onClose();
              }, 300);
            }}
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Cerrar notificación"
          >
            <Icon name="X" className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toast;
