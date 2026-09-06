"use client";

import React from "react";

interface ProgressBarProps {
  progress: number; // 0 to 100
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const roundedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-6 relative overflow-hidden bg-gradient-to-r from-[#120b3b] to-[#040114]">
      {/* Light background glow */}
      <div className="absolute right-0 top-0 w-24 h-24 bg-violet-600/10 blur-2xl pointer-events-none" />

      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
          Progression Globale
        </span>
        <span className="text-sm font-bold text-cyan-400">
          {roundedProgress}%
        </span>
      </div>

      <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden border border-white/5 relative">
        <div
          className="bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_12px_rgba(139,92,246,0.5)]"
          style={{ width: `${roundedProgress}%` }}
        />
      </div>

      <div className="mt-2 text-[10px] text-gray-400 flex justify-between">
        <span>Introduction</span>
        <span>Maîtrise Totale</span>
      </div>
    </div>
  );
}
