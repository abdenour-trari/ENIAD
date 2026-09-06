import React, { useEffect, useState } from 'react';
import { AutomationRun, AutomationStatus } from '../types';
import { useAutomation } from '../hooks/useAutomation';

const STATUS_STYLES: Record<AutomationStatus, string> = {
  idle: 'bg-slate-500/10 text-slate-400 ring-slate-500/20',
  running: 'bg-amber-500/10 text-amber-400 ring-amber-500/20',
  success: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20',
  error: 'bg-red-500/10 text-red-400 ring-red-500/20',
  cancelled: 'bg-orange-500/10 text-orange-400 ring-orange-500/20',
};

export const HistoryTable: React.FC = () => {
  const [history, setHistory] = useState<AutomationRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchHistory } = useAutomation();

  const loadHistory = async () => {
    setIsLoading(true);
    const data = await fetchHistory();
    setHistory(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadHistory();
    // Refresh every 30 seconds
    const interval = setInterval(loadHistory, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDuration = (start: string, end: string | null) => {
    if (!end) return '...';
    const diff = new Date(end).getTime() - new Date(start).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return `${secs}s`;
    const mins = Math.floor(secs / 60);
    return `${mins}m ${secs % 60}s`;
  };

  return (
    <div className="flex flex-col h-full" id="history-table">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
          <span className="text-lg">📋</span>
          Run History
        </h3>
        <button
          onClick={loadHistory}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-2 py-1 rounded hover:bg-white/5"
          id="refresh-history-btn"
        >
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-32 text-slate-600">
            <div className="animate-spin w-5 h-5 border-2 border-slate-600 border-t-slate-300 rounded-full" />
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-600">
            <p className="text-sm">No runs yet</p>
            <p className="text-xs mt-1">Start the automation to see history</p>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-white/5">
                <th className="text-left px-4 py-2 font-medium">Date</th>
                <th className="text-left px-4 py-2 font-medium">Status</th>
                <th className="text-left px-4 py-2 font-medium">Code</th>
                <th className="text-left px-4 py-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {history.map((run) => (
                <tr
                  key={run.id}
                  className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-4 py-2.5 text-slate-400 font-mono">
                    {formatDate(run.started_at)}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ring-1 ${
                        STATUS_STYLES[run.status as AutomationStatus] || STATUS_STYLES.idle
                      }`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono text-emerald-400/80 max-w-[150px] truncate">
                    {run.activation_code || '—'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-500">
                    {getDuration(run.started_at, run.completed_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
