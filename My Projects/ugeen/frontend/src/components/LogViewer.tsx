import React, { useEffect, useRef } from 'react';
import { LogEntry, LogLevel } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
  onClear: () => void;
}

const LOG_COLORS: Record<LogLevel, string> = {
  info: 'text-slate-300',
  warn: 'text-amber-400',
  error: 'text-red-400',
  success: 'text-emerald-400',
  step: 'text-sky-400',
};

const LOG_ICONS: Record<LogLevel, string> = {
  info: 'ℹ️',
  warn: '⚠️',
  error: '❌',
  success: '✅',
  step: '🔄',
};

export const LogViewer: React.FC<LogViewerProps> = ({ logs, onClear }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollRef = useRef(true);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (containerRef.current && autoScrollRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  // Detect if user scrolled up (disable auto-scroll)
  const handleScroll = () => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    autoScrollRef.current = scrollHeight - scrollTop - clientHeight < 50;
  };

  return (
    <div className="flex flex-col h-full" id="log-viewer">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-semibold text-slate-300">Live Logs</h3>
          <span className="text-xs text-slate-600 font-mono">({logs.length})</span>
        </div>
        <button
          onClick={onClear}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-white/5"
          id="clear-logs-btn"
        >
          Clear
        </button>
      </div>

      {/* Log entries */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-thin font-mono text-xs"
      >
        {logs.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-600">
            <p>Waiting for logs...</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              className={`flex gap-2 py-0.5 animate-slide-up ${LOG_COLORS[log.level]}`}
            >
              <span className="text-slate-600 shrink-0 select-none">
                [{log.timestamp}]
              </span>
              <span className="shrink-0 select-none">{LOG_ICONS[log.level]}</span>
              <span className="break-all">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
