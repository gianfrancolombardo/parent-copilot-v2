import React from 'react';
import type { Insight, Child } from '../types';
import { UI_TEXT } from '../constants';
import InsightCard from './InsightCard';
import Icon from './Icon';
import MetricsCard from './MetricsCard';

interface InsightsGridProps {
  insights: Insight[];
  child: Child;
}

const InsightsGrid: React.FC<InsightsGridProps> = ({ insights, child }) => {
  if (insights.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-brand-surface/50 dark:bg-gray-800/50 rounded-2xl p-8 shadow-sm backdrop-blur-sm">
        <div className="bg-brand-primary-light dark:bg-brand-primary/20 p-4 rounded-full mb-4 ring-8 ring-white/50 dark:ring-gray-700/50">
            <Icon name="Sparkles" className="w-10 h-10 text-brand-primary dark:text-blue-300" />
        </div>
        <h3 className="text-xl font-bold text-brand-text-primary dark:text-white">{UI_TEXT.emptyInsightsTitle}</h3>
        <p className="mt-2 text-brand-text-secondary dark:text-gray-300 max-w-sm">
            {UI_TEXT.emptyInsightsBody.replace("{childName}", child.name)}
        </p>
      </div>
    );
  }
  
  const sortedInsights = [...insights].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-4">
      <MetricsCard insights={sortedInsights} />
      {sortedInsights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  );
};

export default InsightsGrid;