import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleButtonClick = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonRect(rect);
    }
    setIsOpen(!isOpen);
  };

  const handleSelectChild = (id: string) => {
    setActiveChildId(id);
    setIsOpen(false);
  };

  const handleAddClick = () => {
    onAddChildClick();
    setIsOpen(false);
  };

  const DropdownContent = () => {
    if (!isOpen || !buttonRect) return null;

    return (
      <div
        ref={dropdownRef}
        className="fixed bg-brand-surface dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700 rounded-lg shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-[100] max-h-80 overflow-y-auto border border-gray-200 dark:border-gray-600 w-64 sm:w-72 md:w-80"
        style={{
          top: buttonRect.bottom + 8,
          right: window.innerWidth - buttonRect.right,
        }}
      >
        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
          {children.map(child => (
            <button
              key={child.id}
              onClick={() => handleSelectChild(child.id)}
              className="w-full text-left px-4 py-3 text-sm text-brand-text-primary dark:text-gray-200 hover:bg-brand-primary-light dark:hover:bg-gray-700 flex items-center justify-between transition-colors"
              role="menuitem"
            >
              <div className="flex flex-col">
                <span className="font-medium">{child.name}</span>
                <span className="text-xs text-brand-text-secondary dark:text-gray-400">{formatAge(new Date(child.birthDate))}</span>
              </div>
              {child.id === activeChildId && <Icon name="CheckCircle2" className="w-4 h-4 text-brand-primary flex-shrink-0" />}
            </button>
          ))}
        </div>
        <div className="py-1">
          <button
            onClick={handleAddClick}
            className="w-full text-left px-4 py-3 text-sm text-brand-text-primary dark:text-gray-200 hover:bg-brand-primary-light dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            role="menuitem"
          >
            <Icon name="Plus" className="w-4 h-4" />
            <span>{UI_TEXT.addChild}</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className="flex items-center justify-between w-40 sm:w-48 md:w-56 bg-brand-surface dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-brand-text-primary dark:text-gray-200 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
      >
        <span className="font-semibold truncate text-sm">{activeChild ? activeChild.name : UI_TEXT.selectChild}</span>
        <Icon name="ChevronDown" className={`w-4 h-4 ml-2 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {typeof document !== 'undefined' && createPortal(<DropdownContent />, document.body)}
    </>
  );
};

export default ChildSelector;
