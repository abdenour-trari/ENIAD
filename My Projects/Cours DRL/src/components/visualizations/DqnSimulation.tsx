"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, RefreshCw, Layers } from "lucide-react";

interface Transition {
  state: string;
  action: string;
  reward: number;
  nextState: string;
  done: boolean;
}

export default function DqnSimulation() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [agentPos, setAgentPos] = useState({ x: 0, y: 3 }); // Start bottom-left
  const [targetPos] = useState({ x: 3, y: 0 }); // Target top-right
  const [pitPos] = useState({ x: 1, y: 1 }); // Pit in middle
  const [replayBuffer, setReplayBuffer] = useState<Transition[]>([]);
  const [stepCount, setStepCount] = useState(0);
  const [targetUpdateCounter, setTargetUpdateCounter] = useState(0);
  const [qNetworkVersion, setQNetworkVersion] = useState(1);
  const [targetNetworkVersion, setTargetNetworkVersion] = useState(1);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const actions = ["HAUT", "DROITE", "BAS", "GAUCHE"];

  // Q-values estimation (simulated)
  const getQValues = (x: number, y: number) => {
    // Distance-based heuristic to make values look realistic
    const distToTarget = Math.abs(x - targetPos.x) + Math.abs(y - targetPos.y);
    const baseVal = 10 - distToTarget * 2;
    
    // Pit penalty
    if (x === pitPos.x && y === pitPos.y) return [-10, -10, -10, -10];
    
    return [
      baseVal + (y > 0 ? 0.8 : -2),  // Up
      baseVal + (x < 3 ? 1.2 : -2),  // Right
      baseVal + (y < 3 ? 0.4 : -2),  // Down
      baseVal + (x > 0 ? 0.2 : -2),  // Left
    ];
  };

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(stepAgent, 800);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, agentPos]);

  const stepAgent = () => {
    const { x, y } = agentPos;
    
    // Epsilon-greedy action choice (simulated)
    let actionIdx = 0;
    if (Math.random() < 0.15) {
      // Random action
      actionIdx = Math.floor(Math.random() * 4);
    } else {
      // Greedy action (max simulated Q-value)
      const qVals = getQValues(x, y);
      actionIdx = qVals.indexOf(Math.max(...qVals));
    }

    let nextX = x;
    let nextY = y;

    if (actionIdx === 0 && y > 0) nextY -= 1; // UP
    if (actionIdx === 1 && x < 3) nextX += 1; // RIGHT
    if (actionIdx === 2 && y < 3) nextY += 1; // DOWN
    if (actionIdx === 3 && x > 0) nextX -= 1; // LEFT

    const reachedTarget = nextX === targetPos.x && nextY === targetPos.y;
    const reachedPit = nextX === pitPos.x && nextY === pitPos.y;
    
    const reward = reachedTarget ? 10 : reachedPit ? -10 : -0.1;
    const done = reachedTarget || reachedPit;

    const transition: Transition = {
      state: `(${x},${y})`,
      action: actions[actionIdx],
      reward,
      nextState: `(${nextX},${nextY})`,
      done,
    };

    // Add to replay buffer (max 6 items shown)
    setReplayBuffer((prev) => [transition, ...prev].slice(0, 6));
    setStepCount((c) => c + 1);

    // Q-network updates on every step
    setQNetworkVersion((v) => v + 1);

    // Target network updates every 5 steps
    setTargetUpdateCounter((c) => {
      const nextC = c + 1;
      if (nextC >= 5) {
        setTargetNetworkVersion((v) => v + 1);
        return 0;
      }
      return nextC;
    });

    if (done) {
      // Reset position
      setAgentPos({ x: 0, y: 3 });
    } else {
      setAgentPos({ x: nextX, y: nextY });
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setAgentPos({ x: 0, y: 3 });
    setReplayBuffer([]);
    setStepCount(0);
    setTargetUpdateCounter(0);
    setQNetworkVersion(1);
    setTargetNetworkVersion(1);
  };

  const currentQ = getQValues(agentPos.x, agentPos.y);

  return (
    <div className="glass-panel p-6 border-white/10 bg-black/40">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h4 className="font-bold text-white text-sm">Simulation DQN en Direct</h4>
          <p className="text-xs text-gray-400 mt-1">L'agent explore la grille, stocke ses transitions et met à jour ses poids.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-all focus:outline-none"
          >
            {isPlaying ? <Pause size={12} /> : <Play size={12} />}
            {isPlaying ? "Pause" : "Démarrer"}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 text-xs transition-all focus:outline-none"
          >
            <RefreshCw size={12} /> Réinitialiser
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Gridworld Environment */}
        <div className="flex flex-col items-center">
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Environnement (Grille 4x4)</h5>
          <div className="grid grid-cols-4 gap-1.5 bg-white/5 p-2 rounded-xl border border-white/10 w-full max-w-[280px] aspect-square">
            {Array.from({ length: 16 }).map((_, idx) => {
              const x = idx % 4;
              const y = Math.floor(idx / 4);
              const isAgent = agentPos.x === x && agentPos.y === y;
              const isTarget = targetPos.x === x && targetPos.y === y;
              const isPit = pitPos.x === x && pitPos.y === y;

              let cellClass = "bg-white/5 border-white/5";
              let content = null;

              if (isAgent) {
                cellClass = "bg-cyan-500/20 border-cyan-400 shadow-inner";
                content = (
                  <div className="w-6 h-6 rounded-full bg-cyan-400 border-2 border-white flex items-center justify-center animate-bounce shadow-md">
                    🤖
                  </div>
                );
              } else if (isTarget) {
                cellClass = "bg-emerald-950/40 border-emerald-500/60";
                content = (
                  <span className="text-lg animate-pulse" title="Trésor (R = +10)">
                    💎
                  </span>
                );
              } else if (isPit) {
                cellClass = "bg-rose-950/40 border-rose-500/60";
                content = (
                  <span className="text-lg" title="Lave (R = -10)">
                    🔥
                  </span>
                );
              }

              return (
                <div
                  key={idx}
                  className={`flex items-center justify-center border rounded-lg transition-all aspect-square relative ${cellClass}`}
                >
                  {content}
                  <span className="absolute bottom-1 right-1 text-[8px] text-gray-600">
                    {x},{y}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 flex gap-3 text-[10px] text-gray-300">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-cyan-500 rounded-full inline-block" /> Agent</span>
            <span className="flex items-center gap-1">💎 Cible (+10)</span>
            <span className="flex items-center gap-1">🔥 Obstacle (-10)</span>
          </div>
        </div>

        {/* 2. Replay Buffer Viewer */}
        <div>
          <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Replay Buffer (Échantillons)
          </h5>
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 h-[280px] overflow-y-auto flex flex-col gap-2">
            {replayBuffer.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-600 italic">
                En attente de transitions...
              </div>
            ) : (
              replayBuffer.map((t, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center justify-between transition-all ${
                    idx === 0
                      ? "bg-violet-950/20 border-violet-500/30 text-white"
                      : "bg-white/5 border-white/5 text-gray-400"
                  }`}
                >
                  <div className="flex flex-col">
                    <span>État: <strong className="text-cyan-400">{t.state}</strong></span>
                    <span>Action: <strong className="text-violet-400">{t.action}</strong></span>
                  </div>
                  <div className="text-right flex flex-col">
                    <span className={t.reward > 0 ? "text-emerald-400 font-bold" : t.reward < -1 ? "text-rose-400 font-bold" : "text-gray-400"}>
                      R: {t.reward > 0 ? `+${t.reward}` : t.reward}
                    </span>
                    <span>Suiv: <strong className="text-cyan-400">{t.nextState}</strong></span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 3. Neural Networks Sync State */}
        <div className="flex flex-col justify-between">
          <div>
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
              <Layers size={12} /> Double Réseau DQN
            </h5>
            <div className="space-y-4">
              {/* Q Network card */}
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-white">Q-Network (Action)</span>
                  <span className="text-cyan-400 font-mono text-[10px]">v.{qNetworkVersion}</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  Calcule $Q(s, a)$ en continu. Est mis à jour à chaque étape d'entraînement.
                </p>
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[9px] font-mono">
                  <div className="bg-black/30 p-1 rounded">▲ HAUT: {currentQ[0].toFixed(2)}</div>
                  <div className="bg-black/30 p-1 rounded">▶ DROITE: {currentQ[1].toFixed(2)}</div>
                  <div className="bg-black/30 p-1 rounded">▼ BAS: {currentQ[2].toFixed(2)}</div>
                  <div className="bg-black/30 p-1 rounded">◀ GAUCHE: {currentQ[3].toFixed(2)}</div>
                </div>
              </div>

              {/* Target Network card */}
              <div className="bg-white/5 border border-white/10 p-3 rounded-xl relative overflow-hidden">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-white">Target Network (Cible)</span>
                  <span className="text-violet-400 font-mono text-[10px]">v.{targetNetworkVersion}</span>
                </div>
                <p className="text-[10px] text-gray-400 leading-relaxed">
                  {"Estime $Q_{\\text{target}}(s', a')$. Poids synchronisés toutes les 5 étapes."}
                </p>
                {/* Sync progress indicator */}
                <div className="mt-2.5">
                  <div className="flex justify-between text-[9px] text-gray-400 mb-1">
                    <span>Prochaine synchro</span>
                    <span>{targetUpdateCounter} / 5</span>
                  </div>
                  <div className="w-full bg-black/40 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-violet-500 h-full transition-all duration-300"
                      style={{ width: `${(targetUpdateCounter / 5) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 leading-relaxed bg-white/5 border border-white/5 p-3 rounded-lg mt-4">
            <strong className="text-cyan-300">Observation : </strong>
            Notez comment le Q-Network change à chaque étape (gradients immédiats), tandis que le Target Network reste gelé pour maintenir la cible de Bellman stable, évitant ainsi les divergences d'apprentissage.
          </div>
        </div>
      </div>
    </div>
  );
}
