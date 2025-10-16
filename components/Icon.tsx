import React, { createElement } from 'react';
import * as icons from 'lucide-react';
import type { IconName } from '../types';

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

// Icon mapping for fallbacks when the AI generates non-existent icon names
const iconFallbacks: Record<string, keyof typeof icons> = {
  'TreasureBox': 'Box',
  'Puzzle': 'Puzzle',
  'Brain': 'Brain',
  'Footprints': 'Footprints',
  'Heart': 'Heart',
  'Moon': 'Moon',
  'UtensilsCrossed': 'UtensilsCrossed',
  'MessageSquare': 'MessageSquare',
  'Sparkles': 'Sparkles',
  'Lightbulb': 'Lightbulb',
  'Tag': 'Tag',
  'CheckCircle2': 'CheckCircle2',
  'AlertTriangle': 'AlertTriangle',
  'TrendingUp': 'TrendingUp',
  'Hourglass': 'Hourglass',
  'BookOpen': 'BookOpen',
  'Palette': 'Palette',
  'User': 'User',
  'Baby': 'Baby'
};

const Icon: React.FC<IconProps> = ({ name, className, size = 24, strokeWidth = 2 }) => {
  // First try the exact name
  let iconName = name;
  let LucideIcon = icons[iconName];

  // If not found, try the fallback mapping
  if (!LucideIcon && iconFallbacks[name]) {
    iconName = iconFallbacks[name];
    LucideIcon = icons[iconName];
  }

  // If still not found, use a default fallback icon
  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in Lucide library. Using fallback icon.`);
    LucideIcon = icons['Lightbulb']; // Default fallback
  }
  
  return createElement(LucideIcon, {
    className,
    size,
    strokeWidth,
  });
};

export default Icon;