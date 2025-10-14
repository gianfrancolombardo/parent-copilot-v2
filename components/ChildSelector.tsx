import React, { useState, useRef, useEffect } from 'react';
import type { Child } from '../types';
import { formatAge } from '../utils/age';
import Icon from './Icon';
import { UI_TEXT } from '../constants';

interface ChildSelectorProps {
  children: Child[];
  activeChildId: string;
  setActiveChildId: (id: string) => void;
  onAddChildClick: () => void;
}

const ChildSelector: React.FC<ChildSelectorProps> = ({ children, activeChildId, setActiveChildId, onAddChildClick }) => {
  const activeChild = children.find(c => c.id === activeChildId);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectChild = (id: string) => {
    setActiveChildId(id);
    setIsOpen(false);
  };

  const handleAddClick = () => {
    onAddChildClick();
    setIsOpen(false);
  };

  const DesktopSelector = (
    <div className="hidden md:flex items-center space-x-4">
      <div className="relative w-full max-w-xs">
        <select
          value={activeChildId}
          onChange={(e) => setActiveChildId(e.target.value)}
          className="appearance-none w-full bg-brand-surface dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-brand-text-primary dark:text-gray-200 py-3 pl-4 pr-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition"
        >
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name} ({formatAge(new Date(child.birthDate))})
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-brand-text-secondary dark:text-gray-400">
          <Icon name="ChevronDown" className="w-5 h-5" />
        </div>
      </div>
      <button onClick={onAddChildClick} className="flex-shrink-0 bg-brand-primary text-white p-3 rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary">
        <Icon name="Plus" className="w-5 h-5" />
      </button>
    </div>
  );

  const MobileSelector = (
    <div className="md:hidden relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-40 bg-brand-surface dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-brand-text-primary dark:text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary"
      >
        <span className="font-semibold truncate">{activeChild ? activeChild.name : UI_TEXT.selectChild}</span>
        <Icon name="ChevronDown" className={`w-5 h-5 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 origin-top-right bg-brand-surface dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none z-20">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {children.map(child => (
              <button
                key={child.id}
                onClick={() => handleSelectChild(child.id)}
                className="w-full text-left px-4 py-2 text-sm text-brand-text-primary dark:text-gray-200 hover:bg-brand-primary-light dark:hover:bg-gray-700 flex items-center justify-between"
                role="menuitem"
              >
                <span>{child.name}</span>
                {child.id === activeChildId && <Icon name="CheckCircle2" className="w-4 h-4 text-brand-primary" />}
              </button>
            ))}
          </div>
          <div className="py-1">
            <button
              onClick={handleAddClick}
              className="w-full text-left px-4 py-2 text-sm text-brand-text-primary dark:text-gray-200 hover:bg-brand-primary-light dark:hover:bg-gray-700 flex items-center gap-2"
              role="menuitem"
            >
              <Icon name="Plus" className="w-4 h-4" />
              <span>{UI_TEXT.addChild}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {DesktopSelector}
      {MobileSelector}
    </>
  );
};

export default ChildSelector;
