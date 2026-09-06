"use client";

import React, { useState } from "react";
import { Calendar, Award, CheckCircle, Target, ArrowRight } from "lucide-react";

export default function AlphaGoTimeline() {
  const [selectedEvent, setSelectedEvent] = useState(1); // Default to AlphaGo (2016)

  const events = [
    {
      id: 0,
      year: "2013",
      title: "DQN Atari (DeepMind)",
      achievement: "Première IA apprenant à jouer à 49 jeux Atari complexes directement à partir des pixels bruts.",
      impact: "Prouve que l'approximation de fonctions par Deep Learning peut se greffer de façon stable sur du Q-Learning classique.",
      visual: (
        <div className="w-full h-24 bg-[#050218] border border-white/5 rounded-xl flex items-center justify-center relative overflow-hidden">
          {/* Mock breakout game */}
          <div className="absolute top-2 w-[90%] flex justify-between gap-1">
            <span className="h-2 w-full bg-rose-500 rounded" />
            <span className="h-2 w-full bg-orange-500 rounded" />
            <span className="h-2 w-full bg-yellow-500 rounded" />
            <span className="h-2 w-full bg-emerald-500 rounded" />
          </div>
          {/* Ball */}
          <div className="absolute w-2 h-2 rounded-full bg-cyan-400 animate-[bounce_1.8s_infinite] left-1/3" style={{ bottom: "25px" }} />
          {/* Paddle */}
          <div className="absolute bottom-2 left-1/4 w-12 h-1.5 bg-violet-500 rounded animate-[pulse_1.5s_infinite]" />
        </div>
      ),
    },
    {
      id: 1,
      year: "2016",
      title: "AlphaGo vs Lee Sedol",
      achievement: "Victoire historique 4-1 contre le plus grand champion moderne du jeu de Go.",
      impact: "Combine les réseaux de neurones (évaluation de valeur et sélection de politique) avec la recherche arborescente de Monte Carlo (MCTS).",
      visual: (
        <div className="w-full h-24 bg-[#0b0826]/40 border border-white/5 rounded-xl flex items-center justify-center p-2">
          {/* Mini Go Board */}
          <div className="grid grid-cols-5 gap-px bg-[#d97706]/20 p-2.5 rounded-lg border border-yellow-800/40 relative">
            {Array.from({ length: 25 }).map((_, idx) => {
              const hasBlack = idx === 6 || idx === 12 || idx === 18;
              const hasWhite = idx === 7 || idx === 11 || idx === 17;
              return (
                <div key={idx} className="w-4 h-4 border border-yellow-950/20 relative flex items-center justify-center">
                  {hasBlack && <span className="w-3.5 h-3.5 rounded-full bg-black shadow-md block" />}
                  {hasWhite && <span className="w-3.5 h-3.5 rounded-full bg-white shadow-md block" />}
                </div>
              );
            })}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-rose-500 font-bold text-xs bg-black/80 px-2 py-0.5 rounded border border-rose-500/30 animate-pulse">
              Coup 78
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      year: "2019",
      title: "OpenAI Five (Dota 2)",
      achievement: "Une équipe de 5 agents RL coopératifs bat les champions du monde en titre du jeu Dota 2.",
      impact: "Démontre la gestion d'actions continues dans des espaces gigantesques à temps partiel et coordonne l'esprit d'équipe (Multi-Agent).",
      visual: (
        <div className="w-full h-24 bg-[#050218] border border-white/5 rounded-xl flex items-center justify-center gap-2">
          {/* Co-op network nodes */}
          <div className="flex gap-1.5 items-center">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <span className="w-5 h-5 rounded-full bg-violet-600/40 border border-violet-400 flex items-center justify-center text-[8px] font-bold text-white">
                  A{idx+1}
                </span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 3,
      year: "2022-2023",
      title: "Alignement des LLMs (RLHF)",
      achievement: "Utilisation du RL pour aligner les modèles GPT-4 et Claude sur les préférences humaines.",
      impact: "Met fin aux réponses incohérentes ou toxiques en modulant les poids de génération à l'aide de l'optimisation PPO.",
      visual: (
        <div className="w-full h-24 bg-[#050218] border border-white/5 rounded-xl flex flex-col justify-center px-4 gap-1.5">
          <div className="flex justify-between items-center text-[9px] text-gray-500">
            <span>Prompt: "Écris un poème"</span>
            <span className="text-emerald-400 font-bold">Récompense Humaine +9.5</span>
          </div>
          <div className="bg-white/5 p-1.5 rounded border border-white/5 font-mono text-[9px] text-gray-300">
            "Le vent souffle doucement sur les plaines..."
          </div>
        </div>
      ),
    },
    {
      id: 4,
      year: "2024-2026",
      title: "Robotique Généraliste",
      achievement: "Les modèles de fondation Robotique (RT-2, Spot) intègrent le RL pour adapter la marche au monde réel.",
      impact: "Utilise le transfert Sim-to-Real et la Domain Randomization pour apprendre des comportements physiques flexibles sur le matériel réel.",
      visual: (
        <div className="w-full h-24 bg-[#050218] border border-white/5 rounded-xl flex items-center justify-center relative">
          {/* Animated robotic arm */}
          <div className="w-24 h-16 border-b-2 border-dashed border-white/10 relative">
            <span className="absolute bottom-0 left-6 w-3 h-10 bg-violet-600/40 border border-violet-500 origin-bottom rotate-45 rounded" />
            <span className="absolute bottom-7 left-12 w-2 h-8 bg-cyan-600/40 border border-cyan-500 origin-bottom -rotate-12 rounded" />
            <span className="absolute bottom-9 left-16 w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          </div>
        </div>
      ),
    },
  ];

  const current = events[selectedEvent];

  return (
    <div className="glass-panel p-6 border-white/10 bg-black/40">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="text-violet-500" size={18} />
        <div>
          <h4 className="font-bold text-white text-sm">Chronologie des Succès du Deep RL</h4>
          <p className="text-xs text-gray-400">Cliquez sur une date de la frise pour explorer les détails techniques de l'exploit.</p>
        </div>
      </div>

      {/* Horizontal timeline slider */}
      <div className="flex justify-between items-center bg-white/5 border border-white/10 rounded-xl p-4 mb-6 relative overflow-x-auto gap-4">
        {events.map((e) => (
          <button
            key={e.id}
            onClick={() => setSelectedEvent(e.id)}
            className={`flex flex-col items-center gap-1.5 focus:outline-none transition-all px-3 py-2 rounded-lg shrink-0 ${
              selectedEvent === e.id
                ? "bg-violet-950/40 border border-violet-500/40 text-violet-200"
                : "text-gray-500 hover:text-gray-300 border border-transparent"
            }`}
          >
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">{e.year}</span>
            <span className="text-xs font-semibold">{e.title.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Left: Detailed text info */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Award className="text-yellow-400" size={16} />
            <h5 className="font-bold text-white text-sm">{current.title} ({current.year})</h5>
          </div>

          <div className="space-y-2.5 text-xs">
            <p className="text-gray-300">
              <strong className="text-cyan-400">Accomplissement :</strong> {current.achievement}
            </p>
            <p className="text-gray-400 leading-relaxed">
              <strong className="text-violet-400">Impact scientifique :</strong> {current.impact}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-900/30 p-2.5 rounded-lg">
            <CheckCircle size={14} /> Victoire académique validée par les pairs.
          </div>
        </div>

        {/* Right: Interactive visual sketch */}
        <div className="flex flex-col justify-center items-center bg-[#070420]/30 border border-white/5 p-4 rounded-2xl">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1">
            <Target size={12} /> Schéma de la technologie
          </span>
          {current.visual}
        </div>
      </div>
    </div>
  );
}
