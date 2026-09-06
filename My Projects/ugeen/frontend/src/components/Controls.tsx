import React from 'react';
import { AutomationStatus } from '../types';

interface ControlsProps {
  status: AutomationStatus;
  isConnected: boolean;
  isLoading: boolean;
  onStart: () => void;
  onStop: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  status,
  isConnected,
  isLoading,
  onStart,
  onStop,
}) => {
  const isRunning = status === 'running';
  const canStart = isConnected && !isRunning && !isLoading;
  const canStop = isConnected && isRunning;

  return (
    <div className="flex gap-3" id="controls">
      {/* Start Button */}
      <button
        onClick={onStart}
        disabled={!canStart}
        className={`relative flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
          canStart
            ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400 hover:shadow-lg hover:shadow-emerald-500/25 active:scale-95'
            : 'bg-surface-800 text-slate-600 cursor-not-allowed'
        }`}
        id="start-btn"
      >
        {/* Pulse ring when idle */}
        {canStart && (
          <span className="absolute inset-0 rounded-xl bg-emerald-500/20 animate-ping opacity-0 hover:opacity-100" />
        )}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        </svg>
        {isLoading ? 'Starting...' : 'Start'}
      </button>

      {/* Stop Button */}
      <button
        onClick={onStop}
        disabled={!canStop}
        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
          canStop
            ? 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 hover:shadow-lg hover:shadow-red-500/25 active:scale-95'
            : 'bg-surface-800 text-slate-600 cursor-not-allowed'
        }`}
        id="stop-btn"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <rect x="6" y="6" width="12" height="12" rx="2" />
        </svg>
        Stop
      </button>
    </div>
  );
};
