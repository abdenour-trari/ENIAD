"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

// Mock data showing catastrophic forgetting performance drop
const forgettingData = [
  { step: 0, score: 10 },
  { step: 100, score: 25 },
  { step: 200, score: 55 },
  { step: 300, score: 78 },
  { step: 400, score: 88 },
  { step: 500, score: 92 }, // Peak
  { step: 600, score: 15 }, // Catastrophic drop!
  { step: 700, score: 12 },
  { step: 800, score: 30 },
  { step: 900, score: 45 },
  { step: 1000, score: 50 },
];

export default function FailureScenarios() {
  const [activeTab, setActiveTab] = useState<"sparse" | "forgetting">("sparse");
  const [isShaped, setIsShaped] = useState(false);
  const [agentIndex, setAgentIndex] = useState(0); // Position 0 to 8
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [rewardHistory, setRewardHistory] = useState<number[]>([]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setStepCount((s) => s + 1);

        if (isShaped) {
          // Guided: Moves systematically to the right towards index 7 (target)
          setAgentIndex((prev) => {
            if (prev < 7) {
              setRewardHistory((h) => [...h, 0.5]);
              return prev + 1;
            } else {
              setRewardHistory((h) => [...h, 10]);
              setIsPlaying(false);
              return 7;
            }
          });
        } else {
          // Unguided random walk (Sparse rewards)
          // Randomly moves left or right, mostly stays around middle
          const moveRight = Math.random() < 0.5;
          setAgentIndex((prev) => {
            let next = prev + (moveRight ? 1 : -1);
            if (next < 0) next = 0;
            if (next > 7) next = 7;
            
            const reachedTarget = next === 7;
            setRewardHistory((h) => [...h, reachedTarget ? 10 : 0]);
            
            if (reachedTarget) {
              setIsPlaying(false);
            }
            return next;
          });
        }
      }, 400);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, isShaped]);

  const handleReset = () => {
    setIsPlaying(false);
    setAgentIndex(0);
    setStepCount(0);
    setRewardHistory([]);
  };

  return (
    <div className="glass-panel p-6 border-white/10 bg-black/40">
      <div className="flex justify-between items-center gap-4 mb-6">
        <div>
          <h4 className="font-bold text-white text-sm">Démos d'Échecs d'Apprentissage</h4>
          <p className="text-xs text-gray-400 mt-1">Comprenez les limites intrinsèques et les pannes critiques du RL.</p>
        </div>
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => {
              setActiveTab("sparse");
              handleReset();
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all focus:outline-none ${
              activeTab === "sparse" ? "bg-violet-950/40 text-violet-200" : "text-gray-400 hover:text-white"
            }`}
          >
            Récompense Rare
          </button>
          <button
            onClick={() => {
              setActiveTab("forgetting");
              handleReset();
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all focus:outline-none ${
              activeTab === "forgetting" ? "bg-violet-950/40 text-violet-200" : "text-gray-400 hover:text-white"
            }`}
          >
            Oubli Catastrophique
          </button>
        </div>
      </div>

      {activeTab === "sparse" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Simulation lane */}
          <div className="lg:col-span-2 bg-[#050218] border border-white/5 p-5 rounded-2xl flex flex-col justify-between min-h-[220px]">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-4">
                Simulation de Recherche de Cible
              </span>

              {/* 1D Grid */}
              <div className="flex justify-between w-full max-w-[420px] bg-black/40 p-4 rounded-xl border border-white/5 relative mx-auto mb-4">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const isAgent = agentIndex === idx;
                  const isTarget = idx === 7;
                  
                  let cellBg = "bg-white/5 border-white/5";
                  if (isTarget) cellBg = "bg-emerald-950/40 border-emerald-500/30 text-emerald-400";
                  if (isAgent) cellBg = "bg-cyan-500/25 border-cyan-400 ring-2 ring-cyan-500/20";

                  return (
                    <div
                      key={idx}
                      className={`w-9 h-9 rounded-lg border flex items-center justify-center text-xs font-mono transition-all ${cellBg}`}
                    >
                      {isAgent ? "🤖" : isTarget ? "💎" : isShaped && idx < 7 ? "🔸" : ""}
                    </div>
                  );
                })}
              </div>

              {/* Controls inside simulation */}
              <div className="flex gap-2 justify-center mb-4">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  disabled={agentIndex === 7}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all focus:outline-none"
                >
                  <Play size={10} /> {isPlaying ? "Pause" : "Lancer"}
                </button>
                <button
                  onClick={handleReset}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 transition-all focus:outline-none"
                >
                  <RotateCcw size={12} />
                </button>
                <button
                  onClick={() => {
                    setIsShaped(!isShaped);
                    handleReset();
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all focus:outline-none ${
                    isShaped
                      ? "bg-emerald-950/40 border-emerald-500 text-emerald-300"
                      : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                  }`}
                >
                  {isShaped ? "Reward Shaping Activé" : "Pas de Guidage"}
                </button>
              </div>
            </div>

            <div className="text-[10px] text-gray-400 leading-relaxed bg-white/5 p-3 rounded-lg border border-white/5">
              {isShaped ? (
                <span className="text-emerald-400 font-bold">✓ Grâce au Reward Shaping : </span>
              ) : (
                <span className="text-rose-400 font-bold">⚠ Sans guidage : </span>
              )}
              {isShaped
                ? "L'agent suit les récompenses intermédiaires (les pastilles 🔸) et se dirige directement vers la cible 💎."
                : "L'agent fait des pas aléatoires et a de grandes chances de tourner en rond indéfiniment sans jamais trouver la cible éloignée 💎 (Récompense trop rare)."}
            </div>
          </div>

          {/* Details side card */}
          <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-amber-500" /> Le Défi de la Rareté
              </h5>
              <p className="text-xs text-gray-300 leading-relaxed mb-3">
                Si un agent n'obtient de récompense qu'en résolvant parfaitement le problème, la probabilité d'y arriver par hasard décroît de façon exponentielle avec la longueur de la tâche.
              </p>
              <div className="bg-black/40 border border-white/5 p-3 rounded-lg font-mono text-[10px] text-gray-400">
                <div>Étape : {stepCount}</div>
                <div>Récompense cumulée : {rewardHistory.reduce((a, b) => a + b, 0).toFixed(1)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "forgetting" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Chart visualizer */}
          <div className="lg:col-span-2 bg-[#050218] border border-white/5 p-4 rounded-2xl h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forgettingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="step" stroke="rgba(255,255,255,0.3)" fontSize={9} label={{ value: "Étapes", position: "insideBottom", offset: -2, fill: "rgba(255,255,255,0.3)" }} />
                <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} label={{ value: "Performance", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.3)" }} />
                <Tooltip
                  contentStyle={{ background: "#0c0828", borderColor: "rgba(139,92,246,0.3)", borderRadius: "8px", fontSize: "11px" }}
                  labelClassName="text-rose-400 font-mono"
                />
                <Line type="monotone" dataKey="score" name="Performance de l'Agent" stroke="#f43f5e" strokeWidth={2} dot={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Explanation card */}
          <div className="bg-white/5 border border-white/5 p-5 rounded-2xl h-full flex flex-col justify-between">
            <div>
              <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-rose-500" /> Effondrement Brutal
              </h5>
              <p className="text-xs text-gray-300 leading-relaxed">
                L'**oubli catastrophique** survient lorsque les nouvelles transitions collectées par le réseau de neurones modifient trop brusquement les poids, effaçant ainsi les compétences précédemment apprises. La courbe de performance s'effondre alors subitement.
              </p>
            </div>
            
            <div className="text-[10px] text-gray-400 leading-relaxed border-t border-white/5 pt-3 mt-4">
              <strong className="text-cyan-400">Comment l'éviter :</strong> L'utilisation d'un Target Network à mise à jour lente (soft update) ou de techniques de régularisation limite ces chutes de performance dévastatrices.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
