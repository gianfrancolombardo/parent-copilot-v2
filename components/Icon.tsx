import React, { createElement } from 'react';
import * as icons from 'lucide-react';
import type { IconName } from '../types';

interface IconProps {
  name: IconName;
  className?: string;
  size?: number;
  strokeWidth?: number;
}

const Icon: React.FC<IconProps> = ({ name, className, size = 24, strokeWidth = 2 }) => {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    console.warn(`Icon "${name}" not found in Lucide library.`);
    return null; // or return a fallback icon
  }
  
  return createElement(LucideIcon, {
    className,
    size,
    strokeWidth,
  });
};

export default Icon;