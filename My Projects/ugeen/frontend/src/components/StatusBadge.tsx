import React from 'react';
import { AutomationStatus, StepName } from '../types';

interface StatusBadgeProps {
  status: AutomationStatus;
  currentStep: StepName | null;
  isConnected: boolean;
}

const STATUS_CONFIG: Record<string, {
  color: string;
  bgColor: string;
  glowColor: string;
  label: string;
  animate: boolean;
}> = {
  idle: {
    color: 'text-slate-400',
    bgColor: 'bg-slate-400',
    glowColor: 'shadow-slate-400/50',
    label: 'Idle',
    animate: false,
  },
  running: {
    color: 'text-amber-400',
    bgColor: 'bg-amber-400',
    glowColor: 'shadow-amber-400/50',
    label: 'Running',
    animate: true,
  },
  success: {
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400',
    glowColor: 'shadow-emerald-400/50',
    label: 'Success',
    animate: false,
  },
  error: {
    color: 'text-red-400',
    bgColor: 'bg-red-400',
    glowColor: 'shadow-red-400/50',
    label: 'Error',
    animate: false,
  },
  cancelled: {
    color: 'text-orange-400',
    bgColor: 'bg-orange-400',
    glowColor: 'shadow-orange-400/50',
    label: 'Cancelled',
    animate: false,
  },
  disconnected: {
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    glowColor: 'shadow-red-500/50',
    label: 'Disconnected',
    animate: true,
  },
};

const STEP_LABELS: Record<StepName, string> = {
  login: 'Logging in...',
  navigate: 'Navigating...',
  intermediary: 'Processing pages...',
  download: 'Downloading...',
  parse: 'Extracting code...',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, currentStep, isConnected }) => {
  const displayStatus = !isConnected ? 'disconnected' : status;
  const config = STATUS_CONFIG[displayStatus] || STATUS_CONFIG.idle;

  const stepLabel = currentStep && status === 'running' ? STEP_LABELS[currentStep] : null;

  return (
    <div className="flex items-center gap-3" id="status-badge">
      {/* Animated dot */}
      <div className="relative flex items-center justify-center">
        <div
          className={`w-3 h-3 rounded-full ${config.bgColor} ${
            config.animate ? 'animate-pulse' : ''
          }`}
        />
        {config.animate && (
          <div
            className={`absolute w-3 h-3 rounded-full ${config.bgColor} animate-ping opacity-75`}
          />
        )}
      </div>

      {/* Status text */}
      <div className="flex flex-col">
        <span className={`text-sm font-semibold ${config.color}`}>
          {config.label}
        </span>
        {stepLabel && (
          <span className="text-xs text-slate-500 animate-fade-in">
            {stepLabel}
          </span>
        )}
      </div>
    </div>
  );
};
