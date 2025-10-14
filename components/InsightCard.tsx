import React from 'react';
import type { Insight } from '../types';
import { CATEGORY_DETAILS, STATUS_DETAILS } from '../constants';
import Icon from './Icon';

interface InsightCardProps {
  insight: Insight;
}

const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const categoryDetail = CATEGORY_DETAILS[insight.category];
  const statusDetail = STATUS_DETAILS[insight.status];
  const isStimulation = insight.type === 'stimulation';

  if (isStimulation) {
    return (
        <div className="relative bg-brand-surface dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border-2 border-dashed border-brand-secondary/80 hover:border-brand-secondary transition-all duration-300 group">
          <div className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold py-1 px-3 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 mb-4">
              <Icon name="Sparkles" className="w-4 h-4" />
              <span>Sugerencia de Estímulo</span>
            </div>
            
            <h3 className="text-lg font-bold text-brand-text-primary dark:text-white group-hover:text-brand-primary transition-colors">{insight.title}</h3>
            
            <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
                <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary dark:text-blue-300 mb-2">
                    <Icon name="BookOpen" className="w-4 h-4" />
                    <span>Actividad Recomendada</span>
                </div>
                <p className="text-brand-text-secondary dark:text-gray-300 text-sm">{insight.recommendation}</p>
            </div>
    
            <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-right">
              {new Date(insight.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      );
  }

  return (
    <div className={`relative bg-brand-surface dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-transparent hover:border-brand-primary/50 transition-all duration-300 group border-l-4 ${statusDetail.colorBorder}`}>
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className={`flex items-center gap-2 text-sm font-semibold py-1 px-3 rounded-full ${categoryDetail.color}`}>
            <Icon name={categoryDetail.icon} className="w-4 h-4" />
            <span>{categoryDetail.name}</span>
          </div>
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${statusDetail.colorClasses}`}>
              {statusDetail.name}
          </span>
        </div>
        <h3 className="mt-4 text-lg font-bold text-brand-text-primary dark:text-white group-hover:text-brand-primary transition-colors">{insight.title}</h3>
        <p className="mt-2 text-brand-text-secondary dark:text-gray-300 text-sm">{insight.observation}</p>
        
        <div className="mt-4 pt-3 border-t border-gray-200/60 dark:border-gray-700/60">
            <div className="flex items-center gap-2 text-sm font-semibold text-brand-primary dark:text-blue-300 mb-2">
                <Icon name="BookOpen" className="w-4 h-4" />
                <span>Recomendación</span>
            </div>
            <p className="text-brand-text-secondary dark:text-gray-300 text-sm">{insight.recommendation}</p>
        </div>

        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500 text-right">
          {new Date(insight.createdAt).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
    </div>
  );
};

export default InsightCard;