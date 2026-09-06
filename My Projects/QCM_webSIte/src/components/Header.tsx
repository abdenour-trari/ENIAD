import React from 'react';
import { Brain, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  setDarkMode,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-slate-950/70 dark:bg-slate-950/70 light:bg-white/80 border-b border-slate-800 dark:border-slate-800 light:border-slate-200 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo/Branding */}
        <button 
          onClick={onReset}
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-md shadow-blue-500/10">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col items-start leading-none">
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-indigo-200 to-white bg-clip-text text-transparent group-hover:opacity-95 transition-opacity">
              QCM Generator
            </span>
            <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase mt-0.5">
              Pro Edition
            </span>
          </div>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-400 hover:text-slate-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-blue-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
