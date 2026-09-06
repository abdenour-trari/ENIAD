"use client";

import React, { useState } from "react";
import { Terminal, Cpu, Play, RefreshCw, Layers } from "lucide-react";

export default function ToolsDashboard() {
  const [selectedTool, setSelectedTool] = useState<"gym" | "pytorch" | "sb3">("gym");
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isTraining, setIsTraining] = useState(false);

  const startTrainingLog = () => {
    if (isTraining) return;
    setIsTraining(true);
    setConsoleLogs(["Initializing Stable-Baselines3 PPO agent...", "Using device: cuda (GPU acceleration active)", "Wrapping environment in DummyVecEnv..."]);

    const logs = [
      "---------------------------------",
      "| rollout/           |          |",
      "|    ep_len_mean     | 22.4     |",
      "|    ep_rew_mean     | 22.4     |",
      "| time/              |          |",
      "|    fps             | 1042     |",
      "---------------------------------",
      "---------------------------------",
      "| rollout/           |          |",
      "|    ep_len_mean     | 87.1     |",
      "|    ep_rew_mean     | 87.1     |",
      "| time/              |          |",
      "|    fps             | 985      |",
      "---------------------------------",
      "---------------------------------",
      "| rollout/           |          |",
      "|    ep_len_mean     | 485.6    |",
      "|    ep_rew_mean     | 485.6    |",
      "| time/              |          |",
      "|    fps             | 940      |",
      "---------------------------------",
      "Training complete! Model saved to 'ppo_cartpole.zip'. Reward threshold reached."
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < logs.length) {
        setConsoleLogs((prev) => [...prev, logs[current]]);
        current++;
      } else {
        clearInterval(interval);
        setIsTraining(false);
      }
    }, 450);
  };

  const clearLogs = () => {
    setConsoleLogs([]);
    setIsTraining(false);
  };

  return (
    <div className="glass-panel p-6 border-white/10 bg-black/40">
      <h4 className="font-bold text-white text-sm mb-4">Bibliothèques et Outils en Action</h4>

      {/* Grid selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <button
          onClick={() => setSelectedTool("gym")}
          className={`p-4 rounded-xl border text-left transition-all focus:outline-none ${
            selectedTool === "gym"
              ? "bg-cyan-950/30 border-cyan-500 text-white shadow-md shadow-cyan-500/5"
              : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <div className="font-bold text-xs uppercase tracking-wider text-cyan-400 mb-1">Environnement</div>
          <span className="font-bold text-sm">Gymnasium API</span>
          <p className="text-[10px] text-gray-500 mt-1">Définit l'API standard d'interaction Agent-Environnement.</p>
        </button>

        <button
          onClick={() => setSelectedTool("pytorch")}
          className={`p-4 rounded-xl border text-left transition-all focus:outline-none ${
            selectedTool === "pytorch"
              ? "bg-violet-950/30 border-violet-500 text-white shadow-md shadow-violet-500/5"
              : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <div className="font-bold text-xs uppercase tracking-wider text-violet-400 mb-1">Calcul Tenseur</div>
          <span className="font-bold text-sm">PyTorch (GPU)</span>
          <p className="text-[10px] text-gray-500 mt-1">Gère la rétropropagation et l'optimisation des réseaux.</p>
        </button>

        <button
          onClick={() => setSelectedTool("sb3")}
          className={`p-4 rounded-xl border text-left transition-all focus:outline-none ${
            selectedTool === "sb3"
              ? "bg-emerald-950/30 border-emerald-500 text-white shadow-md shadow-emerald-500/5"
              : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <div className="font-bold text-xs uppercase tracking-wider text-emerald-400 mb-1">RL Algorithmes</div>
          <span className="font-bold text-sm">Stable-Baselines3</span>
          <p className="text-[10px] text-gray-500 mt-1">Fournit les implémentations de référence prêtes à l'entraînement.</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Detail Panel */}
        <div className="lg:col-span-2 bg-[#050218] border border-white/5 p-5 rounded-2xl flex flex-col justify-between">
          
          {selectedTool === "gym" && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-cyan-300 uppercase tracking-widest flex items-center gap-1.5">
                <Cpu size={14} /> Boucle Standard Gymnasium
              </h5>
              
              {/* Interaction Cycle diagram */}
              <div className="flex justify-around items-center py-6 bg-black/40 rounded-xl border border-white/5 my-2">
                <div className="text-center p-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 text-xs w-20">
                  Agent
                </div>
                <div className="flex flex-col items-center text-[10px] text-gray-500">
                  <span className="text-cyan-400 font-mono">step(action)</span>
                  <span className="w-12 h-0.5 bg-cyan-500/30 relative">
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-t border-r border-cyan-500 rotate-45" />
                  </span>
                </div>
                <div className="text-center p-2.5 rounded-lg border border-violet-500/30 bg-violet-950/20 text-xs w-24">
                  Environnement
                </div>
                <div className="flex flex-col items-center text-[10px] text-gray-500">
                  <span className="text-violet-400 font-mono">obs, reward, done</span>
                  <span className="w-12 h-0.5 bg-violet-500/30 relative">
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 border-b border-l border-violet-500 rotate-45" />
                  </span>
                </div>
                <div className="text-center p-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20 text-xs w-20">
                  Agent
                </div>
              </div>

              <div className="text-xs text-gray-300 space-y-1.5 leading-relaxed">
                <p><strong>1. reset() :</strong> Démarre un nouvel épisode et renvoie l'état initial.</p>
                <p><strong>2. step(action) :</strong> Exécute l'action, avance la physique d'un pas et renvoie la transition.</p>
                <p><strong>3. close() :</strong> Ferme les ressources et afficheurs graphiques de l'environnement.</p>
              </div>
            </div>
          )}

          {selectedTool === "pytorch" && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-violet-300 uppercase tracking-widest flex items-center gap-1.5">
                <Layers size={14} /> Optimisation Tensorielle PyTorch
              </h5>
              
              <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-[11px] text-cyan-300 space-y-1 my-2">
                <div># Calcul de la perte sur le batch</div>
                <div>loss = F.mse_loss(q_values, targets)</div>
                <div className="text-gray-500"># Remise à zéro des gradients</div>
                <div>optimizer.zero_grad()</div>
                <div className="text-gray-500 font-bold"># Rétropropagation automatique</div>
                <div className="font-bold text-violet-300">loss.backward()</div>
                <div className="text-gray-500"># Mise à jour des poids du réseau</div>
                <div>optimizer.step()</div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                Le graphe de calcul dynamique de PyTorch permet de calculer les gradients instantanément. C'est l'outil universel de base pour définir les fonctions objectives de l'agent RL.
              </p>
            </div>
          )}

          {selectedTool === "sb3" && (
            <div className="space-y-4">
              <h5 className="text-xs font-bold text-emerald-300 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal size={14} /> Stable-Baselines3
              </h5>

              <div className="bg-black/50 p-4 rounded-xl border border-white/5 font-mono text-[11px] text-cyan-300 space-y-1 my-2">
                <div>from stable_baselines3 import PPO</div>
                <div>env = gym.make("CartPole-v1")</div>
                <div className="text-emerald-400 font-bold"># Initialise PPO en 1 ligne</div>
                <div>model = PPO("MlpPolicy", env, verbose=1)</div>
                <div className="text-emerald-400 font-bold"># Entraîne l'agent</div>
                <div>model.learn(total_timesteps=10000)</div>
              </div>

              <p className="text-xs text-gray-300 leading-relaxed">
                SB3 est plébiscité car ses algorithmes ont été testés et validés par des experts de l'apprentissage par renforcement, évitant ainsi les erreurs d'implémentation fréquentes.
              </p>
            </div>
          )}
          
          <div className="mt-4 text-[10px] text-gray-500 border-t border-white/5 pt-3">
            Développé par le consortium académique OpenAI, DeepMind et la communauté Open Source.
          </div>
        </div>

        {/* Console logs */}
        <div className="flex flex-col bg-white/5 border border-white/5 rounded-2xl p-4 min-h-[260px] justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal size={12} /> Console SB3
              </span>
              {consoleLogs.length > 0 && (
                <button
                  onClick={clearLogs}
                  className="text-[9px] text-rose-400 hover:underline focus:outline-none"
                >
                  Effacer
                </button>
              )}
            </div>
            
            <div className="bg-black/60 rounded-xl p-3 h-[180px] overflow-y-auto font-mono text-[9px] text-emerald-400 space-y-1 border border-white/5">
              {consoleLogs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-gray-600 italic">
                  Cliquez sur "Lancer l'entraînement" ci-dessous
                </div>
              ) : (
                consoleLogs.map((log, idx) => (
                  <div key={idx} className="leading-snug">{log}</div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={startTrainingLog}
            disabled={isTraining || selectedTool !== "sb3"}
            className="w-full flex items-center justify-center gap-1.5 py-2 mt-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all focus:outline-none shadow-md"
          >
            <Play size={12} /> Lancer l'entraînement
          </button>
        </div>
      </div>
    </div>
  );
}
