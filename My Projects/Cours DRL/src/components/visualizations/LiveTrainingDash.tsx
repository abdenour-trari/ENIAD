"use client";

import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Play, Pause, RotateCcw, Sliders, TrendingUp } from "lucide-react";

interface DataPoint {
  episode: number;
  reward: number;
  epsilon: number;
}

export default function LiveTrainingDash() {
  const [learningRate, setLearningRate] = useState(0.001);
  const [gamma, setGamma] = useState(0.99);
  const [epsilonDecay, setEpsilonDecay] = useState(0.99);
  
  const [trainingData, setTrainingData] = useState<DataPoint[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [currentEpisode, setCurrentEpisode] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rewardRef = useRef(10);
  const epsRef = useRef(1.0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTraining = () => {
    if (isTraining) {
      setIsTraining(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setIsTraining(true);
    
    // Resume or start fresh
    let eps = currentEpisode === 0 ? 1.0 : epsRef.current;
    let reward = currentEpisode === 0 ? 10 : rewardRef.current;
    let ep = currentEpisode;

    timerRef.current = setInterval(() => {
      ep += 50;
      eps = Math.max(0.05, eps * Math.pow(epsilonDecay, 50));
      
      // Heuristic physics depending on hyperparameters:
      // Best settings: LR = 0.001, Gamma = 0.99, EpsilonDecay = 0.99
      // High LR -> Wild oscillation or crash
      // Low Gamma -> Stuck at low rewards
      let delta = 0;
      if (learningRate > 0.008) {
        // High learning rate: unstable
        delta = Math.random() * 25 - 12;
      } else if (gamma < 0.85) {
        // Low gamma: short sighted, caps early
        delta = (50 - reward) * 0.08 + (Math.random() * 6 - 3);
      } else {
        // Normal learning
        const targetReward = 95;
        const rate = learningRate * 2.5; // speed of convergence
        delta = (targetReward - reward) * rate + (Math.random() * 8 - 4);
      }

      reward = Math.max(0, Math.min(100, reward + delta));
      rewardRef.current = reward;
      epsRef.current = eps;

      setTrainingData((prev) => [
        ...prev,
        {
          episode: ep,
          reward: Math.round(reward),
          epsilon: parseFloat(eps.toFixed(2)),
        },
      ]);
      setCurrentEpisode(ep);

      if (ep >= 1000) {
        setIsTraining(false);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 150);
  };

  const handleReset = () => {
    setIsTraining(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setTrainingData([]);
    setCurrentEpisode(0);
    rewardRef.current = 10;
    epsRef.current = 1.0;
  };

  return (
    <div className="glass-panel p-6 border-white/10 bg-black/40">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="font-bold text-white text-sm">Dashboard d'Entraînement Interactif</h4>
          <p className="text-xs text-gray-400 mt-1">Configurez les hyperparamètres et lancez la boucle d'apprentissage.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={startTraining}
            disabled={currentEpisode >= 1000 && !isTraining}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all focus:outline-none disabled:opacity-40"
          >
            {isTraining ? <Pause size={12} /> : <Play size={12} />}
            {isTraining ? "Pause" : currentEpisode >= 1000 ? "Fini" : "Entraîner"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs transition-all focus:outline-none"
          >
            <RotateCcw size={12} /> reset
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left: Hyperparameters adjustments */}
        <div className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col justify-between gap-4">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Sliders size={14} className="text-cyan-400" /> Paramètres d'Apprentissage
          </span>

          <div className="space-y-4 flex-1">
            {/* Learning Rate Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300" title="Taux d'apprentissage du réseau de neurones">Learning Rate ($\alpha$)</span>
                <span className="font-mono text-cyan-400 font-bold">{learningRate.toFixed(4)}</span>
              </div>
              <input
                type="range"
                min="0.0001"
                max="0.01"
                step="0.0005"
                value={learningRate}
                disabled={isTraining}
                onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-50"
              />
              <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                <span>0.0001 (Lent)</span>
                <span>0.01 (Instable)</span>
              </div>
            </div>

            {/* Gamma Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300" title="Facteur d'actualisation des récompenses futures">Discount Factor ($\gamma$)</span>
                <span className="font-mono text-violet-400 font-bold">{gamma.toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="0.80"
                max="0.99"
                step="0.01"
                value={gamma}
                disabled={isTraining}
                onChange={(e) => setGamma(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-violet-400 disabled:opacity-50"
              />
              <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                <span>0.80 (Court terme)</span>
                <span>0.99 (Long terme)</span>
              </div>
            </div>

            {/* Epsilon Decay Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300" title="Vitesse de réduction de l'exploration aléatoire">Epsilon Decay</span>
                <span className="font-mono text-pink-400 font-bold">{epsilonDecay.toFixed(3)}</span>
              </div>
              <input
                type="range"
                min="0.90"
                max="0.995"
                step="0.005"
                value={epsilonDecay}
                disabled={isTraining}
                onChange={(e) => setEpsilonDecay(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-black/40 rounded-lg appearance-none cursor-pointer accent-pink-400 disabled:opacity-50"
              />
              <div className="flex justify-between text-[8px] text-gray-500 mt-1">
                <span>0.90 (Rapide)</span>
                <span>0.995 (Progressive)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right/Center: Recharts Live graph */}
        <div className="lg:col-span-2 bg-[#050218] border border-white/5 p-5 rounded-2xl flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                <TrendingUp size={14} className="text-cyan-400" /> Courbe de Récompense
              </span>
              <div className="flex gap-4 text-[10px] font-mono text-gray-400">
                <span>Épisode : <strong className="text-white">{currentEpisode}</strong></span>
                <span>Récompense : <strong className="text-cyan-400">{Math.round(rewardRef.current)}</strong></span>
                <span>Epsilon : <strong className="text-pink-400">{epsRef.current.toFixed(2)}</strong></span>
              </div>
            </div>

            <div className="h-[200px] w-full bg-black/40 border border-white/5 rounded-xl p-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trainingData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="episode" stroke="rgba(255,255,255,0.3)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} domain={[0, 110]} />
                  <Tooltip
                    contentStyle={{ background: "#0c0828", borderColor: "rgba(139,92,246,0.3)", borderRadius: "8px", fontSize: "11px" }}
                    labelClassName="text-cyan-400 font-mono"
                  />
                  <Line type="monotone" dataKey="reward" name="Récompense" stroke="#06b6d4" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="epsilon" name="Epsilon" stroke="#ec4899" strokeWidth={1} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="text-[10px] text-gray-500 italic mt-3">
            * Expérience : Si le Learning Rate est trop élevé (0.01), la courbe va osciller brutalement ou décroître (divergence). Si gamma est trop faible (0.80), l'agent se limite aux récompenses immédiates.
          </div>
        </div>
      </div>
    </div>
  );
}
