"use client";

import React, { useEffect, useRef, useState } from "react";
import katex from "katex";
import { Info, HelpCircle } from "lucide-react";

interface SymbolExplanation {
  symbol: string;
  meaning: string;
}

interface MathFormulaProps {
  formula: string;
  block?: boolean;
  title?: string;
  explanations?: SymbolExplanation[];
}

export default function MathFormula({
  formula,
  block = true,
  title,
  explanations,
}: MathFormulaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showExplanations, setShowExplanations] = useState(true);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(formula, containerRef.current, {
          displayMode: block,
          throwOnError: false,
        });
      } catch (error) {
        console.error("KaTeX rendering error:", error);
      }
    }
  }, [formula, block]);

  return (
    <div className="glass-panel p-6 my-6 border border-violet-500/20 relative overflow-hidden bg-gradient-to-br from-[#0c082e] to-[#040114]">
      {/* Light glow effect */}
      <div className="absolute -right-20 -top-20 w-40 h-40 rounded-full bg-violet-600/10 blur-3xl pointer-events-none" />
      <div className="absolute -left-20 -bottom-20 w-40 h-40 rounded-full bg-cyan-600/10 blur-3xl pointer-events-none" />

      {title && (
        <h4 className="text-sm font-semibold text-violet-300 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Info size={16} /> {title}
        </h4>
      )}

      {/* Formula Rendering Container */}
      <div className="overflow-x-auto py-4 px-2 my-2 rounded-lg bg-black/40 border border-white/5 flex justify-center items-center">
        <div ref={containerRef} className="text-white text-lg md:text-xl selection:bg-violet-500/30" />
      </div>

      {/* Symbol Explanations Panel */}
      {explanations && explanations.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-4">
          <button
            onClick={() => setShowExplanations(!showExplanations)}
            className="flex items-center gap-2 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors mb-3 focus:outline-none"
          >
            <HelpCircle size={14} />
            {showExplanations
              ? "Masquer l'explication des symboles"
              : "Afficher l'explication des symboles"}
          </button>

          {showExplanations && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300 animate-fadeIn">
              {explanations.map((exp, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 bg-white/5 p-2.5 rounded-lg border border-white/5 hover:border-violet-500/20 transition-all hover:bg-white/10"
                >
                  <span className="font-mono text-cyan-400 font-bold bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/30">
                    {exp.symbol}
                  </span>
                  <span>{exp.meaning}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
