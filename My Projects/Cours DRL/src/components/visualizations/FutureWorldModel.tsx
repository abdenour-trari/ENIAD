"use client";

import React, { useState } from "react";
import { Sparkles, Brain, Eye, Compass, HelpCircle } from "lucide-react";

export default function FutureWorldModel() {
  const [selectedNode, setSelectedNode] = useState<string>("agi");

  const nodes = {
    world: {
      id: "world",
      title: "World Models (Modèles de Monde)",
      desc: "Des systèmes comme Genie ou Sora apprennent les règles physiques de l'environnement uniquement à partir d'images ou d'observations. L'agent RL peut ensuite s'entraîner virtuellement dans un simulateur génératif 'dans son sommeil', supprimant ainsi le besoin de capteurs physiques coûteux.",
      icon: <Eye className="text-cyan-400" size={16} />,
      x: 100,
      y: 70,
    },
    llm: {
      id: "llm",
      title: "RLHF & Alignement LLMs",
      desc: "L'entraînement par renforcement à partir de retours humains (RLHF) via l'algorithme PPO ajuste les probabilités de génération de jetons textuels des LLMs (GPT-4, Claude). Cela aligne l'IA sur l'éthique, la précision et l'utilité attendue par les humains.",
      icon: <Brain className="text-violet-400" size={16} />,
      x: 320,
      y: 70,
    },
    agents: {
      id: "agents",
      title: "Agents Autonomes",
      desc: "Systèmes d'IA combinant des capacités de planification de trajectoires à long terme, d'outils externes (browsers, APIs) et d'auto-évaluation. Le RL guide l'agent vers la résolution de tâches complexes sans script rigide pré-écrit.",
      icon: <Compass className="text-pink-400" size={16} />,
      x: 210,
      y: 230,
    },
    agi: {
      id: "agi",
      title: "AGI (Intelligence Générale)",
      desc: "Le Graal de l'IA. Fusionner les réseaux de transformeurs massifs (System 1 : intuition rapide) et la recherche arborescente planifiée par RL (System 2 : raisonnement lent et logique) pour résoudre des problèmes scientifiques complexes de niveau humain.",
      icon: <Sparkles className="text-yellow-400" size={16} />,
      x: 210,
      y: 140,
    },
  };

  const currentNode = nodes[selectedNode as keyof typeof nodes];

  return (
    <div className="glass-panel p-6 border-white/10 bg-black/40">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="text-yellow-400" size={18} />
        <div>
          <h4 className="font-bold text-white text-sm">Carte Conceptuelle du Futur de l'IA</h4>
          <p className="text-xs text-gray-400">Cliquez sur les nœuds du réseau pour inspecter les liens technologiques de demain.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Network SVG Graph */}
        <div className="lg:col-span-2 flex justify-center bg-black/50 border border-white/5 p-4 rounded-xl relative overflow-hidden">
          <svg width="420" height="300" className="max-w-full">
            {/* Connection lines */}
            <line x1={nodes.world.x} y1={nodes.world.y} x2={nodes.agi.x} y2={nodes.agi.y} stroke="rgba(139,92,246,0.15)" strokeWidth="2" strokeDasharray="3 3" />
            <line x1={nodes.llm.x} y1={nodes.llm.y} x2={nodes.agi.x} y2={nodes.agi.y} stroke="rgba(139,92,246,0.15)" strokeWidth="2" strokeDasharray="3 3" />
            <line x1={nodes.agents.x} y1={nodes.agents.y} x2={nodes.agi.x} y2={nodes.agi.y} stroke="rgba(139,92,246,0.15)" strokeWidth="2" strokeDasharray="3 3" />
            
            {/* Draw World Models Node */}
            <g className="cursor-pointer" onClick={() => setSelectedNode("world")}>
              <circle cx={nodes.world.x} cy={nodes.world.y} r="26" fill={selectedNode === "world" ? "#06b6d4" : "rgba(6,182,212,0.15)"} stroke="#06b6d4" strokeWidth="2" />
              <text x={nodes.world.x} y={nodes.world.y + 4} fill={selectedNode === "world" ? "#030014" : "#ffffff"} fontSize="12" fontWeight="bold" textAnchor="middle">👁️</text>
              <text x={nodes.world.x} y={nodes.world.y + 38} fill="#a78bfa" fontSize="8" fontWeight="bold" textAnchor="middle">WORLD MODELS</text>
            </g>

            {/* Draw LLM Node */}
            <g className="cursor-pointer" onClick={() => setSelectedNode("llm")}>
              <circle cx={nodes.llm.x} cy={nodes.llm.y} r="26" fill={selectedNode === "llm" ? "#8b5cf6" : "rgba(139,92,246,0.15)"} stroke="#8b5cf6" strokeWidth="2" />
              <text x={nodes.llm.x} y={nodes.llm.y + 4} fill={selectedNode === "llm" ? "#030014" : "#ffffff"} fontSize="12" fontWeight="bold" textAnchor="middle">🧠</text>
              <text x={nodes.llm.x} y={nodes.llm.y + 38} fill="#a78bfa" fontSize="8" fontWeight="bold" textAnchor="middle">RLHF / LLMS</text>
            </g>

            {/* Draw Agents Node */}
            <g className="cursor-pointer" onClick={() => setSelectedNode("agents")}>
              <circle cx={nodes.agents.x} cy={nodes.agents.y} r="26" fill={selectedNode === "agents" ? "#ec4899" : "rgba(236,72,153,0.15)"} stroke="#ec4899" strokeWidth="2" />
              <text x={nodes.agents.x} y={nodes.agents.y + 4} fill={selectedNode === "agents" ? "#030014" : "#ffffff"} fontSize="12" fontWeight="bold" textAnchor="middle">🧭</text>
              <text x={nodes.agents.x} y={nodes.agents.y + 38} fill="#a78bfa" fontSize="8" fontWeight="bold" textAnchor="middle">AGENTS AUTO</text>
            </g>

            {/* Draw AGI Node (Center) */}
            <g className="cursor-pointer" onClick={() => setSelectedNode("agi")}>
              <circle cx={nodes.agi.x} cy={nodes.agi.y} r="32" fill={selectedNode === "agi" ? "#eab308" : "rgba(234,179,8,0.15)"} stroke="#eab308" strokeWidth="2" className="animate-pulse" />
              <text x={nodes.agi.x} y={nodes.agi.y + 5} fill={selectedNode === "agi" ? "#030014" : "#ffffff"} fontSize="16" fontWeight="bold" textAnchor="middle">✨</text>
              <text x={nodes.agi.x} y={nodes.agi.y + 48} fill="#facc15" fontSize="9" fontWeight="extrabold" textAnchor="middle">AGI</text>
            </g>
          </svg>
        </div>

        {/* Node detail panel */}
        <div className="flex flex-col bg-white/5 border border-white/5 p-5 rounded-2xl h-full justify-between min-h-[220px]">
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-widest mb-3 flex items-center gap-1.5">
              {currentNode.icon} {currentNode.title}
            </h5>
            <p className="text-xs text-gray-300 leading-relaxed">
              {currentNode.desc}
            </p>
          </div>
          
          <div className="text-[10px] text-gray-400 leading-relaxed border-t border-white/5 pt-3 mt-4 flex items-center gap-1">
            <HelpCircle size={12} className="text-cyan-400" /> Cliquez sur les bulles pour basculer.
          </div>
        </div>
      </div>
    </div>
  );
}
