import React, { useMemo } from 'react';
import type { Insight, InsightStatus } from '../types';
import { STATUS_DETAILS } from '../constants';
import Icon from './Icon';

interface MetricsCardProps {
  insights: Insight[];
}

const MetricsCard: React.FC<MetricsCardProps> = ({ insights }) => {
  const metrics = useMemo(() => {
    const counts = insights.reduce((acc, insight) => {
      acc[insight.status] = (acc[insight.status] || 0) + 1;
      return acc;
    }, {} as Record<InsightStatus, number>);
    return counts;
  }, [insights]);

  return (
    <div className="bg-brand-surface dark:bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg p-5 border border-black/5 dark:border-white/5 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        {(Object.keys(STATUS_DETAILS) as InsightStatus[]).map((status) => {
          const detail = STATUS_DETAILS[status];
          const count = metrics[status] || 0;
          return (
            <div key={status} className="flex flex-col items-center p-2 rounded-lg">
                <div className={`p-2 rounded-full ${detail.colorBg}`}>
                    <Icon name={detail.icon} className={`w-6 h-6 ${detail.colorBorder.replace('border-', 'text-')}`} />
                </div>
              <p className="mt-2 text-2xl font-bold text-brand-text-primary dark:text-white">{count}</p>
              <p className="text-xs font-medium text-brand-text-secondary dark:text-gray-400">{detail.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricsCard;
