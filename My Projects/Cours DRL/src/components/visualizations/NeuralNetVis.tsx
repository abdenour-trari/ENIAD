"use client";

import React, { useState } from "react";
import { Play, ArrowRightLeft, Info } from "lucide-react";

export default function NeuralNetVis() {
  const [pulseForward, setPulseForward] = useState(false);
  const [pulseBackward, setPulseBackward] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{ layer: string; index: number; val: number } | null>(null);

  const inputNodes = [0.85, 0.42, 0.15];
  const hiddenNodes = [0.67, 0.91, 0.33, 0.54];
  const outputNodes = [0.12, 0.88]; // Action 1, Action 2

  const triggerForward = () => {
    if (pulseForward || pulseBackward) return;
    setPulseForward(true);
    setTimeout(() => setPulseForward(false), 2000);
  };

  const triggerBackward = () => {
    if (pulseForward || pulseBackward) return;
    setPulseBackward(true);
    setTimeout(() => setPulseBackward(false), 2000);
  };

  const getNodeCoords = (layer: string, index: number, total: number) => {
    const x = layer === "input" ? 80 : layer === "hidden" ? 250 : 420;
    const spacing = 300 / (total + 1);
    const y = (index + 1) * spacing + 20;
    return { x, y };
  };

  return (
    <div className="glass-panel p-6 border-white/10 bg-black/40">
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div>
          <h4 className="font-bold text-white text-sm">Réseau de Neurones Artificiels (MLP)</h4>
          <p className="text-xs text-gray-400 mt-1">Sélectionnez un neurone ou déclenchez les flux de calcul.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={triggerForward}
            disabled={pulseForward || pulseBackward}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 hover:border-cyan-500 text-cyan-300 text-xs transition-all focus:outline-none disabled:opacity-40"
          >
            <Play size={12} /> Propagation
          </button>
          <button
            onClick={triggerBackward}
            disabled={pulseForward || pulseBackward}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-950/40 border border-violet-800/40 hover:border-violet-500 text-violet-300 text-xs transition-all focus:outline-none disabled:opacity-40"
          >
            <ArrowRightLeft size={12} /> Rétropropagation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Interactive SVG Network */}
        <div className="lg:col-span-2 flex justify-center bg-black/50 border border-white/5 p-4 rounded-xl relative overflow-hidden">
          <svg width="500" height="340" className="max-w-full">
            {/* Draw connections */}
            {inputNodes.map((_, i) =>
              hiddenNodes.map((_, h) => {
                const start = getNodeCoords("input", i, inputNodes.length);
                const end = getNodeCoords("hidden", h, hiddenNodes.length);
                return (
                  <g key={`in-hid-${i}-${h}`}>
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke={pulseForward ? "#22d3ee" : pulseBackward ? "#a78bfa" : "rgba(255,255,255,0.08)"}
                      strokeWidth={pulseForward || pulseBackward ? "2" : "1"}
                      className={pulseForward ? "animate-[dash_2s_infinite]" : ""}
                      strokeDasharray={pulseForward || pulseBackward ? "5, 5" : "none"}
                    />
                  </g>
                );
              })
            )}

            {hiddenNodes.map((_, h) =>
              outputNodes.map((_, o) => {
                const start = getNodeCoords("hidden", h, hiddenNodes.length);
                const end = getNodeCoords("output", o, outputNodes.length);
                return (
                  <g key={`hid-out-${h}-${o}`}>
                    <line
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke={pulseForward ? "#22d3ee" : pulseBackward ? "#a78bfa" : "rgba(255,255,255,0.08)"}
                      strokeWidth={pulseForward || pulseBackward ? "2" : "1"}
                      strokeDasharray={pulseForward || pulseBackward ? "5, 5" : "none"}
                    />
                  </g>
                );
              })
            )}

            {/* Draw Input Layer Nodes */}
            {inputNodes.map((val, idx) => {
              const { x, y } = getNodeCoords("input", idx, inputNodes.length);
              const isSelected = selectedNode?.layer === "input" && selectedNode?.index === idx;
              return (
                <circle
                  key={`in-${idx}`}
                  cx={x}
                  cy={y}
                  r="14"
                  onClick={() => setSelectedNode({ layer: "input", index: idx, val })}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "fill-cyan-500 stroke-cyan-300 stroke-2"
                      : "fill-cyan-950/60 stroke-cyan-600 hover:fill-cyan-900"
                  } ${pulseForward ? "pulse-node-active" : ""}`}
                />
              );
            })}

            {/* Draw Hidden Layer Nodes */}
            {hiddenNodes.map((val, idx) => {
              const { x, y } = getNodeCoords("hidden", idx, hiddenNodes.length);
              const isSelected = selectedNode?.layer === "hidden" && selectedNode?.index === idx;
              return (
                <circle
                  key={`hid-${idx}`}
                  cx={x}
                  cy={y}
                  r="14"
                  onClick={() => setSelectedNode({ layer: "hidden", index: idx, val })}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "fill-violet-500 stroke-violet-300 stroke-2"
                      : "fill-violet-950/60 stroke-violet-600 hover:fill-violet-900"
                  } ${pulseForward || pulseBackward ? "pulse-node-active" : ""}`}
                />
              );
            })}

            {/* Draw Output Layer Nodes */}
            {outputNodes.map((val, idx) => {
              const { x, y } = getNodeCoords("output", idx, outputNodes.length);
              const isSelected = selectedNode?.layer === "output" && selectedNode?.index === idx;
              return (
                <circle
                  key={`out-${idx}`}
                  cx={x}
                  cy={y}
                  r="14"
                  onClick={() => setSelectedNode({ layer: "output", index: idx, val })}
                  className={`cursor-pointer transition-all ${
                    isSelected
                      ? "fill-fuchsia-500 stroke-fuchsia-300 stroke-2"
                      : "fill-fuchsia-950/60 stroke-fuchsia-600 hover:fill-fuchsia-900"
                  } ${pulseBackward ? "pulse-node-active" : ""}`}
                />
              );
            })}

            {/* Text Labels */}
            <text x="80" y="20" fill="#22d3ee" fontSize="10" fontWeight="bold" textAnchor="middle">ENTRÉE (s)</text>
            <text x="250" y="20" fill="#a78bfa" fontSize="10" fontWeight="bold" textAnchor="middle">CACHÉE (MLP)</text>
            <text x="420" y="20" fill="#f472b6" fontSize="10" fontWeight="bold" textAnchor="middle">SORTIE (Q)</text>
          </svg>
        </div>

        {/* Detailed Explanation Panel */}
        <div className="flex flex-col h-full justify-between">
          <div className="glass-panel p-4 border-white/5 bg-white/5 flex-1 flex flex-col justify-center">
            {selectedNode ? (
              <div>
                <h5 className="font-bold text-xs text-violet-300 uppercase tracking-widest mb-2 flex items-center gap-1">
                  <Info size={12} /> Détail du Neurone
                </h5>
                <div className="space-y-2 text-xs">
                  <p>
                    <strong className="text-gray-300">Couche :</strong>{" "}
                    {selectedNode.layer === "input"
                      ? "Entrée (Variables d'État)"
                      : selectedNode.layer === "hidden"
                      ? "Cachée (Représentation interne)"
                      : "Sortie (Q-valeurs)"}
                  </p>
                  <p>
                    <strong className="text-gray-300">Indice :</strong> Neurone #{selectedNode.index + 1}
                  </p>
                  <p>
                    <strong className="text-gray-300">Activation $a_i$ :</strong>{" "}
                    <span className="font-mono text-cyan-400 font-bold">{selectedNode.val.toFixed(4)}</span>
                  </p>
                  <p className="text-gray-400 italic">
                    {selectedNode.layer === "input"
                      ? "Ce neurone transmet une valeur numérique brute capturée dans l'environnement."
                      : selectedNode.layer === "hidden"
                      ? "Ce neurone combine les entrées pondérées puis leur applique une fonction d'activation non-linéaire ReLU."
                      : `Ce neurone évalue l'utilité attendue pour l'action ${selectedNode.index === 0 ? "A (Monter)" : "B (Descendre)"}.`}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-gray-500">
                <p>Cliquez sur un neurone du réseau pour inspecter ses valeurs internes.</p>
              </div>
            )}
          </div>

          <div className="mt-4 text-[11px] text-gray-400 leading-relaxed bg-white/5 border border-white/5 p-3 rounded-lg">
            <span className="text-cyan-400 font-bold">Concept clé : </span>
            {pulseForward && "La propagation calcule les activations de la gauche vers la droite pour obtenir les Q-valeurs de sortie."}
            {pulseBackward && "La rétropropagation calcule le gradient de l'erreur de droite à gauche, ajustant les poids des connexions pour corriger les prédictions."}
            {!pulseForward && !pulseBackward && "Lancez la propagation ou la rétropropagation pour voir les flux en mouvement !"}
          </div>
        </div>
      </div>
    </div>
  );
}
