import React from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAutomation } from '../hooks/useAutomation';
import { StatusBadge } from './StatusBadge';
import { Controls } from './Controls';
import { CodeDisplay } from './CodeDisplay';
import { LogViewer } from './LogViewer';
import { HistoryTable } from './HistoryTable';

export const Dashboard: React.FC = () => {
  const { isConnected, logs, status, latestCode, clearLogs } = useWebSocket();
  const { isLoading, error, startAutomation, stopAutomation } = useAutomation();

  const handleStart = async () => {
    try {
      await startAutomation();
    } catch {
      // Error is handled by the hook
    }
  };

  const handleStop = async () => {
    try {
      await stopAutomation();
    } catch {
      // Error is handled by the hook
    }
  };

  return (
    <div className="min-h-screen bg-surface-950 text-white">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/20 via-surface-950 to-sky-950/20 pointer-events-none" />

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ─── Header ─── */}
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-sky-500 flex items-center justify-center text-lg font-bold shadow-lg shadow-emerald-500/20">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                UGeen Automation
              </h1>
              <p className="text-xs text-slate-500">IPTV Activation Code Retrieval</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <StatusBadge
              status={status.status}
              currentStep={status.currentStep}
              isConnected={isConnected}
            />
            <Controls
              status={status.status}
              isConnected={isConnected}
              isLoading={isLoading}
              onStart={handleStart}
              onStop={handleStop}
            />
          </div>
        </header>

        {/* Error banner */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-slide-up" id="error-banner">
            <div className="flex items-center gap-2">
              <span>❌</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* ─── Main Grid ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-fade-in">
          {/* Code Display - Full width on mobile, 1 col on desktop */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-surface-900/50 backdrop-blur-sm ring-1 ring-white/[0.06] overflow-hidden hover:ring-white/[0.1] transition-all duration-500">
              <CodeDisplay
                latestCode={latestCode}
                statusLastCode={status.lastCode}
              />
            </div>

            {/* Steps Progress */}
            {status.status === 'running' && (
              <div className="mt-5 rounded-2xl bg-surface-900/50 backdrop-blur-sm ring-1 ring-white/[0.06] p-5 animate-slide-up">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <span className="text-lg">🔄</span>
                  Workflow Progress
                </h3>
                <div className="space-y-3">
                  {(['login', 'navigate', 'intermediary', 'download', 'parse'] as const).map(
                    (step, idx) => {
                      const stepLabels = {
                        login: 'Login',
                        navigate: 'Navigate',
                        intermediary: 'Intermediary Pages',
                        download: 'Download',
                        parse: 'Parse Code',
                      };
                      const steps = ['login', 'navigate', 'intermediary', 'download', 'parse'];
                      const currentIdx = status.currentStep ? steps.indexOf(status.currentStep) : -1;
                      const isActive = step === status.currentStep;
                      const isDone = currentIdx > idx;

                      return (
                        <div key={step} className="flex items-center gap-3">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              isDone
                                ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                                : isActive
                                ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30 animate-pulse'
                                : 'bg-surface-800 text-slate-600 ring-1 ring-white/5'
                            }`}
                          >
                            {isDone ? '✓' : idx + 1}
                          </div>
                          <span
                            className={`text-xs font-medium transition-colors duration-300 ${
                              isDone
                                ? 'text-emerald-400'
                                : isActive
                                ? 'text-amber-400'
                                : 'text-slate-600'
                            }`}
                          >
                            {stepLabels[step]}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Log Viewer - Takes 2 columns */}
          <div className="lg:col-span-2 h-[400px] lg:h-[500px] rounded-2xl bg-surface-900/50 backdrop-blur-sm ring-1 ring-white/[0.06] overflow-hidden hover:ring-white/[0.1] transition-all duration-500">
            <LogViewer logs={logs} onClear={clearLogs} />
          </div>
        </div>

        {/* ─── History Section ─── */}
        <div className="mt-5 rounded-2xl bg-surface-900/50 backdrop-blur-sm ring-1 ring-white/[0.06] overflow-hidden animate-fade-in h-[300px] hover:ring-white/[0.1] transition-all duration-500">
          <HistoryTable />
        </div>

        {/* ─── Footer ─── */}
        <footer className="mt-8 text-center text-xs text-slate-700 pb-4">
          <p>UGeen Automation System • Built with Playwright + React</p>
        </footer>
      </div>
    </div>
  );
};
