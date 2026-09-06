"use client";

import React, { useState } from "react";
import { Play, Sparkles, RefreshCw } from "lucide-react";

export default function PolicyGradientVis() {
  const [probRight, setProbRight] = useState(0.5); // Initial: 50% Left, 50% Right
  const [rolloutPath, setRolloutPath] = useState<number[]>([]); // Sequence of positions
  const [isAnimating, setIsAnimating] = useState(false);
  const [rolloutResult, setRolloutResult] = useState<"success" | "failure" | null>(null);
  const [lastDirection, setLastDirection] = useState<"LEFT" | "RIGHT" | null>(null);

  const startRollout = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setRolloutResult(null);
    setLastDirection(null);

    // Simulate step by step path (starts at position 0, wants to reach 3 on right, pit at -3 on left)
    let currentPos = 0;
    const path = [currentPos];
    
    const interval = setInterval(() => {
      // Choose action based on current probability
      const moveRight = Math.random() < probRight;
      currentPos += moveRight ? 1 : -1;
      path.push(currentPos);
      setRolloutPath([...path]);

      if (currentPos >= 3 || currentPos <= -3 || path.length >= 6) {
        clearInterval(interval);
        setIsAnimating(false);
        const success = currentPos >= 3;
        setRolloutResult(success ? "success" : "failure");
        setLastDirection(moveRight ? "RIGHT" : "LEFT");
      }
    }, 300);
  };

  const optimizePolicy = () => {
    if (rolloutResult === null || lastDirection === null) return;

    // Gradient ascent: if success, increase probability of that action. If failure, decrease it.
    if (rolloutResult === "success") {
      if (lastDirection === "RIGHT") {
        setProbRight((p) => Math.min(0.95, p + 0.15));
      } else {
        setProbRight((p) => Math.max(0.05, p - 0.15));
      }
    } else {
      // Failure
      if (lastDirection === "RIGHT") {
        setProbRight((p) => Math.max(0.05, p - 0.15));
      } else {
        setProbRight((p) => Math.min(0.95, p + 0.15));
      }
    }
    // Reset rollout state
    setRolloutPath([]);
    setRolloutResult(null);
    setLastDirection(null);
  };

  const handleReset = () => {
    setProbRight(0.5);
    setRolloutPath([]);
    setIsAnimating(false);
    setRolloutResult(null);
    setLastDirection(null);
  };

  const probLeft = 1 - probRight;

  return (
    <div className="glass-panel p-6 border-white/10 bg-black/40">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="font-bold text-white text-sm">Policy Gradient (Méthode REINFORCE)</h4>
          <p className="text-xs text-gray-400 mt-1">
            Observez comment l'agent stochastique modifie directement la probabilité de ses actions après chaque trajectoire.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startRollout}
            disabled={isAnimating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all focus:outline-none disabled:opacity-40"
          >
            <Play size={12} /> Épisode (Rollout)
          </button>
          <button
            onClick={optimizePolicy}
            disabled={rolloutResult === null || isAnimating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold transition-all focus:outline-none disabled:opacity-30"
          >
            <Sparkles size={12} /> Optimiser Politiques
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 transition-all focus:outline-none"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* 1. Interactive 1D environment slider */}
        <div className="flex flex-col items-center justify-center p-6 bg-black/40 border border-white/5 rounded-xl min-h-[220px] relative">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-8">
            Trajectoire sur l'axe d'états
          </span>

          <div className="flex items-center justify-between w-full max-w-[320px] relative mb-8">
            {/* Grid points (-3, -2, -1, 0, 1, 2, 3) */}
            {[-3, -2, -1, 0, 1, 2, 3].map((pos) => {
              const currentAgentPos = rolloutPath[rolloutPath.length - 1];
              const isAgentHere = currentAgentPos === pos;
              
              let pointColor = "bg-white/10";
              if (pos === 3) pointColor = "bg-emerald-500/30 border border-emerald-400/50";
              if (pos === -3) pointColor = "bg-rose-500/30 border border-rose-400/50";

              return (
                <div key={pos} className="flex flex-col items-center relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-all ${
                    isAgentHere 
                      ? "bg-cyan-500 text-white scale-125 ring-4 ring-cyan-500/20" 
                      : `${pointColor} text-gray-400`
                  }`}>
                    {isAgentHere ? "🤖" : pos === 3 ? "💎" : pos === -3 ? "🔥" : pos}
                  </div>
                </div>
              );
            })}

            {/* Connecting line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/5 -z-10" />
          </div>

          {/* Rollout results badges */}
          <div className="h-6">
            {isAnimating && (
              <span className="text-xs text-cyan-400 animate-pulse font-medium">L'agent fait des choix aléatoires...</span>
            )}
            {!isAnimating && rolloutResult === "success" && (
              <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/25 text-emerald-300 font-semibold border border-emerald-500/30">
                {"Succès ! Retour $G > 0$. Cliquez sur \"Optimiser Politiques\""}
              </span>
            )}
            {!isAnimating && rolloutResult === "failure" && (
              <span className="text-xs px-2.5 py-1 rounded bg-rose-500/25 text-rose-300 font-semibold border border-rose-500/30">
                {"Échec ! Retour $G = 0$. Cliquez sur \"Optimiser Politiques\""}
              </span>
            )}
          </div>
        </div>

        {/* 2. Action Probability Distribution Visualizer */}
        <div className="flex flex-col bg-white/5 border border-white/5 p-5 rounded-xl justify-between h-[220px]">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 block">
              Distribution de Politique $\pi_\theta(a|s)$
            </span>

            <div className="space-y-4">
              {/* Action Left */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{"Action GAUCHE ($\\pi_\\theta(\\text{GAUCHE}|s)$)"}</span>
                  <span className="font-mono font-bold text-cyan-400">{(probLeft * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-cyan-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${probLeft * 100}%` }}
                  />
                </div>
              </div>

              {/* Action Right */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-300">{"Action DROITE ($\\pi_\\theta(\\text{DROITE}|s)$)"}</span>
                  <span className="font-mono font-bold text-violet-400">{(probRight * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-black/40 h-3 rounded-full overflow-hidden">
                  <div
                    className="bg-violet-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${probRight * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 leading-relaxed italic border-t border-white/5 pt-2.5">
            <strong>Algorithme REINFORCE :</strong> Si l'agent réussit (atteint 💎), la probabilité de l'action finale ({lastDirection || "aucune"}) sera augmentée (montée de gradient). S'il échoue (atteint 🔥), elle sera réduite.
          </div>
        </div>
      </div>
    </div>
  );
}
