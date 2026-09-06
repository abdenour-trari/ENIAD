import React, { useState } from 'react';
import { CodePayload } from '../types';

interface CodeDisplayProps {
  latestCode: CodePayload | null;
  statusLastCode: string | null;
}

export const CodeDisplay: React.FC<CodeDisplayProps> = ({ latestCode, statusLastCode }) => {
  const [copied, setCopied] = useState(false);

  const code = latestCode?.code || statusLastCode;
  const date = latestCode?.date
    ? new Date(latestCode.date).toLocaleString()
    : null;

  const handleCopy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback copy
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden" id="code-display">
      {/* Glow effect */}
      {code && (
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-sky-500/5 pointer-events-none" />
      )}

      <div className="relative p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
            <span className="text-lg">🔑</span>
            Activation Code
          </h3>
          {code && (
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-slate-200 ring-1 ring-white/10'
              }`}
              id="copy-code-btn"
            >
              {copied ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          )}
        </div>

        {code ? (
          <div className="space-y-3">
            <div className="bg-surface-950/80 rounded-xl p-4 ring-1 ring-emerald-500/20 animate-glow">
              <p className="font-mono text-xl sm:text-2xl font-bold text-emerald-400 tracking-wider text-center break-all">
                {code}
              </p>
            </div>
            {date && (
              <p className="text-xs text-slate-600 text-center">
                Extracted: {date}
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-slate-600">
            <svg className="w-10 h-10 mb-2 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm">No code extracted yet</p>
            <p className="text-xs mt-1">Start the automation to retrieve a code</p>
          </div>
        )}
      </div>
    </div>
  );
};
