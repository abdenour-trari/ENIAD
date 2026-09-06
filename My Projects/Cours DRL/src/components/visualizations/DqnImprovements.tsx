"use client";

import React, { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Check, Info } from "lucide-react";

// Mock training reward data for different architectures
const mockTrainingData = Array.from({ length: 21 }).map((_, step) => {
  const x = step * 100;
  return {
    episode: x,
    "DQN Standard": Math.round(15 + Math.sin(x/30) * 10 + x * 0.2 + (x > 1000 ? Math.random()*20 - 10 : Math.random()*10)),
    "Double DQN": Math.round(15 + x * 0.28 + (x > 800 ? Math.random()*12 - 6 : Math.random()*8)),
    "Dueling DQN": Math.round(15 + x * 0.32 + (x > 600 ? Math.random()*8 - 4 : Math.random()*6)),
    "Rainbow DQN": Math.round(15 + x * 0.45 + (x > 400 ? Math.random()*6 - 3 : Math.random()*4)),
  };
});

export default function DqnImprovements() {
  const [activeCurves, setActiveCurves] = useState({
    "DQN Standard": true,
    "Double DQN": true,
    "Dueling DQN": false,
    "Rainbow DQN": false,
  });

  const [selectedExtension, setSelectedExtension] = useState<string>("double");

  const toggleCurve = (name: keyof typeof activeCurves) => {
    setActiveCurves((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const extensionsInfo = {
    double: {
      title: "Double DQN",
      problem: "Biais de surestimation des valeurs Q par l'opérateur max.",
      solution: "Séparation du choix de l'action (réseau en ligne) et de son évaluation (réseau cible).",
      formula: "y = r + \\gamma Q_{target}(s', \\arg\\max_a Q(s', a))",
    },
    dueling: {
      title: "Dueling DQN",
      problem: "Calculer la valeur de chaque action est inutile dans les états où l'action n'a pas d'impact.",
      solution: "Séparation du réseau en deux flux : Valeur de l'état V(s) et Avantage A(s, a).",
      formula: "Q(s, a) = V(s) + [A(s, a) - \\text{mean}(A(s, a'))]",
    },
    per: {
      title: "Prioritized Experience Replay (PER)",
      problem: "Échantillonner le Replay Buffer uniformément oublie les expériences rares et critiques.",
      solution: "Prioriser les transitions à forte erreur TD (erreur de prédiction temporelle).",
      formula: "P(i) = \\frac{p_i^\\alpha}{\\sum_k p_k^\\alpha}",
    },
    rainbow: {
      title: "Rainbow DQN",
      problem: "Toutes les améliorations isolées ne tirent pas profit de la synergie globale.",
      solution: "Combinaison simultanée de 6 extensions majeures du DQN de base.",
      formula: "\\text{Score max Atari benchmarks}",
    },
  };

  const selectedInfo = extensionsInfo[selectedExtension as keyof typeof extensionsInfo];

  return (
    <div className="glass-panel p-6 border-white/10 bg-black/40">
      <h4 className="font-bold text-white text-sm mb-4">Analyse Comparative des Améliorations</h4>

      {/* Grid: Graph and Controls */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Left: Curves checkboxes */}
        <div className="flex flex-col gap-2 bg-white/5 p-4 rounded-xl border border-white/5">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Activer les Courbes</span>
          {Object.entries(activeCurves).map(([name, active]) => {
            let color = "text-cyan-400";
            if (name === "Double DQN") color = "text-violet-400";
            if (name === "Dueling DQN") color = "text-pink-400";
            if (name === "Rainbow DQN") color = "text-emerald-400";

            return (
              <button
                key={name}
                onClick={() => toggleCurve(name as keyof typeof activeCurves)}
                className={`flex items-center justify-between p-3 rounded-lg border text-xs font-semibold text-left transition-all focus:outline-none ${
                  active
                    ? "bg-white/5 border-white/20 text-white"
                    : "border-transparent text-gray-500 hover:text-gray-300"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                    name === "DQN Standard" ? "bg-cyan-500" :
                    name === "Double DQN" ? "bg-indigo-400" :
                    name === "Dueling DQN" ? "bg-pink-400" : "bg-emerald-400"
                  }`} />
                  {name}
                </span>
                {active && <Check size={14} className={color} />}
              </button>
            );
          })}
          
          <div className="text-[10px] text-gray-500 italic mt-3">
            Note : Rainbow DQN combine toutes les extensions pour obtenir une convergence fulgurante.
          </div>
        </div>

        {/* Center/Right: Line Chart */}
        <div className="xl:col-span-2 bg-black/50 border border-white/5 p-4 rounded-xl h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mockTrainingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="episode" stroke="rgba(255,255,255,0.4)" fontSize={9} label={{ value: "Épisodes", position: "insideBottom", offset: -2, fill: "rgba(255,255,255,0.4)" }} />
              <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} label={{ value: "Score Moyen", angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.4)" }} />
              <Tooltip
                contentStyle={{ background: "#0c0828", borderColor: "rgba(139,92,246,0.3)", borderRadius: "8px", fontSize: "11px" }}
                labelClassName="text-violet-400"
              />
              <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: "10px" }} />
              {activeCurves["DQN Standard"] && (
                <Line type="monotone" dataKey="DQN Standard" stroke="#06b6d4" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              )}
              {activeCurves["Double DQN"] && (
                <Line type="monotone" dataKey="Double DQN" stroke="#818cf8" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              )}
              {activeCurves["Dueling DQN"] && (
                <Line type="monotone" dataKey="Dueling DQN" stroke="#ec4899" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              )}
              {activeCurves["Rainbow DQN"] && (
                <Line type="monotone" dataKey="Rainbow DQN" stroke="#10b981" strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Selector: Extension detail */}
      <div className="border-t border-white/10 pt-6">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Focus sur les Extensions</span>
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.keys(extensionsInfo).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedExtension(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all focus:outline-none ${
                selectedExtension === key
                  ? "bg-violet-950/40 border-violet-500 text-violet-200"
                  : "bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {extensionsInfo[key as keyof typeof extensionsInfo].title}
            </button>
          ))}
        </div>

        <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div className="space-y-1.5 flex-1">
            <h5 className="font-bold text-white text-sm flex items-center gap-1.5">
              <Info size={14} className="text-cyan-400" /> {selectedInfo.title}
            </h5>
            <p className="text-xs"><strong className="text-rose-400">Problème résolu : </strong> {selectedInfo.problem}</p>
            <p className="text-xs"><strong className="text-emerald-400">Solution : </strong> {selectedInfo.solution}</p>
          </div>
          
          <div className="bg-black/40 border border-white/5 p-3 rounded-lg font-mono text-xs text-center min-w-[200px] text-cyan-400">
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Règle d'update</div>
            <code>{selectedInfo.formula}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
