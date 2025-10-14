import React, { useState } from 'react';
import type { Child } from '../types';
import { UI_TEXT } from '../constants';
import Icon from './Icon';

interface AddChildFormProps {
  onAddChild: (child: Omit<Child, 'id'>) => void;
}

const AddChildForm: React.FC<AddChildFormProps> = ({ onAddChild }) => {
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && birthDate) {
      onAddChild({ name, birthDate });
      setName('');
      setBirthDate('');
    }
  };

  return (
    <div className="min-h-screen bg-brand-primary-light dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-brand-surface dark:bg-gray-800 p-8 rounded-2xl shadow-lg text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-brand-primary mb-6">
          <Icon name="Baby" className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-brand-text-primary dark:text-white mb-2">{UI_TEXT.appName}</h1>
        <p className="text-brand-text-secondary dark:text-gray-300 mb-8">Comencemos por añadir a tu hijo/a.</p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-brand-text-secondary dark:text-gray-300 text-left mb-1">{UI_TEXT.childName}</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Lucía"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary transition bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="birthDate" className="block text-sm font-medium text-brand-text-secondary dark:text-gray-300 text-left mb-1">{UI_TEXT.birthDate}</label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-brand-primary focus:border-brand-primary transition bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary transition-transform transform hover:scale-105"
          >
            {UI_TEXT.saveChild}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddChildForm;