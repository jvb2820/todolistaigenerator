import React, { useState } from 'react';
import { PlusIcon } from './icons/PlusIcon'; 

interface AiGeneratorProps {
  onGenerate: (theme: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const AiGenerator: React.FC<AiGeneratorProps> = ({ onGenerate, isLoading, error }) => {
  const [theme, setTheme] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (theme.trim()) {
      onGenerate(theme.trim());
      // setTheme(''); // Keep theme for potential retry on error
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1 flex flex-col sm:flex-row gap-3 items-start">
      <div className="flex-grow w-full">
        <label htmlFor="aiTheme" className="sr-only">
          Theme for AI Task Generation
        </label>
        <input
          id="aiTheme"
          type="text"
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          placeholder="Enter theme for new AI paper (e.g., Weekend Chores)"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
          disabled={isLoading}
        />
         {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={isLoading || !theme.trim()}
        className="w-full sm:w-auto flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generating...
          </>
        ) : (
          <>
            <PlusIcon className="w-5 h-5 mr-2" /> 
            Generate Themed Paper
          </>
        )}
      </button>
    </form>
  );
};

export default AiGenerator;